
# FuelEU Maritime — Compliance Module (Minimal Full-Stack)

## 1) Overview
This repo is a compact full‑stack implementation of a **FuelEU Maritime** compliance slice:
- **Backend (Node/Express/TS):** compute **GHG intensity (WtW)**, **Compliance Balance (CB)**, and basic **flexibility** features — **banking**, **borrowing**, **pooling**.
- **Frontend (React/Vite/TS):** lightweight dashboard to submit a ship-year energy report and visualize results.
- **Shared types:** single source of truth for request/response models.
- **Docs:** `docs/openapi.yaml` (OpenAPI 3.1), `docs/AGENT_WORKFLOW.md`, and regulatory notes.

> This is a learning/demo scaffold. It is **not** a verification system and does not replace THETIS MRV or accredited verification.

## 2) Architecture summary (hexagonal structure)
We apply a small **hexagonal (ports & adapters)** approach:
- **Domain (core):** pure calculation functions in `server/src/calc.ts` (no I/O). This is the **domain**.
- **Application services (ports):** HTTP handlers in `server/src/index.ts` call the domain and shape DTOs.
- **Adapters (driven/driving):**
  - Driving adapter → **HTTP** (Express) exposes the app to the outside.
  - Driven adapters → (future) DB, queues, verifiers. Currently **none**, keeping domain isolated.
- **Shared contracts:** `shared/types.ts` are the boundary contracts for both client & server.
- **Frontend adapter:** the React app is another driving adapter that consumes the API.

```
           +------------------+
           |   Frontend UI    |  <-- driving adapter (React)
           +------------------+
                    |
                    v
+----------------------------------------+
|          Application (Express)         |  <-- driving adapter (HTTP)
|  Routes -> invoke domain services      |
+----------------------------------------+
                    |
                    v
             +-------------+
             |   Domain    |  <-- pure functions (calc.ts)
             |  (Ports)    |
             +-------------+
                    |
                    v
         [Driven adapters: DB, MQ, etc. — future]
```

## 3) Setup & run instructions

### Prereqs
- Node.js 18+

### Backend
```bash
cd server
npm install
npm run dev
# Server on http://localhost:8080
```

### Frontend
```bash
cd client
npm install
npm run dev
# Open the printed URL (usually http://localhost:5173)
```

### OpenAPI / Swagger UI (optional)
- The OpenAPI spec is at `docs/openapi.yaml`.
- You can plug it into Swagger UI or VS Code REST client as needed.

## 4) How to execute tests
Unit tests cover the domain functions in `server/src/calc.ts` using **Vitest**.

```bash
cd server
npm install
npm run test
```

## 5) Screenshots or sample requests/responses

### Sample Request — Compute CB
`POST http://localhost:8080/api/compute/cb`
```json
{
  "shipIMO": "9876543",
  "year": 2025,
  "ghgieTarget_g_per_MJ": 91.16,
  "windRewardFactor": 1.0,
  "fuels": [
    {"fuelType":"VLSFO","mass_tonnes":800,"lcv_MJ_per_tonne":41000,"wtt_gCO2e_per_MJ":15,"ttw_gCO2e_per_MJ":74,"isRFNBO":false},
    {"fuelType":"e-diesel","mass_tonnes":50,"lcv_MJ_per_tonne":43000,"wtt_gCO2e_per_MJ":13.17,"ttw_gCO2e_per_MJ":76.37,"isRFNBO":true}
  ],
  "shorePowers":[{"connectionId":"OPS-KW-1","energy_MJ":250000}]
}
```

### Sample Response
```json
{
  "ghgie_actual_g_per_MJ": 73.5212,
  "energyInScope_MJ": 34475000,
  "complianceBalance_gCO2e": 606217500,
  "penalty_EUR": 793790059.0,
  "notes": ["RFNBO reward applied to e-diesel"]
}
```

### Borrowing
`POST http://localhost:8080/api/borrow`
```json
{
  "companyId": "ACME",
  "yearN": 2025,
  "energyInScope_MJ": 40000000,
  "ghgieTarget_g_per_MJ": 91.16,
  "requestedACS_gCO2e": 100000000
}
```
Possible response:
```json
{
  "limit_gCO2e": 72880000,
  "approvedACS_gCO2e": 72880000,
  "aggravatedACS_gCO2e": 80168000,
  "note": "If ACS > 0, pooling is not allowed within the same verification period (join next year)."
}
```

For more examples, see `docs/openapi.yaml` and `sample_data/ship_energy_report.sample.json`.
