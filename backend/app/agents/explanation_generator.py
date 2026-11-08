from typing import Dict, Any, List
from app.agents.state import AgentWorkflowState
from app.services.ai_service import ai_service, ExtractedGiftProfile


def generate_explanations_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Generates genuine, personalized explanations for WHY verified marketplace items
    match the recipient's passions and criteria.
    """
    recommendations = state.ranked_recommendations

    if not recommendations:
        return {"ranked_recommendations": []}

    profile = ExtractedGiftProfile(
        recipient_name=state.recipient_name,
        relationship=state.relationship,
        occasion=state.occasion,
        interests=state.user_interests,
        aesthetics=state.extracted_needs.get("aesthetics", []),
        minimum_budget=float(state.minimum_budget) if state.minimum_budget else None,
        maximum_budget=float(state.maximum_budget) if state.maximum_budget else None,
    )

    products_for_ai = [
        {
            "id": r.get("product_source_id"),
            "title": r.get("product_title"),
            "category": r.get("category"),
            "brand": r.get("brand"),
            "price": r.get("price"),
        }
        for r in recommendations[:10]
    ]

    explanations = ai_service.generate_match_explanations(
        recipient_profile=profile,
        verified_products=products_for_ai,
    )

    explanation_map = {e.product_id: e for e in explanations}

    updated_recs: List[Dict[str, Any]] = []
    for r in recommendations:
        item = dict(r)
        exp_match = explanation_map.get(r.get("product_source_id"))
        if exp_match:
            item["match_explanation"] = exp_match.explanation
            # AI match score can optionally calibrate or supplement the heuristic final_score
            item["ai_match_score"] = exp_match.match_score
        else:
            rel_str = state.relationship or "your recipient"
            item["match_explanation"] = (
                f"Curated selection tailored for {rel_str} "
                f"based on matching aesthetic and functional quality."
            )
            item["ai_match_score"] = item.get("final_score", 90.0)

        updated_recs.append(item)

    return {"ranked_recommendations": updated_recs}
