# S3: University Directory

## Status: `not started`

## Purpose

Student-facing UI for discovering, browsing, and evaluating universities. The front door to the counselor and application flow.

## Problems It Solves

- Students need a single place to browse and compare US universities
- Traditional consultants gate this information; we make it freely explorable
- Entry point for deeper engagement (counselor chat, shortlisting, applying)

## Subsystems

### S3.1: Browse & Search UI
- University listing page with filters (location, ranking, tuition, program type)
- Sort options (ranking, match score, deadline proximity)
- Search bar with autocomplete
- Pagination or infinite scroll

### S3.2: University Detail Page
- Overview tab: basic info, stats, photos
- Programs tab: available programs with requirements
- Admissions tab: requirements, deadlines, acceptance rate
- Reviews/stats tab: student outcomes, placement data
- "Chat with Counselor" CTA
- "Shortlist" / "Apply" action buttons

### S3.3: Recommendation Engine
- Profile-to-university matching based on student profile (S1) and university data (S2)
- "Universities for you" personalized section on directory page

## Dependencies

- **S2** (University Knowledge Base) — data source
- **S1** (Student Profile) — for personalized recommendations

## Acceptance Criteria

- [ ] Student can browse universities with working filters and search
- [ ] University detail page shows structured info across tabs
- [ ] "Chat with Counselor" opens counselor chat (S4)
- [ ] Shortlist button adds to student's shortlist (S5)
- [ ] Personalized recommendations appear when profile is complete
