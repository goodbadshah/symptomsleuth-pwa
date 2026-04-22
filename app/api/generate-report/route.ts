import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { DailyLog, Symptom } from "@/app/providers";

// ─── Types ────────────────────────────────────────────────────────────────────

interface DateRange {
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
}

interface RequestBody {
  dateRange: DateRange;
  symptoms: Symptom[];
  logs: DailyLog[];
  conditions: string[];
}

// ─── System prompt ────────────────────────────────────────────────────────────

const REPORT_SYSTEM_PROMPT = `You are a clinical document formatter. You receive patient-reported symptom tracking data and produce a structured clinical summary for the patient to share with their doctor.

RULES:
- This is patient-reported data only. State this clearly where relevant.
- Do not diagnose. Do not suggest medications or treatments.
- Use plain language. Numbers over generalities.
- Write for a doctor who has 30 seconds to scan the document.
- Format each section with a header line: # SECTION NAME (all caps, on its own line)
- Sections in this order:
  1. # PATIENT-REPORTED CONDITIONS
  2. # REPORTING PERIOD
  3. # SYMPTOM SUMMARY
  4. # CONTEXT FACTORS
  5. # NOTABLE PATTERNS
  6. # PATIENT NOTES (include only if notes exist; omit section entirely if not)
- Keep each section brief and factual.
- Severity scale used: 1=Mild, 2=Medium, 3=Severe, 4=Extreme (patient self-report, 1-4).
- If a section has no meaningful data, write one short line saying so.
- Write NO conclusion paragraph. End after the last section.`;

// ─── Data formatter ───────────────────────────────────────────────────────────

