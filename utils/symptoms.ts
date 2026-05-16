import type { Symptom } from "@/app/providers";
import { v4 as uuidv4 } from "uuid";

// All symptoms now use 1-5 severity. Toggle type has been removed.
export interface SuggestedSymptom {
  name: string;
}

export const CONDITION_SYMPTOMS: Record<string, SuggestedSymptom[]> = {
  Migraine: [
    { name: "Headache intensity" },
    { name: "Nausea" },
    { name: "Light sensitivity" },
    { name: "Sound sensitivity" },
    { name: "Aura" },
    { name: "Neck stiffness" },
    { name: "Brain fog" },
  ],
  IBS: [
    { name: "Abdominal pain" },
    { name: "Bloating" },
    { name: "Diarrhea" },
    { name: "Constipation" },
    { name: "Urgency" },
    { name: "Nausea" },
    { name: "Cramping" },
  ],
  Fibromyalgia: [
    { name: "Widespread pain" },
    { name: "Fatigue" },
    { name: "Brain fog" },
    { name: "Sleep quality" },
    { name: "Tenderness" },
    { name: "Morning stiffness" },
    { name: "Headache" },
  ],
  "Chronic Pain": [
    { name: "Pain intensity" },
    { name: "Mobility" },
    { name: "Fatigue" },
    { name: "Sleep quality" },
    { name: "Mood impact" },
    { name: "Pain location flare" },
  ],
  Anxiety: [
    { name: "Anxiety level" },
    { name: "Racing thoughts" },
    { name: "Physical tension" },
    { name: "Sleep disruption" },
    { name: "Panic attack" },
    { name: "Avoidance behaviour" },
  ],
  Autoimmune: [
    { name: "Fatigue" },
    { name: "Joint pain" },
    { name: "Inflammation / swelling" },
    { name: "Brain fog" },
    { name: "Rash or skin flare" },
    { name: "Fever" },
    { name: "Muscle weakness" },
  ],
  PCOS: [
    { name: "Pelvic pain" },
    { name: "Bloating" },
    { name: "Fatigue" },
    { name: "Mood changes" },
    { name: "Acne flare" },
    { name: "Hair loss" },
    { name: "Cycle irregularity" },
  ],
  Endometriosis: [
    { name: "Pelvic pain" },
    { name: "Cramping" },
    { name: "Bloating" },
    { name: "Fatigue" },
    { name: "Pain during activity" },
    { name: "Nausea" },
    { name: "Lower back pain" },
    { name: "Heavy bleeding" },
  ],
  Hypertension: [
    { name: "Headache" },
    { name: "Dizziness" },
    { name: "Shortness of breath" },
    { name: "Chest tightness" },
    { name: "Fatigue" },
    { name: "Blurred vision" },
    { name: "Pounding in chest/neck" },
  ],
  Obesity: [
    { name: "Fatigue" },
    { name: "Joint pain" },
    { name: "Breathlessness" },
    { name: "Sleep disruption" },
    { name: "Mobility difficulty" },
    { name: "Mood impact" },
    { name: "Heartburn" },
  ],
  "Periodontal Disease": [
    { name: "Gum pain" },
    { name: "Bleeding gums" },
    { name: "Tooth sensitivity" },
    { name: "Gum swelling" },
    { name: "Bad breath" },
    { name: "Jaw discomfort" },
    { name: "Loose teeth" },
  ],
  Depression: [
    { name: "Low mood" },
    { name: "Fatigue" },
    { name: "Sleep disruption" },
    { name: "Motivation" },
    { name: "Appetite changes" },
    { name: "Concentration" },
    { name: "Hopelessness" },
  ],
  Arthritis: [
    { name: "Joint pain" },
    { name: "Morning stiffness" },
    { name: "Joint swelling" },
    { name: "Range of motion" },
    { name: "Fatigue" },
    { name: "Warmth / redness" },
    { name: "Grip strength" },
  ],
  "Type 2 Diabetes": [
    { name: "Fatigue" },
    { name: "Thirst" },
    { name: "Frequent urination" },
    { name: "Blurred vision" },
    { name: "Tingling / numbness" },
    { name: "Brain fog" },
    { name: "Wound healing" },
  ],
  COPD: [
    { name: "Breathlessness" },
    { name: "Cough intensity" },
    { name: "Mucus production" },
    { name: "Wheeze" },
    { name: "Chest tightness" },
    { name: "Fatigue" },
    { name: "Exercise tolerance" },
  ],
  Asthma: [
    { name: "Breathlessness" },
    { name: "Wheeze" },
    { name: "Cough" },
    { name: "Chest tightness" },
    { name: "Night symptoms" },
    { name: "Rescue inhaler use" },
    { name: "Exercise triggered symptoms" },
  ],
  "Heart Disease": [
    { name: "Chest pain / pressure" },
    { name: "Shortness of breath" },
    { name: "Fatigue" },
    { name: "Palpitations" },
    { name: "Dizziness" },
    { name: "Leg swelling" },
    { name: "Exercise intolerance" },
  ],
  "Chronic Kidney Disease": [
    { name: "Fatigue" },
    { name: "Ankle / foot swelling" },
    { name: "Nausea" },
    { name: "Reduced urine output" },
    { name: "Itching" },
    { name: "Brain fog" },
    { name: "Shortness of breath" },
  ],
  Cancer: [
    { name: "Fatigue" },
    { name: "Pain" },
    { name: "Nausea" },
    { name: "Appetite loss" },
    { name: "Sleep disruption" },
    { name: "Mood impact" },
    { name: "Treatment side effects" },
  ],
  "Dementia & Alzheimer's": [
    { name: "Memory lapses" },
    { name: "Confusion" },
    { name: "Disorientation" },
    { name: "Mood changes" },
    { name: "Sleep disruption" },
    { name: "Speech difficulty" },
    { name: "Daily task difficulty" },
  ],
  Stroke: [
    { name: "Weakness / paralysis" },
    { name: "Speech difficulty" },
    { name: "Fatigue" },
    { name: "Balance issues" },
    { name: "Headache" },
    { name: "Vision changes" },
    { name: "Cognitive difficulty" },
  ],
  Osteoporosis: [
    { name: "Back pain" },
    { name: "Bone pain" },
    { name: "Posture changes" },
    { name: "Balance issues" },
    { name: "Fatigue" },
    { name: "Height loss" },
    { name: "Fracture risk (fallen)" },
  ],
  "Atrial Fibrillation": [
    { name: "Palpitations" },
    { name: "Breathlessness" },
    { name: "Fatigue" },
    { name: "Dizziness" },
    { name: "Chest discomfort" },
    { name: "Exercise intolerance" },
    { name: "Anxiety" },
  ],
  "Liver Disease": [
    { name: "Fatigue" },
    { name: "Abdominal discomfort" },
    { name: "Nausea" },
    { name: "Jaundice" },
    { name: "Itching" },
    { name: "Abdominal swelling" },
    { name: "Dark urine" },
  ],
  "Thyroid Disease": [
    { name: "Fatigue" },
    { name: "Weight changes" },
    { name: "Cold / heat sensitivity" },
    { name: "Brain fog" },
    { name: "Mood changes" },
    { name: "Hair loss" },
    { name: "Heart rate irregularity" },
  ],
  IBD: [
    { name: "Abdominal pain" },
    { name: "Diarrhea" },
    { name: "Urgency" },
    { name: "Rectal bleeding" },
    { name: "Fatigue" },
    { name: "Nausea" },
    { name: "Appetite loss" },
  ],
  POTS: [
    { name: "Lightheadedness" },
    { name: "Palpitations" },
    { name: "Fatigue" },
    { name: "Brain fog" },
    { name: "Fainting / Syncope" },
    { name: "Blood pooling" },
    { name: "Shortness of breath" },
  ],
  "Long COVID": [
    { name: "Fatigue" },
    { name: "Brain fog" },
    { name: "Post-exertional malaise" },
    { name: "Breathlessness" },
    { name: "Loss of taste / smell" },
    { name: "Chest pain" },
    { name: "Joint pain" },
  ],
  MCAS: [
    { name: "Skin flushing / hives" },
    { name: "GI upset" },
    { name: "Fatigue" },
    { name: "Brain fog" },
    { name: "Palpitations" },
    { name: "Shortness of breath" },
    { name: "Anaphylaxis-like symptoms" },
  ],
  "Chronic Lyme Disease": [
    { name: "Joint pain" },
    { name: "Fatigue" },
    { name: "Brain fog" },
    { name: "Muscle aches" },
    { name: "Nerve pain" },
    { name: "Sleep disruption" },
    { name: "Headaches" },
  ],
  Other: [
    { name: "Main symptom" },
    { name: "Fatigue" },
    { name: "Pain" },
  ],
};

export const ALL_CONDITIONS = Object.keys(CONDITION_SYMPTOMS).filter(
  (c) => c !== "Other"
);

/**
 * Returns deduplicated Symptom objects for the given conditions.
 * Symptoms shared across conditions (e.g. "Fatigue") are included once,
 * attributed to the first condition that lists them.
 */
export function buildSuggestedSymptoms(conditions: string[]): Symptom[] {
  const seen = new Set<string>();
  const result: Symptom[] = [];

  for (const condition of conditions) {
    const suggestions = CONDITION_SYMPTOMS[condition] ?? [];
    for (const s of suggestions) {
      const key = s.name.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push({
          id: uuidv4(),
          name: s.name,
          condition,
        });
      }
    }
  }

  return result;
}
