# MaterialHub

**SIH 26099 — National Material Harmonization Platform**

A frontend for the SIH 26099 FastAPI backend (AI-driven standardization and
harmonization of material codes across CPSEs). This app is a visual/API
layer only — it does not implement or alter any matching, standardization,
or approval logic, all of which lives in the backend.

## Stack

React 18, Vite, React Router, Axios, Tailwind CSS, Lucide icons.

## Prerequisites

- Node.js 18+
- The SIH 26099 FastAPI backend running locally (`uvicorn app.main:app --reload --port 8000`)

## Setup

```bash
npm install
cp .env.example .env   # adjust VITE_API_BASE_URL if your backend runs elsewhere
npm run dev
```

The app runs at `http://localhost:5173` by default and expects the backend
at `http://localhost:8000/api` (see `.env.example`).

## Build

```bash
npm run build
npm run preview   # serve the production build locally
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8000/api` | Base URL for all API requests. Never hardcoded elsewhere — see `src/services/api.js`. |

## CORS

The backend ships with `allow_origins=["*"]` for development, which already
covers the Vite dev server on port 5173. If you lock down CORS for a real
deployment, add your frontend's origin to the FastAPI `CORSMiddleware`
config — do not work around CORS failures from the frontend.

## Project structure

```
src/
├── components/
│   ├── layout/       Sidebar, Header, GlobalSearch, Layout
│   ├── common/        Badge, Button, Modal, ConfidenceBar, states, etc.
│   ├── materials/      Material detail section/field helpers
│   └── matching/       Score breakdown, conflict warning, comparison table, material picker
├── pages/              One file per route
├── services/api.js     Centralized Axios client — the only file with API paths
├── lib/
│   ├── constants.js    Match types, approval statuses, critical attributes — mirrors backend enums exactly
│   ├── formatters.js   Display formatting (dates, percentages, fallback "—")
│   └── transformers.js Normalizes ad-hoc backend response shapes
└── hooks/              useApi (loading/error/data), useDebouncedValue, useApiHealth
```

## Notes on backend fidelity

This frontend was built by reading the actual backend source
(`app/schemas/schemas.py`, `app/models/models.py`, `app/api/*.py`) rather
than guessing from a spec. A few things worth knowing:

- **Match types** are exactly `EXACT_DUPLICATE`, `NEAR_DUPLICATE`,
  `FUNCTIONALLY_EQUIVALENT`, `POSSIBLE_MATCH`, `DISTINCT_MATERIAL` (see
  `src/lib/constants.js`). `DISTINCT_MATERIAL` pairs are filtered out before
  being persisted as match candidates, so you will not normally see that
  badge in the Matches list.
- **Matching weights** (`WEIGHT_LEXICAL`, `WEIGHT_SEMANTIC`,
  `WEIGHT_TECHNICAL`) are configurable server-side but are not returned by
  any endpoint, so the UI only displays the three component scores and the
  final confidence — it does not fabricate a weight breakdown.
- **National Material Code list** (`GET /api/nmc`) returns plain dicts, not
  a Pydantic schema — see `normalizeNmcListItem` in `src/lib/transformers.js`.
- No mock data exists anywhere in this app. Empty API responses render an
  empty state, not placeholder content.

## Known limitation of this build

This project was generated in an environment without network access, so
`npm install` and `npm run build` could not be executed here to verify a
clean build. All source files were hand-written against the backend's
actual schemas, but please run:

```bash
npm install
npm run build
```

on your machine and fix any dependency-resolution issues that surface —
particularly version pins in `package.json`, which were chosen to be recent
and compatible but not verified by an actual install in this environment.
