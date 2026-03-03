# BeyondCampus — Work Breakdown Structure

> Decomposed backwards from the end goal, built forwards from the starting point.
>
> **Levels:** L1 Product → L2 System → L3 Subsystem → L4 Work Package → L5 Task
>
> **Status key:** `draft` → `specced` → `in-progress` → `done`
>
> **Current focus:** V0.1 — University Admission Counseling

---

## V0.1 Critical Path

The backward decomposition revealed this build order:

```
Step 1 → Step 2 → Step 3 → Step 4 → Step 5 → Step 6 → Step 7
Profile   Univ     Docs     App       Agent     Agent     Packet
Schema    Data     Vault    Model     Checklist Validate  Complete
```

---

## V0.1 WBS Tree

```
BeyondCampus V0.1: University Admission Counseling (L1)
│
│
│   ══════════════════════════════════════════════════════
│   STEP 1: Student Identity & Profile (S1)
│   ══════════════════════════════════════════════════════
│
├── S1: Student Identity & Profile (L2) ...................... [partial]
│   │
│   ├── S1.1: Authentication (L3) ............................ [done]
│   │   ├── WP: Email/password signup & signin (L4) .......... [done]
│   │   ├── WP: JWT session management (L4) .................. [done]
│   │   └── WP: Middleware route protection (L4) .............. [done]
│   │
│   ├── S1.2: Identity Cleanup (L3) .......................... [draft]
│   │   ├── WP: Unify ID strategy (CUID→UUID) (L4)
│   │   │   ├── Migrate User.id to UUID (L5)
│   │   │   ├── Remove cuidToUuid converter (L5)
│   │   │   └── Update all FK references (L5)
│   │   └── WP: Add proper FK relations (L4)
│   │       ├── Twin.userId → User.id FK (L5)
│   │       └── TwinSession.userId → User.id FK (L5)
│   │
│   ├── S1.3: Expanded Student Profile (L3) .................. [draft]
│   │   ├── WP: Profile schema design (L4)
│   │   │   ├── Academic background model (L5)
│   │   │   ├── Test scores model (GRE, GMAT, IELTS, TOEFL) (L5)
│   │   │   ├── Work experience model (L5)
│   │   │   ├── Extracurriculars model (L5)
│   │   │   └── Preferences: target courses, budget, timeline (L5)
│   │   ├── WP: Profile edit UI (L4)
│   │   └── WP: Profile completeness scoring (L4)
│   │       ├── Define minimum completeness for application (L5)
│   │       └── Completeness gate enforcement (L5)
│   │
│   └── S1.4: Onboarding Updates (L3) ........................ [draft]
│       └── WP: Capture expanded profile fields during onboarding (L4)
│
│
│   ══════════════════════════════════════════════════════
│   STEP 2: University Knowledge Base (S2)
│   ══════════════════════════════════════════════════════
│
├── S2: University Knowledge Base (L2) ....................... [not started]
│   │
│   ├── S2.1: University Data Schema (L3)
│   │   ├── WP: University model (L4)
│   │   │   ├── Basic info: name, location, type, ranking (L5)
│   │   │   ├── Acceptance rate, enrollment size (L5)
│   │   │   └── Campus info, website, contact (L5)
│   │   ├── WP: Program model (L4)
│   │   │   ├── Degree type, department, duration (L5)
│   │   │   ├── Tuition & fees (L5)
│   │   │   └── Prerequisites & test requirements (L5)
│   │   └── WP: Admission requirements model (L4)
│   │       ├── Required documents per program (L5)
│   │       ├── Minimum scores / GPA thresholds (L5)
│   │       ├── Application deadlines & rounds (L5)
│   │       └── Special requirements (portfolio, interview) (L5)
│   │
│   └── S2.2: Texas University Data (L3)
│       ├── WP: Identify Texas universities (~50-80) (L4)
│       ├── WP: Data sourcing strategy (L4)
│       │   ├── College Scorecard API (L5)
│       │   ├── IPEDS data (L5)
│       │   └── Manual curation for requirements (L5)
│       ├── WP: Seed data ingestion (L4)
│       └── WP: Data quality validation (L4)
│
│
│   ══════════════════════════════════════════════════════
│   STEP 3: Document Vault (S6)
│   ══════════════════════════════════════════════════════
│
├── S6: Document Vault (L2) .................................. [not started]
│   │
│   ├── S6.1: Document Storage (L3)
│   │   ├── WP: Document DB model (L4)
│   │   │   ├── Type enum (transcript, sop, lor, resume, etc.) (L5)
│   │   │   ├── Metadata: name, size, mime_type, uploaded_at (L5)
│   │   │   └── User FK (ownership) (L5)
│   │   ├── WP: File storage backend (L4)
│   │   │   ├── Local filesystem for dev (L5)
│   │   │   └── File type & size validation (L5)
│   │   └── WP: Upload API (L4)
│   │
│   ├── S6.2: Document Management UI (L3)
│   │   ├── WP: Upload interface (drag & drop) (L4)
│   │   ├── WP: Document library view (L4)
│   │   └── WP: Preview & download (L4)
│   │
│   └── S6.3: Agent Access Layer (L3)
│       ├── WP: Document retrieval API (L4)
│       └── WP: PDF/DOCX text extraction (L4)
│
│
│   ══════════════════════════════════════════════════════
│   STEP 4: Application Model (S5 — partial)
│   ══════════════════════════════════════════════════════
│
├── S5: Applications (L2) .................................... [not started]
│   │
│   ├── S5.1: Application Model (L3)
│   │   ├── WP: Application DB model (L4)
│   │   │   ├── Links: student, university, program (L5)
│   │   │   ├── Status enum pipeline (L5)
│   │   │   │   └── draft → checklist_created → uploading →
│   │   │   │       under_review → needs_correction → packet_complete
│   │   │   └── Timestamps: created, updated, completed (L5)
│   │   └── WP: Application API (create, update status, get) (L4)
│   │
│   ├── S5.2: Checklist Model (L3)
│   │   ├── WP: Checklist item model (L4)
│   │   │   ├── Linked to application (L5)
│   │   │   ├── Item type: document, form, test_score, other (L5)
│   │   │   ├── Status: pending, uploaded, approved, rejected (L5)
│   │   │   ├── Agent feedback field (L5)
│   │   │   └── Linked document reference (optional) (L5)
│   │   └── WP: Checklist API (L4)
│   │       ├── Create checklist (agent-generated) (L5)
│   │       ├── Update item status (L5)
│   │       └── Add/modify items post-creation (L5)
│   │
│   └── S5.3: Application UI (L3)
│       ├── WP: Application dashboard (list all applications) (L4)
│       ├── WP: Application detail view (L4)
│       │   ├── Status display (L5)
│       │   ├── Checklist with item statuses (L5)
│       │   ├── Upload to checklist item (L5)
│       │   └── Agent feedback per item (L5)
│       └── WP: Packet Complete view (ready-to-submit summary) (L4)
│
│
│   ══════════════════════════════════════════════════════
│   STEP 5: University Counselor — Checklist Generation (S4)
│   ══════════════════════════════════════════════════════
│
├── S4: University Admission Counselors (L2) ................. [not started]
│   │
│   ├── S4.1: Counselor Agent — Checklist Generation (L3)
│   │   ├── WP: Agent architecture (LangGraph) (L4)
│   │   │   ├── Agent reads student profile via tool (L5)
│   │   │   ├── Agent reads university/program requirements via tool (L5)
│   │   │   └── Agent outputs structured checklist JSON (L5)
│   │   ├── WP: Checklist generation prompt design (L4)
│   │   └── WP: Checklist persistence (write to DB) (L4)
│   │
│   │
│   │   ════════════════════════════════════════════════
│   │   STEP 6: University Counselor — Document Validation
│   │   ════════════════════════════════════════════════
│   │
│   ├── S4.2: Counselor Agent — Document Validation (L3)
│   │   ├── WP: Validation agent architecture (L4)
│   │   │   ├── Agent reads document content (text extraction) (L5)
│   │   │   ├── Agent reads checklist item requirements (L5)
│   │   │   └── Agent validates: format, content, completeness (L5)
│   │   ├── WP: Approval/rejection flow (L4)
│   │   │   ├── Per-item approve with confirmation (L5)
│   │   │   ├── Per-item reject with feedback message (L5)
│   │   │   └── Application status auto-transition (L5)
│   │   └── WP: Re-upload & re-validation cycle (L4)
│   │
│   │
│   │   ════════════════════════════════════════════════
│   │   STEP 7: Packet Complete
│   │   ════════════════════════════════════════════════
│   │
│   └── S4.3: Packet Complete (L3)
│       ├── WP: All-items-approved check (L4)
│       ├── WP: Transition to "Packet Complete" status (L4)
│       └── WP: Ready-to-submit summary view (L4)
│           ├── All documents packaged (L5)
│           ├── University + program + deadline info (L5)
│           └── Download / export packet (L5)
```

---

## Dependency Graph (V0.1)

```
S1 (Profile) ───┐
                 ├──→ S5 (Application + Checklist) ──→ S4.1 (Checklist Gen)
S2 (Univ Data) ──┘              │                              │
                                │                              ▼
S6 (Doc Vault) ─────────────────┘                     S4.2 (Doc Validation)
                                                               │
                                                               ▼
                                                      S4.3 (Packet Complete)
```

---

## Future Versions (not decomposed yet)

| Version | Feature Set | Systems |
|---------|------------|---------|
| V0.2 | University Directory & Discovery | S3 |
| V0.3 | Maya — Main Agent | S7 |
| V0.4 | Agent Teams | S8 |
| V0.5+ | Shortlist management, batch apply, portal integration, expansion | S5 (expanded), S3+ |
