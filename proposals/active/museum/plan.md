# KickCast World Cup Museum — Roadmap

**Vision:** Turn KickCast from a 2026-only companion app into a permanent, interactive World Cup archive — live through 2030 and beyond. Not a stats site. A place to relive every World Cup from 1930 onward.

**Core principle — fidelity tiers by era:** Event-level data (touches, shots, xG, subs, momentum) exists cleanly for 2018+ tournaments and is sparse-to-nonexistent before that. Modern tournaments get the full cinematic treatment. Historic tournaments get a simpler, honest "archive card" treatment. Don't promise cinematic replay everywhere and hit a data wall later — decide the tier per tournament up front.

---

## Phase 0 — Data Foundation
- Supabase schema for tournaments, matches, teams, players, goals, lineups
- Source historical index from Wikidata
- Reuse existing KickCast 2026 data as the seed for the modern tier
- Flag each tournament with a fidelity tier (`cinematic` vs `archive`) based on available event data

## Phase 1 — MVP Museum
- Launch on existing KickCast data + Wikidata historical index
- Tournament list, match list, results, group standings — archive-card style across all eras
- This is the "museum doors open" milestone; everything else layers on top

## Phase 2 — 2026 Visual Centerpiece
- 2D "living pitch" animation: formations, subs, goal markers, animated timeline scrubber
- Canvas2D + simplex noise, no 3D engine yet
- Lineup view: players positioned on the pitch, click a player for a side panel (age, club, country, prior WC history, tournament stats)
- Applies only to `cinematic`-tier tournaments (2018+) where lineup/event data actually exists

## Phase 3 — Historical Archive Expansion
- Player pages: career timeline across tournaments (goals, awards, matches, appearances)
- Team pages: tournament-by-tournament history, best finish, top scorers, kits, managers
- Records: largest wins, youngest/oldest scorer, fastest goal, most clean sheets — searchable
- **Trophy Journey**: animated path per tournament (group stage → knockout → final), with the trophy-lift moment as a small celebratory beat
- **"Where Are They Now?"**: per-squad view showing each player's current club/status, sourced manually per squad rather than live-scraped
- **Player comparison**: side-by-side stats (goals, minutes, assists, matches) — start with structured stats only, no video

## Phase 4 — YouTube Integration (2026 first)
- Goal library: click a goal → embedded YouTube clip at the correct timestamp
- Match highlights embedded per match
- Curated `youtubeVideoId` mapping per goal/match — **manual curation, not auto-search** (auto-search misfires; official clips get pulled/region-locked)
- Fallback: link out to source when embed unavailable
- **Match Story Mode**: a narrative-text layer over the event timeline for `cinematic`-tier matches ("22' — Messi receives, turns, shoots — GOAL"), built on data already collected in Phase 2, not a separate data source
- Expand backward to older tournaments only where officially embeddable footage exists

## Phase 5 — 3D Upgrade
- three.js/WebGL upgrade to the Phase 2 lineup/pitch view for flagship `cinematic` matches (finals, iconic matches)
- Social sharing cards (shareable match/player visuals)
- Read-only historical view of the bracket UI you already have for the predictor, applied retroactively to past tournaments

## Phase 6 — 2030 Countdown
- Host country teaser content
- Countdown timer
- Positions KickCast to go live again as an active companion app when 2030 qualifying begins

---

## Phase 7+ — Stretch / Backlog (not scheduled)
Fun, but each is its own data model and would stall Phase 1 if pulled forward:
- Player connections network graph (teammate/club relationships)
- Stadium explorer (interactive globe)
- Dream XI builder (drag-and-drop squad builder)
- Daily quiz (guess the lineup/score/stadium)
- Market value data — skip entirely; licensing/scraping reliable valuation data isn't worth it for a museum use case

---

## Notes
- Trademark caution: avoid official FIFA/World Cup branding in any app store submission
- Public-facing posts (LinkedIn, blog) stay high-level builder narrative — no stack/service names
- YouTube embeds use the official embed player only, prefer official FIFA/broadcaster uploads

---

## Scope decisions (2026-07-18)
- Bracket + Vote tabs retire — become read-only "final picks" archive cards, no more live predict/vote.
- Fixtures/Teams tabs rebuilt as the archive-card browser (Phase 0/1 schema), eventually spanning all World Cups back to 1930.
- Nav needs a tournament selector — app moves from single-tournament to multi-era archive.
- WcXi tab untouched for now — folds into Phase 3 records/player pages later.
- **Home and Leaderboard kept intact for now** — no change yet.
- Supersedes earlier freeze-flag/`TOURNAMENT_ENDED` plan logged 2026-07-18 — this roadmap is the live plan.
