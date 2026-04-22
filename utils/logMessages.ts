export interface LogMessage {
  heading: string; // Fraunces - short, punchy
  body: string;    // DM Sans - 1-2 sentences max
}

// 40 messages across three categories:
//   Encouraging (15) - validates effort without being saccharine
//   Tips (15)        - teaches users how to extract value from the app
//   Insight (10)     - data philosophy and long-game framing

export const LOG_MESSAGES: readonly LogMessage[] = [
  // ── Encouraging ────────────────────────────────────────────────────────────

  {
    heading: "Logged.",
    body: "Tracking on a hard day counts twice.",
  },
  {
    heading: "Saved.",
    body: "Your data is building. Every entry sharpens the picture.",
  },
  {
    heading: "Recorded.",
    body: "Most people stop before patterns emerge. You haven't.",
  },
  {
    heading: "Noted.",
    body: "The hardest part of any habit is showing up when you feel worst. You did.",
  },
  {
    heading: "Done.",
    body: "You're building a medical record no appointment form can replicate.",
  },
  {
    heading: "Added.",
    body: "Three weeks of consistent logs is worth more than years of trying to remember.",
  },
  {
    heading: "Good.",
    body: "Chronic illness is hard to explain to a doctor. Your data will do it for you.",
  },
  {
    heading: "Logged.",
    body: "Every data point makes your next doctor conversation a little more useful.",
  },
  {
    heading: "Saved.",
    body: "Small habit. Large payoff.",
  },
  {
    heading: "Recorded.",
    body: "Your body is telling a story. You're learning to read it.",
  },
  {
    heading: "Noted.",
    body: "A symptom record your doctor will actually have time to read. That's what this is becoming.",
  },
  {
    heading: "Logged.",
    body: "Consistency is what turns raw data into patterns.",
  },
  {
    heading: "Saved.",
    body: "Some days this is the hardest thing you'll do. Those days matter most.",
  },
  {
    heading: "Recorded.",
    body: "You're one of the rare few who actually tracks. That changes your relationship with your condition.",
  },
  {
    heading: "Done.",
    body: "This kind of data separates guesswork from real treatment decisions.",
  },

  // ── Tips ───────────────────────────────────────────────────────────────────

  {
    heading: "7-day tip.",
    body: "Head to the Timeline tab after your seventh log. One week of data is enough to start spotting patterns.",
  },
  {
    heading: "14-day tip.",
    body: "Check the Timeline for correlations between your sleep quality and your worst symptom days.",
  },
  {
    heading: "30-day tip.",
    body: "After a month, Timeline shows trend direction - whether things are improving, stable, or worsening.",
  },
  {
    heading: "Log triggers.",
    body: "Even occasional food trigger entries build correlation signal over time. Tap the food section on high-severity days.",
  },
  {
    heading: "Before your appointment.",
    body: "Open the Report tab, set the range to 30 days, and generate a summary. Screenshot it for your doctor.",
  },
  {
    heading: "Sleep matters.",
    body: "Sleep quality is the single strongest predictor in most symptom datasets. Log it consistently if you can.",
  },
  {
    heading: "Context is signal.",
    body: "Stress and sleep together explain more symptom variance than almost any other factor. Both are worth logging.",
  },
  {
    heading: "Community tab.",
    body: "After a week of logs, the Insights tab shows how your patterns compare to others with the same condition.",
  },
  {
    heading: "Log bad days.",
    body: "Severe days are the most valuable data points for identifying triggers. Even a quick entry helps.",
  },
  {
    heading: "Severity guide.",
    body: "5 is emergency-level, 1 is barely noticeable. Anchor against those extremes when you log - it keeps your scale consistent.",
  },
  {
    heading: "Take a note.",
    body: "Even one line in the Notes section on a notable day gives your doctor context months later.",
  },
  {
    heading: "Focus your log.",
    body: "If you're not actively tracking a symptom, turn it off in Settings. A shorter focused log beats an incomplete long one.",
  },
  {
    heading: "Report tip.",
    body: "Your generated reports include trend direction, average severity, and correlations - formatted for a clinical read, not a wall of text.",
  },
  {
    heading: "Patterns take time.",
    body: "Most trigger patterns take 3–4 weeks of consistent logging to become statistically visible. You're building toward that.",
  },
  {
    heading: "During a flare.",
    body: "Log daily during flares. Start date, severity arc, and recovery timeline are data no one can recall accurately from memory.",
  },

  // ── Insight ────────────────────────────────────────────────────────────────

  {
    heading: "Your data.",
    body: "It stays on your device. No company, no researcher, no server can read it - only you and who you share it with.",
  },
  {
    heading: "Community data.",
    body: "Your anonymous logs - no identity, no dates - help surface patterns for others with the same condition.",
  },
  {
    heading: "After 14 days.",
    body: "Your generated report will include trend direction and correlation analysis. That's when it gets useful to a doctor.",
  },
  {
    heading: "Consistency wins.",
    body: "A slightly imprecise log every day beats a perfect log once a week. Speed over perfection.",
  },
  {
    heading: "Check the Timeline.",
    body: "Head to Timeline after your seventh log. One week reveals what a single day never could.",
  },
  {
    heading: "Reports work.",
    body: "Patients who bring symptom logs to appointments report shorter diagnostic timelines and better medication adjustments.",
  },
  {
    heading: "Severity is personal.",
    body: "Your 4 isn't someone else's 4. The value is in your own trends over time, not the absolute number.",
  },
  {
    heading: "What your doctor sees.",
    body: "Not 'I've been bad lately' - but 'severity averaged 3.8 last week, up from 2.1.' That's a different conversation.",
  },
  {
    heading: "Your history.",
    body: "A 90-day symptom log is a clinical artifact. The longer you track, the more valuable it becomes.",
  },
  {
    heading: "Patterns compound.",
    body: "The first week of data is a sketch. The first month is a map. Keep going.",
  },
] as const;

export function pickRandomMessage(): LogMessage {
  return LOG_MESSAGES[Math.floor(Math.random() * LOG_MESSAGES.length)];
}
