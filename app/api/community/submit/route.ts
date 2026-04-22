import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import type { AnonymousLogEntry } from "@/utils/anonymize";

// ──────────────────────────────────────────────────────────────────────────────
// Allowlists for shape validation - no extra fields, no PII.
// ──────────────────────────────────────────────────────────────────────────────

const ALLOWED_ENTRY_KEYS = new Set([
  "condition",
  "symptomName",
  "value",
  "weekOf",
  "context",
]);

const ALLOWED_CONTEXT_KEYS = new Set([
  "sleepQuality",
  "stressLevel",
  "exercise",
  "foodTriggers",
]);

const WEEK_RE = /^\d{4}-W(?:0[1-9]|[1-4]\d|5[0-3])$/;

// ──────────────────────────────────────────────────────────────────────────────
// POST /api/community/submit
// Body: AnonymousLogEntry[]
// ──────────────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  let entries: unknown;

  try {
    entries = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // Must be a non-empty array
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ ok: true }); // no-op, not an error
  }

  // Guard against payload bombs
  if (entries.length > 100) {
    return NextResponse.json({ error: "Too many entries" }, { status: 400 });
  }

  // ── Validate each entry ──────────────────────────────────────────────────

  for (const entry of entries) {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) {
      return NextResponse.json({ error: "Invalid entry shape" }, { status: 400 });
    }

    const e = entry as Record<string, unknown>;

    // No extra fields (PII guard)
    for (const key of Object.keys(e)) {
      if (!ALLOWED_ENTRY_KEYS.has(key)) {
        return NextResponse.json(
          { error: `Disallowed field: ${key}` },
          { status: 400 }
        );
      }
    }

    // condition - required string, max 200 chars
    if (typeof e.condition !== "string" || e.condition.trim().length === 0 || e.condition.length > 200) {
      return NextResponse.json({ error: "Invalid condition" }, { status: 400 });
    }

    // symptomName - required string, max 200 chars
    if (typeof e.symptomName !== "string" || e.symptomName.trim().length === 0 || e.symptomName.length > 200) {
      return NextResponse.json({ error: "Invalid symptomName" }, { status: 400 });
    }

    // value - integer 1–5
    if (
      typeof e.value !== "number" ||
      !Number.isInteger(e.value) ||
      e.value < 1 ||
      e.value > 5
    ) {
      return NextResponse.json({ error: "Invalid value" }, { status: 400 });
    }

    // weekOf - YYYY-Wnn format only (never a specific date)
    if (typeof e.weekOf !== "string" || !WEEK_RE.test(e.weekOf)) {
      return NextResponse.json({ error: "Invalid weekOf" }, { status: 400 });
    }

    // context - optional, validate if present
    if (e.context !== undefined) {
      if (typeof e.context !== "object" || e.context === null || Array.isArray(e.context)) {
        return NextResponse.json({ error: "Invalid context" }, { status: 400 });
      }

      const ctx = e.context as Record<string, unknown>;

      // No extra context fields
      for (const key of Object.keys(ctx)) {
        if (!ALLOWED_CONTEXT_KEYS.has(key)) {
          return NextResponse.json(
            { error: `Disallowed context field: ${key}` },
            { status: 400 }
          );
        }
      }

      // sleepQuality - integer 1–5 if present
      if (ctx.sleepQuality !== undefined) {
        if (
          typeof ctx.sleepQuality !== "number" ||
          !Number.isInteger(ctx.sleepQuality) ||
          ctx.sleepQuality < 1 ||
          ctx.sleepQuality > 5
        ) {
          return NextResponse.json({ error: "Invalid sleepQuality" }, { status: 400 });
        }
      }

      // stressLevel - integer 1–5 if present
      if (ctx.stressLevel !== undefined) {
        if (
          typeof ctx.stressLevel !== "number" ||
          !Number.isInteger(ctx.stressLevel) ||
          ctx.stressLevel < 1 ||
          ctx.stressLevel > 5
        ) {
          return NextResponse.json({ error: "Invalid stressLevel" }, { status: 400 });
        }
      }

      // exercise - boolean if present
      if (ctx.exercise !== undefined && typeof ctx.exercise !== "boolean") {
        return NextResponse.json({ error: "Invalid exercise" }, { status: 400 });
      }

      // foodTriggers - string[] if present, max 20 items, each max 100 chars
      if (ctx.foodTriggers !== undefined) {
        if (
          !Array.isArray(ctx.foodTriggers) ||
          ctx.foodTriggers.length > 20 ||
          ctx.foodTriggers.some((t) => typeof t !== "string" || t.length > 100)
        ) {
          return NextResponse.json({ error: "Invalid foodTriggers" }, { status: 400 });
        }
      }
    }
  }

  // ── Insert via service role key ──────────────────────────────────────────

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  // Prefer service role key; fall back to anon key if not configured
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Degrade gracefully - community data is never blocking
    return NextResponse.json({ ok: true });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // Map camelCase AnonymousLogEntry to snake_case DB columns
  const rows = (entries as AnonymousLogEntry[]).map((e) => ({
    condition:     e.condition.trim(),
    symptom_name:  e.symptomName.trim(),
    value:         e.value,
    week_of:       e.weekOf,
    sleep_quality: e.context?.sleepQuality ?? null,
    stress_level:  e.context?.stressLevel  ?? null,
    exercise:      e.context?.exercise     ?? null,
    food_triggers: e.context?.foodTriggers ?? null,
  }));

  try {
    const { error } = await supabase.from("anonymous_logs").insert(rows);
    if (error) {
      // Log server-side but don't surface to client
      console.error("anonymous_logs insert error:", error.message);
    }
  } catch {
    // Degrade gracefully - never block the user
  }

  return NextResponse.json({ ok: true });
}
