# S7: Maya — Main Agent

## Status: `not started`

## Purpose

Maya is the central AI counselor on the home screen — a research and automation assistant that can search universities, manage shortlists, trigger applications, access student profiles, search the web, and delegate to specialist agent teams.

## Problems It Solves

- Students need a single intelligent entry point instead of navigating multiple UIs
- Cross-university research and comparison is tedious manually
- Automating multi-step workflows (e.g., "apply to all my shortlisted schools") requires tool orchestration

## Subsystems

### S7.1: Core Agent
- Agent architecture on LangGraph (state machine, tool routing)
- System prompt & Maya persona (warm, knowledgeable, proactive)
- Conversation memory (per-user, persistent)
- Streaming chat interface on home page

### S7.2: MCP Tool Integration
- University search tool: find universities matching criteria
- Shortlist tools: add, remove, view shortlist
- Application tools: start application, apply to all shortlisted
- Student profile access: read profile for recommendations, suggest improvements
- Document vault access: retrieve and reference uploaded documents
- Course/career suggestion tool based on profile

### S7.3: Web Search
- Web search tool for real-time information (visa updates, scholarship deadlines, news)
- Source citation in responses

### S7.4: Agent Team Delegation
- Intent detection: recognize when a student needs specialist help
- Handoff protocol: pass context to specialist agent (S8)
- Result collection: receive specialist output and present to student

## Dependencies

- **S1** (Student Profile) — profile access
- **S2** (University KB) — university search
- **S5** (Shortlist & Applications) — shortlist/apply tools
- **S6** (Document Vault) — document access

## Acceptance Criteria

- [ ] Maya is accessible on the home screen with streaming chat
- [ ] Maya can search universities and present results conversationally
- [ ] Maya can add/remove universities from shortlist via tool calls
- [ ] Maya can read student profile and give personalized recommendations
- [ ] Maya can delegate to specialist agents and return results
- [ ] Web search returns current information with citations
