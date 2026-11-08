# Giftora System Architecture

Giftora is an AI-powered personalized gift discovery and multi-marketplace shopping platform. It combines a Next.js App Router frontend with a Python FastAPI backend, MySQL 8.0 relational database, Google Gemini AI, and LangGraph agent workflow.

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 16+ Frontend                      │
│        (App Router, Tailwind CSS, Lucide Icons)             │
│            http://localhost:3000                            │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON API (REST)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend                          │
│            http://localhost:8000                            │
├──────────────────────────────┬──────────────────────────────┤
│  • JWT Auth & Argon2id       │  • LangGraph Gift Curator    │
│  • Pydantic v2 Schemas       │  • 5-Factor Ranking Engine   │
│  • Dependency Injection      │  • Marketplace Connectors    │
└──────────────┬───────────────┴──────────────┬───────────────┘
               │                              │
               ▼                              ▼
┌──────────────────────────────┐ ┌────────────────────────────┐
│      MySQL 8.0 Server        │ │      External Services     │
│   (Database: giftora_db)     │ │ • Google Gemini API        │
│   • 18 Normalized Tables     │ │ • Amazon PA-API (or Mock)  │
│   • UTF8MB4 & FK Cascades    │ │ • Flipkart API (or Mock)   │
│   • SQLAlchemy 2.x & Alembic │ │ • Myntra Feed (or Mock)    │
└──────────────────────────────┘ └────────────────────────────┘
```

---

## 2. Multi-Agent LangGraph Workflow

The gift discovery pipeline is coordinated through a stateful LangGraph graph (`AgentWorkflowState`):

1. **`plan_search`**: Analyzes user input, extracts recipient identity, relationship, occasion, aesthetic tags, and budget bounds using Google Gemini with deterministic NLP fallback.
2. **`generate_queries`**: Synthesizes targeted retail queries for marketplace connectors (e.g., `"coffee gift for brother"`).
3. **`normalize_products`**: Queries marketplace connectors (Amazon, Flipkart, Myntra), normalizes data structures into `MarketplaceProductItem`, and eliminates duplicates.
4. **`verify_products`**: Enforces item stock availability and applies non-negotiable budget floors and ceilings.
5. **`rank_recommendations`**: Computes multi-criteria scores using the deterministic 5-factor scoring engine:
   - Interest relevance: 35%
   - Budget fit: 25%
   - Quality evidence: 20%
   - Practical usefulness: 10%
   - Value for money: 10%
6. **`generate_explanations`**: Synthesizes genuine, personalized match rationale for why each item suits the recipient.

---

## 3. Marketplace Connector Architecture

Marketplace connectors adhere to the `BaseMarketplaceConnector` abstract interface:
- **Explicit Status**: Connectors report live status (`ACTIVE`, `NOT_CONFIGURED`, `UNAVAILABLE`).
- **Resilient Fallback**: When API credentials are not provided, connectors safely return clearly labelled development mock records (`is_development_mock: True`) to enable full end-to-end development without external API keys.

---

## 4. Security & Authentication

- **Password Hashing**: Uses Argon2id (`passlib[argon2]`, `argon2-cffi`), the modern cryptographic standard.
- **Tokens**: Stateless JWT tokens signed with HS256 (`python-jose`), with dedicated access and refresh tokens.
- **CORS**: Strict CORS origin configuration for `http://localhost:3000`.
- **Environment**: All secrets are loaded from `.env` via `pydantic-settings`; default template provided in `.env.example`.
