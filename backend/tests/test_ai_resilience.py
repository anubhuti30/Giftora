from app.services.ai_service import ExtractedGiftProfile, GeminiAIService


class Response:
    def __init__(self, text):
        self.text = text


class Client:
    def __init__(self, response=None, error=None):
        self.response, self.error = response, error

    def generate_content(self, *_args, **_kwargs):
        if self.error:
            raise self.error
        return self.response


def service_with(response=None, error=None):
    service = GeminiAIService()
    service._client = Client(response, error)
    service.api_key = "test-key"
    return service


def test_valid_response_is_normalized():
    profile = service_with(Response('{"relationship":" sister ","interests":["coffee", 12],"maximum_budget":"5000"}')).extract_gift_requirements("gift")
    assert profile.relationship == "sister"
    assert profile.interests == ["coffee"]
    assert profile.maximum_budget == 5000


def test_malformed_or_empty_response_falls_back_without_budget():
    for response in (Response("not json"), Response("")):
        profile = service_with(response).extract_gift_requirements("birthday gift for sister")
        assert profile.relationship == "Sister"
        assert profile.maximum_budget is None


def test_partial_response_preserves_valid_fields_and_discards_invalid_types():
    profile = service_with(Response('{"occasion":"birthday","interests":"not-a-list","minimum_budget":false,"maximum_budget":"unknown"}')).extract_gift_requirements("gift")
    assert profile.occasion == "birthday"
    assert profile.interests == []
    assert profile.minimum_budget is None and profile.maximum_budget is None


def test_reversed_budgets_are_not_invented():
    profile = service_with(Response('{"minimum_budget":5000,"maximum_budget":500}')).extract_gift_requirements("gift")
    assert profile.minimum_budget is None and profile.maximum_budget is None


def test_timeout_quota_and_unexpected_structure_fall_back():
    for response, error in ((None, TimeoutError()), (None, RuntimeError("quota exceeded")), (Response("[]"), None)):
        profile = service_with(response, error).extract_gift_requirements("coffee gift for friend")
        assert profile.interests == ["Coffee"]


def test_valid_ai_explanations_are_used_only_for_known_product_ids():
    service = service_with(Response('[{"product_id":"product-1","match_score":88,"explanation":"Matches the listed coffee interest."},{"product_id":"unknown","match_score":90,"explanation":"Ignore me."}]'))
    results = service.generate_match_explanations(ExtractedGiftProfile(interests=["coffee"]), [{"id": "product-1", "category": "Kitchen"}])
    assert len(results) == 1
    assert results[0].product_id == "product-1"
    assert results[0].match_score == 88


def test_invalid_ai_explanations_use_deterministic_verified_data_only():
    service = service_with(Response("not-json"))
    results = service.generate_match_explanations(ExtractedGiftProfile(relationship="Friend"), [{"id": "product-1", "category": "Books"}])
    assert len(results) == 1
    assert "Friend" in results[0].explanation
    assert "Books" in results[0].explanation


def test_fallback_does_not_match_keywords_inside_unrelated_words():
    profile = GeminiAIService()._heuristic_extraction("My team is booking a room for an anniversary")
    assert profile.interests == []
    assert profile.relationship is None


def test_extremely_long_or_nested_model_payload_uses_safe_fallback():
    oversized = "x" * 3_000
    profile = service_with(Response('{"interests": {"nested": ["coffee"]}, "relationship": "' + oversized + '"}')).extract_gift_requirements("gift for friend")
    assert profile.relationship == "Friend"
    assert profile.interests == []
