from decimal import Decimal
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class RankingWeights(BaseModel):
    interest_relevance: float = 0.35
    budget_fit: float = 0.25
    quality_evidence: float = 0.20
    practical_usefulness: float = 0.10
    value_for_money: float = 0.10


class ScoredProductCandidate(BaseModel):
    product_source_id: str
    product_title: str
    marketplace_name: str
    price: Decimal
    final_score: float = Field(..., ge=0, le=100)
    interest_score: float
    budget_score: float
    quality_score: float
    usefulness_score: float
    value_score: float
    ranking_position: int = 1
    match_explanation: str = ""


class ProductRankingService:
    def __init__(self, weights: Optional[RankingWeights] = None):
        self.weights = weights or RankingWeights()

    def filter_strict_budget(
        self,
        products: List[Dict[str, Any]],
        minimum_budget: Optional[Decimal] = None,
        maximum_budget: Optional[Decimal] = None,
    ) -> List[Dict[str, Any]]:
        """
        Applies non-negotiable budget bounds BEFORE scoring.
        Items exceeding the maximum budget or below the minimum floor are strictly pruned.
        """
        filtered = []
        for p in products:
            price = Decimal(str(p.get("current_price") or p.get("price") or 0))
            if minimum_budget is not None and price < minimum_budget:
                continue
            if maximum_budget is not None and price > maximum_budget:
                continue
            filtered.append(p)
        return filtered

    def rank_products(
        self,
        candidates: List[Dict[str, Any]],
        user_interests: List[str],
        target_budget_max: Optional[Decimal] = None,
    ) -> List[ScoredProductCandidate]:
        """
        Calculates deterministic multi-criteria scores according to configured weights:
        - Interest relevance: 35%
        - Budget fit: 25%
        - Quality evidence: 20%
        - Practical usefulness: 10%
        - Value for money: 10%
        """
        scored: List[ScoredProductCandidate] = []

        interests_lower = [i.lower() for i in user_interests]

        for item in candidates:
            price = Decimal(str(item.get("current_price") or item.get("price") or 0))
            title = str(item.get("title") or item.get("product_title") or item.get("canonical_name") or "")
            prod_id = str(item.get("id") or item.get("marketplace_product_id") or "")
            category = str(item.get("category") or "")
            rating = float(item.get("rating") or item.get("source_rating") or 4.5)
            reviews = int(item.get("review_count") or item.get("source_review_count") or 50)
            orig_price = item.get("original_price")

            # 1. Interest Relevance (0-100)
            text_corpus = f"{title} {category}".lower()
            matched_interests = sum(1 for tag in interests_lower if tag in text_corpus)
            if interests_lower:
                interest_score = min(100.0, 60.0 + (matched_interests / len(interests_lower)) * 40.0)
            else:
                interest_score = 75.0

            # 2. Budget Fit (0-100)
            # Optimal sweet spot is between 60% and 95% of target budget ceiling
            if target_budget_max and target_budget_max > 0:
                ratio = float(price / target_budget_max)
                if 0.5 <= ratio <= 0.95:
                    budget_score = 95.0
                elif ratio < 0.5:
                    budget_score = 80.0
                elif ratio <= 1.0:
                    budget_score = 90.0
                else:
                    budget_score = 40.0
            else:
                budget_score = 85.0

            # 3. Quality Evidence (0-100) - based on rating and reviews
            norm_rating = (min(5.0, max(1.0, rating)) / 5.0) * 80.0
            review_bonus = min(20.0, (reviews / 500.0) * 20.0)
            quality_score = min(100.0, norm_rating + review_bonus)

            # 4. Practical Usefulness (0-100)
            # High-utility categories like Home, Wellness, Tech receive baseline scores
            util_cats = ["home", "tech", "wellness", "kitchen", "stationery", "apparel"]
            usefulness_score = 90.0 if any(c in category.lower() for c in util_cats) else 75.0

            # 5. Value for Money (0-100)
            if orig_price and Decimal(str(orig_price)) > price:
                disc = float((Decimal(str(orig_price)) - price) / Decimal(str(orig_price)))
                value_score = min(100.0, 75.0 + (disc * 50.0))
            else:
                value_score = 80.0

            final_score = (
                (interest_score * self.weights.interest_relevance)
                + (budget_score * self.weights.budget_fit)
                + (quality_score * self.weights.quality_evidence)
                + (usefulness_score * self.weights.practical_usefulness)
                + (value_score * self.weights.value_for_money)
            )

            scored.append(
                ScoredProductCandidate(
                    product_source_id=prod_id,
                    product_title=title,
                    marketplace_name=str(item.get("marketplace_name") or "Curated Marketplace"),
                    price=price,
                    final_score=round(final_score, 2),
                    interest_score=round(interest_score, 2),
                    budget_score=round(budget_score, 2),
                    quality_score=round(quality_score, 2),
                    usefulness_score=round(usefulness_score, 2),
                    value_score=round(value_score, 2),
                )
            )

        # Sort descending by final score
        scored.sort(key=lambda x: x.final_score, reverse=True)

        # Assign positions
        for idx, candidate in enumerate(scored):
            candidate.ranking_position = idx + 1

        return scored


ranking_service = ProductRankingService()
