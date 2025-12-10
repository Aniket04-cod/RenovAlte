"""
Qdrant Vector Database Client Wrapper
Handles document indexing and semantic search
"""

import logging
from typing import List, Dict, Any, Optional
from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue
)

try:
    from langchain_core.documents import Document
except ImportError:
    from langchain.schema import Document

logger = logging.getLogger(__name__)


class QdrantVectorDB:
    """
    Wrapper for Qdrant vector database operations.
    Handles collection management, document indexing, and similarity search.
    """
    
    def __init__(
        self,
        host: str = "localhost",
        port: int = 6333,
        collection_name: str = "renovation_docs"
    ):
        """
        Initialize Qdrant client.
        
        Args:
            host: Qdrant server host
            port: Qdrant server port
            collection_name: Name of the collection to use
        """
        self.host = host
        self.port = port
        self.collection_name = collection_name
        
        logger.info(f"Connecting to Qdrant at {host}:{port}")
        try:
            self.client = QdrantClient(host=host, port=port)
            logger.info("Qdrant client connected successfully")
        except Exception as e:
            logger.error(f"Failed to connect to Qdrant: {str(e)}")
            raise
    
    def create_collection(self, embedding_dim: int, distance: Distance = Distance.COSINE):
        """
        Create a new collection or recreate if exists.
        
        Args:
            embedding_dim: Dimension of embedding vectors
            distance: Distance metric (COSINE, EUCLID, DOT)
        """
        try:
            # Check if collection exists
            collections = self.client.get_collections().collections
            collection_names = [c.name for c in collections]
            
            if self.collection_name in collection_names:
                logger.info(f"Collection '{self.collection_name}' already exists")
                return
            
            # Create collection
            logger.info(f"Creating collection '{self.collection_name}' with dimension {embedding_dim}")
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=embedding_dim,
                    distance=distance
                )
            )
            logger.info(f"Collection '{self.collection_name}' created successfully")
        except Exception as e:
            logger.error(f"Error creating collection: {str(e)}")
            raise
    
    def delete_collection(self):
        """Delete the collection if it exists."""
        try:
            self.client.delete_collection(collection_name=self.collection_name)
            logger.info(f"Collection '{self.collection_name}' deleted")
        except Exception as e:
            logger.warning(f"Could not delete collection: {str(e)}")
    
    def add_documents(
        self,
        documents: List[Document],
        embeddings: List[List[float]],
        batch_size: int = 100
    ):
        """
        Add documents with embeddings to the collection.
        
        Args:
            documents: List of LangChain Document objects
            embeddings: List of embedding vectors (must match documents length)
            batch_size: Number of documents to upload per batch
        """
        if len(documents) != len(embeddings):
            raise ValueError(f"Mismatch: {len(documents)} docs, {len(embeddings)} embeddings")
        
        logger.info(f"Adding {len(documents)} documents to collection '{self.collection_name}'")
        
        try:
            points = []
            for idx, (doc, embedding) in enumerate(zip(documents, embeddings)):
                # Create point with embedding and metadata
                point = PointStruct(
                    id=idx,
                    vector=embedding,
                    payload={
                        "text": doc.page_content,
                        "metadata": doc.metadata
                    }
                )
                points.append(point)
                
                # Upload in batches
                if len(points) >= batch_size:
                    self.client.upsert(
                        collection_name=self.collection_name,
                        points=points
                    )
                    logger.debug(f"Uploaded batch of {len(points)} points")
                    points = []
            
            # Upload remaining points
            if points:
                self.client.upsert(
                    collection_name=self.collection_name,
                    points=points
                )
                logger.debug(f"Uploaded final batch of {len(points)} points")
            
            logger.info(f"Successfully added {len(documents)} documents")
        except Exception as e:
            logger.error(f"Error adding documents: {str(e)}")
            raise
    
    def search(
        self,
        query_embedding: List[float],
        top_k: int = 5,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """
        Perform semantic similarity search.
        
        Args:
            query_embedding: Query vector
            top_k: Number of results to return
            filters: Optional metadata filters (e.g., {"category": "regulations"})
            
        Returns:
            List of search results with text, metadata, and score
        """
        try:
            # Build Qdrant filter if provided
            qdrant_filter = None
            if filters:
                conditions = []
                for key, value in filters.items():
                    conditions.append(
                        FieldCondition(
                            key=f"metadata.{key}",
                            match=MatchValue(value=value)
                        )
                    )
                if conditions:
                    qdrant_filter = Filter(must=conditions)
            
            # Perform search using query_points (Qdrant client v1.x API)
            logger.debug(f"Searching for top {top_k} results with filters: {filters}")
            results = self.client.query_points(
                collection_name=self.collection_name,
                query=query_embedding,
                limit=top_k,
                query_filter=qdrant_filter
            ).points
            
            # Format results
            formatted_results = []
            for hit in results:
                formatted_results.append({
                    "text": hit.payload["text"],
                    "metadata": hit.payload["metadata"],
                    "score": hit.score
                })
            
            logger.debug(f"Found {len(formatted_results)} results")
            return formatted_results
        except Exception as e:
            logger.error(f"Error searching: {str(e)}")
            raise
    
    def get_collection_info(self) -> Dict[str, Any]:
        """Get information about the collection."""
        try:
            info = self.client.get_collection(collection_name=self.collection_name)
            return {
                "name": self.collection_name,
                "points_count": info.points_count if hasattr(info, 'points_count') else 0,
                "vectors_count": info.vectors_count if hasattr(info, 'vectors_count') else info.points_count,
                "status": str(info.status) if hasattr(info, 'status') else "unknown"
            }
        except Exception as e:
            logger.error(f"Error getting collection info: {str(e)}")
            return {"error": str(e)}


# Singleton instance
_vector_db = None


def get_vector_db(
    host: str = "localhost",
    port: int = 6333,
    collection_name: str = "renovation_docs"
) -> QdrantVectorDB:
    """
    Get singleton vector DB instance.
    
    Args:
        host: Qdrant host
        port: Qdrant port
        collection_name: Collection name
        
    Returns:
        QdrantVectorDB instance
    """
    global _vector_db
    
    if _vector_db is None:
        logger.info("Initializing singleton vector DB client")
        _vector_db = QdrantVectorDB(host=host, port=port, collection_name=collection_name)
    
    return _vector_db
