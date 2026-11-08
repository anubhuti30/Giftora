from typing import Dict, Any, List
from app.agents.state import AgentWorkflowState
from app.services.ranking_service import ranking_service


def rank_recommendations_node(state: AgentWorkflowState) -> Dict[str, Any]:
    """
    Ranks verified product candidates using the deterministic 5-factor scoring engine:
    Interest (35%), Budget (25%), Quality (20%), Usefulness (10%), Value (10%).
    """
    candidates = state.validated_products

    if not candidates:
        return {"ranked_recommendations": []}

    scored_candidates = ranking_service.rank_products(
        candidates=candidates,
        user_interests=state.user_interests,
        target_budget_max=state.maximum_budget,
    )

    # Convert ScoredProductCandidate models to dictionaries for state propagation
    ranked_dicts: List[Dict[str, Any]] = []
    # Index products by id or marketplace_product_id for fast lookup of metadata
    candidate_lookup = {}
    for c in candidates:
        cid = str(c.get("id") or c.get("marketplace_product_id") or "")
        if cid:
            candidate_lookup[cid] = c

    for scored in scored_candidates:
        orig = candidate_lookup.get(scored.product_source_id, {})
        title = scored.product_title or orig.get("title") or orig.get("product_title") or "Curated Gift"
        rating = float(orig.get("rating") or orig.get("source_rating") or 4.5)
        reviews = int(orig.get("review_count") or orig.get("source_review_count") or 50)

        ranked_dicts.append({
            "product_source_id": scored.product_source_id,
            "product_title": title,
            "marketplace_name": scored.marketplace_name,
            "price": float(scored.price),
            "original_price": float(orig.get("original_price")) if orig.get("original_price") else None,
            "discount_percentage": orig.get("discount_percentage"),
            "source_rating": rating,
            "source_review_count": reviews,
            "image_url": orig.get("image_url", ""),
            "product_url": orig.get("product_url", "#"),
            "category": orig.get("category", "Gifts"),
            "brand": orig.get("brand", ""),
            "final_score": scored.final_score,
            "interest_score": scored.interest_score,
            "budget_score": scored.budget_score,
            "quality_score": scored.quality_score,
            "usefulness_score": scored.usefulness_score,
            "value_score": scored.value_score,
            "ranking_position": scored.ranking_position,
            "match_explanation": scored.match_explanation,
            "is_curated": orig.get("is_curated", True),
            "availability_status": orig.get("availability_status", "in_stock"),
            "is_development_mock": bool(orig.get("is_development_mock", False)),
            "source_attribution": orig.get("source_attribution", ""),
        })

    return {"ranked_recommendations": ranked_dicts}
