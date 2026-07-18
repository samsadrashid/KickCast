import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ESPN_URL = "https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard";

Deno.serve(async () => {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const res = await fetch(ESPN_URL);
  if (!res.ok) {
    return new Response(JSON.stringify({ error: `ESPN fetch failed: ${res.status}` }), { status: 502 });
  }
  const events = (await res.json()).events ?? [];

  let updated = 0;
  const errors: string[] = [];

  for (const event of events) {
    const comp = event.competitions?.[0];
    const status = comp?.status;
    const home = comp?.competitors?.find((c: any) => c.homeAway === "home");
    const away = comp?.competitors?.find((c: any) => c.homeAway === "away");
    if (!comp || !status || !home || !away) continue;

    const state = status.type.state; // 'pre' | 'in' | 'post'
    const clock = state === "in" ? (status.displayClock ?? "") : state === "post" ? "FT" : "0'";

    const { error } = await supabase
      .from("matches")
      .update({
        home_score: Number(home.score ?? 0),
        away_score: Number(away.score ?? 0),
        status_state: state,
        status_name: status.type.name,
        clock,
        updated_at: new Date().toISOString(),
      })
      .eq("id", String(event.id));

    if (error) errors.push(`${event.id}: ${error.message}`);
    else updated++;
  }

  return new Response(JSON.stringify({ updated, total: events.length, errors }), {
    headers: { "Content-Type": "application/json" },
  });
});
