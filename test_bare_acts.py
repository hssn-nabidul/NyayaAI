import asyncio
import sys
from pathlib import Path

# Add backend to path
sys.path.append(str(Path(__file__).parent / "backend"))

from backend.services.bare_acts import get_all_acts, get_act_details, get_section_details
from backend.services.kanoon import search_judgments

async def test_bare_acts_logic():
    print("--- Testing Bare Acts Logic ---")
    
    # 1. Test Listing
    print("\n1. Testing get_all_acts()...")
    acts = await get_all_acts()
    print(f"Found {len(acts)} priority acts.")
    for act in acts[:3]:
        print(f" - {act['title']} ({act['slug']})")
        
    # 2. Test Act Details
    test_slug = "ipc-1860"
    print(f"\n2. Testing get_act_details('{test_slug}')...")
    details = await get_act_details(test_slug)
    print(f"Title: {details['title']}")
    print(f"Sections found: {len(details['sections'])}")
    
    # 3. Test Section Details
    test_section = "302"
    print(f"\n3. Testing get_section_details('{test_slug}', '{test_section}')...")
    section = await get_section_details(test_slug, test_section)
    if section:
        print(f"Section {section['number']}: {section['title']}")
        print(f"Content: {section['content']}")
    else:
        print("Section not found!")

    # 4. Test Related Cases Search (as used in the router)
    print(f"\n4. Testing Related Cases Search for '{test_slug} Section {test_section}'...")
    query = f"Section {test_section} {details['title']}"
    case_results = await search_judgments(query=query)
    print(f"Found {case_results.get('total', 0)} related cases.")
    if case_results.get('results'):
        print(f"Top result: {case_results['results'][0]['title']}")

async def main():
    try:
        await test_bare_acts_logic()
        print("\n✅ Bare Acts Logic Test Completed Successfully.")
    except Exception as e:
        print(f"\n❌ Test Failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(main())
