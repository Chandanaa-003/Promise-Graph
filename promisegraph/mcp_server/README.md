# PromiseGraph MCP Server (Phase 5 Placeholder)

This directory is reserved for the **Model Context Protocol (MCP)** server component of PromiseGraph.

## Architecture Vision (Phase 5)

When implemented in Phase 5, this service will expose PromiseGraph's communication intelligence, relationship graph, and commitment tracking tools to external AI clients such as:

- Claude Desktop
- Cursor IDE
- Antigravity IDE / Agent
- Custom autonomous LLM agents

### Planned Tool Definitions

1. `get_active_commitments`: Query pending promises made by or to the user.
2. `search_relationship_graph`: Query stakeholder trust scores, interaction frequency, and communication channels.
3. `extract_commitments_from_text`: Ad-hoc extraction of promises from conversational transcripts.
4. `propose_follow_up`: Generate human-in-the-loop follow-up drafts for approval.

> **Note**: In accordance with the Phase 1 specification, this directory serves as the architectural foundation placeholder. Implementation will commence in Phase 5.
