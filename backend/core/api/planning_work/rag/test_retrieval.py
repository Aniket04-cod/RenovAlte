"""
Test RAG Retrieval
Test semantic search with sample queries
"""

import os
import sys
import logging

sys.path.insert(0, os.path.dirname(__file__))

from retriever import get_rag_retriever

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def test_retrieval():
    """Test RAG retrieval with sample queries."""
    print("=" * 80)
    print("TESTING RAG RETRIEVAL")
    print("=" * 80)
    print()
    
    # Initialize retriever
    print("Initializing RAG retriever...")
    retriever = get_rag_retriever()
    print()
    
    # Get collection stats
    print("Collection statistics:")
    stats = retriever.get_collection_stats()
    print(f"  Points: {stats.get('points_count')}")
    print(f"  Status: {stats.get('status')}")
    print()
    
    # Test queries
    test_queries = [
        {
            "name": "General Renovation Query",
            "query": "What are the main steps in a building renovation project in Germany?",
            "top_k": 3
        },
        {
            "name": "Permits & Approvals",
            "query": "What building permits and approvals are required for residential renovation?",
            "top_k": 3,
            "category": "permits"
        },
        {
            "name": "Government Incentives",
            "query": "What financial incentives and grants are available for energy-efficient renovations?",
            "top_k": 3,
            "category": "incentives"
        },
        {
            "name": "Legal Compliance",
            "query": "What are the legal requirements and compliance obligations for renovation projects?",
            "top_k": 3,
            "category": "regulations"
        }
    ]
    
    for test in test_queries:
        print("=" * 80)
        print(f"TEST: {test['name']}")
        print("=" * 80)
        print(f"Query: {test['query']}")
        print()
        
        # Retrieve context
        if "category" in test:
            context = retriever.retrieve_by_category(
                query=test["query"],
                category=test["category"],
                top_k=test["top_k"]
            )
        else:
            context = retriever.retrieve_context(
                query=test["query"],
                top_k=test["top_k"]
            )
        
        if context:
            print("Retrieved context:")
            print(context)
        else:
            print("No context retrieved")
        print()
    
    # Multi-category test
    print("=" * 80)
    print("TEST: Multi-Category Retrieval")
    print("=" * 80)
    print("Query: Planning a kitchen renovation with permits and incentives")
    print()
    
    context = retriever.retrieve_multi_category(
        query="kitchen renovation planning with permits and financial support",
        categories=["permits", "incentives", "processes"],
        chunks_per_category=2
    )
    print("Retrieved context:")
    print(context)
    print()
    
    print("=" * 80)
    print("✓ RETRIEVAL TESTS COMPLETE")
    print("=" * 80)


if __name__ == "__main__":
    try:
        test_retrieval()
    except KeyboardInterrupt:
        print("\n\nTests interrupted by user")
    except Exception as e:
        logger.error(f"Tests failed: {str(e)}", exc_info=True)
        print(f"\n✗ Tests failed: {str(e)}")
