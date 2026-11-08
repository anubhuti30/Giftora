from typing import Dict, Any, List
from app.agents.state import AgentWorkflowState


def generate_queries_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """Generates multiple targeted marketplace search queries."""
    queries: List[str] = []
    interests = state.user_interests or ["curated gifts"]
    rel = state.relationship or "recipient"
    occ = state.occasion or ""

    for interest in interests[:3]:
        queries.append(f"{interest} gift for {rel}")
        if occ:
            queries.append(f"{interest} {occ} gift")

    if not queries:
        queries.append(state.original_query)

    return {"generated_search_queries": queries[:4]}
