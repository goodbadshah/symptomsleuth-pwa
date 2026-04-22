import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// ──────────────────────────────────────────────────────────────────────────────
// GET /api/community/aggregates?condition=Migraine
//
// Returns the pre-computed ConditionAggregate for a condition, or null.
// Cached for 1 hour - the underlying data only updates nightly.
// ──────────────────────────────────────────────────────────────────────────────

export async function GET(request: NextRequest): Promise<NextResponse> {
  const condition = request.nextUrl.searchParams.get("condition");

  if (!condition || typeof condition !== "string" || condition.trim().length === 0) {
    return NextResponse.json(
      { error: "condition query param required" },
      { status: 400 }
    );
  }

  // Guard against oversized inputs
  if (condition.length > 200) {
    return NextResponse.json({ error: "condition too long" }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(null, { status: 200 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data, error } = await supabase
    .from("condition_aggregates")
    .select("*")
    .eq("condition", condition.trim())
    .single();

  if (error || !data) {
    // No aggregate yet for this condition - not an error
    return NextResponse.json(null, {
      status: 200,
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  }

  // Map snake_case DB columns back to camelCase for the client
  const aggregate = {
    condition:        data.condition,
    totalActiveUsers: data.total_active_users,
    symptoms:         data.symptoms,
    correlations:     data.correlations,
    updatedAt:        data.updated_at,
  };

  return NextResponse.json(aggregate, {
    headers: {
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
