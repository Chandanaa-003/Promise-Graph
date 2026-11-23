# PromiseGraph

> **AI-Powered Communication Intelligence & Relationship Platform**

PromiseGraph ingests conversations across multiple communication channels (Email, WhatsApp, GitHub), identifies participants, extracts implicit and explicit commitments/promises, tracks deadlines, and builds a rich, auditable relationship graph.

---

## Phase 1 — Project Foundation

This repository contains the completed **Phase 1** foundational structure:

- **Frontend**: Responsive React 18, TypeScript, Vite, Tailwind CSS with landing page, PromiseGraph branding, placeholder dashboard, collapsible sidebar, header with profile placeholder, and live health status indicator.
- **Backend**: FastAPI modular architecture with configuration management (`pydantic-settings`), database connection layer, health check endpoint (`GET /api/health`), and structured `api`, `models`, `schemas`, and `services` modules.
- **Database**: PostgreSQL support via SQLAlchemy 2.0 with complete relational models for `User`, `ConnectedAccount`, `Conversation`, `Person`, `Commitment`, and `Evidence`. (Supports SQLite for lightweight zero-dependency local development).
- **Docker**: Docker Compose configuration orchestrating PostgreSQL 16 and the FastAPI backend service, with support for local frontend execution.
- **MCP Server**: Architecture placeholder and interface contract for Phase 5 integration with external AI clients (Antigravity, Cursor, Claude).

---

## Directory Structure

```text
promisegraph/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── endpoints/
│   │   │   │   │   ├── commitments.py       # Commitment CRUD endpoints
│   │   │   │   │   ├── conversations.py     # Conversation listing & registry
│   │   │   │   │   ├── health.py            # System health check endpoint
│   │   │   │   │   ├── people.py            # Relationship graph people endpoints
│   │   │   │   │   └── users.py             # User management endpoints
│   │   │   │   └── router.py                # Aggregated API v1 router
│   │   ├── core/
│   │   │   ├── config.py                    # Pydantic BaseSettings environment config
│   │   │   └── database.py                  # SQLAlchemy engine, session & init
│   │   ├── models/
│   │   │   ├── commitment.py                # Commitment model
│   │   │   ├── connected_account.py         # ConnectedAccount model (Gmail, WhatsApp, etc.)
│   │   │   ├── conversation.py              # Ingested conversation threads
│   │   │   ├── evidence.py                  # Audit snippets & verification proofs
│   │   │   ├── person.py                    # Relationship graph contact model
│   │   │   └── user.py                      # User entity model
│   │   ├── schemas/
│   │   │   ├── commitment.py                # Commitment Pydantic schemas
│   │   │   ├── connected_account.py         # Connected account schemas
│   │   │   ├── conversation.py              # Conversation schemas
│   │   │   ├── evidence.py                  # Evidence schemas
│   │   │   ├── health.py                    # Health check response schema
│   │   │   ├── person.py                    # Person schemas
│   │   │   └── user.py                      # User schemas
│   │   ├── services/
│   │   │   ├── commitment_service.py        # Commitment business logic
│   │   │   └── user_service.py              # User business logic
│   │   └── main.py                          # FastAPI app entry point & lifespan
│   ├── .env.example                         # Backend environment template
│   ├── Dockerfile                           # Backend container specification
│   └── requirements.txt                     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx                # SaaS Intelligence Dashboard
│   │   │   ├── LandingPage.tsx              # Clean SaaS landing page
│   │   │   ├── Navbar.tsx                   # Top header with profile placeholder & health pill
│   │   │   └── Sidebar.tsx                  # Collapsible sidebar navigation
│   │   ├── services/
│   │   │   └── api.ts                       # Backend API client
│   │   ├── types/
│   │   │   └── index.ts                     # TypeScript data interfaces
│   │   ├── App.tsx                          # App root view coordinator
│   │   ├── index.css                        # Tailwind CSS styling & custom scrollbars
│   │   ├── main.tsx                         # React 18 DOM mount point
│   │   └── vite-env.d.ts                    # Vite client types
│   ├── .env.example                         # Frontend environment template
│   ├── Dockerfile                           # Multi-stage production container build
│   ├── index.html                           # HTML template
│   ├── package.json                         # Node dependencies & scripts
│   ├── postcss.config.js                    # PostCSS configuration
│   ├── tailwind.config.js                   # Tailwind design system configuration
│   ├── tsconfig.json                        # TypeScript configuration
│   └── vite.config.ts                       # Vite dev server & proxy settings
├── mcp_server/
│   └── README.md                            # Model Context Protocol placeholder & roadmap
├── .gitignore                               # Production gitignore
├── docker-compose.yml                       # Multi-container orchestration (PostgreSQL + Backend)
└── README.md                                # Comprehensive documentation
```

