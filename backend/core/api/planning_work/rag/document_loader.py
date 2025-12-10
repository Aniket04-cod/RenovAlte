"""
Document Loader & Chunker for RAG Pipeline
Loads PDFs, TXT, and Markdown files and splits them into semantic chunks
"""

import os
import logging
from typing import List
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.documents import Document

logger = logging.getLogger(__name__)


class DocumentLoader:
    """Load and chunk documents for RAG indexing"""

    def __init__(self, chunk_size: int = 1000, chunk_overlap: int = 200):
        """
        Args:
            chunk_size: Characters per chunk (~250 words)
            chunk_overlap: Overlap between chunks for context preservation
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=chunk_overlap,
            separators=["\n\n", "\n", ". ", " ", ""],  # Hierarchical splitting
            length_function=len,
        )

    def load_pdf(self, pdf_path: str) -> List[Document]:
        """Load and chunk a PDF file"""
        try:
            loader = PyPDFLoader(pdf_path)
            docs = loader.load()
            chunks = self.splitter.split_documents(docs)
            logger.info(f"✓ Loaded PDF {pdf_path}: {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Failed to load PDF {pdf_path}: {e}")
            return []

    def load_text(self, txt_path: str) -> List[Document]:
        """Load and chunk a TXT or markdown file"""
        try:
            loader = TextLoader(txt_path, encoding="utf-8")
            docs = loader.load()
            chunks = self.splitter.split_documents(docs)
            logger.info(f"✓ Loaded TXT {txt_path}: {len(chunks)} chunks")
            return chunks
        except Exception as e:
            logger.error(f"Failed to load TXT {txt_path}: {e}")
            return []

    def load_directory(self, directory_path: str) -> List[Document]:
        """Recursively load all PDF and TXT files from a directory"""
        all_chunks = []
        supported_extensions = (".pdf", ".txt", ".md")

        if not os.path.isdir(directory_path):
            logger.warning(f"Directory not found: {directory_path}")
            return all_chunks

        for root, dirs, files in os.walk(directory_path):
            for file in files:
                if file.lower().endswith(supported_extensions):
                    file_path = os.path.join(root, file)
                    try:
                        if file.lower().endswith(".pdf"):
                            chunks = self.load_pdf(file_path)
                        else:
                            chunks = self.load_text(file_path)
                        all_chunks.extend(chunks)
                    except Exception as e:
                        logger.error(f"Failed to process {file_path}: {e}")

        logger.info(f"✓ Loaded directory {directory_path}: {len(all_chunks)} total chunks")
        return all_chunks

    def add_metadata(self, documents: List[Document], doc_type: str = None, source_category: str = None) -> List[Document]:
        """Enrich documents with metadata for better filtering"""
        for doc in documents:
            if "source" not in doc.metadata:
                doc.metadata["source"] = "unknown"
            if doc_type:
                doc.metadata["doc_type"] = doc_type  # e.g., "regulation", "contract", "permit"
            if source_category:
                doc.metadata["category"] = source_category  # e.g., "GEG", "KfW", "regional"
        return documents


# Example usage:
if __name__ == "__main__":
    loader = DocumentLoader()
    doc_dir = "./rag/documents"

    # Load all documents
    docs = loader.load_directory(doc_dir)
    print(f"Loaded {len(docs)} document chunks")

    # Add metadata
    docs = loader.add_metadata(docs, doc_type="regulation", source_category="GEG")
    print(f"Added metadata to {len(docs)} documents")
