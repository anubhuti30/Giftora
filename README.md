# Giftora — AI-Powered Personalized Gift Discovery & Shopping Platform

> *"Every person is different. Every gift should be too."*

Giftora is a full-stack, AI-powered personalized gift discovery and retail comparison platform. It integrates a Next.js App Router frontend with a high-performance Python FastAPI backend, MySQL 8.0 relational database (`giftora_db`), Google Gemini AI, and a LangGraph agent workflow across Amazon, Flipkart, and Myntra.

---

## 🎨 Visual Identity & Brand System

- **Primary Background**: Warm Ivory (`#F8F5F0`, `#FAF8F5`)
- **Secondary Background**: Soft Blush (`#E9DDE7`, `#F4EEF3`)
- **Primary Accent**: Muted Mauve (`#9B668B`, `#834E74`)
- **Deep Accent**: Plum (`#422C42`, `#301E30`)
- **Main Typography**: Charcoal (`#29252A`)
- **Editorial Heading Font**: Playfair Display (Google Fonts)
- **UI & Body Sans Font**: Plus Jakarta Sans (Google Fonts)

---

## 🧭 Implemented Routes & Experiences

1. **Public Landing Page (`/`)**:
   - Editorial Hero with recipient persona selector and interactive natural language gift prompt.
   - Occasion Discovery (Birthday, Anniversary, Graduation, Festivals, Thank You, Just Because).
   - Curated Collections Showcase (*Gifts Under ₹500*, *Thoughtful Gifts for Her*, *Gifts for Tech Lovers*, *Unique Gifts for Someone Special*).
   - 3-step editorial narrative explaining the Giftora philosophy.
   - The 4 Giftora Advantages and closing call-to-action.
   - Comprehensive footer with brand statements and trust notes.

2. **Authentication Flow**:
   - `/login`: Email & password authentication with visibility toggles, remember me, error feedback, and Google OAuth UI placeholder.
   - `/signup`: Full name, email, password strength checks, confirmation validation, and terms acknowledgement.
   - `/forgot-password`: Email recovery with validation and confirmation success states.

3. **AI Discovery Workspace (`/discover`)**:
   - Conversational AI assistant with progressive disclosure.
   - Recipient selectors, celebration pickers, multi-select passion chips, and budget tier sliders.
   - Contextual chat feedback with animated AI thinking indicators and one-click demo presets.

4. **Gift Results (`/discover/results`)**:
   - Filter by marketplace source, category, keyword, and dynamic price ceiling slider.
   - Sort by AI Match score, price, or customer review rating.
   - Product cards featuring high-res imagery, source badges, wishlist hearts, compare checkboxes, and personalized AI match explanations.

5. **Side-by-Side Product Comparison (`/compare`)**:
   - Comprehensive side-by-side comparison of up to 4 items.
   - Compares: AI match reason, ideal recipient fit, craftsmanship/materials, distinct value pros, delivery estimates, sentiment analysis, and external shop links.

6. **Saved Wishlist (`/wishlist`)**:
   - Persistent wishlist with category filters, sorting, and total estimated basket value calculator.
   - Clean empty state with direct jump to AI discovery.

7. **Recipient Profiles (`/recipients`)**:
   - Loved ones directory with avatars, relationship tags, birthday dates, passion tags, and personal notes.
   - Interactive Add/Edit recipient modal with live validation.
   - "Find Gifts for [Name]" direct launch action.

8. **Account Settings (`/settings`)**:
   - Profile management (name, email, delivery city).
   - Gifting preferences and AI Assistant Tone selector (*Warm & Empathetic*, *Concise & Direct*, *Creative & Eclectic*).
   - Occasion reminder notifications and data export.

---

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom design tokens
- **Icons**: Lucide React
- **API Client**: Typed HTTP client (`src/lib/api.ts`)
- **State Management**: React Context (`GiftoraContext`) with local storage persistence and backend synchronization

### Backend & Database
- **Framework**: FastAPI (Python 3.12)
- **Database**: MySQL 8.0 (`giftora_db`, utf8mb4) with 18 normalized tables
- **ORM & Migrations**: SQLAlchemy 2.x and Alembic
- **Password Hashing**: Argon2id via `passlib[argon2]` & `argon2-cffi`
- **Security**: JWT stateless bearer authentication (`python-jose`)
- **AI Engine**: Google Gemini Generative AI (`google-generativeai`) with structured JSON schema extraction & deterministic NLP fallback
- **Agent Workflow**: LangGraph multi-node state graph (`StateGraph`)
- **Marketplace Connectors**: Amazon India, Flipkart, Myntra connectors with live status and development mock provider
- **Testing**: Pytest with automated test suite

---

## 🚀 Getting Started

### 1. Database Setup (MySQL 8.0 & Workbench)
1. Ensure your local MySQL service (`MySQL80`) is running on port 3306.
2. Launch **MySQL Workbench 8.0 CE**.
3. Open and execute `database/schema.sql` (`File -> Open SQL Script...`). This creates the database `giftora_db` and all 18 normalized tables with foreign keys and cascade rules.
4. Open and execute `database/seed.sql` to populate initial development mock and catalog data.

### 2. Backend Setup & Startup
1. Copy environment template:
   ```powershell
   copy backend\.env.example backend\.env
   ```
2. Configure your MySQL password and Google Gemini API key in `backend/.env`.
3. Start the FastAPI backend server:
   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload --port 8000
   ```
4. Access interactive API documentation at:
   - Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
   - ReDoc: [http://localhost:8000/redoc](http://localhost:8000/redoc)
   - Health Check: [http://localhost:8000/health](http://localhost:8000/health)

### 3. Run Backend Test Suite
```powershell
cd backend
python -m pytest tests -v
```

### 4. Frontend Setup & Startup
1. In the project root directory:
   ```powershell
   npm install
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) in your browser.
3. Verify linting and production build:
   ```powershell
   npm run lint
   npm run build
   ```

---

## 📂 Documentation Directory

Detailed architectural design specifications and schema references:
- **[System Architecture](docs/architecture.md)**
- **[Database Design & ERD](docs/database-design.md)**
- **[REST API Documentation](docs/api-documentation.md)**

## Known limitations

- Marketplace connectors currently return clearly labelled development mock catalogues when credentials are absent. The live Amazon, Flipkart, and Myntra request implementations are not present, so configured credentials alone do not enable live search.
- Gemini extraction is optional. When it is unavailable or returns invalid structured data, Giftora uses a deterministic extraction fallback and leaves unknown budgets/preferences unset.
- The checked-in `database/schema.sql` is a destructive local bootstrap script, not a production migration. There are currently no Alembic revision files; do not run that script against an existing database.
- A subset of the frontend still uses local storage for demo/offline state. Backend persistence should be treated as authoritative only for flows that explicitly call the API client.