---

## Database Models (SQLAlchemy 2.0)

| Model | Table | Description |
|---|---|---|
| `User` | `users` | Registered users owning accounts and intelligence graphs. |
| `ConnectedAccount` | `connected_accounts` | Channel credentials and state for Gmail, WhatsApp, GitHub. |
| `Conversation` | `conversations` | Normalized conversation threads across communication channels. |
| `Person` | `people` | Individual stakeholders, colleagues, and contacts with relationship scores. |
| `Commitment` | `commitments` | Extracted promises made or received, statuses, and due dates. |
| `Evidence` | `evidence` | Verifiable transcript excerpts, timestamps, and context proofs. |

---

## Getting Started on Windows (PowerShell)

### Prerequisites
- **Python 3.10+**
- **Node.js 18+ & npm**
- **Docker Desktop** (optional for Docker Compose workflow)

---

### Method A: Local Development Setup (Quickest)

Open two PowerShell windows: one for the Backend and one for the Frontend.

#### Step 1: Start the Backend

```powershell
# Navigate to the backend directory
cd "d:\proniss ai\promisegraph\backend"

# 1. Create a Python virtual environment (if not already created)
python -m venv .venv

# 2. Activate the virtual environment
.\.venv\Scripts\Activate.ps1

# 3. Install required Python packages
python -m pip install -r requirements.txt

# 4. Copy the environment configuration file
Copy-Item .env.example .env

# 5. Start the FastAPI server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

> **Backend is now running at:** `http://127.0.0.1:8000`  
> - Health Check: `http://127.0.0.1:8000/api/health`  
> - Interactive API Docs (Swagger): `http://127.0.0.1:8000/docs`  
> - Alternative Docs (ReDoc): `http://127.0.0.1:8000/redoc`  

#### Step 2: Start the Frontend

In a second PowerShell window:

```powershell
# Navigate to the frontend directory
cd "d:\proniss ai\promisegraph\frontend"

# 1. Copy the environment configuration file
Copy-Item .env.example .env

# 2. Install dependencies (if not already installed)
npm install

# 3. Start the Vite development server
npm run dev
```

> **Frontend is now running at:** `http://localhost:5173`  
> Open your browser to explore the **Landing Page**, switch to the **Dashboard**, and observe real-time health pings to the backend.

---

### Method B: Docker Compose (PostgreSQL + Backend)

To launch the PostgreSQL database alongside the backend service:

```powershell
# Navigate to the root promisegraph directory
cd "d:\proniss ai\promisegraph"

# Start PostgreSQL and Backend in background
docker compose up -d postgres backend

# View container status
docker compose ps

# View backend logs
docker compose logs -f backend
```

Then run the frontend locally with `npm run dev` in `frontend/`, connecting seamlessly to the Dockerized backend on `http://localhost:8000`.

To bring down all containers and preserve database volumes:
```powershell
docker compose down
```

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Root information and API links |
| `GET` | `/api/health` | System health check (database ping, uptime, version) |
| `GET` | `/api/v1/health` | V1 Health check endpoint |
| `GET` | `/api/v1/commitments` | List commitments (filters: `status`, `user_id`) |
| `POST` | `/api/v1/commitments` | Create a new tracked commitment |
| `GET` | `/api/v1/commitments/{id}` | Retrieve commitment by ID |
| `PATCH` | `/api/v1/commitments/{id}` | Update commitment status or details |
| `GET` | `/api/v1/people` | List people in the relationship graph |
| `POST` | `/api/v1/people` | Add a person to the relationship graph |
| `GET` | `/api/v1/conversations` | List ingested conversations |
| `POST` | `/api/v1/conversations` | Register an ingested conversation |
| `GET` | `/api/v1/users` | List registered users |
| `POST` | `/api/v1/users` | Register a new user |

---

## Roadmap

- **Phase 1 (Completed)**: Foundational architecture, models, FastAPI backend, React dashboard & landing page, Docker configuration.
- **Phase 2**: Gmail API OAuth 2.0 flow & thread ingestion pipeline.
- **Phase 3**: WhatsApp chat export import and Cloud API webhook integration.
- **Phase 4**: GitHub API integration for issues, pull requests, and code review comments.
- **Phase 5**: LLM-powered commitment extraction engine with evidence citation.
- **Phase 6**: Model Context Protocol (MCP) server for Claude, Cursor, and Antigravity.
- **Phase 7**: Relationship graph network visualization and human-in-the-loop follow-up approvals.
