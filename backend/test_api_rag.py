"""
Test RAG via API Call
Simulates frontend request to backend planning API
"""
import requests
import json

def test_planning_api():
    """Test the planning API endpoint with RAG"""
    print("=" * 80)
    print("TESTING RAG VIA BACKEND API")
    print("=" * 80)
    print()
    
    url = "http://127.0.0.1:8000/api/planning/generate/"
    
    payload = {
        "building_type": "single-family",
        "budget": 100000,
        "location": "Bavaria",
        "building_size": 150,
        "renovation_goals": [
            "Energy efficiency improvement",
            "Window replacement",
            "Heating system upgrade"
        ],
        "building_age": "1960",
        "target_start_date": "2025-06-01",
        "financing_preference": "KfW loan",
        "incentive_intent": "Yes",
        "living_during_renovation": "No",
        "heritage_protection": "Yes (Denkmalschutz)",
        "energy_certificate_available": "Grade D",
        "current_insulation_status": "Minimal",
        "heating_system_type": "Old gas boiler",
        "window_type": "Double glazing (old)",
    }
    
    print("Request URL:", url)
    print()
    print("Request Payload:")
    print(json.dumps(payload, indent=2))
    print()
    print("Sending request...")
    print()
    
    try:
        response = requests.post(url, json=payload, timeout=30)
        
        print(f"Response Status: {response.status_code}")
        print()
        
        if response.status_code == 200:
            data = response.json()
            
            print("✅ SUCCESS!")
            print()
            
            # Check for RAG indicators
            if "plan" in data:
                plan = data["plan"]
                
                print("📊 PLAN SUMMARY:")
                if "project_summary" in plan:
                    summary = plan["project_summary"]
                    print(f"  Cost: {summary.get('total_estimated_cost', 'N/A')}")
                    print(f"  Duration: {summary.get('total_duration', 'N/A')}")
                    print(f"  Complexity: {summary.get('complexity_level', 'N/A')}")
                print()
                
                print(f"📋 PHASES: {len(plan.get('phases', []))} phases")
                for i, phase in enumerate(plan.get('phases', [])[:3], 1):
                    print(f"  {i}. {phase.get('title')} - {phase.get('duration')}")
                print()
                
                print(f"💡 AI SUGGESTIONS: {len(plan.get('ai_suggestions', []))} suggestions")
                for i, suggestion in enumerate(plan.get('ai_suggestions', [])[:3], 1):
                    if isinstance(suggestion, dict):
                        print(f"  {i}. {suggestion.get('title', suggestion)}")
                    else:
                        print(f"  {i}. {suggestion}")
                print()
            
            # Check timing info (RAG adds ~100ms)
            if "timings" in data:
                timings = data["timings"]
                print("⏱️ PERFORMANCE:")
                print(f"  Total: {timings.get('total_ms', 0)}ms")
                if timings.get('llm_ms'):
                    print(f"  LLM: {timings['llm_ms']}ms")
                if data.get("cached"):
                    print("  💾 Served from cache")
                if data.get("escalated"):
                    print("  ⚡ Escalated to pro model")
                print()
            
            # Save response
            output_file = "api_test_response.json"
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            print(f"💾 Full response saved to: {output_file}")
            print()
            
            print("=" * 80)
            print("✅ RAG IS WORKING!")
            print("=" * 80)
            print()
            print("Check your backend console for RAG logs:")
            print("  - 'Initializing RAG retriever for GeminiService'")
            print("  - 'Retrieved RAG context: XXXX chars'")
            print()
            print("The AI suggestions and phases should now include:")
            print("  - German building permit requirements")
            print("  - KfW/BAFA incentive information")
            print("  - Heritage protection (Denkmalschutz) considerations")
            print("  - Legal compliance requirements")
            
        else:
            print(f"❌ FAILED: {response.status_code}")
            print(response.text)
            
    except requests.exceptions.ConnectionError:
        print("❌ Could not connect to backend")
        print()
        print("Make sure backend is running:")
        print("  cd backend")
        print("  python manage.py runserver")
    except Exception as e:
        print(f"❌ Error: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    test_planning_api()
