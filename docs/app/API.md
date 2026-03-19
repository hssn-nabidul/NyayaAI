# API.md — Nyaya Backend API Contracts

Base URL (dev): `http://localhost:8000`  
Base URL (prod): `https://nyaya-api.onrender.com`  
All responses: `Content-Type: application/json`

---

## Health Check

### `GET /health`
Returns backend status.

**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "kanoon": "connected",
  "gemini": "connected"
}
```

---

## Search

### `GET /search`
Keyword-based case search via Indian Kanoon.

**Query params:**
| Param | Type | Required | Default | Description |
|---|---|---|---|---|
| `q` | string | ✅ | — | Search query |
| `court` | string | ❌ | `all` | `SC` / `DHC` / `BHC` / `MHC` / `all` |
| `from_year` | int | ❌ | — | Filter from year |
| `to_year` | int | ❌ | — | Filter to year |
| `page` | int | ❌ | `0` | Page number (0-indexed) |

**Response 200:**
```json
{
  "query": "right to privacy article 21",
  "total": 847,
  "page": 0,
  "results": [
    {
      "doc_id": "257038",
      "title": "Justice K.S. Puttaswamy (Retd) v. Union Of India",
      "court": "Supreme Court of India",
      "court_code": "SC",
      "date": "2017-08-24",
      "year": 2017,
      "citation": "AIR 2017 SC 4161",
      "headline": "Right to privacy is a fundamental right under Article 21...",
      "judges": ["D.Y. Chandrachud", "J.S. Khehar", "R.K. Agrawal"],
      "area_of_law": ["Constitutional Law", "Fundamental Rights"]
    }
  ]
}
```

**Response 400:**
```json
{"detail": "Query must be at least 3 characters"}
```

---

### `POST /search/nlp`
Natural language legal search — Gemini pre-processes the query.

**Request body:**
```json
{
  "query": "Police arrested my client without telling him the reason and kept him for 3 days without seeing a magistrate",
  "court": "all",
  "page": 0
}
```

**Response 200:**
```json
{
  "original_query": "Police arrested my client without telling him the reason...",
  "extracted_terms": ["Article 22", "D.K. Basu guidelines", "Section 57 CrPC", "preventive detention", "right to know grounds of arrest"],
  "kanoon_query_used": "article 22 grounds of arrest magistrate DK Basu",
  "total": 124,
  "page": 0,
  "results": [ ... same structure as /search ... ]
}
```

---

## Cases

### `GET /cases/{doc_id}`
Full case detail with judgment text.

**Path params:**
| Param | Description |
|---|---|
| `doc_id` | Indian Kanoon document ID |

**Response 200:**
```json
{
  "doc_id": "257038",
  "title": "Justice K.S. Puttaswamy (Retd) v. Union Of India",
  "court": "Supreme Court of India",
  "court_code": "SC",
  "date": "2017-08-24",
  "year": 2017,
  "citation": "AIR 2017 SC 4161",
  "bench": "9-Judge Constitution Bench",
  "judges": ["D.Y. Chandrachud", "J.S. Khehar", "R.K. Agrawal", "J. Chelameswar", "S.A. Bobde", "R.F. Nariman", "A.M. Sapre", "L.N. Rao", "S.K. Kaul"],
  "parties": {
    "petitioner": "Justice K.S. Puttaswamy (Retd) & Anr",
    "respondent": "Union of India & Ors"
  },
  "area_of_law": ["Constitutional Law", "Fundamental Rights", "Right to Privacy"],
  "full_text": "REPORTABLE\n\nIN THE SUPREME COURT OF INDIA...",
  "word_count": 87432
}
```

**Response 404:**
```json
{"detail": "Case not found"}
```

---

### `GET /cases/{doc_id}/summary`
AI-generated summary. Generates via Gemini if not cached.

**Response 200:**
```json
{
  "doc_id": "257038",
  "plain_summary": "A 9-judge Constitution Bench unanimously held that the right to privacy is a fundamental right protected under Article 21 of the Constitution of India. The court overruled two previous judgments — M.P. Sharma (1954) and Kharak Singh (1962) — that had held otherwise. The judgment establishes a three-part test (legality, legitimate aim, proportionality) that any state action encroaching on privacy must satisfy.",
  "key_issues": [
    "Whether right to privacy is a fundamental right under Part III of the Constitution",
    "Whether M.P. Sharma (1954) and Kharak Singh (1962) should be overruled",
    "What is the scope and extent of the right to privacy"
  ],
  "holding": "Right to privacy is intrinsic to life and liberty under Article 21. It is also protected under Articles 14 and 19. Both M.P. Sharma and Kharak Singh are overruled. Any invasion of privacy must be (1) sanctioned by law, (2) serve a legitimate state aim, and (3) be proportionate.",
  "precedents_cited": [
    {"doc_id": "601760", "title": "Maneka Gandhi v. Union of India", "year": 1978},
    {"doc_id": "445372", "title": "Gobind v. State of Madhya Pradesh", "year": 1975}
  ],
  "area_of_law": ["Constitutional Law", "Fundamental Rights", "Art.21", "Privacy"],
  "significance": "This is the foundational privacy judgment in Indian law. It is cited in every subsequent case involving data protection, surveillance, Aadhaar, and personal liberty.",
  "model_used": "gemini-1.5-flash",
  "generated_at": "2025-03-01T10:23:44Z"
}
```

---

### `GET /cases/{doc_id}/citations`
Citation graph data — cases cited by and cases citing this judgment.

**Response 200:**
```json
{
  "doc_id": "257038",
  "cites": [
    {
      "doc_id": "601760",
      "title": "Maneka Gandhi v. Union of India",
      "court_code": "SC",
      "year": 1978,
      "relationship": "cited"
    }
  ],
  "cited_by": [
    {
      "doc_id": "887234",
      "title": "Justice K.S. Puttaswamy v. Union of India (Aadhaar)",
      "court_code": "SC",
      "year": 2018,
      "relationship": "applied"
    }
  ],
  "total_cited_by": 412,
  "fetched_at": "2025-03-01T10:23:44Z"
}
```

---

## Judges

### `GET /judges/{judge_name}`
Judge profile and analytics.

**Path params:**
| Param | Example |
|---|---|
| `judge_name` | `D.Y. Chandrachud` (URL encoded: `D.Y.%20Chandrachud`) |

**Response 200:**
```json
{
  "name": "D.Y. Chandrachud",
  "current_court": "Supreme Court of India",
  "current_role": "Chief Justice of India",
  "appointed_date": "2016-05-13",
  "total_judgments": 847,
  "subject_breakdown": {
    "Constitutional Law": 45,
    "Criminal Law": 22,
    "Civil Law": 18,
    "Service Law": 8,
    "Family Law": 7
  },
  "notable_judgments": [
    {
      "doc_id": "257038",
      "title": "Puttaswamy v. Union of India",
      "year": 2017,
      "significance": "Foundational privacy judgment"
    },
    {
      "doc_id": "991234",
      "title": "Navtej Singh Johar v. Union of India",
      "year": 2018,
      "significance": "Decriminalised consensual same-sex relations"
    }
  ],
  "ideological_tendency": "Rights-expansive",
  "pil_admission_rate": 71,
  "profile_summary": "Justice Chandrachud is widely regarded as one of the most progressive voices on the Supreme Court, with a consistent record of expanding the scope of fundamental rights. His dissents, particularly in the Aadhaar case, are frequently cited as the more constitutionally sound position.",
  "generated_at": "2025-03-01T10:23:44Z"
}
```

**Response 404:**
```json
{"detail": "Judge not found"}
```

---

## Moot Prep

### `POST /moot/prep`
Generate moot court arguments for a proposition.

**Request body:**
```json
{
  "proposition": "The mandatory linking of Aadhaar with welfare schemes violates the right to privacy and is constitutionally impermissible.",
  "side": "both",
  "format": "jessup"
}
```

`side`: `"petitioner"` | `"respondent"` | `"both"`  
`format`: `"jessup"` | `"nls"` | `"scc"` | `"generic"` (optional, default `"generic"`)

**Response 200:**
```json
{
  "proposition": "The mandatory linking of Aadhaar...",
  "petitioner": {
    "arguments": [
      {
        "heading": "Aadhaar linkage fails the proportionality prong of the Puttaswamy test",
        "body": "The exclusion of genuine beneficiaries due to biometric failures is disproportionate to the stated aim of eliminating ghost beneficiaries. The state has less invasive alternatives available.",
        "supporting_cases": [
          {"doc_id": "257038", "title": "Puttaswamy v. UoI", "year": 2017, "relevance": "Establishes three-part test; linkage fails proportionality"},
          {"doc_id": "445372", "title": "PUCL v. UoI", "year": 2001, "relevance": "Right to food as enforceable right under Art.21"}
        ]
      }
    ],
    "key_cases": ["Puttaswamy 2017", "PUCL 2001", "Aruna Roy 2002"]
  },
  "respondent": {
    "arguments": [
      {
        "heading": "The state has a compelling interest in preventing fraudulent diversion of welfare funds",
        "body": "Over ₹90,000 crore was saved by eliminating ghost beneficiaries post-Aadhaar seeding. The legitimate aim prong is overwhelmingly satisfied.",
        "supporting_cases": [
          {"doc_id": "889234", "title": "Puttaswamy v. UoI (Aadhaar)", "year": 2018, "relevance": "Majority upheld Aadhaar with safeguards"}
        ]
      }
    ],
    "key_cases": ["Puttaswamy Aadhaar 2018", "State of MP v. Bharat Singh"]
  },
  "generated_at": "2025-03-01T10:23:44Z"
}
```

---

## Draft Assistant

### `POST /draft/suggest`
Get case suggestions relevant to a piece of draft text.

**Request body:**
```json
{
  "draft_text": "It is respectfully submitted that the detention of the Petitioner for a period exceeding 24 hours without production before the nearest Magistrate is in direct violation of Article 22(2) of the Constitution of India.",
  "max_suggestions": 5
}
```

**Response 200:**
```json
{
  "suggestions": [
    {
      "doc_id": "445123",
      "title": "D.K. Basu v. State of West Bengal",
      "court": "SC",
      "year": 1997,
      "citation": "(1997) 1 SCC 416",
      "reason": "Directly on point — establishes binding guidelines for arrest and detention including the 24-hour magistrate rule",
      "relevance_score": 0.97
    },
    {
      "doc_id": "612345",
      "title": "Hussainara Khatoon v. State of Bihar",
      "court": "SC",
      "year": 1979,
      "citation": "AIR 1979 SC 1360",
      "reason": "Right to speedy trial; production before magistrate as fundamental right under Art.21",
      "relevance_score": 0.91
    }
  ]
}
```

---

## Error Responses

All endpoints return standard error format:

```json
{
  "detail": "Human-readable error message",
  "code": "KANOON_UNAVAILABLE",
  "timestamp": "2025-03-01T10:23:44Z"
}
```

**Error codes:**
| Code | HTTP | Meaning |
|---|---|---|
| `KANOON_UNAVAILABLE` | 503 | Indian Kanoon API is down |
| `GEMINI_UNAVAILABLE` | 503 | Gemini API is down or rate limited |
| `CASE_NOT_FOUND` | 404 | docId doesn't exist in Kanoon |
| `JUDGE_NOT_FOUND` | 404 | Judge name not found |
| `QUERY_TOO_SHORT` | 400 | Query less than 3 chars |
| `RATE_LIMITED` | 429 | Too many requests from this IP |

---

*Document: API.md · Project: Nyaya · Version: 1.0*
