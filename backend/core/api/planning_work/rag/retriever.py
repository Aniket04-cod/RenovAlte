"""
RAG Retrieval Service
Combines embeddings and vector DB for semantic search and context retrieval
"""

import logging
from typing import List, Dict, Any, Optional

try:
    from .embeddings import get_embeddings_service
    from .vector_db import get_vector_db
except ImportError:
    from embeddings import get_embeddings_service
    from vector_db import get_vector_db

logger = logging.getLogger(__name__)


class RAGRetriever:
    """
    High-level RAG retrieval service.
    Handles query embedding, similarity search, and context formatting.
    """
    
    def __init__(
        self,
        embeddings_model: str = "all-MiniLM-L6-v2",
        qdrant_host: str = "localhost",
        qdrant_port: int = 6333,
        collection_name: str = "renovation_docs"
    ):
        """
        Initialize RAG retriever with embeddings and vector DB.
        
        Args:
            embeddings_model: HuggingFace model name
            qdrant_host: Qdrant server host
            qdrant_port: Qdrant server port
            collection_name: Qdrant collection name
        """
        logger.info("Initializing RAG retriever")
        
        # Initialize services
        self.embeddings_service = get_embeddings_service(embeddings_model)
        self.vector_db = get_vector_db(qdrant_host, qdrant_port, collection_name)
        
        logger.info("RAG retriever initialized successfully")
    
    def retrieve_context(
        self,
        query: str,
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None,
        format_as_bullets: bool = True
    ) -> str:
        """
        Retrieve relevant context for a query.
        
        Args:
            query: User query or prompt
            top_k: Number of relevant chunks to retrieve
            filters: Optional metadata filters (e.g., {"category": "permits"})
            format_as_bullets: Format results as bullet points
            
        Returns:
            Formatted context string for prompt injection
        """
        if not query or not query.strip():
            logger.warning("Empty query provided")
            return ""
        
        try:
            # 1. Embed query
            logger.debug(f"Embedding query: {query[:100]}...")
            query_embedding = self.embeddings_service.embed_query(query)
            
            # 2. Search vector DB
            logger.debug(f"Searching for top {top_k} results")
            results = self.vector_db.search(
                query_embedding=query_embedding,
                top_k=top_k,
                filters=filters
            )
            
            if not results:
                logger.info("No results found")
                return ""
            
            # 3. Format results
            if format_as_bullets:
                context = self._format_as_bullets(results)
            else:
                context = self._format_as_paragraphs(results)
            
            logger.info(f"Retrieved {len(results)} chunks, formatted as {'bullets' if format_as_bullets else 'paragraphs'}")
            return context
        except Exception as e:
            logger.error(f"Error retrieving context: {str(e)}")
            return ""
    
    def retrieve_by_category(
        self,
        query: str,
        category: str,
        top_k: int = 3
    ) -> str:
        """
        Retrieve context filtered by category.
        
        Args:
            query: User query
            category: Category to filter by (regulations, permits, incentives, processes)
            top_k: Number of chunks to retrieve
            
        Returns:
            Formatted context string
        """
        return self.retrieve_context(
            query=query,
            top_k=top_k,
            filters={"category": category}
        )
    
    def retrieve_multi_category(
        self,
        query: str,
        categories: List[str],
        chunks_per_category: int = 2
    ) -> str:
        """
        Retrieve context from multiple categories.
        
        Args:
            query: User query
            categories: List of categories to search
            chunks_per_category: Number of chunks per category
            
        Returns:
            Formatted context with sections per category
        """
        all_context = []
        
        for category in categories:
            logger.debug(f"Retrieving from category: {category}")
            context = self.retrieve_by_category(
                query=query,
                category=category,
                top_k=chunks_per_category
            )
            if context:
                all_context.append(f"=== {category.upper()} ===\n{context}")
        
        return "\n\n".join(all_context)
    
    def _format_as_bullets(self, results: List[Dict[str, Any]]) -> str:
        """Format search results as bullet points."""
        bullets = []
        for idx, result in enumerate(results, 1):
            text = result["text"].strip()
            # Truncate long chunks
            if len(text) > 500:
                text = text[:497] + "..."
            bullets.append(f"• {text}")
        
        return "\n".join(bullets)
    
    def _format_as_paragraphs(self, results: List[Dict[str, Any]]) -> str:
        """Format search results as paragraphs."""
        paragraphs = []
        for result in results:
            text = result["text"].strip()
            metadata = result["metadata"]
            source = metadata.get("source", "Unknown")
            
            # Add source attribution
            paragraphs.append(f"{text}\n[Source: {source}]")
        
        return "\n\n".join(paragraphs)
    
    def get_collection_stats(self) -> Dict[str, Any]:
        """Get statistics about the indexed collection."""
        return self.vector_db.get_collection_info()


# Singleton instance
_rag_retriever = None


def get_rag_retriever(
    embeddings_model: str = "all-MiniLM-L6-v2",
    qdrant_host: str = "localhost",
    qdrant_port: int = 6333,
    collection_name: str = "renovation_docs"
) -> RAGRetriever:
    """
    Get singleton RAG retriever instance.
    
    Args:
        embeddings_model: HuggingFace model name
        qdrant_host: Qdrant host
        qdrant_port: Qdrant port
        collection_name: Collection name
        
    Returns:
        RAGRetriever instance
    """
    global _rag_retriever
    
    if _rag_retriever is None:
        logger.info("Initializing singleton RAG retriever")
        _rag_retriever = RAGRetriever(
            embeddings_model=embeddings_model,
            qdrant_host=qdrant_host,
            qdrant_port=qdrant_port,
            collection_name=collection_name
        )
    
    return _rag_retriever
