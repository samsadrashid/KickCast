# Graph Report - worldcup2026  (2026-06-12)

## Corpus Check
- 11 files · ~101,834 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 160 nodes · 178 edges · 20 communities (15 shown, 5 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.5)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `a6974839`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]

## God Nodes (most connected - your core abstractions)
1. `App` - 16 edges
2. `getTeam()` - 10 edges
3. `BracketTab` - 10 edges
4. `scripts` - 5 edges
5. `getRound()` - 4 edges
6. `TeamsTab` - 4 edges
7. `VoteTab` - 4 edges
8. `Supabase` - 4 edges
9. `Supabase Auth` - 4 edges
10. `Supabase DB` - 4 edges

## Surprising Connections (you probably didn't know these)
- `App` --uses--> `React 19`  [EXTRACTED]
  src/App.jsx → package.json
- `@supabase/supabase-js` --implements--> `Supabase`  [EXTRACTED]
  package.json → src/supabase.js
- `App` --calls--> `Supabase DB`  [EXTRACTED]
  src/App.jsx → src/supabase.js
- `BracketTab` --calls--> `Supabase DB`  [EXTRACTED]
  src/App.jsx → src/supabase.js
- `VoteTab` --calls--> `Supabase DB`  [EXTRACTED]
  src/App.jsx → src/supabase.js

## Import Cycles
- None detected.

## Communities (20 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.06
Nodes (17): ALL_TEAMS, BRACKET_ROUNDS, DARK_T, ESPN_POS, ESPN_TEAM_IDS, FIXTURES, GROUPS, LIGHT_T (+9 more)

### Community 1 - "Community 1"
Cohesion: 0.20
Nodes (10): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/react, @types/react-dom (+2 more)

### Community 2 - "Community 2"
Cohesion: 0.13
Nodes (20): BracketListView, BracketMatchCard, BracketTab, BracketTreeView, FixturesTab, MatchCard, MatchCardSlide, MatchSliderSection (+12 more)

### Community 3 - "Community 3"
Cohesion: 0.13
Nodes (14): dependencies, html2canvas, react, react-dom, @supabase/supabase-js, name, private, scripts (+6 more)

### Community 7 - "Community 7"
Cohesion: 0.20
Nodes (10): App(), getTeam(), makeGlobalStyle(), MatchCard(), MatchCardSlide(), MatchDetailsModal(), SupportPickerModal(), TeamDetail() (+2 more)

### Community 8 - "Community 8"
Cohesion: 0.12
Nodes (16): App, AuthModal, LeaderboardTab, MoreTab, SideDrawer, DARK_T, LIGHT_T, MOCK_STATS (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.50
Nodes (3): Expanding the ESLint configuration, React Compiler, React + Vite

### Community 10 - "Community 10"
Cohesion: 0.50
Nodes (4): BracketTab(), getR32UsedTeams(), getRound(), getRoundWinners()

### Community 18 - "Community 18"
Cohesion: 0.40
Nodes (4): active_agent, files_modified, last_updated, tool_calls

### Community 19 - "Community 19"
Cohesion: 0.09
Nodes (22): /Users/ony/Downloads/Avrek/API/KickCast API/src/crawlers/fixturesCrawler.js, ts, /Users/ony/Downloads/Avrek/API/KickCast API/src/crawlers/liveScoreCrawler.js, ts, /Users/ony/Downloads/Avrek/API/KickCast API/src/crawlers/standingsCrawler.js, ts, /Users/ony/Downloads/Avrek/API/KickCast API/src/index.js, ts (+14 more)

## Knowledge Gaps
- **70 isolated node(s):** `ts`, `ts`, `ts`, `ts`, `ts` (+65 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `App` connect `Community 8` to `Community 2`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Why does `BracketTab` connect `Community 2` to `Community 8`?**
  _High betweenness centrality (0.020) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Community 1` to `Community 3`?**
  _High betweenness centrality (0.014) - this node is a cross-community bridge._
- **What connects `ts`, `ts`, `ts` to the rest of the system?**
  _70 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.06060606060606061 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.12631578947368421 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.13333333333333333 - nodes in this community are weakly interconnected._