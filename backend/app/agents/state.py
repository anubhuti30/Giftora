from decimal import Decimal
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class AgentWorkflowState(BaseModel):
    # Inputs
    user_id: str
    recipient_id: Optional[str] = None
    recipient_name: Optional[str] = None
    relationship: Optional[str] = None
    occasion: Optional[str] = None
    original_query: str
    user_interests: List[str] = Field(default_factory=list)
    minimum_budget: Optional[Decimal] = None
    maximum_budget: Optional[Decimal] = None

    # Intermediate extraction & planning
    extracted_needs: Dict[str, Any] = Field(default_factory=dict)
    generated_search_queries: List[str] = Field(default_factory=list)
    raw_marketplace_items: List[Dict[str, Any]] = Field(default_factory=list)
    normalized_products: List[Dict[str, Any]] = Field(default_factory=list)
    validated_products: List[Dict[str, Any]] = Field(default_factory=list)

    # Final outputs
    ranked_recommendations: List[Dict[str, Any]] = Field(default_factory=list)
    visual_inspirations: List[Dict[str, Any]] = Field(default_factory=list)
    external_ai_destination: Optional[Dict[str, str]] = None
    search_session_id: Optional[str] = None
    error_message: Optional[str] = None
