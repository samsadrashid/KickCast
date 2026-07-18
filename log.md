# Kickcast Log

## 2026-06-18

- Project folder created. Planning phase begins.

- **2026-07-09 11:13** — auto-wrap: session ended [auto-wrap]

- **2026-07-09 11:14** — auto-wrap: session ended [auto-wrap]

- **2026-07-09 11:17** — auto-wrap: session ended [auto-wrap]

- **2026-07-16 08:47** — auto-wrap: session ended [auto-wrap]

## 2026-07-18

- Dev server started (localhost:5173). Confirmed stack: React + Vite + Supabase.
- **Museum-mode plan** (post-tournament pivot, World Cup ends next week): app loses live purpose, pivots to read-only archive.
  - Add `TOURNAMENT_ENDED` freeze flag. When true: Bracket/Vote tabs go read-only (show final picks/results, hide predict/vote actions); Leaderboard frozen at final standings; Fixtures/Teams/WcXi stay as-is (already display-only).
  - Archive banner in top bar replacing live countdown once frozen.
  - Rebrand copy pass ("Kickcast Museum" or similar — naming TBD).
  - Block new predictions/votes server-side (Supabase RLS / function-level), not just UI hide.
  - Update `Project_Status.md` phase once implemented.
  - **Decision: wait until tournament actually ends** to implement — do not build flag preemptively.
  - **Superseded** by full Museum Roadmap below.

- **Museum Roadmap saved**: `proposals/active/museum/plan.md` — full multi-phase plan turning KickCast into permanent World Cup archive (1930→2030+), fidelity-tiered (`cinematic` 2018+ vs `archive` pre-2018). Phases 0–6 scoped (data foundation → MVP museum → 2026 pitch viz → historical expansion → YouTube → 3D → 2030 countdown), Phase 7+ stretch backlog logged separately.
  - Scope decisions: Bracket/Vote tabs retire to read-only archive cards; Fixtures/Teams rebuilt as archive-card browser; nav gets tournament selector; WcXi untouched for now; **Home and Leaderboard kept intact for now**.
  - Tier bumped to `MewKing`, `plan_approved: true` (user approved 2026-07-18). `Project_Status.md` updated: tier, current_phase, stack.

- **Phase 0 shipped** — migration `museum_phase0_data_foundation` applied to live Supabase project `koxmyiquyoxalpkefcsf` (KickCast). Additive only, no existing columns/tables touched:
  - New tables: `tournaments` (id, year, name, host_country, `fidelity_tier` enum cinematic/archive, starts_on, ends_on), `teams`, `players`, `lineups`, `goals`.
  - `tournament_id` FK column added to existing `matches` and `standings` tables (nullable).
  - Seeded `tournaments` with `2026` row (fidelity_tier: cinematic), backfilled all 104 matches + 48 standings rows to `tournament_id='2026'`.
  - RLS enabled on all new tables, public+authenticated read policies mirroring existing `matches`/`standings` pattern.
  - `teams`/`players`/`lineups`/`goals` empty — next: seed from existing 2026 data + Wikidata historical index (rest of Phase 0 / start of Phase 1).
  - Verified: dev server (localhost:5173) still responds 200 after migration, live app unaffected.

- **Seeded `teams` + `players`** from existing 2026 `App.jsx` data (`TEAM_DATA`, `GROUPS`, `ESPN_TEAM_IDS` — extracted programmatically via a Node vm sandbox, not hand-transcribed, to avoid errors across ~1200 rows):
  - Migration `museum_phase0_seed_teams_players`: 48 teams (real 2026 field only, `id` = ESPN id matching existing `matches.team_id`), 806 players from `TEAM_DATA[name].squad`.
  - Found 17 teams with `squad: []` stubs in source (no roster data exists yet in the app): Bosnia-Herzegovina, Cape Verde, Congo DR, Curaçao, Czechia, Ghana, Haiti, Ivory Coast, Jordan, Norway, Qatar, Scotland, South Africa, Sweden, Tunisia, Türkiye, United States.
  - `United States` was a false negative — real squad exists under a duplicate legacy key `"USA"` (same team_id 660) in `TEAM_DATA`. Migration `museum_phase0_seed_usa_alias_fix` backfilled 26 players from that alias.
  - Final: 832 players across 32/48 teams. Remaining 16 teams have no seedable data — not fabricated, left empty pending real roster sourcing (Wikidata / manual, later phase).
  - Verified: dev server still 200 after both migrations.

