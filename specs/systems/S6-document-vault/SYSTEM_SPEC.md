# S6: Document Vault

## Status: `not started`

## V0.1 Scope

Upload, store, type, retrieve documents. PDF text extraction for agent validation. No version tracking or agent summaries yet.

## Purpose

Centralized storage for student documents that agents can read and validate against application checklists.

## Problems It Solves

- Agents need to read document content to validate (not just check file exists)
- Documents must be reusable across multiple applications (upload once, link many)
- Students need a clear view of what they've uploaded

## V0.1 Subsystems

### S6.1: Document Storage
- **Document DB model**: type, name, size, mime_type, file_path, uploaded_at, user FK
- **Type enum**: transcript, sop, lor, resume, test_score_report, passport, financial_proof, portfolio, other
- **File storage**: local filesystem for dev (directory per user)
- **Upload API**: file type validation (PDF, DOCX, JPG, PNG), size limit (10MB)

### S6.2: Document Management UI
- Upload interface (drag & drop or file picker)
- Document library view (grouped by type)
- Preview & download

### S6.3: Agent Access Layer
- Document retrieval API (read-only, by document ID or by user+type)
- PDF text extraction (for agent to read content during validation)

## Data Models Needed

- `Document` (new)
- `DocumentType` enum

## Dependencies

- **S1** (Student Identity) — document ownership (user FK)

## Key Decisions

- Local filesystem storage for V0.1 (S3/cloud later)
- Documents are reusable: upload once, link to multiple checklist items across applications
- Text extraction is a must for V0.1 (agent validates content, not just existence)
- No version tracking in V0.1 — student re-uploads create a new document record

## Acceptance Criteria

- [ ] Student can upload PDF/DOCX/image documents
- [ ] Documents are persisted with type and metadata
- [ ] Document library shows all uploads grouped by type
- [ ] Agent can retrieve document content as text via API
- [ ] Documents can be linked to checklist items in applications
- [ ] File type and size validation works
