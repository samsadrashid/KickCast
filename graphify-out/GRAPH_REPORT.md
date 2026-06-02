# worldcup2026 — Knowledge Graph Report
*Generated: 2026-06-02 17:30 · Path: .*

---

## Overview

| Metric | Value |
|--------|-------|
| Total nodes | 46 |
| Total edges | 60 |
| Communities | 14 |
| EXTRACTED edges | 58 |
| INFERRED edges | 2 |
| Source files scanned | 25 |
| Code files | 7 (.jsx × 3, .js × 3, .html × 1) |
| Config/docs | 6 |

---

## Communities

### Match & Bracket Engine (8 nodes)
Nodes: FIXTURES, BRACKET_ROUNDS, TeamPickerModal, WinnerPickerModal, BracketMatchCard, BracketListView, BracketTreeView, BracketTab

### App Shell & Navigation (7 nodes)
Nodes: MOCK_STATS, MoreTab, TABS, SideDrawer, AuthModal, App, Supabase Auth

### Match Card UI (5 nodes)
Nodes: StatusBadge, MatchCard, MatchCardSlide, MatchSliderSection, FixturesTab

### Team & Group Data (4 nodes)
Nodes: GROUPS, TEAM_DATA, TeamsTab, TeamDetail

### Supabase Backend (4 nodes)
Nodes: Supabase, Supabase DB, supabase.js, @supabase/supabase-js

### Build & Deploy Config (4 nodes)
Nodes: vite.config.js, netlify.toml, vercel.json, Vite 8

### Theme System (3 nodes)
Nodes: DARK_T, LIGHT_T, Theme System

### React Entry & Deps (3 nodes)
Nodes: main.jsx, package.json, React 19

### Voting & Local State (2 nodes)
Nodes: VoteTab, localStorage

### Leaderboard (2 nodes)
Nodes: MOCK_USERS, LeaderboardTab

### Round Data (1 nodes)
Nodes: ROUND_IDS

### Match Map (1 nodes)
Nodes: MATCH_MAP

### HTML Shell (1 nodes)
Nodes: index.html

### Documentation (1 nodes)
Nodes: README.md

---

## God Nodes

Highest-degree nodes — structural hubs connecting multiple communities:

- **App** — degree 16 · App Shell & Navigation · `src/App.jsx:3184`
- **BracketTab** — degree 10 · Match & Bracket Engine · `src/App.jsx:2078`
- **TeamsTab** — degree 4 · Team & Group Data · `src/App.jsx:1320`
- **VoteTab** — degree 4 · Voting & Local State · `src/App.jsx:2275`
- **Supabase Auth** — degree 4 · App Shell & Navigation · `src/supabase.js:`

---

## Surprising Connections

Cross-community edges that reveal unexpected coupling:

- **App** `renders` **FixturesTab** — bridges *App Shell & Navigation* → *Match Card UI*
- **App** `renders` **TeamsTab** — bridges *App Shell & Navigation* → *Team & Group Data*
- **App** `renders` **BracketTab** — bridges *App Shell & Navigation* → *Match & Bracket Engine*
- **App** `renders` **VoteTab** — bridges *App Shell & Navigation* → *Voting & Local State*
- **App** `renders` **LeaderboardTab** — bridges *App Shell & Navigation* → *Leaderboard*
- **FixturesTab** `uses` **FIXTURES** — bridges *Match Card UI* → *Match & Bracket Engine*
- **VoteTab** `uses` **FIXTURES** — bridges *Voting & Local State* → *Match & Bracket Engine*
- **BracketTab** `uses` **TEAM_DATA** — bridges *Match & Bracket Engine* → *Team & Group Data*

---

## Suggested Questions

1. **How does the theme system propagate to every component?** — Traces `T` mutation from `App` → all tab components. Follow the `data_T → comp_*` edges.

2. **What happens end-to-end when a user submits a score prediction?** — `VoteTab` → `supabase.from('wc_predictions').upsert` → `Supabase DB` → `Supabase`. Crosses 3 communities.

3. **Which component has the most render dependencies?** — `App` (degree 16) renders 8 child tabs + SideDrawer + AuthModal. Central god node.

4. **How is localStorage used as an offline sync layer?** — `BracketTab`, `VoteTab`, `App` all write to `localStorage` as cache before Supabase upsert. Reveals the offline-first pattern.

5. **What's the deployment target ambiguity?** — Both `netlify.toml` and `vercel.json` exist in the same project. Cross-community edge: both depend on `Vite 8` for build. Only one should be the target.

---

## Audit Trail

All edges tagged:
- **EXTRACTED** — relationship found explicitly in source (import, JSX usage, function call, `.from()` call)
- **INFERRED** — reasonable dependency implied by co-location or shared config (marked clearly)
- **AMBIGUOUS** — none found in this corpus

Input tokens (LLM): 0 (AST-only extraction — no LLM calls needed for this code corpus)

---
