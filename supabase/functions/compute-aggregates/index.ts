// supabase/functions/compute-aggregates/index.ts
//
// Supabase Edge Function - triggered nightly via cron or HTTP call.
// Delegates the heavy computation to the compute_condition_aggregates()
// SQL function defined in the migration.
//
// Deploy:
//   supabase functions deploy compute-aggregates
//
// Invoke (via pg_cron or manual HTTP):
//   curl -X POST https://<project>.supabase.co/functions/v1/compute-aggregates \
//     -H "Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>"

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  // Authorization: require the service role key so this cannot be triggered
  // by arbitrary external callers.
  const authHeader = req.headers.get("Authorization") ?? "";
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!serviceRoleKey || authHeader !== `Bearer ${serviceRoleKey}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  if (!supabaseUrl) {
    return new Response(JSON.stringify({ error: "Missing SUPABASE_URL" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Call the SQL function which does all heavy lifting inside Postgres
  const { error } = await supabase.rpc("compute_condition_aggregates");

  if (error) {
    console.error("compute_condition_aggregates error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  console.log("Condition aggregates computed successfully at", new Date().toISOString());

  return new Response(JSON.stringify({ ok: true, computedAt: new Date().toISOString() }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
