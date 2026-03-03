# S8: Agent Teams

## Status: `not started`

## Purpose

Specialized expert agents that handle deep, domain-specific workflows. Maya delegates to these when a student needs focused help on immigration, profile building, SOP writing, or exam preparation.

## Problems It Solves

- Generic AI can't go deep enough on specialized domains (visa rules, SOP craft)
- Human specialists charge ₹15K–₹60K per service; agent teams scale this to zero marginal cost
- Each domain has its own structured workflow that benefits from a dedicated agent

## Subsystems

### S8.1: Immigration Expert
- US visa knowledge base (F-1, J-1 visa types, SEVIS, I-20, DS-160)
- Structured immigration guidance flow (step-by-step)
- Document preparation assistance (which forms, how to fill them)
- Timeline & checklist generation (personalized to student's deadlines)

### S8.2: Profile Builder
- Profile strength analysis against target universities
- Gap identification (missing test scores, weak extracurriculars, etc.)
- Improvement roadmap with actionable todos
- Progress tracking over time

### S8.3: SOP Expert
- SOP structure guidance (per-university expectations)
- Draft generation from student profile data and goals
- Review & feedback loop (iterative improvement)
- Per-university SOP customization

### S8.4: Exam Prep Expert
- Test requirement identification based on target programs (GRE/GMAT/IELTS/TOEFL)
- Personalized study plan generation
- Resource recommendations (free and paid)
- Score tracking & readiness assessment

### S8.5: Agent Team Framework
- Shared agent base: common persona traits, memory management, tool access
- Specialist registration & discovery (Maya knows which agents exist)
- Cross-agent context sharing (student profile, documents, shortlist)

## Dependencies

- **S7** (Maya) — delegation source
- **S1** (Student Profile) — student context
- **S6** (Document Vault) — document access for SOP, immigration docs

## Acceptance Criteria

- [ ] Each specialist agent can be invoked by Maya via delegation
- [ ] Immigration expert provides structured visa guidance with checklists
- [ ] Profile builder analyzes profile and generates improvement roadmap
- [ ] SOP expert generates drafts and provides iterative feedback
- [ ] Exam prep expert creates study plans based on target programs
- [ ] All agents share student context without re-asking for information
