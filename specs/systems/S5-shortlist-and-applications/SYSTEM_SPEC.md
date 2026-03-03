# S5: Shortlist & Applications

## Status: `not started`

## V0.1 Scope

Application model + status pipeline + checklist model only. Shortlist management, batch apply, and comparison are V0.5+.

## Purpose

Track a student's application to a specific university+program through its full lifecycle, from draft through agent-validated packet completion.

## Problems It Solves

- Students need structured tracking of multi-step applications across universities
- Agents need a checklist to validate against — must be stored, not ephemeral
- Document-to-requirement mapping must be explicit (not "upload everything and hope")

## V0.1 Subsystems

### S5.1: Application Model
- Application DB model linking: student, university, program
- Status pipeline: `draft → checklist_created → uploading → under_review → needs_correction → packet_complete`
- Status transitions enforced (can't skip steps)
- Timestamps for each status change

### S5.2: Checklist Model
- Checklist items linked to an application
- Each item has: type (document, form, test_score, other), description, status (pending, uploaded, approved, rejected)
- Agent feedback field per item (rejection reason, suggestions)
- Linked document reference (when student uploads against this item)
- Agent can add/modify items post-creation (not auto-regenerated on profile changes)

### S5.3: Application UI
- Application dashboard (list all applications with status)
- Application detail view (status, checklist with item states, upload per item, agent feedback)
- Packet Complete view (ready-to-submit summary with all documents packaged)

## Data Models Needed

- `Application` (new)
- `ApplicationStatus` enum
- `ChecklistItem` (new)
- `ChecklistItemStatus` enum
- `ChecklistItemType` enum

## Dependencies

- **S1** (Student Identity) — who is applying
- **S2** (University Knowledge Base) — what they're applying to
- **S6** (Document Vault) — uploaded documents linked to checklist items

## Key Decisions

- Checklist is generated once by the university agent (S4), not auto-updated on profile changes
- Agent can modify checklist post-validation (add items, change requirements)
- Terminal status is `Packet Complete` (not "Applied" — no portal integration in V0.1)
- Re-upload cycle: rejected items can be re-uploaded, which triggers re-validation

## Acceptance Criteria

- [ ] Student can start an application for a university+program
- [ ] Application has a visible status pipeline
- [ ] Checklist is populated by the university agent
- [ ] Student can upload documents against specific checklist items
- [ ] Agent can approve/reject each item with feedback
- [ ] Student can re-upload rejected items
- [ ] Application transitions to "Packet Complete" when all items are approved
- [ ] Packet Complete view shows downloadable summary
