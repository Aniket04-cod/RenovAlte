"""
Quick RAG Status Check
Run this to verify RAG is working in your backend
"""
import os
import sys

# Add parent to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

def check_rag_status():
    print("=" * 80)
    print("RAG SYSTEM STATUS CHECK")
    print("=" * 80)
    print()
    
    # 1. Check Qdrant
    print("1. Checking Qdrant Vector Database...")
    try:
        import requests
        response = requests.get("http://localhost:6333")
        if response.status_code == 200:
            print("   ✅ Qdrant running on localhost:6333")
            data = response.json()
            print(f"   Version: {data.get('version', 'unknown')}")
        else:
            print(f"   ❌ Qdrant responded with status {response.status_code}")
    except Exception as e:
        print(f"   ❌ Qdrant not accessible: {str(e)}")
        print("   Fix: docker start qdrant")
    print()
    
    # 2. Check Documents Indexed
    print("2. Checking Indexed Documents...")
    try:
        from rag.vector_db import get_vector_db
        vector_db = get_vector_db()
        info = vector_db.get_collection_info()
        
        if info.get('points_count', 0) > 0:
            print(f"   ✅ {info['points_count']} documents indexed")
            print(f"   Collection: {info.get('name')}")
            print(f"   Status: {info.get('status')}")
        else:
            print("   ❌ No documents indexed")
            print("   Fix: python rag/index_documents.py")
    except Exception as e:
        print(f"   ❌ Could not check collection: {str(e)}")
    print()
    
    # 3. Test Retrieval
    print("3. Testing Semantic Retrieval...")
    try:
        from rag.retriever import get_rag_retriever
        retriever = get_rag_retriever()
        
        test_query = "What permits are needed for window replacement in Germany?"
        context = retriever.retrieve_context(test_query, top_k=2)
        
        if context:
            print(f"   ✅ Retrieval working")
            print(f"   Query: {test_query}")
            print(f"   Retrieved {len(context)} chars of context")
            print(f"   Preview: {context[:150]}...")
        else:
            print("   ❌ No context retrieved")
    except Exception as e:
        print(f"   ❌ Retrieval failed: {str(e)}")
    print()
    
    # 4. Check GeminiService Integration
    print("4. Checking GeminiService Integration...")
    try:
        from services import GeminiService
        
        # Try to initialize with RAG
        service = GeminiService(use_rag=True)
        
        if service.use_rag and service.rag_retriever:
            print("   ✅ RAG enabled in GeminiService")
            print("   ✅ RAG retriever initialized")
        elif service.use_rag:
            print("   ⚠️ RAG enabled but retriever not initialized")
        else:
            print("   ⚠️ RAG disabled (missing dependencies or Qdrant)")
            print("   Service will use fallback knowledge base")
    except Exception as e:
        print(f"   ❌ Could not check service: {str(e)}")
    print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY")
    print("=" * 80)
    print()
    print("To test with frontend/backend:")
    print("  1. Start backend: cd backend && python manage.py runserver")
    print("  2. Start frontend: cd frontend && npm start")
    print("  3. Open app, go to Planning page")
    print("  4. Fill out form and generate a plan")
    print("  5. Check backend console for RAG logs:")
    print("     - 'Retrieved RAG context: XXXX chars'")
    print("     - 'Initializing RAG retriever for GeminiService'")
    print()
    print("To see raw RAG output:")
    print("  python rag/test_retrieval.py")
    print()

if __name__ == "__main__":
    check_rag_status()
