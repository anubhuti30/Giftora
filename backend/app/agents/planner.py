from typing import Dict, Any
from app.agents.state import AgentWorkflowState
from app.services.ai_service import ai_service


def plan_search_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """Extracts recipient requirements and outlines the search direction."""
    extracted = ai_service.extract_gift_requirements(state.original_query)

    # Merge explicit inputs with extracted criteria
    interests = list(set(state.user_interests + extracted.interests))
    relationship = state.relationship or extracted.relationship or "Someone Special"
    occasion = state.occasion or extracted.occasion or "Celebration"

    min_budget = state.minimum_budget
    if min_budget is None and extracted.minimum_budget:
        min_budget = extracted.minimum_budget

    max_budget = state.maximum_budget
    if max_budget is None and extracted.maximum_budget:
        max_budget = extracted.maximum_budget

    return {
        "extracted_needs": {
            "relationship": relationship,
            "occasion": occasion,
            "interests": interests,
            "aesthetics": extracted.aesthetics,
            "clarifying_question": extracted.clarifying_question,
        },
        "user_interests": interests,
        "relationship": relationship,
        "occasion": occasion,
        "minimum_budget": min_budget,
        "maximum_budget": max_budget,
    }
