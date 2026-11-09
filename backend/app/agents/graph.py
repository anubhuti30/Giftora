import logging
from typing import Dict, Any, Optional
from decimal import Decimal
from langgraph.graph import StateGraph, END
from app.agents.state import AgentWorkflowState
from app.agents.planner import plan_search_node
from app.agents.query_generator import generate_queries_node
from app.agents.product_normalizer import normalize_products_node
from app.agents.product_verifier import verify_products_node
from app.agents.recommendation_ranker import rank_recommendations_node
from app.agents.explanation_generator import generate_explanations_node

logger = logging.getLogger("giftora.agents.graph")


def build_gift_curator_graph():
    """
    Constructs and compiles the multi-step Giftora Curator Agent graph:
    1. plan_search: extract recipient needs & intent
    2. generate_queries: produce marketplace search queries
    3. normalize_products: aggregate and deduplicate marketplace items
    4. verify_products: availability check and strict budget enforcement
    5. rank_recommendations: 5-factor deterministic multi-criteria scoring
    6. generate_explanations: contextual AI reasons for matches
    """
    workflow = StateGraph(AgentWorkflowState)

    # Register nodes
    workflow.add_node("plan_search", plan_search_node)
    workflow.add_node("generate_queries", generate_queries_node)
    workflow.add_node("normalize_products", normalize_products_node)
    workflow.add_node("verify_products", verify_products_node)
    workflow.add_node("rank_recommendations", rank_recommendations_node)
    workflow.add_node("generate_explanations", generate_explanations_node)

    # Establish linear flow with validation
    workflow.set_entry_point("plan_search")
    workflow.add_edge("plan_search", "generate_queries")
    workflow.add_edge("generate_queries", "normalize_products")
    workflow.add_edge("normalize_products", "verify_products")
    workflow.add_edge("verify_products", "rank_recommendations")
    workflow.add_edge("rank_recommendations", "generate_explanations")
    workflow.add_edge("generate_explanations", END)

    return workflow.compile()


gift_curator_app = build_gift_curator_graph()


def run_gift_curator(
    user_id: str,
    original_query: str,
    recipient_id: Optional[str] = None,
    recipient_name: Optional[str] = None,
    relationship: Optional[str] = None,
    occasion: Optional[str] = None,
    user_interests: Optional[list] = None,
    minimum_budget: Optional[Decimal] = None,
    maximum_budget: Optional[Decimal] = None,
) -> Dict[str, Any]:
    """
    Executes the curated gift discovery workflow synchronously or as an invoked task.
    Returns the populated state including ranked_recommendations and extracted_needs.
    """
    initial_state = AgentWorkflowState(
        user_id=user_id,
        recipient_id=recipient_id,
        recipient_name=recipient_name,
        relationship=relationship,
        occasion=occasion,
        original_query=original_query,
        user_interests=user_interests or [],
        minimum_budget=minimum_budget,
        maximum_budget=maximum_budget,
    )

    try:
        final_state = gift_curator_app.invoke(initial_state)
        # Final state can be a dict or AgentWorkflowState depending on langgraph version
        res_dict = final_state if isinstance(final_state, dict) else final_state.model_dump()

        # Generate separate Pinterest visual inspiration (never represented as shopping products)
        from app.connectors.pinterest import PinterestConnector
        import urllib.parse
        interests = res_dict.get("user_interests") or user_interests or []
        occ = res_dict.get("occasion") or occasion
        rel = res_dict.get("relationship") or relationship or "recipient"
        pin_connector = PinterestConnector()
        inspirations = pin_connector.get_inspirations(
            interests=interests,
            occasion=occ,
            recipient_relationship=rel,
            limit=4,
        )
        res_dict["visual_inspirations"] = [item.model_dump() for item in inspirations]

        # External AI Inspiration Destination (ChatGPT prompt pre-fill)
        interests_str = ", ".join(interests) if interests else "thoughtful gifts"
        budget_str = f"up to INR {maximum_budget}" if maximum_budget else "flexible"
        prompt_query = f"I am searching for thoughtful gift ideas for my {rel} for {occ or 'a special occasion'}. Their passions include {interests_str}, budget {budget_str}. Please suggest creative and personalized gift concepts."
        res_dict["external_ai_destination"] = {
            "provider": "ChatGPT",
            "title": "Brainstorm further concepts on ChatGPT",
            "description": "Launch an external AI brainstorm session with pre-filled recipient context.",
            "destination_url": f"https://chatgpt.com/?q={urllib.parse.quote_plus(prompt_query)}",
            "is_retailer": False,
        }

        return res_dict
    except Exception as e:
        logger.error(f"Error executing gift curator graph: {e}", exc_info=True)
        # Fallback graceful return with heuristic products
        return {
            "user_id": user_id,
            "original_query": original_query,
            "error_message": str(e),
            "ranked_recommendations": [],
            "extracted_needs": {},
        }