- **Historical tournament index sourced from Wikidata** (`museum_phase0_seed_historical_tournaments`). SPARQL query against `query.wikidata.org` for editions where P3450 = Q19317 (FIFA World Cup). Filtered out: cancelled 1942/1946 (WWII), qualification-round items (query matched those loosely), not-yet-held 2030/2034/2038 editions. 22 held tournaments (1930–2022) inserted, all `fidelity_tier: archive`, with year/host/start/end dates. Multi-host (2002 Japan/South Korea) joined as single string.
  - **Phase 0 complete**: 23 tournaments total (22 archive + 2026 cinematic). `teams`/`players` seeded for 2026 only — historical tournaments have index-level data (name/host/dates) only, no match/team/player data yet (that's later-phase ingestion work, much bigger scope).

- **Phase 1 (MVP Museum) — first slice shipped**: new "Museum" tab added to `App.jsx` (`TABS` array, 7th nav slot; `MuseumTab` component ~line 4705). User confirmed placement: new top-level nav tab (not nested in Fixtures/Teams).
  - `MuseumTab` fetches `tournaments` table, renders 23 archive-cards (grid, cinematic 2026 highlighted gold/"LIVE", 22 historical "ARCHIVE"). Clicking 2026 jumps to Fixtures tab (`onOpenLive` → `setTab("fixtures")`); clicking a historical card expands inline showing host/dates + "match-by-match archive not yet available" note — honest about the data gap rather than faking it.
  - Verified via Playwright (webapp-testing skill): heading renders, 1 LIVE + 22 ARCHIVE cards present, zero console/page errors, screenshot confirms visual layout matches app's existing style (Barlow Condensed, navy/gold theme, card conventions borrowed from `TeamsTab`).
  - `npx eslint src/App.jsx` run — no new errors introduced by this change (pre-existing lint debt elsewhere in the file, unrelated).
  - Home and Leaderboard untouched per earlier decision.

- **`tournament_id` filters wired into live queries** — closes a latent correctness gap: `matches`/`standings` queries (main fetch, realtime subscriptions, and `BracketTab`'s standings load) previously had no tournament scoping, meaning they'd silently start mixing eras the moment any non-2026 match/standings data gets ingested. Added `.eq('tournament_id', '2026')` to all 4 query sites in `App.jsx` plus `filter: 'tournament_id=eq.2026'` on the two realtime channel subscriptions. No UI tournament-switcher added yet (no historical match data exists to switch to — would be premature).
  - Verified via Playwright: Fixtures tab (102 results + upcoming matches), Teams tab knockout bracket, and Bracket tab standings all still render real data post-filter. One pre-existing React key-prop console warning in `KnockoutTreeView` (unrelated to this change, not introduced by it).

- **Phase 2 (2026 Visual Centerpiece) started** — user said "phase 2 start". Scoped down before building: roadmap's "living pitch" formation view needs real per-match lineup data, which the `lineups` table (Phase 0 schema) has none of — `TEAM_DATA`'s `xi` flag is a generic presumed starting XI, not tied to any specific match, so seeding `lineups` from it would be fabricated data. Flagged this to user; asked which Phase 2 piece to build first given the constraint.
  - User picked: **goal timeline scrubber** first (real per-match `matches.goals` data — minute, scorer, side, own-goal flag — already populated live by existing sync, 93/102 completed matches have it).
  - Built `GoalTimeline` component (`App.jsx`, added before `MatchDetailsModal`): horizontal minute-scale track (0–96, extends to 120 if match went to extra time), goals plotted as clickable ⚽/⚠️(OG) markers positioned proportionally by parsed minute (handles stoppage-time notation like `"45'+5'"`), gold playhead line snaps to selected goal, readout below shows minute/scorer/side. Falls back to the original plain list when nothing's selected. Replaced the old static goals block in `MatchDetailsModal` with it — no other modal content touched.
  - Verified via Playwright: opened multiple completed-match detail modals (some completed matches have no `goals` data — a real gap, not a bug, ~9/102), found one with 2 goals, confirmed markers render at correct positions, click-to-select works (playhead moves, marker enlarges, other marker dims, readout updates), zero console errors.
  - Not yet built: lineup pitch view (blocked on real match-lineup data) and simplex-noise idle animation (pure polish, deferred).

- **Phase 3 (Historical Archive Expansion) started** — user said "phase 3 start". Flagged upfront: every Phase 3 feature (player career timelines, team tournament-history, records, Trophy Journey, "Where Are They Now?") needs real match/squad data per historical tournament, and the 22 historical tournaments only had index-level rows (name/host/dates) — zero matches/teams/players. Asked user how to proceed; chose "ingest historical data first."
  - Checked what Wikidata reliably has before committing to scope: full match-by-match + squad data is patchy pre-1990s and out of scope for inline ingestion (would need a dedicated data-source decision). **Tournament winner** (P1346) is solid and complete — 22/22 held editions matched, high confidence.
  - Migration `museum_phase3_tournament_winners`: added `winner_team_name` text column to `tournaments`, populated for all 22 historical editions (names cleaned of Wikidata's " men's national football team" suffix).
  - Wired into `MuseumTab`: 🏆 winner badge now shown on every archive card. Verified via Playwright — 22 trophy markers rendered, screenshot confirms correct winners (2022 Argentina, 2018 France, 2014 Germany, etc.), zero console errors.
  - **Still blocked**: match-by-match results, historical squads, records, player pages, Trophy Journey animation, "Where Are They Now?" — all need a real historical match/squad data source, not yet chosen. This was a deliberately small, honest first slice, not the full Phase 3.

- **Phase 4 (YouTube Integration) started** — user said "phase 4 start". Hard constraint from roadmap itself: manual curation only, no auto-search for video IDs — and no real curated YouTube video IDs exist or were sourced (can't browse/verify YouTube). Flagged this; asked user how the no-embed fallback should look. Chose: YouTube search-query link, clearly labeled as a search shortcut, not a claimed official clip.
  - Migration `museum_phase4_seed_goals`: populated the normalized `goals` table (Phase 0 schema, was empty) from the real goal data already in `matches.goals` (Phase 2 source) — 294 goal rows across 93 matches, restructured not fabricated. Added `player_name` text column (raw scorer name) since exact `player_id` FK matching against seeded squads is unreliable (accent/formatting differences, scorers not always in the pre-tournament squad list — only 32/48 teams have squads at all). Backfilled `player_id` via exact case-insensitive name+team match: 114/294 matched, rest honestly left null.
  - Built **Match Story Mode**: `narrateGoal()` templated narrative lines (e.g. "22' — GOAL. Mikel Oyarzabal strikes for Spain.") over real minute/scorer/team data already in `GoalTimeline` — no new data source, just narrative phrasing per roadmap's own spec ("built on data already collected in Phase 2").
  - Built YouTube fallback: `youtubeSearchUrl()` generates a real, working YouTube search link (player + team + "World Cup 2026"), shown as "🔍 Search YouTube (no curated clip yet)" — honest about not being a curated embed. `goals.youtube_video_id` stays null everywhere; embed path isn't built since there's nothing real to embed.
  - Verified via Playwright: narrative renders correctly, search link has correct encoded URL (confirmed for Mikel Oyarzabal/Spain), zero console errors, screenshot confirms clean UI.
  - Goal library browsing UI (dedicated list of all goals) and per-match highlight reels not built — deferred, GoalTimeline covers the per-match case which was the higher-value slice.

- **Phase 5 (3D Upgrade) started** — user said "phase 5 start". Flagged upfront: 2 of 3 roadmap items blocked on prior gaps —
  - 3D pitch upgrade: would upgrade the Phase 2 lineup/pitch view, which was never built (still blocked on real per-match lineup data). Nothing to upgrade.
  - Retroactive historical bracket: needs historical match/bracket data — same unresolved Phase 3 blocker.
  - **Social sharing cards**: no data blocker — built this piece. Found `BracketTab` already had a `handleShare` (html2canvas → `navigator.share`/download) for bracket predictions; added the same pattern to `MatchDetailsModal` for match results.
  - Implementation: wrapped the score header + result pill in a `cardRef` capture region with a "🏆 KICKCAST · FIFA WORLD CUP 2026" branding line; added a "📤 SHARE RESULT" button (shown only for completed/`FT` matches) that captures the region via `html2canvas`, tries `navigator.share` with the PNG file, falls back to direct download.
  - Verified via Playwright: clicked share on a completed match (England 1–2 Argentina), confirmed real download (`kickcast-match.png`, ~42KB), screenshot of the generated card confirms clean branded output — flags, score, result pill, no clutter. Zero console errors.

- **Phase 6 (2030 Countdown) started and shipped** — user said "phase 6 start". No data blocker this time: 2030 hosts (Spain/Portugal/Morocco) and dates (2030-06-08 to 2030-07-28) are real, confirmed, already surfaced in the Phase 0 Wikidata pull (excluded then since not-yet-held).
  - Migration `museum_phase6_2030_countdown`: added `'upcoming'` to the `fidelity_tier` enum (2030 doesn't fit cinematic/archive — hasn't happened, shouldn't be mislabeled as archive).
  - Migration `museum_phase6_2030_seed`: inserted the 2030 tournament row.
  - Built `Countdown2030Card` in `MuseumTab`: live-ticking D/H/M/S countdown (1s interval), host-country teaser, "NEXT UP" badge, rendered above the archive grid (grid now filters out the `upcoming`-tier row so it doesn't double-render as a regular card).
  - Verified via Playwright: countdown seconds tick live (confirmed 02→01 across a 1.5s wait), "NEXT UP" badge renders, day count (~1420 days from 2026-07-18 to 2030-06-08) checks out arithmetically, zero console errors, screenshot confirms clean layout.
  - This also completes the roadmap's Phase 6 intent: positions the app to go live again as an active companion when 2030 qualifying begins — no further action needed until then.

## Session wrap — 2026-07-18

Ran museum roadmap Phases 0–6 in one session, tier bumped Stalk→MewKing along the way (plan_approved: true). `Project_Status.md` updated with 3 open threads, all sharing one root cause: no real historical match/squad data source has been chosen. That single gap blocks the lineup pitch view (Phase 2), most of Phase 3, and the 3D/retroactive-bracket half of Phase 5. Everything actually shipped this session used real data — Wikidata for historical index/winners/2030, `matches.goals`/`TEAM_DATA` already in the live app for 2026 — nothing fabricated to fill gaps; gaps were left honestly empty or flagged instead.

Suggested commit message:
```
feat(kickcast): museum roadmap phases 0-6 — schema, archive browser, goal timeline, winners, story mode, share cards, 2030 countdown

Adds tournaments/teams/players/lineups/goals schema with fidelity tiers (Phase 0),
Museum tab tournament browser (Phase 1), per-match goal timeline scrubber (Phase 2),
Wikidata-sourced tournament winner badges (Phase 3), goals table seed + Match Story
Mode narrative + YouTube search fallback (Phase 4), match-result share cards (Phase 5),
and a live 2030 World Cup countdown (Phase 6).

Lineup pitch view, most of Phase 3 (player/team pages, records, Trophy Journey), and
the 3D pitch/retroactive bracket pieces of Phase 5 remain blocked on a real historical
match/squad data source — not yet chosen, tracked in Project_Status.md open_threads.
```

- **2026-07-18 04:35** — auto-wrap: modified Project_Status.md, log.md [auto-wrap]
