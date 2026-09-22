# TruthLens

**A multi-agent AI system for detecting, tracing and countering online misinformation.**

Misinformation travels faster than the manual fact-checking processes built to correct it. By the
time a professional correction is published, the false claim has usually already reached its
audience. TruthLens compresses the whole response cycle — **detect → trace → predict → counter** —
into a single automated pipeline, and holds high-severity cases for a human before anything is
published.

The project's central engineering claim is not that a language model can label a claim as false.
It is that a generative system can be *constrained to stay honest* in a domain where confident
invention is the primary risk.

---

## The four agents

The pipeline is a [LangGraph](https://langchain-ai.github.io/langgraph/) state machine with
conditional routing. A shared typed state object is enriched at each stage, and low-value signals
terminate early so they never consume downstream work.

| # | Agent | What it does |
|---|-------|--------------|
| 1 | **Claim Detector** | Extracts the core assertion and scores it under an anchored severity rubric (1–10), returning confidence, harm, persuasion techniques and the verbatim phrases behind the judgement. |
| 2 | **Origin Tracer** | Records each sighting in a Neo4j provenance graph, reads back the ordered outlet timeline, and narrates it. *The facts come from the graph; only the prose comes from the model.* |
| 3 | **Spread Predictor** | Computes a risk score from five weighted features and reports **each driver's numeric contribution** — e.g. `Detector severity: 7/10 -> +0.210 of 0.396 risk (53%)`. |
| 4 | **Narrative Drafter** | Retrieves evidence from a fact-check corpus and writes a correction grounded strictly in it — returning `no_evidence` rather than fabricating support. |

Between agents 1 and 2 sits **semantic claim resolution**: paraphrases of the same assertion are
collapsed onto one canonical claim. Without it, each claim carries a single source, the Origin
Tracer has no chain to follow and the Spread Predictor sees zero velocity.

---

## Design decisions worth knowing

**Grounded, not generative-by-default.** No agent may assert a fact it cannot derive from a
recorded source. Provenance comes from graph queries, risk from arithmetic over observed features,
corrections from retrieved documents whose IDs are stored alongside the output.

**The drafter is allowed to refuse.** If no document passes the relevance threshold, the agent
returns `no_evidence` and generates nothing. A fabricated citation would be new misinformation
delivered with apparent authority — silence is the better failure.

**Tamper-evident audit trail.** Every consequential action writes an `:AuditEvent` carrying the
SHA-256 of its own contents plus the hash of the previous event on that claim. Editing any stored
event invalidates every event after it. `GET /api/claims/{id}/verify-chain` recomputes the chain
and names the first broken event; the UI shows a live integrity badge. Chain tips are mirrored to
`backend/audit_chain_tips.log`, deliberately **outside** the database, since chaining alone only
forces an attacker to rewrite the tail.

**Human judgement where it counts.** Automation handles detection, tracing, scoring and drafting.
Claims at severity ≥ 9 with confidence ≥ 0.6 are held at a review gate. Publishing stays with a
person.

**A self-maintaining evidence base.** The corpus is seeded from the live feeds of established
fact-checking organisations rather than frozen at download time.

---

## Architecture

```
NewsAPI / YouTube / RSS
         |
         v
  Ingestion layer  ---- normalise . dedup . heuristic suspicion ranking
         |
         v
  LangGraph orchestration
    detect --> trace --> spread --> narrative --> [review gate]
         |
         v
  Persistence:  Neo4j     (claims, sources, reviews, audit chain)
                ChromaDB  (evidence corpus + canonical claim index)
         |
         v
  FastAPI :8000  -->  Express/Vite BFF :3000  -->  React client
```

### Stack

| Layer | Technology |
|---|---|
| Orchestration | LangGraph |
| LLM inference | Groq — `openai/gpt-oss-20b` |
| Embeddings | Sentence-Transformers `all-MiniLM-L6-v2` (squared-L2) |
| Vector store | ChromaDB — `misinformation_knowledge`, `claim_index` |
| Graph store | Neo4j Aura — `:Claim`, `:Source`, `:Review`, `:AuditEvent` |
| Graph ML | PyTorch, PyTorch Geometric |
| API | FastAPI + Uvicorn |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion |

---

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+
- A [Neo4j Aura](https://console.neo4j.io) instance (the free tier is sufficient)
- API keys: [Groq](https://console.groq.com), [NewsAPI](https://newsapi.org),
  [YouTube Data API v3](https://console.cloud.google.com)

### 1. Configure credentials

```bash
cp backend/.env.example backend/.env
```

Fill in `GROQ_API_KEY`, `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEWS_API_KEY` and
`YOUTUBE_API_KEY`. `backend/.env` is gitignored and must never be committed.

### 2. Install

```bash
pip install -r backend/requirements.txt
```

```bash
npm install
```

### 3. Seed the evidence corpus

```bash
cd backend && python -m storage.seed_evidence
```

This harvests published fact-checks from Snopes, PolitiFact, FactCheck.org, Full Fact and the WHO,
then adds topic-matched articles for each monitored subject area.

### 4. Run

Backend:

```bash
cd backend && python -m uvicorn main:app --reload --port 8000
```

Frontend, in a second terminal:

```bash
npm run dev
```

Open http://127.0.0.1:3000 — start the backend first. The client has **no mock fallback** and will
show an explicit offline banner rather than render invented figures.

### 5. Ingest

Click **PULL LIVE** in the app to fetch fresh posts and run them through the full pipeline, or:

```bash
curl -X POST "http://127.0.0.1:8000/api/ingest/bulk?max_total=10"
```

---

## Configuration

Thresholds are environment variables so they can be retuned without touching code. The values below
were set empirically, not assumed.

| Variable | Default | Governs |
|---|---|---|
| `RAG_MAX_DISTANCE` | `1.2` | Maximum distance at which retrieved evidence is accepted as relevant |
| `CLAIM_DEDUP_MAX_DISTANCE` | `0.70` | Maximum distance at which two claims are treated as the same assertion |
| `REVIEW_SEVERITY_THRESHOLD` | `9` | Minimum severity for escalation to human review |
| `GROQ_MODEL` | `openai/gpt-oss-20b` | Model used by agents 1, 2 and 4 |
| `GROQ_MAX_ATTEMPTS` | `4` | Retries before a model call is abandoned |

On the calibration set, true paraphrases measured 0.13–0.65 apart and genuinely distinct claims
0.80+, so `0.70` sits in the gap between them.

---

## API

| Method | Endpoint | Purpose |
|---|---|---|
| `GET` | `/health` | Liveness check |
| `POST` | `/api/ingest` | Submit a single post |
| `POST` | `/api/ingest/bulk` | Fetch from all live sources and run the pipeline |
| `POST` | `/api/workflow/run` | Run the full four-agent workflow on one post |
| `GET` | `/api/claims` | All stored claims with review status and audit trail |
| `GET` | `/api/claims/{id}/verify-chain` | Recompute the SHA-256 audit chain |
| `GET` / `POST` | `/api/claims/{id}/review` | Read or record the human decision |
| `POST` | `/api/claims/{id}/publish` | Export an approved correction (**simulated**) |
| `GET` / `POST` | `/api/evidence` | List or extend the evidence corpus |
| `GET` | `/api/sources` | Which ingestion sources are wired up and configured |

Each agent is also exposed individually (`/api/claims/detect`, `/trace`, `/predict-spread`,
`/draft`) for testing stages in isolation. Interactive docs at http://127.0.0.1:8000/docs

---

## Limitations

Stated plainly so the output is not over-interpreted.

- **Spread prediction is an explainable heuristic, not a validated forecast.** No labelled
  propagation dataset was available, so the risk score is weighted observed features. Reach figures
  rest on order-of-magnitude audience constants per platform.
- **Provenance is bounded by observation.** The tracer reports first-seen order *within ingested
  material*, which is not necessarily true origin in the world.
- **Publication is simulated.** Nothing is transmitted to any external platform or authority.
- **Coverage is partial.** Three sources are live; Reddit, Telegram, X and TikTok are implemented
  but inactive pending credentials. Closed messaging platforms are not reachable via public APIs.
- **English text only.** Multilingual and image/video claims are out of scope.
- **Legacy audit events are unchained.** Events written before hashing was introduced carry no
  digest and are reported as `not_chained` rather than being retro-hashed — a hash computed after
  the fact would certify the current state, not the original.

---

## Project layout

```
backend/
  agents/        the four analytical agents
  ingestion/     ingestion manager + seven platform connectors
  storage/       vector store, canonical claim index, corpus seeding
  graph/         Neo4j client, Cypher operations, audit hash chain
  workflow/      LangGraph state graph and shared state
  main.py        FastAPI surface
src/
  pages/         seven functional pages
  components/    shared UI and visualisations
server.ts        Express backend-for-frontend adapter
```

---

## Team

Built by **Hajra Khan**, **Insha Ansari**, **Shifa Shaikh** and **Bushra Kazi**
at M.H. Saboo Siddik College of Engineering, under the guidance of **Mr. Suraj Chopade**,
as part of the AI Career for Women (AICW) programme.
