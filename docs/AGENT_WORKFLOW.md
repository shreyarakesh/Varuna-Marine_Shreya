# AGENT_WORKFLOW

This document explains how AI coding agents (e.g., **GitHub Copilot**, **Cursor Agent**, **Claude Code**, **GPT-5 Thinking**) are used responsibly in this repository.

## 1) Objectives & Boundaries
- **Objectives:** accelerate boilerplate, scaffold components, draft API specs, write tests, and generate doc skeletons that map to FuelEU Annex I/IV/Articles 20–21.
- **Non-goals:** unsupervised regulatory interpretation, automatic compliance claims, or replacing verification steps (THETIS MRV, accredited verifiers).

## 2) Agent Capabilities Used
- **Code synthesis:** React forms, Express routes, TypeScript types.
- **Refactor & explain:** summarize functions, propose smaller modules, add JSDoc.
- **Test authoring:** suggest unit test cases from examples.
- **Spec alignment:** turn types + examples into OpenAPI and backfill examples.

## 3) Tooling & Models
- **Local IDE:** VS Code + Copilot / Cursor.
- **Chat agents:** GPT-5 Thinking for design reviews and calculations sanity checks.
- **On-repo tools:** `npm scripts` for typecheck (`tsc`), format/lint (add if enabled).
- **No production secrets** are present; dev values only.

## 4) Prompts & Guardrails
- Start prompts with **desired outcome**, **acceptance criteria**, and **regulatory mapping**.
- Ask agents to: keep **pure functions** in `server/src/calc.ts`, avoid I/O side effects.
- Require **TypeScript strict** compatibility and **no any** leaks in public types.
- For FuelEU claims, enforce “**working demo only**” language in comments and docs.

## 5) Code Generation Policy
- Agents may create files under `client/`, `server/`, `shared/`, or `docs/`.
- All generated code must compile (`tsc`) and run via `npm run dev` before commit.
- Prefer **small PRs**; commit message should include: scope, agent(s) used, prompt summary.

## 6) Review & Validation
- Human reviews for every change that impacts: formulas, constants, endpoints, or regulatory wording.
- Run **unit tests** for `computeCompliance` and `borrowingCheck` before merging (to be added).
- Manual cross-checks against the *ESSF SAPS WS1* guidance for Annex I and IV mappings.

## 7) Data Handling & Privacy
- Do not paste real operator data into prompts.
- If using representative data, **anonymize** IMO/company IDs and volumes.
- Keep verification artifacts out of the repo (store outside, or use placeholders).

## 8) Failure Modes & Fallbacks
- If an agent proposes ambiguous math, fall back to **hand-derived** equations and cite the applicable annex.
- If the OpenAPI conflicts with types, types win; fix spec and add examples.
- If agents refactor too aggressively, revert and ship simpler code.

## 9) How to Run Agents Locally
- **Copilot/Cursor:** enable in the IDE and apply to the current file; accept changes in small chunks.
- **Chat agent:** paste the function or spec in a chat with the prompt:  
  “Review for correctness against Annex I & IV, keep types strict, return minimal diff.”

## 10) Decision Log
Maintain a short log in PR descriptions (date, agent, prompt, outcome). Example:
- *2025‑11‑10:* Cursor Agent — generated `openapi.yaml` from shared types; added examples; human reviewed.

## 11) Roadmap for Agent Tasks
- Add **OpenAPI → server validation** with `openapi-backend` or `zod-to-openapi`.
- Generate **contract tests** from `openapi.yaml`.
- Create **playwright** UI smoke tests suggested by agents.
