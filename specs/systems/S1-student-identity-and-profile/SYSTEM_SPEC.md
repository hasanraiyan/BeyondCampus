# S1: Student Identity & Profile

## Status: `partial`

## V0.1 Scope

Auth exists. Need: identity cleanup (UUID unification, FKs), expanded profile schema, profile completeness gate.

## Purpose

Manage student authentication, onboarding, and profile data. This is the identity backbone — the university counselor agent reads the student profile to generate application checklists.

## Problems It Solves

- Agents need structured student data (academics, scores, goals) to generate accurate checklists
- Profile completeness directly impacts quality of agent output
- Current ID system (CUID/UUID mismatch) creates data integrity risks

## V0.1 Subsystems

### S1.1: Authentication (done)
- Email/password signup & signin
- JWT session management via NextAuth
- Middleware route protection

### S1.2: Identity Cleanup
- Unify ID strategy: migrate User.id to UUID (or make all FKs use CUID consistently)
- Remove `cuidToUuid` converter hack
- Add proper FK relations: Twin.userId → User.id, TwinSession.userId → User.id

### S1.3: Expanded Student Profile
- **Academic background**: degree, institution, GPA, major, graduation year
- **Test scores**: GRE (V/Q/AW), GMAT, IELTS, TOEFL — score + date taken
- **Work experience**: company, role, duration, description
- **Extracurriculars**: activity, role, duration, achievements
- **Preferences**: target courses, specializations, budget range, timeline
- Profile view/edit UI
- Profile completeness scoring
- Minimum completeness gate (must reach X% before starting an application)

### S1.4: Onboarding Updates
- Capture expanded profile fields during onboarding flow
- Progressive — collect basics first, detailed info can be added later

## Data Models Needed

- `User` (rework — expand fields or split into related models)
- `AcademicBackground` (new)
- `TestScore` (new)
- `WorkExperience` (new)
- `Extracurricular` (new)

## Dependencies

None — this is foundational.

## Key Decisions

- Profile completeness gate: student cannot start an application until profile meets minimum threshold
- Test scores stored with date (scores expire, agents need to know if retake is needed)
- Multiple academic backgrounds supported (undergrad + postgrad)

## Acceptance Criteria

- [ ] All IDs use a single consistent strategy (no more cuidToUuid)
- [ ] FK relations enforced at DB level
- [ ] Student profile captures: academics, test scores, work experience, extracurriculars, preferences
- [ ] Profile completeness score is computed
- [ ] Student cannot start application below completeness threshold
- [ ] Profile is editable from a dedicated UI page
