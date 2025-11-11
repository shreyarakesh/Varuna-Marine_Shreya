
# REFLECTION

**1) What I learned using AI agents**  
Leveraging coding agents clarified how to turn regulatory text into code by insisting on: (a) a pure, testable **domain core**; (b) explicit **types** as the single source of truth; and (c) an **OpenAPI** contract that mirrors those types. Prompting with acceptance criteria (Annex I for GHGIE, Annex IV for CB/penalty, Article 20/21 for flexibility) consistently yields better, smaller diffs from agents. The biggest lesson: agents excel at boilerplate/spec scaffolding, but **humans must own formulas, constants, and legal nuance**.

**2) Efficiency gains vs manual coding**  
- Scaffolding (monorepo, Vite/Express/TS, OpenAPI): ~70–80% faster.  
- Spec/examples generation and README/docs: ~60% faster.  
- Domain math & edge cases: only ~20–30% faster because human review and hand-checking are critical.  
Overall, the blended approach reduced total setup time by more than half while maintaining correctness via tests and reviews.

**3) Improvements I’d make next time**  
- Add **contract tests** derived from `openapi.yaml` and wire an OpenAPI validator middleware.  
- Use **property-based tests** for energy/LCV edge cases and RFNBO paths.  
- Introduce **zod** schemas to co-generate types + OpenAPI and validate inputs at runtime.  
- Automate a small **pooling allocator** (LP-based) with invariants (no ship exits worse) tested.  
- Add a **Swagger UI** route and a **Docker Compose** for one-command up.
