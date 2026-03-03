# S4: University Admission Counselors

## Status: `not started`

## V0.1 Scope

Checklist generation + document validation agent only. Full Q&A counselor, comparison features, and chat interface are later versions.

## Purpose

Each university gets an AI admission counselor that:
1. Generates a structured application checklist by analyzing the student's profile against the program's requirements
2. Validates uploaded documents against that checklist (format, content, completeness)
3. Approves or rejects with actionable feedback

## Problems It Solves

- Students don't know exactly what documents each university needs or in what format
- Document errors cause application delays and rejections
- Human counselors charge per review; AI scales this to zero marginal cost

## V0.1 Subsystems

### S4.1: Checklist Generation Agent
- LangGraph agent with tool access to:
  - Student profile (S1) — academics, scores, extracurriculars
  - University/program requirements (S2) — required docs, thresholds, deadlines
- Outputs structured JSON checklist (not conversational text)
- Each checklist item: type, description, requirements, expected format
- Checklist is written to DB via Application Checklist model (S5)

### S4.2: Document Validation Agent
- LangGraph agent with tool access to:
  - Uploaded document content (S6 text extraction)
  - Checklist item requirements (S5)
- Validates each document against its checklist item:
  - Correct document type?
  - Content matches what's expected? (e.g., transcript has GPA, SOP addresses the right program)
  - Format/quality acceptable?
- Outputs per-item: approved / rejected + feedback message
- Can add new checklist items if validation reveals missing requirements

### S4.3: Packet Complete
- Triggered when all checklist items are approved
- Transitions application status to `packet_complete`
- Generates ready-to-submit summary

## Dependencies

- **S1** (Student Profile) — agent reads profile for checklist generation
- **S2** (University KB) — agent reads program requirements
- **S5** (Application + Checklist model) — agent writes checklist, reads/writes item status
- **S6** (Document Vault) — agent reads uploaded document content

## Key Decisions

- Agent validates content, not just file type (reads the actual document)
- Checklist is created once, but agent can modify it post-validation
- One agent per university (contextually aware of that university's specific requirements)
- V0.1: no conversational Q&A — agent's job is checklist + validation only

## Acceptance Criteria

- [ ] Agent generates a structured checklist given a student profile + university program
- [ ] Checklist items are persisted in DB and visible in application UI
- [ ] Agent reads uploaded document content (PDF text extraction)
- [ ] Agent approves or rejects each document with specific feedback
- [ ] Rejected items can be re-uploaded and re-validated
- [ ] Application transitions to Packet Complete when all items approved
- [ ] Agent can add checklist items during validation if needed
