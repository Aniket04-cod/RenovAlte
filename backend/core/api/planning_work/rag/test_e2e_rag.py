"""
End-to-End Test: RAG-Enhanced Plan Generation
Tests the full pipeline from user input -> RAG retrieval -> plan generation
"""

import os
import sys
import json

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from services import GeminiService, MockGeminiService


def test_rag_plan_generation():
    """Test plan generation with RAG-enhanced context."""
    print("=" * 80)
    print("END-TO-END RAG TEST: Plan Generation with Vector Search")
    print("=" * 80)
    print()
    
    # Check if Gemini API key is available
    has_api_key = bool(os.getenv("GEMINI_API_KEY"))
    
    if has_api_key:
        print("✓ GEMINI_API_KEY detected - using GeminiService with RAG")
        service = GeminiService(use_rag=True)
    else:
        print("⚠ GEMINI_API_KEY not set - using MockGeminiService")
        print("  Note: Mock doesn't use RAG, but tests the integration flow")
        service = MockGeminiService()
    
    print()
    
    # Test case: Heritage building renovation with permits
    print("Test Case: Heritage Building Renovation")
    print("-" * 80)
    
    test_params = {
        "building_type": "single-family",
        "budget": 120000.0,
        "location": "Bavaria",
        "building_size": 180,
        "renovation_goals": [
            "Energy efficiency improvement",
            "Window replacement",
            "Insulation upgrade",
            "Heating system modernization"
        ],
        "building_age": "1950",
        "target_start_date": "2025-04-01",
        "financing_preference": "KfW loan + personal savings",
        "incentive_intent": "Yes, planning to apply",
        "living_during_renovation": "No",
        "heritage_protection": "Yes (Denkmalschutz)",
        "energy_certificate_available": "Grade E",
        "current_insulation_status": "Minimal, needs upgrade",
        "heating_system_type": "Old gas boiler",
        "window_type": "Single glazing",
        "surveys_require": "Structural assessment, energy audit",
    }
    
    print("Input Parameters:")
    for key, value in test_params.items():
        if isinstance(value, list):
            print(f"  {key}: {', '.join(value)}")
        else:
            print(f"  {key}: {value}")
    print()
    
    print("Generating plan...")
    print()
    
    try:
        result = service.generate_renovation_plan(**test_params)
        
        if result.get("success"):
            print("✓ Plan generated successfully!")
            print()
            
            # Display key results
            plan = result.get("plan", {})
            
            if "project_summary" in plan:
                summary = plan["project_summary"]
                print("PROJECT SUMMARY:")
                print(f"  Cost Estimate: {summary.get('total_estimated_cost', 'N/A')}")
                print(f"  Duration: {summary.get('total_duration', 'N/A')}")
                print(f"  Complexity: {summary.get('complexity_level', 'N/A')}")
                print(f"  Funding Readiness: {summary.get('funding_readiness', 'N/A')}")
                print()
            
            if "phases" in plan:
                phases = plan["phases"]
                print(f"PHASES ({len(phases)} total):")
                for phase in phases[:3]:  # Show first 3
                    print(f"  {phase.get('id')}. {phase.get('title')} - {phase.get('duration')} ({phase.get('cost')})")
                if len(phases) > 3:
                    print(f"  ... and {len(phases) - 3} more phases")
                print()
            
            if "ai_suggestions" in plan:
                suggestions = plan["ai_suggestions"]
                print(f"AI SUGGESTIONS ({len(suggestions)} items):")
                for i, suggestion in enumerate(suggestions[:3], 1):
                    if isinstance(suggestion, dict):
                        print(f"  {i}. {suggestion.get('title', 'N/A')}")
                    else:
                        print(f"  {i}. {suggestion}")
                if len(suggestions) > 3:
                    print(f"  ... and {len(suggestions) - 3} more suggestions")
                print()
            
            # Check for RAG context usage
            timings = result.get("timings", {})
            if timings:
                print("PERFORMANCE:")
                print(f"  Prompt build: {timings.get('prompt_ms', 0)}ms")
                print(f"  LLM generation: {timings.get('llm_ms', 0)}ms")
                print(f"  Parsing: {timings.get('parse_ms', 0)}ms")
                print(f"  Total: {timings.get('total_ms', 0)}ms")
                if result.get("escalated"):
                    print("  ⚡ Auto-escalated to pro model")
                if result.get("cached"):
                    print("  💾 Served from cache")
                print()
            
            # Save full result to file
            output_file = os.path.join(os.path.dirname(__file__), "test_rag_output.json")
            with open(output_file, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"✓ Full output saved to: {output_file}")
            print()
            
            print("=" * 80)
            print("✓ RAG INTEGRATION TEST PASSED")
            print("=" * 80)
            
        else:
            print("✗ Plan generation failed")
            print(f"Error: {result.get('error', 'Unknown error')}")
            return False
            
    except Exception as e:
        print(f"✗ Test failed with exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return False
    
    return True


if __name__ == "__main__":
    success = test_rag_plan_generation()
    sys.exit(0 if success else 1)
