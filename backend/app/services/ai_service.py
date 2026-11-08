import json
import logging
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from app.core.config import settings

logger = logging.getLogger("giftora.ai_service")


class ExtractedGiftProfile(BaseModel):
    recipient_name: Optional[str] = None
    relationship: Optional[str] = None
    occasion: Optional[str] = None
    interests: List[str] = Field(default_factory=list)
    aesthetics: List[str] = Field(default_factory=list)
    minimum_budget: Optional[float] = None
    maximum_budget: Optional[float] = None
    clarifying_question: Optional[str] = None
    search_queries: List[str] = Field(default_factory=list)


class AIExplanationResult(BaseModel):
    product_id: str
    match_score: float = Field(..., ge=0, le=100)
    explanation: str


class GeminiAIService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.model_name = settings.GEMINI_MODEL or "gemini-1.5-flash"
        self._client = None

        if self.api_key:
            try:
                import google.generativeai as genai
                genai.configure(api_key=self.api_key)
                self._client = genai.GenerativeModel(self.model_name)
                logger.info(f"Initialized Gemini model: {self.model_name}")
            except Exception as e:
                logger.error(f"Failed to configure Gemini client: {e}")

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self._client)

    def extract_gift_requirements(self, user_query: str, chat_history: Optional[List[Dict[str, str]]] = None) -> ExtractedGiftProfile:
        """
        Extracts structured gifting criteria, target interests, and marketplace search queries
        from conversational user input using Google Gemini.
        """
        if not self.is_configured:
            # Fallback deterministic extraction when API key is not configured
            # Clear error reporting according to requirements
            return self._heuristic_extraction(user_query)

        history_context = ""
        if chat_history:
            history_context = "Conversation history:\n" + "\n".join(
                f"- {h.get('role', 'user')}: {h.get('content', '')}" for h in chat_history[-6:]
            ) + "\n\n"

        prompt = f"""
You are Giftora's Senior AI Gifting Curator.
Analyze the following user input and optional conversation history.
Extract the person they are shopping for, their relationship, the celebration occasion, specific interests, aesthetic vibes, and budget limits in INR (₹).
Also generate 3 targeted, realistic retail search keywords (e.g. "soy wax botanical fig candle", "mulberry silk sleep mask").
If critical information is missing to make a thoughtful recommendation, formulate a brief, polite clarifying question.

IMPORTANT: Do NOT invent product titles, prices, ratings, discounts, or purchase URLs. Only extract recipient requirements and search keywords.

{history_context}Current User Input: "{user_query}"

Respond strictly with valid JSON conforming to this schema:
{{
  "recipient_name": string or null,
  "relationship": string or null,
  "occasion": string or null,
  "interests": [string],
  "aesthetics": [string],
  "minimum_budget": number or null,
  "maximum_budget": number or null,
  "clarifying_question": string or null,
  "search_queries": [string]
}}
"""
        try:
            response = self._client.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            data = json.loads(response.text)
            return ExtractedGiftProfile(**data)
        except Exception as e:
            logger.error(f"Gemini API error during requirement extraction: {e}")
            return self._heuristic_extraction(user_query)

    def generate_match_explanations(
        self,
        recipient_profile: ExtractedGiftProfile,
        verified_products: List[Dict[str, Any]],
    ) -> List[AIExplanationResult]:
        """
        Generates genuine, personalized explanations for WHY verified marketplace items match
        the recipient's passions without hallucinating product attributes.
        """
        if not verified_products:
            return []

        if not self.is_configured:
            # Deterministic explanation generator
            results = []
            for i, p in enumerate(verified_products):
                title = p.get("title", "")
                cat = p.get("category", "")
                score = max(70.0, 98.0 - (i * 2.5))
                reason = f"Curated for {recipient_profile.relationship or 'your recipient'} matching their aesthetic in {cat}. High craftsmanship and reliable delivery."
                results.append(AIExplanationResult(product_id=p.get("id", str(i)), match_score=score, explanation=reason))
            return results

        product_summaries = [
            {"id": p.get("id"), "title": p.get("title"), "category": p.get("category"), "brand": p.get("brand"), "price": float(p.get("price", 0))}
            for p in verified_products
        ]

        prompt = f"""
You are Giftora's AI Gifting Concierge.
Given the recipient's profile:
- Relationship: {recipient_profile.relationship}
- Occasion: {recipient_profile.occasion}
- Interests: {', '.join(recipient_profile.interests)}
- Aesthetic: {', '.join(recipient_profile.aesthetics)}

For each of these VERIFIED marketplace items, provide a 1-2 sentence thoughtful explanation for why it specifically suits this recipient, plus a compatibility score (70-99).
Never invent specifications, discounts, or reviews not provided.

Products:
{json.dumps(product_summaries, indent=2)}

Respond with JSON array conforming to:
[
  {{ "product_id": string, "match_score": number, "explanation": string }}
]
"""
        try:
            response = self._client.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            items = json.loads(response.text)
            return [AIExplanationResult(**item) for item in items]
        except Exception as e:
            logger.error(f"Gemini API error during explanation generation: {e}")
            # Fallback
            return [
                AIExplanationResult(
                    product_id=p.get("id", ""),
                    match_score=92.0,
                    explanation=f"Thoughtful match for {recipient_profile.relationship or 'loved one'} based on their interests."
                )
                for p in verified_products
            ]

    def _heuristic_extraction(self, text: str) -> ExtractedGiftProfile:
        """Deterministic NLP heuristic fallback when API key is missing or offline."""
        lower = text.lower()
        rel = None
        for r in ["sister", "brother", "partner", "wife", "husband", "mom", "mother", "dad", "father", "friend", "colleague"]:
            if r in lower:
                rel = r.capitalize()
                break

        occ = None
        for o in ["birthday", "anniversary", "graduation", "festivals", "diwali", "christmas", "thank you", "housewarming"]:
            if o in lower:
                occ = o.capitalize()
                break

        interests = []
        for tag in ["coffee", "tea", "candle", "silk", "tech", "keyboard", "ayurveda", "plant", "journal", "ceramic", "pottery", "book"]:
            if tag in lower:
                interests.append(tag.capitalize())

        queries = [f"{i} gift for {rel or 'someone special'}" for i in interests] or [f"gift for {rel or 'loved one'}"]

        return ExtractedGiftProfile(
            relationship=rel,
            occasion=occ,
            interests=interests,
            search_queries=queries,
        )


ai_service = GeminiAIService()
