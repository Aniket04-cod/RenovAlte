"""
Comprehensive Document Review for RAG Pipeline
Analyzes all uploaded documents and provides recommendations
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from document_loader import DocumentLoader

def analyze_documents():
    """Analyze all documents in the documents folder"""
    loader = DocumentLoader()
    docs_dir = os.path.join(os.path.dirname(__file__), "documents")
    
    # All files in directory
    all_files = os.listdir(docs_dir)
    
    print("=" * 80)
    print("DOCUMENT ANALYSIS FOR RAG PIPELINE")
    print("=" * 80)
    print()
    
    # Categorize by file type and relevance
    relevant_docs = {
        "regulations": [],
        "permits": [],
        "incentives": [],
        "processes": [],
    }
    
    non_relevant = []
    unsupported = []
    
    # Test each file
    for filename in sorted(all_files):
        filepath = os.path.join(docs_dir, filename)
        filesize = os.path.getsize(filepath) / 1024  # KB
        
        print(f"File: {filename}")
        print(f"  Size: {filesize:.1f} KB")
        
        # Determine file type
        if filename.endswith('.png') or filename.endswith('.jpg'):
            print(f"  Status: SKIP (image file - not useful for text RAG)")
            unsupported.append(filename)
        elif filename.endswith('.docx'):
            print(f"  Status: UNSUPPORTED (DOCX - need python-docx library)")
            print(f"  Note: Convert to PDF or install python-docx to process")
            unsupported.append(filename)
        elif filename.lower().startswith('effective ai'):
            print(f"  Status: NON-RELEVANT (meta document about AI, not renovation)")
            non_relevant.append(filename)
        elif filename.lower().startswith('his project'):
            print(f"  Status: NON-RELEVANT (internal project doc, not renovation domain)")
            non_relevant.append(filename)
        elif filename.lower().startswith('expense'):
            print(f"  Status: MAYBE (expense data - might be examples or templates)")
            # Load and check
            try:
                docs = loader.load_pdf(filepath)
                if docs:
                    preview = docs[0].page_content[:200].lower()
                    if 'renovation' in preview or 'cost' in preview:
                        print(f"  Preview: Contains renovation/cost info - keep for reference")
                        relevant_docs["processes"].append(filename)
                    else:
                        print(f"  Preview: Generic expense doc - low relevance")
                        non_relevant.append(filename)
            except:
                non_relevant.append(filename)
        elif 'government' in filename.lower() or 'incentive' in filename.lower():
            print(f"  Status: RELEVANT (government incentives)")
            print(f"  Category: incentives")
            try:
                docs = loader.load_pdf(filepath)
                print(f"  Chunks: {len(docs)}")
                relevant_docs["incentives"].append(filename)
            except Exception as e:
                print(f"  Error: {str(e)}")
        elif 'legal' in filename.lower() or 'compliance' in filename.lower():
            print(f"  Status: RELEVANT (legal/compliance framework)")
            print(f"  Category: regulations")
            try:
                docs = loader.load_pdf(filepath)
                print(f"  Chunks: {len(docs)}")
                relevant_docs["regulations"].append(filename)
            except Exception as e:
                print(f"  Error: {str(e)}")
        elif 'permit' in filename.lower() or 'approval' in filename.lower():
            print(f"  Status: RELEVANT (permits/approvals)")
            print(f"  Category: permits")
            try:
                docs = loader.load_pdf(filepath)
                print(f"  Chunks: {len(docs)}")
                relevant_docs["permits"].append(filename)
            except Exception as e:
                print(f"  Error: {str(e)}")
        elif 'renovation' in filename.lower() or 'building' in filename.lower() or 'research' in filename.lower():
            print(f"  Status: RELEVANT (renovation processes/research)")
            print(f"  Category: processes")
            try:
                docs = loader.load_pdf(filepath)
                print(f"  Chunks: {len(docs)}")
                relevant_docs["processes"].append(filename)
            except Exception as e:
                print(f"  Error: {str(e)}")
        else:
            print(f"  Status: UNKNOWN")
            non_relevant.append(filename)
        
        print()
    
    # Summary
    print("=" * 80)
    print("SUMMARY & RECOMMENDATIONS")
    print("=" * 80)
    print()
    
    total_relevant = sum(len(v) for v in relevant_docs.values())
    
    print(f"Total files: {len(all_files)}")
    print(f"  Relevant for RAG: {total_relevant}")
    print(f"  Non-relevant: {len(non_relevant)}")
    print(f"  Unsupported formats: {len(unsupported)}")
    print()
    
    print("RELEVANT DOCUMENTS BY CATEGORY:")
    for category, files in relevant_docs.items():
        if files:
            print(f"\n{category.upper()} ({len(files)} files):")
            for f in files:
                print(f"  - {f}")
    
    if non_relevant:
        print(f"\nNON-RELEVANT (recommend removing):")
        for f in non_relevant:
            print(f"  - {f}")
    
    if unsupported:
        print(f"\nUNSUPPORTED FORMATS (convert or install dependencies):")
        for f in unsupported:
            print(f"  - {f}")
    
    print("\n" + "=" * 80)
    print("NEXT STEPS")
    print("=" * 80)
    print("""
1. Remove non-relevant files:
   - Effective AI Assistant.pdf
   - HIS Project - Sprint 1.docx (if confirmed internal)
   - Screenshot 2025-11-15 at 14.57.00.png

2. Convert DOCX to PDF or install python-docx:
   pip install python-docx
   Then add DOCX loader support to document_loader.py

3. Organize relevant files into subdirectories:
   documents/
     regulations/
       - Legal Compliance Framework...pdf
     permits/
       - Permits and Approvals...pdf (if converted)
       - Research Documentation_ German Building Permits...pdf
     incentives/
       - Government Incentives.pdf
     processes/
       - Renovation Process and Expected Challenges.pdf

4. Proceed to Step 4: Create Embeddings Service
   - Choose: sentence-transformers (HuggingFace) or Ollama nomic-embed-text
   - Create rag/embeddings.py with EmbeddingsService class

5. Create Vector DB client wrapper (Step 5)
   - Create rag/vector_db.py with QdrantVectorDB class

6. Index documents into Qdrant (Step 6)
   - Create rag/index_documents.py script
   - Run once to populate vector store

7. Integrate retrieval into services.py (Step 7)
   - Replace lightweight _kb dict with full RAG retrieval
    """)

if __name__ == "__main__":
    analyze_documents()