function formatDataForPrompt(body: RequestBody): string {
  const { dateRange, symptoms, logs, conditions } = body;

  const filtered = logs
    .filter((l) => l.date >= dateRange.start && l.date <= dateRange.end)
    .sort((a, b) => a.date.localeCompare(b.date));

  if (filtered.length === 0) {
    return `Conditions tracked: ${conditions.join(", ")}\nDate range: ${dateRange.start} to ${dateRange.end}\nNo logs found in this date range.`;
  }

  const symptomMap = new Map(symptoms.map((s) => [s.id, s]));

  // Per-symptom stats keyed by name
  const symptomStats: Record<
    string,
    { count: number; values: number[]; condition: string }
  > = {};

  const ctxStats = {
    sleepReadings: [] as number[],
    stressReadings: [] as number[],
    exerciseDays: 0,
    totalDays: filtered.length,
    foodTriggerCounts: {} as Record<string, number>,
    foodTriggerHighSevDays: {} as Record<string, number>,
  };

  for (const log of filtered) {
    for (const entry of log.entries) {
      const sym = symptomMap.get(entry.symptomId);
      const name = sym?.name ?? entry.symptomId;
      const condition = sym?.condition ?? "Unknown";

      if (!symptomStats[name]) {
        symptomStats[name] = { count: 0, values: [], condition };
      }
      if (entry.value > 0) {
        symptomStats[name].count++;
        symptomStats[name].values.push(entry.value);
      }
    }

    const ctx = log.context;
    if (ctx?.sleepQuality != null) ctxStats.sleepReadings.push(ctx.sleepQuality);
    if (ctx?.stressLevel != null) ctxStats.stressReadings.push(ctx.stressLevel);
    if (ctx?.exercise) ctxStats.exerciseDays++;

    if (ctx?.foodTriggers && ctx.foodTriggers.length > 0) {
      const hasHighSev = log.entries.some((e) => e.value >= 3);
      for (const trigger of ctx.foodTriggers) {
        ctxStats.foodTriggerCounts[trigger] =
          (ctxStats.foodTriggerCounts[trigger] ?? 0) + 1;
        if (hasHighSev) {
          ctxStats.foodTriggerHighSevDays[trigger] =
            (ctxStats.foodTriggerHighSevDays[trigger] ?? 0) + 1;
        }
      }
    }
  }

  const lines: string[] = [
    `Conditions tracked: ${conditions.join(", ")}`,
    `Date range: ${dateRange.start} to ${dateRange.end}`,
    `Days with logs: ${filtered.length}`,
    "",
    "SYMPTOM DATA:",
  ];

  for (const [name, stats] of Object.entries(symptomStats)) {
    if (stats.values.length === 0) continue;
    const avg = (
      stats.values.reduce((a, b) => a + b, 0) / stats.values.length
    ).toFixed(1);
    const min = Math.min(...stats.values);
    const max = Math.max(...stats.values);

    // Simple trend: compare last half vs first half by value mean
    let trend = "stable";
    const half = Math.floor(stats.values.length / 2);
    if (half >= 1) {
      const firstMean =
        stats.values.slice(0, half).reduce((a, b) => a + b, 0) / half;
      const lastMean =
        stats.values.slice(-half).reduce((a, b) => a + b, 0) / half;
      if (lastMean - firstMean > 0.3) trend = "worsening";
      else if (firstMean - lastMean > 0.3) trend = "improving";
    }

    lines.push(
      `- ${name} (${stats.condition}): ${stats.count}/${filtered.length} days logged, avg ${avg}/4, min ${min}, max ${max}, trend: ${trend}`
    );
  }

  lines.push("", "CONTEXT DATA:");
  if (ctxStats.sleepReadings.length > 0) {
    const avg = (
      ctxStats.sleepReadings.reduce((a, b) => a + b, 0) /
      ctxStats.sleepReadings.length
    ).toFixed(1);
    lines.push(
      `- Sleep quality: avg ${avg}/4 (${ctxStats.sleepReadings.length} of ${filtered.length} days logged)`
    );
  } else {
    lines.push("- Sleep quality: not logged");
  }

  if (ctxStats.stressReadings.length > 0) {
    const avg = (
      ctxStats.stressReadings.reduce((a, b) => a + b, 0) /
      ctxStats.stressReadings.length
    ).toFixed(1);
    lines.push(
      `- Stress level: avg ${avg}/4 (${ctxStats.stressReadings.length} of ${filtered.length} days logged)`
    );
  } else {
    lines.push("- Stress level: not logged");
  }

  lines.push(
    `- Exercise: ${ctxStats.exerciseDays} of ${filtered.length} days logged`
  );

  const triggerEntries = Object.entries(ctxStats.foodTriggerCounts).sort(
    (a, b) => b[1] - a[1]
  );
  if (triggerEntries.length > 0) {
    lines.push("- Food triggers:");
    for (const [trigger, count] of triggerEntries) {
      const highSev = ctxStats.foodTriggerHighSevDays[trigger] ?? 0;
      lines.push(
        `  - ${trigger}: ${count} days logged, ${highSev}/${count} were high-severity days`
      );
    }
  } else {
    lines.push("- Food triggers: not logged");
  }

  // Notes - cap at 10 to avoid token overflow
  const notes = filtered
    .filter((l) => l.note?.trim())
    .slice(0, 10)
    .map((l) => `${l.date}: ${l.note!.trim()}`);

  if (notes.length > 0) {
    lines.push("", "PATIENT NOTES:");
    lines.push(...notes);
  }

  return lines.join("\n");
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<Response> {
  let body: RequestBody;
  try {
    body = (await request.json()) as RequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (
    !body.dateRange?.start ||
    !body.dateRange?.end ||
    !Array.isArray(body.logs) ||
    !Array.isArray(body.conditions)
  ) {
    return NextResponse.json(
      { error: "Missing required fields: dateRange, logs, conditions" },
      { status: 400 }
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  }

  const dataText = formatDataForPrompt(body);
  const client = new Anthropic({ apiKey });

  try {
    const message = await client.messages.create({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1500,
      system: REPORT_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `Generate a doctor report from this patient-reported data:\n\n${dataText}`,
        },
      ],
    });

    const reportText = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("\n");

    return NextResponse.json({ report: reportText });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Report generation failed: ${msg}` },
      { status: 500 }
    );
  }
}
