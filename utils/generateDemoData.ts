import type { AppState, DailyLog, Symptom, SymptomEntry } from "@/app/providers";
import { CONDITION_SYMPTOMS } from "@/utils/symptoms";

// ─── Seeded pseudo-random (LCG) ───────────────────────────────────────────────
// Deterministic per-day seed so the same condition always produces the same demo.

function makeRand(seed: number): () => number {
  let s = seed & 0x7fffffff;
  return () => {
    s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

// ─── Food triggers available for correlation ──────────────────────────────────

const FOOD_POOL = [
  "Dairy",
  "Gluten",
  "Eggs",
  "Red Meat",
  "Cruciferous Veg",
  "Nightshades",
];

// ─── Main generator ───────────────────────────────────────────────────────────

export function generateDemoData(condition: string): AppState {
  const conditionSymptoms =
    CONDITION_SYMPTOMS[condition] ?? CONDITION_SYMPTOMS["Migraine"];

  const symptoms: Symptom[] = conditionSymptoms.map((s, i) => ({
    id: `demo-${condition.replace(/\s+/g, "-").toLowerCase()}-${i}`,
    name: s.name,
    condition,
  }));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const logs: DailyLog[] = [];

  for (let dayOffset = 89; dayOffset >= 0; dayOffset--) {
    const date = new Date(today);
    date.setDate(date.getDate() - dayOffset);
    const dateStr = date.toISOString().split("T")[0];

    // Seed based on condition + date for fully deterministic output
    const dateSeed = date.getTime() / 86400000; // day number
    const condSeed = condition
      .split("")
      .reduce((a, c) => a + c.charCodeAt(0), 0);
    const rand = makeRand((dateSeed * 397 + condSeed * 13) & 0x7fffffff);

    // ── Context ──────────────────────────────────────────────────────────────
    // Use a sinusoidal base to bake natural weekly patterns into the data.
    const weekPhase = Math.sin((dayOffset / 7) * Math.PI);

    const sleepQuality = Math.max(
      1,
      Math.min(5, Math.round(3.0 - weekPhase * 0.8 + (rand() - 0.5) * 2))
    );
    const stressLevel = Math.max(
      1,
      Math.min(5, Math.round(2.5 + weekPhase * 0.6 + (rand() - 0.5) * 2))
    );
    const exercise = rand() > 0.52; // ~48% exercise days

    // Food triggers: more likely on high-stress / poor-sleep days
    const badDay = sleepQuality <= 2 || stressLevel >= 4;
    const foodTriggers: string[] = [];
    if (rand() > (badDay ? 0.4 : 0.72)) foodTriggers.push("Dairy");
    if (rand() > (badDay ? 0.55 : 0.8)) foodTriggers.push("Gluten");
    if (rand() > 0.87) foodTriggers.push(FOOD_POOL[2 + Math.floor(rand() * 4)]);

    // ── Severity base from context ────────────────────────────────────────────
    const contextSeverity =
      2.3 +
      (sleepQuality <= 2 ? 0.9 : sleepQuality <= 3 ? 0.4 : 0) +
      (stressLevel >= 4 ? 0.8 : stressLevel >= 3 ? 0.35 : 0) -
      (exercise ? 0.45 : 0) +
      (foodTriggers.includes("Dairy") ? 0.35 : 0) +
      (foodTriggers.includes("Gluten") ? 0.2 : 0);

    // ── Per-symptom entries ───────────────────────────────────────────────────
    const entries: SymptomEntry[] = symptoms.map((s, si) => {
      const rand2 = makeRand(
        (dateSeed * 199 + condSeed * 7 + si * 31) & 0x7fffffff
      );
      const noise = (rand2() - 0.5) * 2.2; // ±1.1 variation per symptom
      const value = Math.max(1, Math.min(5, Math.round(contextSeverity + noise)));
      return { symptomId: s.id, value };
    });

    // ── Occasional note ───────────────────────────────────────────────────────
    const NOTES = [
      "Rough day today.",
      "Feeling a bit better after resting.",
      "Weather change seemed to trigger symptoms.",
      "Took medication this morning.",
      "Stressful week of work.",
      "Slept better last night.",
      "Long day on my feet.",
    ];
    const note = rand() > 0.85 ? NOTES[Math.floor(rand() * NOTES.length)] : undefined;

    logs.push({
      date: dateStr,
      entries,
      context: { sleepQuality, stressLevel, exercise, foodTriggers },
      note,
      loggedAt: new Date(date.getTime() + 20 * 3600 * 1000).toISOString(), // ~8 PM each day
    });
  }

  const createdAt = new Date(today);
  createdAt.setDate(createdAt.getDate() - 89);

  return {
    version: 5,
    profile: {
      conditions: [condition],
      symptoms,
      createdAt: createdAt.toISOString(),
      supabaseLinked: false,
      awaitingAccountSetup: false,
      premium: {
        type: "monthly",
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      communityOptIn: true,
      aiUnlockedAt: new Date().toISOString(),
    },
    logs,
  };
}

export const DEMO_CONDITIONS = Object.keys(CONDITION_SYMPTOMS).sort();
