"""
Document Indexing Script
Loads documents, generates embeddings, and indexes into Qdrant
Run once to populate the vector database
"""

import os
import sys
import logging

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from document_loader import DocumentLoader
from embeddings import get_embeddings_service
from vector_db import get_vector_db

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def index_documents():
    """
    Load all relevant PDFs from documents folder and index into Qdrant.
    """
    print("=" * 80)
    print("DOCUMENT INDEXING FOR RAG PIPELINE")
    print("=" * 80)
    print()
    
    # 1. Initialize services
    print("Step 1: Initializing services...")
    loader = DocumentLoader()
    embeddings_service = get_embeddings_service()
    vector_db = get_vector_db()
    print(f"  ✓ Embeddings model: all-MiniLM-L6-v2 (dim={embeddings_service.get_embedding_dimension()})")
    print(f"  ✓ Qdrant client: localhost:6333")
    print()
    
    # 2. Load documents
    print("Step 2: Loading documents...")
    docs_dir = os.path.join(os.path.dirname(__file__), "documents")
    
    # Only load relevant PDFs (exclude non-relevant files)
    relevant_pdfs = [
        ("Government Incentives.pdf", "incentives"),
        ("Legal Compliance Framework for Residential Renova....pdf", "regulations"),
        ("Renovation Process and Expected Challenges.pdf", "processes"),
        ("Research Documentation_ German Building Permits,....pdf", "permits"),
        ("Expense break down.pdf", "processes"),
    ]
    
    all_docs = []
    for filename, category in relevant_pdfs:
        filepath = os.path.join(docs_dir, filename)
        if not os.path.exists(filepath):
            print(f"  ⚠ Skipping missing file: {filename}")
            continue
        
        try:
            docs = loader.load_pdf(filepath)
            # Add category metadata
            for doc in docs:
                doc.metadata["category"] = category
                doc.metadata["source"] = filename
            
            all_docs.extend(docs)
            print(f"  ✓ Loaded {len(docs)} chunks from {filename} (category: {category})")
        except Exception as e:
            print(f"  ✗ Failed to load {filename}: {str(e)}")
    
    if not all_docs:
        print("\n✗ No documents loaded. Exiting.")
        return
    
    print(f"\n  Total chunks loaded: {len(all_docs)}")
    print()
    
    # 3. Generate embeddings
    print("Step 3: Generating embeddings...")
    print(f"  Processing {len(all_docs)} chunks...")
    try:
        texts = [doc.page_content for doc in all_docs]
        embeddings = embeddings_service.embed_documents(texts)
        print(f"  ✓ Generated {len(embeddings)} embeddings")
    except Exception as e:
        print(f"  ✗ Embedding generation failed: {str(e)}")
        return
    print()
    
    # 4. Create collection
    print("Step 4: Setting up Qdrant collection...")
    try:
        vector_db.delete_collection()  # Clean slate
        vector_db.create_collection(embedding_dim=embeddings_service.get_embedding_dimension())
        print(f"  ✓ Collection 'renovation_docs' created")
    except Exception as e:
        print(f"  ✗ Collection creation failed: {str(e)}")
        return
    print()
    
    # 5. Index documents
    print("Step 5: Indexing documents into Qdrant...")
    try:
        vector_db.add_documents(documents=all_docs, embeddings=embeddings)
        print(f"  ✓ Indexed {len(all_docs)} documents")
    except Exception as e:
        print(f"  ✗ Indexing failed: {str(e)}")
        return
    print()
    
    # 6. Verify
    print("Step 6: Verifying collection...")
    info = vector_db.get_collection_info()
    print(f"  Collection: {info.get('name')}")
    print(f"  Points: {info.get('points_count')}")
    print(f"  Vectors: {info.get('vectors_count')}")
    print(f"  Status: {info.get('status')}")
    print()
    
    print("=" * 80)
    print("✓ INDEXING COMPLETE")
    print("=" * 80)
    print()
    print("Next steps:")
    print("  1. Test retrieval with: python test_retrieval.py")
    print("  2. Integrate RAG into services.py")
    print("  3. Generate a plan with RAG-enhanced prompts")


if __name__ == "__main__":
    try:
        index_documents()
    except KeyboardInterrupt:
        print("\n\nIndexing interrupted by user")
    except Exception as e:
        logger.error(f"Indexing failed: {str(e)}", exc_info=True)
        print(f"\n✗ Indexing failed: {str(e)}")
