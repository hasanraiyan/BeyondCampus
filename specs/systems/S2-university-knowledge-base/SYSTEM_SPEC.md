# S2: University Knowledge Base

## Status: `not started`

## V0.1 Scope

University + program + admission requirements schema. Seed data for Texas universities (~50-80). No automated pipeline yet — manual/semi-automated ingestion.

## Purpose

Structured repository of university data that the admission counselor agent reads to generate accurate application checklists and validate documents.

## Problems It Solves

- Agent needs structured program requirements to generate checklists (not hallucinated guesses)
- Students need to see what programs exist and what they require
- Data must be accurate enough for document validation to work

## V0.1 Subsystems

### S2.1: University Data Schema
- **University model**: name, location (city, state), type (public/private), ranking, acceptance rate, enrollment, website
- **Program model**: degree type (MS, MBA, PhD, etc.), department, name, duration, tuition, prerequisites, test requirements
- **Admission requirements model**: required documents per program, minimum GPA/scores, deadlines, application rounds, special requirements (portfolio, interview, etc.)

### S2.2: Texas University Data
- Identify all relevant Texas universities (UT Austin, Texas A&M, Rice, UTD, UH, SMU, Baylor, TTU, etc.)
- Data sourcing: College Scorecard API, IPEDS, university websites
- Seed data ingestion into DB
- Data quality validation (spot-check completeness per university)

## Data Models Needed

- `University` (new)
- `Program` (new)
- `AdmissionRequirement` (new — or embedded in Program)
- `Deadline` (new — per program per round)

## Dependencies

None — this is foundational.

## Key Decisions

- V0.1 is Texas only (~50-80 universities)
- Requirements must be structured enough for agent to generate checklists (not free-text blobs)
- Manual curation is acceptable for V0.1 — automated pipeline is later
- Each program has its own requirements (not university-level generic)

## Acceptance Criteria

- [ ] University model stores: name, location, type, ranking, acceptance rate, website
- [ ] Program model stores: degree, department, duration, tuition, prerequisites, test requirements
- [ ] Admission requirements are per-program with required documents, score thresholds, deadlines
- [ ] Texas universities seeded with at least top programs per school
- [ ] Agent can query: "What are the requirements for MS CS at UT Austin?"
