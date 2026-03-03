# BeyondCampus — Product Overview

## Vision

An AI-native, end-to-end study abroad consultancy for Indian students targeting US universities. Replaces the ₹50K–₹2L human counselor model with always-available AI agents that handle every stage — from university research to application submission to visa prep.

## Target User

Indian undergraduate/graduate aspirants planning to study in the USA.

## Version Roadmap

| Version | Feature Set | Scope |
|---------|------------|-------|
| **V0.1** | University Admission Counseling | Core application pipeline: profile → university data → documents → agent-driven checklist → validation → ready-to-submit packet. Texas universities only. |
| V0.2 | University Directory & Discovery | Browse, search, filter universities. Recommendations. |
| V0.3 | Maya — Main Agent | Central AI agent with MCP tools, web search, automation. |
| V0.4 | Agent Teams | Specialist agents: immigration, SOP, profile builder, exam prep. |
| V0.5+ | Expansion | More states/countries, portal integration, payments, analytics. |

## V0.1 End Goal

> "A student has applied to one or more Texas universities through BeyondCampus, where the university agent validated their documents against that university's checklist, and the application status shows 'Packet Complete' for a specific course."

## V0.1 Critical Path (Backward Decomposition)

```
GOAL: Student has a "Packet Complete" application
  ← Agent validated and approved all documents against checklist
    ← Agent could read uploaded documents (text extraction)
    ← Agent had validation criteria per checklist item
    ← Student could re-upload after corrections
  ← University agent created a checklist for this application
    ← Agent read student profile (academics, scores, goals)
    ← Agent read university/program requirements from DB
    ← Agent produced structured checklist (trackable items, not just text)
  ← Student uploaded required documents
    ← Document vault exists (upload, store, retrieve, type)
    ← Documents are typed (transcript, SOP, LOR, etc.)
    ← Documents are reusable across applications
  ← Student selected a university + course to apply to
    ← University and program data exists in DB
    ← Data was sourced for Texas universities
  ← Student has an account with a complete profile
    ← Auth system works
    ← Profile schema captures academics, scores, extracurriculars
    ← Minimum profile completeness gate before starting application
```

## V0.1 Build Order (Forward from Starting Point)

```
Step 1: Fix identity + expand student profile schema
Step 2: Design + populate university data models (Texas)
Step 3: Build document vault with upload + text extraction
Step 4: Build application model with status pipeline + checklist
Step 5: Build university counselor agent (checklist generation)
Step 6: Build agent document validation flow
Step 7: Build "Packet Complete" terminal state + ready-to-submit view
```

## V0.1 Application Status Pipeline

```
Draft → Checklist Created → Uploading → Under Review → Needs Correction → Packet Complete
                                            ↑                │
                                            └────────────────┘
                                          (student re-uploads after feedback)
```

## Systems Involved in V0.1

| System | V0.1 Scope | Full Scope (later) |
|--------|-----------|-------------------|
| S1: Student Identity & Profile | Auth + expanded profile schema + completeness gate | Password reset, social login |
| S2: University Knowledge Base | Texas university data + program requirements | All US, data pipeline automation |
| S4: University Counselors | Checklist generation + document validation agent | Full Q&A counselor, comparison |
| S5: Shortlist & Applications | Application model + status pipeline + checklist | Shortlist management, batch apply |
| S6: Document Vault | Upload, store, type, text extraction | Version tracking, agent summaries |

Systems **not in V0.1**: S3 (Directory UI), S7 (Maya), S8 (Agent Teams)

## Full System Map (All Versions)

| ID | System | Purpose |
|----|--------|---------|
| S1 | Student Identity & Profile | Auth, onboarding, profile data, preferences |
| S2 | University Knowledge Base | Data acquisition, schema, storage, enrichment |
| S3 | University Directory | Browse, search, filter, university pages |
| S4 | University Admission Counselors | Per-university AI counselor agents |
| S5 | Shortlist & Applications | Shortlist management, application tracking |
| S6 | Document Vault | Document upload, storage, agent access |
| S7 | Maya (Main Agent) | Central AI agent with MCP, web search, delegation |
| S8 | Agent Teams | Specialized experts (immigration, SOP, profile, exam) |

## Key V0.1 Decisions

- **Dataset**: Texas universities only (~50-80 schools)
- **Document validation**: Agent reads and validates document content (not just file type check)
- **Checklist**: Generated once by agent from profile + program requirements. Agent can modify post-validation (add/change items). Does not auto-regenerate on profile changes.
- **"Applied" means**: Packet is complete and ready for human submission. No portal integration in V0.1.
- **Terminal status**: `Packet Complete` (not `Applied` — we're not submitting to portals yet)
