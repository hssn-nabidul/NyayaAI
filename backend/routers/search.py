from fastapi import APIRouter, Depends, Query, HTTPException, Body
from typing import Optional, Dict, Any
from services.kanoon import search_judgments
from services.gemini import extract_search_params
from services.firebase_auth import get_current_user, FirebaseUser
from services.rate_limiter import check_and_increment

router = APIRouter(
    prefix="/search",
    tags=["search"],
)

@router.get("/")
async def perform_search(
    q: str = Query(..., min_length=2),
    court: str = Query(None), # Default to None instead of "all"
    from_year: Optional[int] = Query(None),
    to_year: Optional[int] = Query(None),
    page: int = Query(0, ge=0),
) -> Dict[str, Any]:
    """
    Public keyword search for judgments with filters.
    """
    try:
        # 1. Normalize query
        q_clean = q.replace(" v. ", " vs ").replace(" v ", " vs ")
        q_lower = q_clean.lower()
        
        # 2. Convert years to Indian Kanoon date format (DD-MM-YYYY)
        from_date = f"1-1-{from_year}" if from_year else None
        to_date = f"31-12-{to_year}" if to_year else None

        # 3. Call search service with filters
        results_data = await search_judgments(
            query=q_clean,
            court=court if court and court != "all" else "all",
            pagenum=page,
            fromdate=from_date,
            todate=to_date
        )
        
        raw_results = results_data.get("results", [])
        
        if not raw_results:
            return {
                "query": q,
                "total": 0,
                "page": page,
                "results": []
            }

        # Priority/Booster Logic
        constitution_items = []
        high_confidence_matches = []
        other_items = []
        
        # Strip common words for similarity check
        query_words = [w for word in q_lower.replace("vs", "").replace('"', "").split() if (w := word.strip()) and len(w) > 2]
        query_words_set = set(query_words)
        
        for res in raw_results:
            title_lower = res["title"].lower()
            
            # 1. Identify Constitution results
            if "constitution of india" in title_lower and "constitution" not in q_lower:
                constitution_items.append(res)
                continue
            
            # 2. Check for case name match
            # If parties match AND there is a "vs" or "v." in title
            match_count = sum(1 for word in query_words_set if word in title_lower)
            score = match_count / len(query_words_set) if query_words_set else 0
            
            # Booster: If high word match AND it's a case (has vs/v)
            has_separator = any(x in title_lower for x in [" vs ", " v. ", " v ", " versus "])
            
            if score >= 0.8 and has_separator:
                high_confidence_matches.append(res)
            elif score >= 0.9: # Very high match even without vs
                high_confidence_matches.append(res)
            else:
                other_items.append(res)
        
        # Re-assemble: high matches first, then others, then constitution
        # We also want to ensure is_internal results are boosted if they match

        final_results = []

        # 0. Internal items usually come first from search_judgments, but let's be explicit
        internal_items = [res for res in raw_results if res.get("is_internal")]
        external_items = [res for res in raw_results if not res.get("is_internal")]

        # Sort external items by the original booster logic
        ext_constitution = []
        ext_high_conf = []
        ext_others = []

        for res in external_items:
            title_lower = res["title"].lower()
            if "constitution of india" in title_lower and "constitution" not in q_lower:
                ext_constitution.append(res)
                continue

            match_count = sum(1 for word in query_words_set if word in title_lower)
            score = match_count / len(query_words_set) if query_words_set else 0
            has_separator = any(x in title_lower for x in [" vs ", " v. ", " v ", " versus "])

            if (score >= 0.8 and has_separator) or score >= 0.9:
                ext_high_conf.append(res)
            else:
                ext_others.append(res)

        final_results = internal_items + ext_high_conf + ext_others + ext_constitution

        # Format response to match API.md
        return {
            "query": q,
            "total": results_data.get("total", 0),
            "page": results_data.get("page", 0),
            "results": final_results
        }

    except Exception as e:
        print(f"Public search failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=503, 
            detail="Indian Kanoon API is currently unavailable."
        )


@router.post("/nlp")
async def nlp_search(
    description: str = Body(...),
    page: int = Query(0, ge=0),
    current_user: FirebaseUser = Depends(get_current_user)
) -> Dict[str, Any]:
    """
    Perform a natural language search. Requires authentication.
    """
    usage = await check_and_increment(current_user.uid)

    try:
        extracted = await extract_search_params(description)
        kanoon_query = extracted.get("kanoon_search_query", description)
        
        # Extract years if provided by Gemini
        from_year = extracted.get("from_year")
        to_year = extracted.get("to_year")
        
        from_date = f"1-1-{from_year}" if from_year else None
        to_date = f"31-12-{to_year}" if to_year else None

        # results structure: {results, total, page}
        results_data = await search_judgments(
            query=kanoon_query, 
            pagenum=page,
            fromdate=from_date,
            todate=to_date
        )
        
        raw_results = results_data.get("results", [])
        
        # Priority/Booster Logic (Same as public search)
        internal_items = [res for res in raw_results if res.get("is_internal")]
        external_items = [res for res in raw_results if not res.get("is_internal")]

        ext_constitution = []
        ext_case_matches = []
        ext_others = []
        
        # We use original query words for similarity checking
        q_words = set(description.lower().replace("vs", "").replace("v.", "").split())
        
        for res in external_items:
            title_lower = res["title"].lower()
            if "constitution of india" in title_lower and "constitution" not in description.lower():
                ext_constitution.append(res)
                continue
            
            match_count = sum(1 for word in q_words if word in title_lower)
            score = match_count / len(q_words) if q_words else 0
            
            if score >= 0.7:
                ext_case_matches.append(res)
            else:
                ext_others.append(res)
        
        final_results = internal_items + ext_case_matches + ext_others + ext_constitution
        
        return {
            "original_query": description,
            "extracted_terms": extracted.get("legal_principles", []),
            "kanoon_query_used": kanoon_query,
            "total": results_data.get("total", 0),
            "page": results_data.get("page", 0),
            "results": final_results,
            "ai_analysis": extracted,
            "usage": usage
        }
    except Exception as e:
        print(f"NLP Search failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))
