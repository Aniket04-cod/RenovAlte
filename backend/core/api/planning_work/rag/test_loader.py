"""
Test script to verify PDF loading works
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(__file__))

from document_loader import DocumentLoader

def test_pdfs():
    """Test loading the uploaded PDFs"""
    loader = DocumentLoader()
    docs_dir = os.path.join(os.path.dirname(__file__), "documents")
    
    test_files = [
        "Government Incentives.pdf",
        "Legal Compliance Framework for Residential Renova....pdf",
        "Renovation Process and Expected Challenges.pdf",
    ]
    
    print("=== TESTING PDF LOADING ===\n")
    
    results = {}
    for filename in test_files:
        pdf_path = os.path.join(docs_dir, filename)
        try:
            docs = loader.load_pdf(pdf_path)
            print(f"OK {filename}")
            print(f"   Chunks: {len(docs)}")
            if docs and len(docs) > 0:
                preview = docs[0].page_content[:300].replace('\n', ' ')
                print(f"   Preview: {preview}...")
            results[filename] = {"status": "success", "chunks": len(docs)}
            print()
        except Exception as e:
            print(f"FAIL {filename}: {str(e)}\n")
            results[filename] = {"status": "failed", "error": str(e)}
    
    return results

if __name__ == "__main__":
    results = test_pdfs()
    print("\n=== SUMMARY ===")
    for filename, result in results.items():
        if result["status"] == "success":
            print(f"  {filename}: {result['chunks']} chunks")
        else:
            print(f"  {filename}: FAILED - {result['error']}")
