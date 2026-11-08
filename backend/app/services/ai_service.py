"""Defensive Gemini integration with a deterministic, non-inventing fallback."""
import json
import logging
import re
import time
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, field_validator

from app.core.config import settings

logger = logging.getLogger("giftora.ai_service")


class ExtractedGiftProfile(BaseModel):
    recipient_name: Optional[str] = Field(default=None, max_length=255)
    relationship: Optional[str] = Field(default=None, max_length=100)
    occasion: Optional[str] = Field(default=None, max_length=100)
    interests: List[str] = Field(default_factory=list, max_length=20)
    aesthetics: List[str] = Field(default_factory=list, max_length=20)
    minimum_budget: Optional[Decimal] = Field(default=None, ge=0, le=10_000_000)
    maximum_budget: Optional[Decimal] = Field(default=None, ge=0, le=10_000_000)
    clarifying_question: Optional[str] = Field(default=None, max_length=500)
    search_queries: List[str] = Field(default_factory=list, max_length=5)

    @field_validator("interests", "aesthetics", mode="before")
    @classmethod
    def normalize_string_list(cls, value: Any) -> List[str]:
        return [item.strip() for item in value if isinstance(item, str) and item.strip()][:20] if isinstance(value, list) else []

    @field_validator("search_queries", mode="before")
    @classmethod
    def normalize_search_queries(cls, value: Any) -> List[str]:
        return [item.strip() for item in value if isinstance(item, str) and item.strip()][:5] if isinstance(value, list) else []

    @field_validator("recipient_name", "relationship", "occasion", "clarifying_question", mode="before")
    @classmethod
    def normalize_optional_string(cls, value: Any) -> Optional[str]:
        return value.strip() if isinstance(value, str) and value.strip() else None

    @field_validator("minimum_budget", "maximum_budget", mode="before")
    @classmethod
    def normalize_budget(cls, value: Any) -> Optional[Decimal]:
        if value is None or isinstance(value, bool):
            return None
        try:
            return Decimal(str(value))
        except (InvalidOperation, ValueError):
            return None

    def model_post_init(self, __context: Any) -> None:
        if self.minimum_budget is not None and self.maximum_budget is not None and self.minimum_budget > self.maximum_budget:
            self.minimum_budget = self.maximum_budget = None


class AIExplanationResult(BaseModel):
    product_id: str = Field(min_length=1)
    match_score: float = Field(ge=0, le=100)
    explanation: str = Field(min_length=1, max_length=1000)


