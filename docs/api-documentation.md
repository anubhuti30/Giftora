# Giftora REST API Documentation

The Giftora backend exposes a REST API powered by FastAPI with interactive Swagger OpenAPI documentation available at:
`http://localhost:8000/docs`

---

## 1. Authentication Endpoints

### Register User
- **POST** `/api/v1/auth/register`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "StrongPassword123!",
    "full_name": "Ananya Sharma",
    "preferred_currency": "INR"
  }
  ```
- **Response**: `201 Created`

### Login (OAuth2 Form / JSON)
- **POST** `/api/v1/auth/login`
- **Request Body** (form-urlencoded or JSON):
  `username=user@example.com&password=StrongPassword123!`
- **Response**:
  ```json
  {
    "access_token": "eyJhbGciOi...",
    "refresh_token": "eyJhbGciOi...",
    "token_type": "bearer",
    "expires_in": 86400
  }
  ```

### Get Current User Profile
- **GET** `/api/v1/auth/me`
- **Headers**: `Authorization: Bearer <access_token>`

---

## 2. Gift Discovery & Search Endpoints

### Execute Gift Search (LangGraph Workflow)
- **POST** `/api/v1/search/gift-search`
- **Request Body**:
  ```json
  {
    "relationship": "Sister",
    "occasion": "Birthday",
    "interests": ["Aromatherapy", "Ceramics"],
    "minimum_budget": 500,
    "maximum_budget": 3500,
    "query": "Aesthetic handmade candle or ceramic set for quiet evenings"
  }
  ```
- **Response**:
  ```json
  {
    "search_id": "9b81ef12-...",
    "query": "gift for Sister for Birthday interested in Aromatherapy, Ceramics",
    "extracted_needs": {
      "relationship": "Sister",
      "occasion": "Birthday",
      "interests": ["Aromatherapy", "Ceramics"]
    },
    "recommendations_count": 5,
    "recommendations": [
      {
        "ranking_position": 1,
        "product_title": "Botanical Fig Soy Candle with Ceramic Vessel",
        "marketplace_name": "Amazon India",
        "price": 1499.0,
        "final_score": 91.25,
        "match_explanation": "Hand-poured ceramic candle matching her love for ceramics and quiet aesthetic evenings."
      }
    ]
  }
  ```

---

## 3. Conversational AI Assistant

### Chat with Concierge
- **POST** `/api/v1/chat`
- **Request Body**:
  ```json
  {
    "message": "I want to get a coffee gift for my brother under ₹4000"
  }
  ```
- **Response**:
  ```json
  {
    "conversation_id": "...",
    "reply_message": {
      "sender_type": "assistant",
      "message_content": "I love this idea! For Brother, focusing on Coffee creates a thoughtful touch..."
    },
    "suggested_quick_replies": [
      "Find gifts under ₹3,000",
      "Show premium aesthetic options"
    ]
  }
  ```

---

## 4. Recipients Management

- **GET** `/api/v1/recipients`: List all user recipients.
- **POST** `/api/v1/recipients`: Create recipient profile with interests & budget limits.
- **GET** `/api/v1/recipients/{id}`: Get recipient details.
- **PUT** `/api/v1/recipients/{id}`: Update recipient profile.
- **DELETE** `/api/v1/recipients/{id}`: Delete recipient.

---

## 5. Wishlist & Comparison

- **GET** `/api/v1/wishlist`: Retrieve saved wishlist items.
- **POST** `/api/v1/wishlist`: Add product to wishlist (`{ "product_source_id": "..." }`).
- **DELETE** `/api/v1/wishlist/{item_id}`: Remove item from wishlist.
- **POST** `/api/v1/compare`: Create comparison matrix (`{ "product_source_ids": ["id1", "id2"] }`).
- **GET** `/api/v1/compare/{id}`: Get side-by-side product comparisons.

---

## 6. Health & Verification

- **GET** `/health`: Overall service status.
- **GET** `/health/database`: MySQL 8.0 connectivity check.
- **GET** `/health/ai`: Gemini AI engine status.
- **GET** `/health/connectors`: Status of Amazon, Flipkart, Myntra connectors.
