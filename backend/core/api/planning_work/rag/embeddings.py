"""
Embeddings Service for RAG Pipeline
Generates vector embeddings using sentence-transformers (HuggingFace)
"""

import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)


class EmbeddingsService:
    """
    Generates embeddings for documents and queries using sentence-transformers.
    Uses 'all-MiniLM-L6-v2' model: fast, lightweight, good quality for semantic search.
    
    Model specs:
    - Dimensions: 384
    - Max sequence length: 256 tokens
    - Size: ~80MB
    - Performance: ~14,000 sentences/sec on GPU, ~2,000 on CPU
    """
    
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize embeddings service with specified model.
        
        Args:
            model_name: HuggingFace model name (default: all-MiniLM-L6-v2)
        """
        self.model_name = model_name
        logger.info(f"Loading embeddings model: {model_name}")
        
        try:
            self.model = SentenceTransformer(model_name)
            self.embedding_dim = self.model.get_sentence_embedding_dimension()
            logger.info(f"Model loaded successfully. Embedding dimension: {self.embedding_dim}")
        except Exception as e:
            logger.error(f"Failed to load embeddings model: {str(e)}")
            raise
    
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """
        Generate embeddings for a list of document texts.
        
        Args:
            texts: List of text strings to embed
            
        Returns:
            List of embedding vectors (each is a list of floats)
        """
        if not texts:
            logger.warning("embed_documents called with empty list")
            return []
        
        try:
            logger.debug(f"Embedding {len(texts)} documents")
            embeddings = self.model.encode(
                texts,
                batch_size=32,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            # Convert numpy arrays to Python lists for JSON serialization
            return [emb.tolist() for emb in embeddings]
        except Exception as e:
            logger.error(f"Error embedding documents: {str(e)}")
            raise
    
    def embed_query(self, text: str) -> List[float]:
        """
        Generate embedding for a single query text.
        
        Args:
            text: Query text string
            
        Returns:
            Embedding vector (list of floats)
        """
        if not text or not text.strip():
            logger.warning("embed_query called with empty text")
            return [0.0] * self.embedding_dim
        
        try:
            logger.debug(f"Embedding query: {text[:100]}...")
            embedding = self.model.encode(
                text,
                show_progress_bar=False,
                convert_to_numpy=True
            )
            return embedding.tolist()
        except Exception as e:
            logger.error(f"Error embedding query: {str(e)}")
            raise
    
    def get_embedding_dimension(self) -> int:
        """Get the dimensionality of embeddings produced by this model."""
        return self.embedding_dim


# Singleton instance for reuse across requests
_embeddings_service = None


def get_embeddings_service(model_name: str = "all-MiniLM-L6-v2") -> EmbeddingsService:
    """
    Get singleton embeddings service instance.
    Loads model once and reuses across requests for efficiency.
    
    Args:
        model_name: HuggingFace model name
        
    Returns:
        EmbeddingsService instance
    """
    global _embeddings_service
    
    if _embeddings_service is None:
        logger.info("Initializing singleton embeddings service")
        _embeddings_service = EmbeddingsService(model_name)
    
    return _embeddings_service