class GeminiAIService:
    def __init__(self) -> None:
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self._client = None
        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
                logger.info("Gemini client initialized", extra={"model": self.model_name})
            except Exception as exc:
                logger.warning("Gemini client unavailable", extra={"reason": type(exc).__name__})

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self._client)

    @staticmethod
    def _parse_json_response(raw: Any) -> Optional[Dict[str, Any]]:
        """Accept one JSON object, with optional Markdown code fences."""
        if not isinstance(raw, str) or not raw.strip():
            return None
        candidate = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip(), flags=re.IGNORECASE)
        try:
            decoded = json.loads(candidate)
        except json.JSONDecodeError:
            return None
        return decoded if isinstance(decoded, dict) else None

    @staticmethod
    def _is_transient_error(exc: Exception) -> bool:
        message = str(exc).lower()
        return any(term in message for term in ("timeout", "temporar", "429", "quota", "rate limit", "503", "unavailable", "connection"))

    def _generate(self, prompt: str):
        """Use a short bounded retry only for provider/network transient failures."""
        last_error: Optional[Exception] = None
        for attempt in range(2):
            try:
                return self._client.generate_content(
                    prompt,
                    generation_config={"response_mime_type": "application/json"},
                    request_options={"timeout": 10},
                )
            except Exception as exc:
                last_error = exc
                if attempt == 0 and self._is_transient_error(exc):
                    time.sleep(0.2)
                    continue
                raise
        raise last_error or RuntimeError("Gemini generation failed")

    def extract_gift_requirements(self, user_query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> ExtractedGiftProfile:
        """Preserve valid partial model output and fall back only when it is unusable."""
        if not self.is_configured:
            logger.info("AI extraction fallback activated", extra={"reason": "not_configured"})
            return self._heuristic_extraction(user_query)
        history = "\n".join(f"- {item.get('role', 'user')}: {item.get('content', '')}" for item in (chat_history or [])[-6:] if isinstance(item, dict))
        prompt = f"""Extract only facts explicitly stated in this gifting request. Do not infer a budget, interest, or personality trait. Return one JSON object with keys recipient_name, relationship, occasion, interests, aesthetics, minimum_budget, maximum_budget, clarifying_question, search_queries. Unknown values must be null or [].\nConversation:\n{history}\nRequest: {user_query}"""
        try:
            response = self._generate(prompt)
            payload = self._parse_json_response(getattr(response, "text", None))
            if payload is None:
                raise ValueError("invalid JSON object")
            profile = ExtractedGiftProfile.model_validate(payload)
            logger.info("AI extraction completed", extra={"status": "validated", "has_budget": profile.maximum_budget is not None})
            return profile
        except Exception as exc:
            logger.warning("AI extraction fallback activated", extra={"reason": type(exc).__name__})
            return self._heuristic_extraction(user_query)

    def generate_match_explanations(self, recipient_profile: ExtractedGiftProfile, verified_products: List[Dict[str, Any]]) -> List[AIExplanationResult]:
        if not verified_products:
            return []
        fallback = self._deterministic_explanations(recipient_profile, verified_products)
        if not self.is_configured:
            return fallback
        products = [{"id": str(p.get("id", "")), "title": p.get("title"), "category": p.get("category"), "brand": p.get("brand"), "price": p.get("price")} for p in verified_products]
        prompt = f"""Create a concise gift-match explanation only from the verified product fields below. Do not claim delivery, craftsmanship, ratings, discounts, or specifications not supplied. Return a JSON array of objects with product_id, match_score (0-100), and explanation. Recipient facts: relationship={recipient_profile.relationship!r}; occasion={recipient_profile.occasion!r}; interests={recipient_profile.interests!r}; aesthetics={recipient_profile.aesthetics!r}. Products: {json.dumps(products, default=str)}"""
        try:
            response = self._generate(prompt)
            raw = json.loads(re.sub(r"^```(?:json)?\s*|\s*```$", "", getattr(response, "text", "").strip(), flags=re.IGNORECASE))
            if not isinstance(raw, list):
                raise ValueError("expected explanation list")
            expected_ids = {product["id"] for product in products if product["id"]}
            valid = []
            for item in raw:
                if isinstance(item, dict):
                    parsed = AIExplanationResult.model_validate(item)
                    if parsed.product_id in expected_ids:
                        valid.append(parsed)
            return valid or fallback
        except Exception as exc:
            logger.warning("AI explanation fallback activated", extra={"reason": type(exc).__name__})
            return fallback

    @staticmethod
    def _deterministic_explanations(recipient_profile: ExtractedGiftProfile, products: List[Dict[str, Any]]) -> List[AIExplanationResult]:
        interest_text = ", ".join(recipient_profile.interests[:2]) or "the details you shared"
        return [
            AIExplanationResult(
                product_id=str(product.get("id", index)),
                match_score=max(70.0, 98.0 - index * 2.5),
                explanation=f"Considered for {recipient_profile.relationship or 'your recipient'} because it aligns with {interest_text} in the listed {product.get('category') or 'gift'} category.",
            )
            for index, product in enumerate(products)
            if product.get("id") is not None
        ]

    def _heuristic_extraction(self, text: str) -> ExtractedGiftProfile:
        lower = text.lower()
        has_term = lambda term: bool(re.search(rf"(?<!\w){re.escape(term)}(?!\w)", lower))
        relationship = next((item.capitalize() for item in ["sister", "brother", "partner", "wife", "husband", "mom", "mother", "dad", "father", "friend", "colleague"] if has_term(item)), None)
        occasion = next((item.capitalize() for item in ["birthday", "anniversary", "graduation", "festivals", "diwali", "christmas", "thank you", "housewarming"] if has_term(item)), None)
        interests = [item.capitalize() for item in ["coffee", "tea", "candle", "silk", "tech", "keyboard", "ayurveda", "plant", "journal", "ceramic", "pottery", "book"] if has_term(item)]
        return ExtractedGiftProfile(relationship=relationship, occasion=occasion, interests=interests, search_queries=[f"{item} gift" for item in interests][:3])


ai_service = GeminiAIService()
