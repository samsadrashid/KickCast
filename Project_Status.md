# Kickcast

## Status

```yaml
tier: MewKing
current_phase: museum-phase6-2030-countdown
stack: react-vite-supabase
plan_approved: true
open_threads:
  - "Historical match/squad data source not yet chosen — blocks: Phase 2 lineup pitch view, Phase 3 player/team pages+records+Trophy Journey+Where Are They Now, Phase 5 3D pitch upgrade + retroactive historical bracket. Wikidata's match-level coverage is patchy pre-1990s; needs a real sourcing decision before any of these can ship honestly."
  - "16/48 2026 teams have no player squad data in TEAM_DATA (Bosnia-Herzegovina, Cape Verde, Congo DR, Curaçao, Czechia, Ghana, Haiti, Ivory Coast, Jordan, Norway, Qatar, Scotland, South Africa, Sweden, Tunisia, Türkiye) — left empty, not fabricated."
  - "No curated YouTube video IDs exist for any goal — Phase 4 fallback is a search link, not real embeds. Needs manual curation per roadmap's own no-auto-search rule."
gate_block_count: 0
```

## Notes

Stack: React + Vite + Supabase (see package.json). Museum roadmap plan at `proposals/active/museum/plan.md`, approved 2026-07-18.

Session 2026-07-18 ran Phases 0–6 of the roadmap end to end:
- **Phase 0**: schema (tournaments/teams/players/lineups/goals + fidelity_tier), seeded 48 teams/832 players/23 tournaments (2026 + 22 historical via Wikidata).
- **Phase 1**: Museum tab (tournament archive-card browser), `tournament_id` scoping fixed on live queries.
- **Phase 2**: goal timeline scrubber (real per-match data) — lineup pitch view blocked, no real lineup data.
- **Phase 3**: tournament winner badges (22/22, Wikidata-sourced) — everything else blocked, no historical match/squad data.
- **Phase 4**: normalized `goals` table seeded (294 rows), Match Story Mode narrative, YouTube search fallback (no real embeds — none curated).
- **Phase 5**: match-result share cards (html2canvas) — 3D pitch and retroactive bracket blocked, same data gaps as Phase 2/3.
- **Phase 6**: 2030 countdown card, real Wikidata-sourced hosts/dates, live-ticking.

All DB changes applied directly to live Supabase project `koxmyiquyoxalpkefcsf` via migrations (additive only, live 2026 app verified unaffected throughout). All frontend changes to `App.jsx` verified in-browser via Playwright before being called done.

Next session: either pick a real historical data source to unblock the three open threads above, or continue elsewhere. Dev server was left running on localhost:5173 this session (not necessarily still running next session).
