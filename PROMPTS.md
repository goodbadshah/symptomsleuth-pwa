# SymptomSleuth - Build Prompt Sequence

Use these prompts sequentially in Claude Code. Each prompt builds on the previous. Wait for each to complete and verify before moving to the next.

-----

## PROMPT 1: Project Scaffold & PWA Setup

```
First, install the frontend-design skill: `npx skills add https://github.com/anthropics/skills --skill frontend-design`. Read the SKILL.md file before proceeding.

Initialize a new Next.js 14+ project with App Router and TypeScript called "symptomsleuth". Use `npx create-next-app@latest` with Tailwind CSS enabled. Then install and configure:
- next-pwa (or @ducanh2912/next-pwa) with Workbox for service worker and offline support
- manifest.json in /public with: name "SymptomSleuth", short_name "SymptomSleuth", theme_color "#2D6A4F", background_color "#FAFAF8", display "standalone", start_url "/"
- Create placeholder PWA icons (192x192 and 512x512) as simple SVGs with the letter "S" in the brand green, saved in /public/icons
- Add Google Fonts via next/font/google: Fraunces (variable) and DM Sans (400, 500, 600). Apply them in app/layout.tsx.
- Set up globals.css with the CSS custom properties from CLAUDE.md (all color tokens, including --community)
- Create the app route structure from CLAUDE.md: app/page.tsx (landing), app/(app)/layout.tsx (app shell with global AppHeader at top + bottom nav), app/(app)/log/page.tsx, app/(app)/timeline/page.tsx, app/(app)/insights/page.tsx, app/(app)/report/page.tsx
- The (app) layout is a client component. At the top, render the AppHeader component (72px, `--accent` background, wordmark left, StreakBadge right). At the bottom, the four-tab bottom nav (Log, Timeline, Insights, Report). Between them, the page content area with the paper-ground noise overlay applied via the PaperGround component on the shell root. Nav uses simple SVG icons. Follow the design anti-patterns in CLAUDE.md.
- Build components/brand/Wordmark.tsx as a thin wrapper around the existing `/public/brand/wordmark.svg` asset - do NOT attempt to recreate or redraw the logo; the existing SVG is authored and shipped as-is. The wrapper just imports and sizes the image (height 48px, auto width) with an appropriate alt text. If `/public/brand/wordmark.svg` does not yet exist, create a placeholder file with a single `<svg>` comment "<!-- PLACEHOLDER: replace with authored wordmark.svg from brand assets -->" and log a warning - do NOT invent a replacement logo.
- Create utils/severityGlyphs.tsx with the five Severity Glyph SVG components (GlyphNone, GlyphMild, GlyphModerateLow, GlyphModerate, GlyphSevere, GlyphExtreme) plus the SeverityGlyph dispatcher. The authored glyph code is provided in a separate file in the repo - copy it verbatim and do NOT substitute Phosphor Icons, emoji, or faces. These glyphs are used everywhere severity is visually indicated in the app.
- Create components/ui/PaperGround.tsx - a fixed full-screen element applied once in the app shell root. It renders an inline SVG `<feTurbulence>` noise pattern tiled across the viewport at `--paper-noise-opacity` (0.03), warm-tinted, with `pointer-events: none` so it never intercepts taps. This is the paper ground.
- Set up React Context + useReducer in a providers.tsx client component for global app state matching the data model in CLAUDE.md version 4 (including communityOptIn, DailyContext, aiUnlockedAt, aiUsage)
- Create the localStorage persistence layer in utils/storage.ts with read/write/migrate helpers wrapped in try/catch. Include a schema version check - if the stored version is older than 4, run migration logic: v2→v3 adds userId; v3→v4 adds aiUnlockedAt (undefined) and aiUsage (empty messages array).
- Install @supabase/supabase-js and configure Supabase Auth in utils/supabaseClient.ts with a singleton client (createClient from @supabase/supabase-js). This same client is used for Auth, community data, and sync. Export it as `supabase` (null-safe when env vars are missing).
- Create utils/community.ts with placeholder functions for submitAnonymousLog() and fetchConditionAggregates().
- Create app/auth/callback/route.ts - the OAuth redirect handler. After Google/Facebook OAuth, Supabase redirects here. The route should: call `supabase.auth.exchangeCodeForSession(code)`, then redirect to `/onboarding` if the user has no profile in localStorage, or `/log` if they do.
- Update providers.tsx AppState to version 4 with `userId?: string`, `aiUnlockedAt?: string`, and `aiUsage?: AIUsage` added to profile. Add `SET_USER_ID`, `SET_AI_UNLOCKED_AT`, and `RECORD_AI_MESSAGE` actions. Update storage migration: v2→v3 adds userId; v3→v4 adds the AI fields.
- Create a .env.example file (committed to git) listing all required environment variables:

```
ANTHROPIC_API_KEY=sk-ant-your-key-here
STRIPE_SECRET_KEY=sk_test_your-key-here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key-here
STRIPE_ANNUAL_PRICE_ID=price_your-annual-price-id-here
STRIPE_MONTHLY_PRICE_ID=price_your-monthly-price-id-here
STRIPE_LIFETIME_PRICE_ID=price_your-lifetime-price-id-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SYNC_SERVER_PEPPER=your-random-32-byte-hex-string-here
```

- Verify that .env.local is in .gitignore (Next.js includes this by default, but confirm)
- Verify: app runs with `npm run dev`, bottom nav renders with 4 tabs, fonts load, PWA manifest is served at /manifest.json
```

-----

## PROMPT 2: Onboarding Flow

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code.

Build the onboarding flow with five screens. There is NO auth screen - authentication happens post-onboarding. Refer to CLAUDE.md for the full spec.

Screen 1 - Condition Select:
- Grid of tappable condition cards: Migraine, IBS, Fibromyalgia, Chronic Pain, Anxiety, Autoimmune, PCOS, Endometriosis, Hypertension, Obesity, Periodontal Disease, Depression, Arthritis, Type 2 Diabetes, COPD, Asthma, Heart Disease, Chronic Kidney Disease, Cancer, Dementia & Alzheimer's, Stroke, Osteoporosis, Atrial Fibrillation, Liver Disease, Thyroid Disease, IBD, "Other" (with text input). Multi-select with visual active state.
- Cards should NOT be rounded-pill shapes with shadows. Use a clean grid with subtle border states: unselected = light border, selected = sage green border with a faint green wash. Typography-forward - the condition name does the work, not an icon.
- "Continue" button at bottom, enabled when at least one selected.

Screen 2 - Symptom Setup:
- Based on selected conditions, show a pre-populated list of suggested symptoms from utils/symptoms.ts.
- User can toggle suggestions on/off and add custom symptoms via an "Add symptom" input at the bottom.
- Each symptom row: symptom name + on/off toggle. No type selector - all symptoms are 1–5 severity.
- Keep it clean and list-like - not a card per symptom. Think settings screen.

Screen 3 - Community Opt-In:
- Heading in Fraunces: "Help others with [Condition]"
- Clear explanation: what IS shared (condition, symptom name, severity by week, sleep/stress/exercise/food trigger context) and what is NEVER shared (identity, notes, specific dates, menstrual data).
- Toggle: "Contribute anonymous data" - ON by default.
- Warm, honest tone - not legalese.
- "Continue" button.

Screen 4 - Plan Picker:
- Heading in Fraunces (weight 400): "You’re ready."
- Subheading in DM Sans secondary: "Choose a plan. No charge for 7 days."
- Two plan option cards, vertically stacked, tappable. Annual shown first (selected by default):
  - Annual: "$39.99/year" with "14-day free trial" pill tag (accent-light background, accent text). Subtext: "$3.33/month, billed annually."
  - Monthly: "$9.99/month"
- Selected card: sage green border + faint green wash (same as condition card selected state). Unselected: --border color.
- Brief features list (4 items, same as before): Full symptom history, Community insights, Doctor-ready reports, Track multiple conditions.
- "Continue" CTA → advances to Screen 5 with chosen plan.
- Small text below CTA: "No charge today. Cancel anytime before your trial ends."

Screen 5 - Card Collection:
- Requires @stripe/stripe-js and @stripe/react-stripe-js. Install if not present.
- Heading in Fraunces (weight 400): "Secure your spot."
- Subheading in DM Sans secondary: "No charge until [Date 7 days from now]. Cancel anytime before."
- On mount: POST to /api/create-setup-intent → returns { clientSecret }. Show skeleton while loading.
- Render <Elements stripe={stripePromise} options={{ clientSecret }}> wrapping the form.
- Form fields:
  1. Email input (standard HTML, above the Stripe element) - labelled "Email" - used for billing and account recovery
  2. <PaymentElement /> - Stripe's unified card input, appearance options set to match app tokens:
     - variables: { colorPrimary: '#2d6a4f', colorBackground: '#ffffff', colorText: '#1a1a1a', borderRadius: '12px', fontFamily: 'DM Sans, system-ui, sans-serif' }
- CTA button: "Start 7-day free trial" - full width, sage green, Button-in-Button style.
- On submit:
  1. `stripe.confirmSetup({ elements, confirmParams: { return_url: window.location.origin + '/onboarding/trial-activated' } })`
  2. Stripe redirects to /onboarding/trial-activated?setup_intent=... on success
- Create app/onboarding/trial-activated/page.tsx (client component):
  - On mount: reads setup_intent id from URL params
  - POST to /api/activate-trial with { setupIntentId, plan, email } → server creates Stripe Customer + Subscription with trial_period_days: 7 → returns { subscriptionId, customerId, trialEndsAt }
  - Dispatch SET_TRIAL_DATA { subscriptionId, customerId, email, trialEndsAt, plan }
  - Show brief confirmation: checkmark + "You’re all set. Your trial runs until [date]." (2 seconds)
  - Navigate to /log
- Inline error state below the form if confirmSetup fails. Never a toast for form errors.
- Legal line at bottom (small, secondary color): "By tapping Start, you agree to be charged $[price] on [date] unless you cancel. Cancel at any time in Settings."
- "Back" text link top-left returns to Screen 4.

Create API routes:
- app/api/create-setup-intent/route.ts: creates a Stripe SetupIntent (mode: 'setup', payment_method_types: ['card']). Returns { clientSecret }.
- app/api/activate-trial/route.ts: accepts { setupIntentId, plan, email } where plan is 'annual' or 'monthly'. Retrieves SetupIntent from Stripe to get payment_method id. Creates Stripe Customer with email. Creates Stripe Subscription with the payment method, trial_period_days (14 for annual, 7 for monthly), and the correct price ID (STRIPE_ANNUAL_PRICE_ID or STRIPE_MONTHLY_PRICE_ID). Returns { subscriptionId, customerId, trialEndsAt }.

Create utils/symptoms.ts with sensible default symptom suggestions for each condition (5–8 per condition, covering all 26 supported conditions plus Other). Onboarding state should be tracked so it only shows once (check profile.stripeCustomerId in localStorage on app load - if set, user has completed onboarding).
```

-----

## PROMPT 3: Daily Logging Screen (Core Loop)

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code. This is the most important screen in the app - its design quality determines whether people come back daily.

Build the Daily Log screen. It must be completable in under 10 seconds for symptoms only, under 15 seconds with context fields. Refer to CLAUDE.md > Key Screens > Daily Log for the spec.

The screen is laid out as an editorial journal entry. Top-to-bottom inside the main content area (beneath the global AppHeader):

HERO DATE TREATMENT:
- Primary line: full date in Fraunces 44px weight 400 - "Tuesday, April 21"
- Secondary line beneath: DM Mono 12px --text-secondary, dynamic context string
  - Day 1: "Day 1 · First trail entry"
  - Day 2+ not yet logged today: "Day {loggedDaysCount + 1} · Last logged {relativeDate}"
  - Already logged today: "Day {loggedDaysCount} · Logged {relativeTime} - tap to update"
  - relativeDate: "yesterday" / "2 days ago" / "last {Weekday}" / ISO date if > 14 days ago
- 48px vertical space below the secondary line before the section header

SECTION HEADER (editorial eyebrow + Fraunces pairing):
- Eyebrow "TODAY'S LOG" in DM Sans 10px uppercase, tracked 0.15em, --text-secondary, 4px above the heading baseline
- Heading "Rate Your Symptoms" in Fraunces 24px weight 400
- Body: "One deliberate tap per symptom." - DM Sans 14px --text-secondary, period (authoritative, not instructional)

SYMPTOM GROUPING (critical - editorial chapter markers):

Build components/log/ConditionChapterMarker.tsx: a horizontal 1px --border hairline rule spanning the card's inner width, with the condition name centered on the rule in DM Sans 10px uppercase, tracked 0.15em, --accent color. 8px negative space around the text so the rule visually breaks around it.

- Do NOT render the condition name as a grey pill or rounded badge. The hairline chapter marker replaces the prior pill treatment.
- If 2+ conditions selected: each group collapsed by default. Below the chapter-marker rule (collapsed state), render a mini severity preview - a horizontal row of Severity Glyphs (from utils/severityGlyphs.tsx) showing today's logged severity per symptom in the group, or the None glyph if unlogged. Maximum 5 glyphs.
- Tap the chapter-marker rule to expand. Expanded state persists for the session.
- If 1 condition: chapter marker still renders; all symptoms expanded, no collapse UI.
- Within an expanded group: each symptom row = name left, SeverityChipSelector right. Vertical padding 12px.

SEVERITY CHIP SELECTOR (canonical severity input - replaces the numbered circles entirely):

Build components/log/SeverityChipSelector.tsx. 5 chips in a horizontal row: None, Mild, Medium, Severe, Extreme. Tap-to-commit pattern (one deliberate tap). This component is the ONLY severity input used anywhere in the app - reuse for symptom rows, sleep quality, and stress level in the Context section.

Chip structure (double-bezel architecture):
- Outer shell: `ring-1 ring-black/[0.04]` with `p-[2px]` and `rounded-[8px]`
- Inner core: `bg-[--bg-surface]` with `shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]` and `rounded-[6px]` (concentric-smaller radius)
- Inside the inner core (vertical stack, centered):
  - Severity Glyph from utils/severityGlyphs.tsx (12px) - using ORDERED_CHIP_GLYPHS[index] so each chip gets its matching glyph (None/Mild/ModerateLow/Moderate/Severe, index 0–4). NOT an emoticon face, NOT a Phosphor icon.
  - Label beneath: DM Sans 12px weight 500 - "None", "Mild", "Medium", "Severe", "Extreme"
- Chip dimensions: 64px wide × 56px tall
- Row gap: 6px between chips
- Resting state: --bg-surface inner core, --text-primary label, glyph currentColor inherits --text-secondary
- Selected state (claimed, not highlighted):
  - Inner core fills with the severity color at 25% opacity (e.g. `rgba(200,71,47,0.25)` for Extreme). The severity color is keyed by the chip's index: [None=gray, Mild=severity-1, Moderate-Low=severity-2, Moderate=severity-3, Severe=severity-4, Extreme=severity-5]. Use the updated warmer palette from CLAUDE.md.
  - Outer shell gains a 1.5px ring in the severity color offset 1px outside the existing bezel (`ring-offset-1 ring-offset-[--bg-primary]`)
  - Label and glyph shift to the severity color at full opacity
  - Label weight increases from 500 to 600
- Press feedback: on :active, `translateY(0.5px)` + `shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]`. Transition 150ms cubic-bezier(0.16, 1, 0.3, 1).
- Only one chip per row selected at a time. Tapping a different chip commits the new value; selected ring fades 200ms from old chip to new.
- Behind the row, render a visually hidden `<input type="radio">` group for accessibility. Chips are labeled radio buttons semantically - use proper labels and aria-checked.
- Internal value scale 0–4: None=0 (stored as undefined - no entry written), Mild=1, Moderate-Low=2, Medium=3, Severe=4. Legacy logs may have value=5; treat as Severe on display.

MARGINALIA MICRO-STATS (when data exists):

Build components/log/Marginalia.tsx. For every symptom row with ≥3 logged data points in the user's history:
- Absolute-positioned to the right of the chip row, vertically centered with the chip group
- DM Mono 11px --text-secondary, no background, no border
- Content logic (pick deterministically by ISO week):
  - If last log was today: "last: {value}"
  - Else if symptom has ≥7 days of history: "7d avg {X.X}" (single decimal)
  - Else if symptom has ≥14 days of history: alternate with "trend {↗ | ↘ | →}" - computed by comparing last-7-day mean vs prior-7-day mean; threshold ±0.3 for arrow direction
- Absent on day 1. Absent for symptoms with < 3 logs. Never for Food Triggers section.

FOOD TRIGGERS SECTION (open by default, positioned between symptom groups and Context):
- Header: "Food Triggers" with "Optional" eyebrow pill (accent variant)
- 2-column chip grid using the same double-bezel visual language as SeverityChipSelector but without glyphs - just the trigger name
- Unselected: outer ring + bg-surface inner. Selected: outer ring in --accent + rgba(216,243,220,0.5) inner tint + accent text color.
- Fixed trigger list: Dairy, Eggs, Poultry, Red Meat, Seafood, Legumes, Cruciferous Veg, Nightshades, Gluten
- Tap to select/deselect. Multi-select. Stored as `context.foodTriggers?: string[]`.
- Component: components/log/FoodTriggers.tsx

CONTEXT SECTION (collapsed by default):
- Label: "Optional" eyebrow, secondary color
- Sleep quality row: "How did you sleep?" - uses SeverityChipSelector with 5 chips (terrible/poor/okay/good/great). Since this is not symptom severity, override the selected-state fill color from the severity palette to --context-slider-high at 25% opacity with a matching 1.5px ring. Pass a `palette="neutral"` prop to SeverityChipSelector to trigger this.
- Stress level row: "Stress today?" - same SeverityChipSelector palette="neutral" pattern, labels: none/mild/medium/high/extreme
- Exercise: simple on/off toggle switch (the one remaining boolean)
- Menstrual cycle day: number input, ONLY if tracking PCOS or Endometriosis
- Context fields subtly indented with 2px solid --border left border to group them

NOTES SECTION (collapsed, tap to expand, textarea)

SAVE BUTTON (full width, sage green, button-in-button style):
- Primary CTA pattern from Premium Craft Patterns - sage green solid fill, no gradient, label + CheckCircle trailing icon nested in a circular wrapper
- On tap: label changes to "Saved", row confirmation flashes each logged symptom row's left border in --accent (2px, opacity 1→0, 600ms)
- If today already logged: pre-populate values, button reads "Update"
- On save: fire AnonymousLogEntry to Supabase in background if communityOptIn. Trigger SaveConfirmModal bottom sheet.

APP HEADER + STREAK BADGE are rendered globally in (app)/layout.tsx - not in this screen. Do not add a header or streak to this page.

POST-SAVE MODAL (SaveConfirmModal):
- Create utils/logMessages.ts with 40 messages in three tiers: 15 encouraging, 15 instructive (mention Timeline at 7 days, AI Sleuth unlocks at 14 days, Doctor Report when premium), 10 philosophy/insight. Export pickRandomMessage().
- Create components/log/SaveConfirmModal.tsx: bottom sheet slides up after successful save. Double-bezel architecture. Random LogMessage. Streak pill inside modal when count ≥ 1. 2px drain bar at the base of the inner bezel counting down 4 seconds (linear timing - permitted exception for countdown). Auto-dismiss at 4s; backdrop tap dismisses immediately. Heading Fraunces 22px weight 400. Body DM Sans 14px secondary.
- Wire into log/page.tsx: trigger showModal state after setSaveState("saved"), pass current streak from useStreak().

ANONYMIZATION (privacy boundary):
On save, if profile.communityOptIn is true:
- Create an AnonymousLogEntry per symptom (see CLAUDE.md data model) - strip all PII, use weekOf not specific date, exclude notes and menstrual data
- Call /api/community/submit in background (non-blocking)
- Create utils/anonymize.ts - takes a DailyLog, returns AnonymousLogEntry[]. This is the PII boundary - review the shape carefully against the AnonymousLogEntry interface.
```

-----

## PROMPT 4: Timeline Composable Segment

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code.

Build the Timeline composable segment components using Recharts. Timeline is NOT a standalone page - it renders inside the Insights screen as a segment. Build all components in `components/timeline/`. Create `app/(app)/timeline/page.tsx` as a one-liner redirect only: `import { redirect } from 'next/navigation'; export default function TimelinePage() { redirect('/insights'); }` - no component code.

- Date range tabs at top: 7D, 30D, 90D, All - styled as text tabs with an underline indicator, not pill buttons
- Line chart (Recharts AreaChart) showing severity symptoms over time
  - X-axis: dates (DM Sans, secondary text color, small size)
  - Y-axis: severity 1-5 (minimal grid lines - one for each level, very faint)
  - Each symptom is a separate colored line
  - Toggle symptom visibility by tapping legend items
  - Smooth curves, filled area with very low opacity (0.1-0.15) - the chart should feel like a watercolor wash, not a filled block
  - Use muted, desaturated versions of the severity colors for multi-symptom overlay so the chart doesn't look like a children's toy
  - Remove all default Recharts chrome (default tooltips, grid, cartesian grid) and restyle to match the app's aesthetic
- Context overlay: if context data exists, show small icons along the x-axis (moon for poor sleep, lightning for high stress, running figure for exercise, fork-and-knife for days with food triggers logged) as a secondary data layer. These should be very subtle - 12px, secondary color, below the main chart.
- Below the chart: scrollable list of daily log cards showing date, small severity dots for each symptom, context indicators, and truncated note if present. Tap a card to see full detail. Cards should be borderless rows with a bottom divider, not shadowed cards.
- For toggle-type symptoms: show as binary markers (dot present/absent) rather than lines

Implement the trial gate:
- Create hooks/useTrial.ts that calculates trial status from profile.createdAt and profile.premium
- If trial expired AND not premium: only show 7D range, blur/overlay the chart for older data with a centered "Unlock your full history" CTA button that navigates to the paywall. The blur should be a CSS backdrop-filter, not a translucent overlay card.
- Date ranges beyond 7D show a small lock icon (inline SVG, not emoji) if not premium

Finally, create `components/timeline/TimelineSegment.tsx` - a thin composable wrapper that combines `DateRangeSelector`, `TimelineChart`, and `DailyLogList` with their own internal `useState` for the selected date range. This is what Insights renders. It accepts `{ logs, symptoms, isPremium }` props and contains all the logic previously inside the standalone Timeline page.

-----

## PROMPT 4.5: Editorial Stationery Polish Pass

This prompt retrofits everything built in Prompts 1–4 to the Editorial Stationery aesthetic defined in the updated CLAUDE.md. Run it after Prompt 4 and before Prompt 5. It is atomic and reversible - all changes are visual/structural refinements, no data model changes.

```
Read the updated frontend-design SKILL.md and the full Design Philosophy section of CLAUDE.md (including Editorial Layout Patterns, Severity Glyph System, and updated Design Tokens) before writing any component code. This prompt retrofits the existing components to the Editorial Stationery aesthetic - do not treat it as a cosmetic pass, treat it as a correctness pass against the updated spec.

PART A - Global retrofits (affect every screen):

1. Design tokens. In app/globals.css, update the severity color variables to the warmer values specified in CLAUDE.md Design Tokens:
   --severity-1: #C5DFB8
   --severity-2: #A8CC97
   --severity-3: #F4C95D
   --severity-4: #E8823A
   --severity-5: #C8472F
   Add --paper-noise-opacity: 0.03.

2. Paper ground. Confirm components/ui/PaperGround.tsx exists and is rendered once in app/(app)/layout.tsx as a fixed full-screen layer beneath the AppHeader. It uses an inline SVG with `<feTurbulence baseFrequency="0.9" numOctaves="2" />` piped through `<feColorMatrix>` that warms the noise toward #D4CFBF, applied at the opacity token. Ensure `pointer-events: none` and `z-index: 0` so it never blocks taps.

3. App header. Build components/layout/AppHeader.tsx if it does not exist. 72px tall, `bg-[--accent]` background, 1px bottom border at `--accent` brightness ~60%. Left: the Wordmark component at height 48px with 20px left padding. Right: the StreakBadge component with 20px right padding - render StreakBadge as a `bg-white/20 backdrop-blur-sm` pill with 1px `ring-white/30`, containing a 14px inline-stroke flame SVG and DM Mono 12px number. Show the badge from Day 1. At 55% opacity when today has not been logged yet. Replace any previous streak-overlay implementation; there should be exactly one streak rendering point in the app.

4. Severity glyphs everywhere. Confirm utils/severityGlyphs.tsx exists. Audit every component that previously used an emoticon face, a Phosphor icon, or a colored dot to indicate severity - replace with the appropriate SeverityGlyph. Specifically check: SeverityChipSelector (see Part B), Timeline chart tooltip severity indicators, Insights mini-preview dots, Doctor Report severity markers, Save confirmation modal.

5. Ban audit. Grep the codebase for emoji characters (😊 😐 😖 and any other emoticons) used as UI elements. Remove all of them. If any component uses a Phosphor face icon (Smiley, SmileyMeh, SmileySad, etc.) as severity indication, replace with the glyph. The glyph system is the canonical indicator.

PART B - SeverityChipSelector (refactor, not rebuild):

The previous component (SeveritySlider or the initial chip implementation) is renamed to SeverityChipSelector and restyled per CLAUDE.md. This is the canonical severity input. Location: components/log/SeverityChipSelector.tsx.

Props: { value: number; onChange: (value: number) => void; scale?: 'severity' | 'context'; }

Visual:
- 5 chips in a horizontal row (None · Mild · Medium · Severe · Extreme), equal width, 64px wide × 56px tall
- Each chip uses the double-bezel architecture: outer shell `ring-1 ring-black/[0.04]` with inner core `bg-[--bg-surface]` and `shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]`. Border radius 1.25rem outer, calc(1.25rem - 0.375rem) inner.
- Chip content: SeverityGlyph (12px, centered) stacked above a DM Sans 12px weight 500 label
- Resting: `--text-primary` label, glyph at `--text-secondary`
- Selected (severity scale): inner core fills with the appropriate severity color at 25% opacity. Outer shell gains a 1.5px ring in the same severity color, offset outside the bezel by 1px (`ring-offset-1 ring-offset-[--bg-primary]`). Label and glyph shift to the severity color at full opacity. Label weight 500 → 600.
- Selected (context scale): inner core fills with `--context-slider-high` (#4A4A4A) at 25% opacity. Ring in #4A4A4A. Glyph and label in #4A4A4A. Same visual treatment, neutral palette.
- On `:active`: `translateY(0.5px)` + `shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]` with 150ms cubic-bezier(0.16, 1, 0.3, 1).
- Only one chip selected at a time. Tapping a new chip animates the selected ring between chips via opacity fade (200ms).
- Underlying radio group for accessibility: hidden `<input type="radio" name={symptomId}>` per chip with proper labels.

Use SeverityChipSelector everywhere: symptom rows in Log, sleep/stress context fields (pass `scale="context"`), and any other surface that previously used a slider.

PART C - Daily Log (app/(app)/log/page.tsx) editorial refit:

1. Hero date block. Above "Rate Your Symptoms", render:
   - Fraunces 44px weight 400: full date string ("Tuesday, April 21") from date-fns format
   - Below, DM Mono 12px `--text-secondary`: dynamic context string derived from loggedDaysCount and lastLogDate:
     * Day 1: "Day 1 · First trail entry"
     * Unlogged today, day 2+: `Day ${loggedDaysCount + 1} · Last logged ${relativeDate}`
     * Logged today: `Day ${loggedDaysCount} · Logged ${relativeTime} - tap to update`
   - relativeDate helper: "yesterday" / "2 days ago" / "last Tuesday" / ISO date if > 14 days
   - 48px vertical space beneath the secondary line.

2. Section eyebrow + heading. Replace the existing "Rate Your Symptoms" heading with the stacked pattern:
   - Eyebrow: "TODAY'S LOG" in DM Sans 10px uppercase, tracking 0.15em, `--text-secondary`, 4px above heading baseline
   - Heading: "Rate Your Symptoms" in Fraunces 24px weight 400
   - Body: "One deliberate tap per symptom." in DM Sans 14px `--text-secondary` (period, authoritative - not instructional)

3. Condition chapter markers. Build components/log/ConditionChapterMarker.tsx. Props: { condition: string; collapsed?: boolean; onToggle?: () => void; children: ReactNode; }
   - Renders a 1px `--border` hairline rule spanning the card's inner width
   - Condition name centered on the rule in DM Sans 10px uppercase, tracking 0.15em, `--accent` color, with 8px horizontal negative space around the text so the rule visually breaks around it (achieve via `::before` and `::after` flex children, or an absolute-positioned text node on a relative rule container)
   - Replace any previous grey-pill condition header in the Log screen with this component.
   - When multiple conditions are tracked: each chapter marker is the tap target for collapsing its group. Below the rule in collapsed state: a row of max 5 Severity Glyphs (using SeverityGlyph dispatcher) showing today's logged severity per symptom, or GlyphNone for unlogged.

4. Marginalia. Build components/log/Marginalia.tsx. Props: { symptomId: string; }
   - Reads the user's log history from AppState
   - If fewer than 3 logs exist for this symptom: renders null
   - Otherwise: DM Mono 11px `--text-secondary`, right-aligned, absolute-positioned inside the symptom row (top-right, vertically centered with chip row)
   - Content rotation logic:
     * If last log was today: `last: ${value}`
     * If last log was within 7 days AND ≥7 days history: `7d avg ${X.X}` (one decimal)
     * If ≥14 days history: deterministic rotation by ISO week between "7d avg {X.X}" and "trend ${↗|↘|→}"
   - Trend arrow: compare last 7 days average to prior 7 days average. >10% up → ↗. >10% down → ↘. Otherwise → (unicode U+2192 for rightward, matching the existing ↗↘ arrows).

5. Wire Marginalia into every SymptomRow rendered under the SeverityChipSelector row. Leave Food Triggers section untouched - no marginalia there.

PART D - Other screens:

- Timeline segment components (`components/timeline/`): update severity color references (already picked up via CSS variable changes). Tooltip severity markers: replace any dot/icon with SeverityGlyph of the appropriate value.
- Upgrade / Paywall: no structural changes in this pass, but verify the paywall screen uses the warmer severity palette if it renders any severity previews.
- Report screen: severity references in the generated report should render SeverityGlyph inline alongside numeric values.

PART E - Verify:
- npm run dev starts cleanly
- Log screen hero date reads correctly on day 1 and day 2+ states
- Severity chips render glyphs, not emoticons, in every state
- Paper ground is visible at 2x browser zoom (subtle grain on background only)
- Condition chapter markers render as hairline-with-centered-text, not as grey pills
- Marginalia appears only where data justifies it (never on day 1 or low-data symptoms)
- No console warnings about missing wordmark - either the asset is in place or the placeholder warning logged as expected
```

-----

## PROMPT 5: Community Intelligence Layer (free, layered into Insights)

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code. This is the moat - the feature that turns SymptomSleuth from a personal tool into a data network. IMPORTANT: Community insights are now free for all users (not premium-only). See CLAUDE.md Trial Logic > Community access rationale. The AI Sleuth chat, built in Prompt 5.5, is the premium-gated layer within Insights. Community stays free.

This prompt builds:
1. The Supabase backend for anonymous community data
2. The API routes
3. The useCommunity hook
4. The Community-section components (CommunityOverview, PatternComparison, CorrelationCard, ShareableInsight, ThresholdMessage)

The Insights *page* itself - with its four-state shell (A empty / B preview + community / C live AI chat / D AI paywall with data teaser) - is NOT built in this prompt. It is built in Prompt 5.5, which imports the Community components from this prompt as the lower section. Build the components here as composable sections, not as a full page.

First, set up the Supabase backend:
- Create the anonymous_logs table in Supabase (provide the SQL):
  - id (uuid, auto-generated)
  - condition (text, indexed)
  - symptom_name (text)
  - value (integer)
  - week_of (text: ISO week format YYYY-Wnn, indexed)
  - sleep_quality (integer, nullable)
  - stress_level (integer, nullable)
  - exercise (boolean, nullable)
  - food_triggers (text[], nullable)       -- array of trigger names e.g. ["Dairy", "Gluten"]
  - created_at (timestamptz, auto-generated)
  - NO user ID column. NO device ID column. This is intentional.
  - NOTE: No symptom_type column - all symptoms are 1–5 severity.

- Create the condition_aggregates table:
  - condition (text, primary key)
  - total_active_users (integer) - approximated from distinct week_of entries in last 4 weeks
  - symptoms (jsonb) - array of SymptomAggregate objects
  - correlations (jsonb) - array of Correlation objects
  - updated_at (timestamptz)

- Create a Supabase Edge Function or SQL function (run via pg_cron nightly) that:
  1. For each condition, counts approximate active users (distinct week_of values in last 4 weeks as a proxy)
  2. For each condition + symptom combination, computes: tracking count, average severity, severity distribution, and trend direction (compare last 4 weeks avg to prior 4 weeks avg)
  3. For each condition, computes correlations between context factors (sleep, stress, exercise, food triggers) and symptom severity. A correlation is valid only if sample size >= 200. Use simple co-occurrence: "X% of entries with low sleep (1-2) had severity >= 4", "X% of entries including Dairy had severity >= 3"
  4. Writes results to condition_aggregates, replacing the previous row

Now implement the API routes:
- app/api/community/submit/route.ts: accepts POST with AnonymousLogEntry[], validates shape (no extra fields, no PII), inserts into Supabase anonymous_logs. Returns 200 on success, degrades gracefully on failure.
- app/api/community/aggregates/route.ts: accepts GET with ?condition=Migraine, reads from condition_aggregates, returns the aggregate. Cache this response (Cache-Control: max-age=3600) since it only updates nightly.

Now implement the hook:
- hooks/useCommunity.ts: fetches aggregates for the user's conditions, caches in memory, exposes loading/error/data states. Refetches on mount and every 24 hours.

Now build the Community section components. All of these are exported from components/insights/ for use by the Insights page in Prompt 5.5. None of them gate on premium status.

CommunityOverview.tsx (container that composes the three sections below):
- Condition selector at top if tracking multiple conditions (styled as text tabs matching Timeline)
- Hero stat: "Based on X,XXX [Condition] users" in Fraunces 24px weight 400 - this is the trust anchor. If below 50 users, render ThresholdMessage instead.

Section 1 - Top Tracked Symptoms:
- Ranked list: "What other [Condition] users track most"
- Each row: symptom name, horizontal bar showing percentage of users who track it, percentage number in DM Mono
- The user's own tracked symptoms should be highlighted (subtle sage green left border)
- If the community tracks symptoms the user doesn't, show them with a "Add to your tracker?" tap action

Section 2 - PatternComparison.tsx (Your Patterns vs. Community):
- For each symptom the user tracks, show a simple side-by-side:
  - Left: "Your avg: 3.2" (from their localStorage data)
  - Right: "Community avg: 2.8" (from aggregates)
  - Visual: two small horizontal bars in different colors (sage green for personal, --community teal for community)
- Keep this dead simple. No complex charts. The comparison itself is the insight.

Section 3 - CorrelationCard.tsx (Correlation Insights):
- Each correlation rendered as a CorrelationCard:
  - Teal left border (--community color)
  - Insight text: "71% of migraine users who logged poor sleep also logged higher severity the next day"
  - Sample size in small DM Mono: "Based on 3,200 entries"
  - Share button (small, text-style): triggers ShareableInsight canvas render

ShareableInsight.tsx:
- When user taps "Save/Share" on any insight card, render a clean image using HTML Canvas:
  - White background, SymptomSleuth logo small at top (load from /public/brand/wordmark.svg - do NOT recreate)
  - The insight text, clearly formatted
  - "symptomsleuth.com" at bottom
  - Output as PNG via canvas.toDataURL(), trigger native share sheet (navigator.share) or download to camera roll
- The primary user use case is AMMUNITION - saving the card to show a doctor ("see, it's not just me"), a partner, or an insurance reviewer. The secondary use case is sending to a friend with the same condition via DM. Do NOT frame this in the UI as "share with your community" or any public-sharing language. Chronic illness patients share health data selectively and privately.
- The same canvas rendering is also used by the brand (you) to produce weekly condition-specific content for SymptomSleuth's own social accounts. The data is the marketing - distributed by the brand across Reddit, Facebook groups, TikTok, and Twitter. This is a content engine you control, not a user behavior you're hoping for.

ThresholdMessage.tsx:
- Shown when a condition has < 50 active users
- Fraunces heading: "Community insights are building"
- Body: "We need more [Condition] users logging to surface patterns. Share SymptomSleuth with others who have [Condition] to unlock community insights."
- Share button that copies a pre-written message + link
- This message itself is a distribution mechanic

Do NOT build app/(app)/insights/page.tsx in this prompt. That page is built in Prompt 5.5 and composes these components as its lower section.
```

-----

## PROMPT 5.5: AI Sleuth - Insights as Home, with four-state chat surface

```
Read the frontend-design SKILL.md, the full Design Philosophy section of CLAUDE.md, and especially the "AI Sleuth - Access, Cost, and Safety" section and "Key Screens > 4. Insights (AI Sleuth + Community)" section before writing any component code. This prompt builds the AI chat feature and rewires Insights as the app's primary reflective surface.

This prompt builds in order:
1. content/aiSampleQuestions.ts - condition-keyed rotating sample questions
2. utils/aiSystemPrompt.ts - system prompt with medical safety scaffolding
3. utils/aiPreviewStats.ts - client-side data-derived teaser computation
4. app/api/ai-chat/route.ts - streaming SSE endpoint with prompt caching
5. hooks/useAIAccess.ts - threshold and access state
6. hooks/useAIChat.ts - chat session state + rate limit + streaming
7. components/insights/AIPreviewCard.tsx - State B locked preview
8. components/insights/ProgressToUnlock.tsx - State B progress strip
9. components/insights/AIChat.tsx - State C live chat
10. components/insights/AILockedPreview.tsx - State D post-threshold paywall
11. app/(app)/insights/page.tsx - the four-state Insights page composing all of the above + CommunityOverview from Prompt 5
12. Default landing tab logic in app/(app)/layout.tsx

--- STEP 1: content/aiSampleQuestions.ts ---

Export a typed object keyed by condition name, with 6-10 rotating sample questions per condition. Questions must be written in first person ("What do my evening severity spikes have in common?"), Fraunces-worthy (read well at 22px weight 400), and specific to the condition's typical concerns.

Cover all conditions onboarded in CLAUDE.md (Migraine, IBS, Fibromyalgia, Chronic Pain, Anxiety, Autoimmune, PCOS, Endometriosis, Hypertension, Obesity, Depression, Arthritis, Type 2 Diabetes, COPD, Asthma, Heart Disease, Chronic Kidney Disease, Thyroid Disease, IBD, Other). Fall back to the "Other" set for any condition not explicitly listed.

Export a helper `getSampleQuestionForWeek(condition: string, weekNumber: number): string` that deterministically picks one question from the array using `weekNumber % array.length`. This ensures consistency within a week and rotation across weeks.

--- STEP 2: utils/aiSystemPrompt.ts ---

Export a function `buildAISystemPrompt({ conditions, loggedDaysCount, totalLogEntries }): string` that returns the system prompt string. The prompt must include:

- Role: "You are Sleuth, SymptomSleuth's data analyst. You read the user's own symptom logs and help them see patterns."
- Explicit scope: Sleuth observes patterns in the user's logged data. It does NOT diagnose, prescribe, recommend medications or dosages, or interpret medication interactions.
- Emergency redirect rule: if the user's message implies a medical emergency (suicidal ideation, chest pain with severity/urgency cues, stroke symptoms - face drooping, arm weakness, speech difficulty, allergic reaction with breathing difficulty), respond with a brief acknowledgment and direct them to emergency services (911 in US, 999 in UK, 000 in AU, or their local emergency number if the logs suggest location) - do not pattern-analyze the emergency.
- Framing rule: always frame observations as "patterns in your data," "your logs show," or "based on X days of your entries." Never "you have" or "you are experiencing."
- Unanswerable questions: if asked something the logs cannot answer (causation, prognosis, "why do I have X"), acknowledge the limit and redirect to pattern-level observations the data does support.
- Tone: calm, direct, respectful. Not cheerful. Not clinical-cold. Authored warmth.
- Response format: short responses (2-4 sentences typical, 1 paragraph max for complex questions). Use plain language, not medical jargon. Numbers over impressions ("on 8 of your last 10 low-sleep days" vs "often").
- Notes privacy: the user's free-text notes are NOT included in the payload by default. Only reference notes if the user's question explicitly asks about them, in which case respond "I don't have access to your notes for this question - try asking again with specifics."
- Required footer on every response: "- pattern observation from your logged data, not medical advice."

--- STEP 3: utils/aiPreviewStats.ts ---

Export `computePreviewInsight(logs: DailyLog[], conditions: string[]): string` - generates a single one-sentence data-derived teaser insight for State D without any API call. Logic:

- If <14 days of data: return a generic placeholder (this function shouldn't be called below threshold, but defense-in-depth)
- Otherwise, run three simple checks in order and return the first one that yields a result:
  1. Low-sleep correlation: of days where sleepQuality <= 2, what % had any symptom at severity >= 3? If >60%: return e.g. "Your severity trends upward on low-sleep nights."
  2. Food trigger correlation: for each food trigger, what % of days logging it had any symptom at severity >= 3? Pick the top one if >55%: "Your migraines cluster on days you logged {trigger}."
  3. Stress correlation: of days where stressLevel >= 3, what % had severity >= 3? If >55%: "Stress appears in {pct}% of your high-severity entries."
- Fallback: "You've logged {loggedDaysCount} days. Your patterns are becoming clearer."

Return a single sentence, no markdown, no leading/trailing whitespace.

--- STEP 4: app/api/ai-chat/route.ts ---

Streaming POST endpoint. Request body: { messages: { role: 'user' | 'assistant'; content: string }[]; userContext: { conditions: string[]; loggedDaysCount: number; totalLogEntries: number; recentLogs: DailyLog[] } }

- Validate: reject if loggedDaysCount < 14 or totalLogEntries < 20 (return 403 with "AI threshold not met")
- Validate: reject if messages.length > 10 (session should rotate, not grow unbounded) - return 400 with "Conversation too long; start a new session"
- Build system prompt via buildAISystemPrompt()
- Construct the Anthropic API call using claude-sonnet-4-5-20250929 with:
  - max_tokens: 800
  - stream: true
  - system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }, { type: 'text', text: `User's recent symptom data:\n${formatLogs(userContext.recentLogs)}`, cache_control: { type: 'ephemeral' } }]
  - messages: userContext messages array (last 10 turns max)
- Stream response back to client as SSE
- Handle errors gracefully - return a terminal SSE event with error: string
- Use the ANTHROPIC_API_KEY env var (shared with /api/generate-report)

Rate-limit backup at the edge: 30 requests/hour per IP via Next.js middleware (failsafe only - real rate limit is client-side).

formatLogs helper: serialize the last 90 days of DailyLog entries to a compact text format. Include date, entries (symptom name + severity value), context (sleep, stress, exercise, foodTriggers). EXCLUDE the notes field entirely. Target ~6000 tokens for typical payloads.

--- STEP 5: hooks/useAIAccess.ts ---

Export a hook returning:
```
{
  isAIThresholdMet: boolean;      // loggedDaysCount >= 14 && totalLogEntries >= 20
  hasAIAccess: boolean;           // isAIThresholdMet && isPremium
  loggedDaysCount: number;
  totalLogEntries: number;
  daysRemaining: number;          // Math.max(0, 14 - loggedDaysCount)
  logsRemaining: number;          // Math.max(0, 20 - totalLogEntries)
  aiUnlockedAt: string | undefined;
}
```

Side effect: when isAIThresholdMet first becomes true, dispatch SET_AI_UNLOCKED_AT with now() if aiUnlockedAt is undefined. Do this via useEffect in the hook.

--- STEP 6: hooks/useAIChat.ts ---

Export a hook managing the chat session. State:
- messages: { role, content, id }[]
- isStreaming: boolean
- error: string | null
- rateLimitResetAt: Date | null

Methods:
- sendMessage(content: string): validates rate limit (max 20 messages in rolling 24h from profile.aiUsage.messages[]), fetches /api/ai-chat with SSE, streams tokens into the latest assistant message
- clearConversation(): resets messages to []

Rate limit logic: on every sendMessage call, prune profile.aiUsage.messages to only include entries from the last 24h. If resulting array length >= 20, set rateLimitResetAt to the oldest entry + 24h, do not send. Otherwise, append { sentAt: new Date().toISOString() } to profile.aiUsage.messages via RECORD_AI_MESSAGE dispatch, then send.

Session scope: messages is React state only. Do not persist to localStorage. On hook unmount or clearConversation call, messages resets to [].

--- STEP 7: components/insights/AIPreviewCard.tsx ---

Props: { condition: string; weekNumber: number; daysRemaining: number; logsRemaining: number; }

Render:
- Double-bezel container (outer shell ring-1 ring-black/[0.04] bg-white/60 p-1.5 rounded-[1.25rem]; inner core bg-[--bg-surface] with inset highlight shadow, padded p-6)
- Eyebrow pill (neutral variant: bg-[--border] text-[--text-secondary]):
  - If daysRemaining > 0: "ASK SLEUTH - UNLOCKS IN {daysRemaining} DAYS"
  - Else (logsRemaining > 0): "ASK SLEUTH - NEEDS MORE LOGS"
- 16px spacer
- Fraunces 22px weight 400: getSampleQuestionForWeek(condition, weekNumber)
- 20px spacer
- Skeleton answer: 3 bars of varying widths (95%, 82%, 68%), 12px tall each, 8px vertical gap, `bg-[--border]` with the shimmer animation (2s cycle). NOT text - just bars.
- 20px spacer
- Footer text, DM Sans 12px `--text-secondary`: "Your personal AI unlocks when your data has enough signal to answer you well."
- Card is NOT tappable.

--- STEP 8: components/insights/ProgressToUnlock.tsx ---

Props: { daysRemaining: number; logsRemaining: number; loggedDaysCount: number; totalLogEntries: number; }

Render a thin row, no card container, flex layout:
- Left: DM Mono 11px `--text-secondary`
  - Pick whichever gate has more remaining (larger remaining = further from done):
    * If daysRemaining >= logsRemaining: "{loggedDaysCount} of 14 days"
    * Else: "{totalLogEntries} of 20 logs"
- Right: 80px wide × 2px tall progress line
  - Track: bg-[--border]
  - Fill: bg-[--accent], width = `${Math.min(100, (loggedDaysCount / 14) * 100)}%` OR `${Math.min(100, (totalLogEntries / 20) * 100)}%` matching the gate shown on the left

--- STEP 9: components/insights/AIChat.tsx ---

Full spec per CLAUDE.md Key Screens > State C. Key points:

- Double-bezel container (matches AIPreviewCard outer dimensions)
- Eyebrow pill (accent variant: bg-[--accent-light] text-[--accent]): "TRAIL"
- Top-right inside the card: "New conversation" text button (DM Sans 12px `--text-secondary`), calls clearConversation()
- Conversation area: max-h-[480px] overflow-y-auto, scrolls to bottom on new message
  - User turns: right-aligned, DM Sans 15px `--text-primary`, `pl-12` (48px left padding, reads as quoted), no background, no avatar
  - AI turns: left-aligned, DM Sans 15px `--text-primary`, prefix with a small 8px `bg-[--accent]` rounded dot (inline-block, 8px margin-right), no avatar, no name label
  - Between turns: 16px vertical gap
  - Post-process AI response content: find severity words ("Mild", "Medium", "Severe", "Extreme") and wrap them with an inline SeverityGlyph + label pair. Regex-based substitution is fine for v1.
- Empty state (messages.length === 0):
  - Fraunces 22px weight 400: "Your sleuth works for you."
  - DM Sans 14px `--text-secondary`: `Ask about your patterns, triggers, or symptoms. Sleuth reads your ${loggedDaysCount} days of data - never your notes field unless you ask.`
  - Three starter chips below (tap-to-send), drawn from getSampleQuestionForWeek rotation offset by 0, 1, 2
  - Footnote, DM Sans 11px `--text-secondary`: "Sleuth is not a doctor. For medical decisions, use the Doctor Report and see your clinician."
- Input area (bottom of card):
  - Above the textarea: horizontally scrolling row of 3 suggested prompt chips (double-bezel visual, tap-to-send - immediate send on tap, no textarea fill-and-commit step)
  - Textarea: auto-grow up to 4 lines max, placeholder cycles through sample questions on each mount
  - Trailing send button inside the textarea bezel: button-in-button style, bg-[--accent], Phosphor ArrowUp 14px weight light
- Rate limit state: if rateLimitResetAt is set, replace the input area with a centered DM Sans 14px `--text-secondary` message: `You've asked 20 questions in the last day. Sleuth resets in ${formatDuration(rateLimitResetAt - now)}.` No upgrade CTA.

Streaming UX: while isStreaming, show the assistant's in-progress message with the text accumulating plus a blinking caret (CSS-only, no JS). On error, display error text inline with a retry button.

--- STEP 10: components/insights/AILockedPreview.tsx ---

Props: { logs: DailyLog[]; conditions: string[]; }

Per CLAUDE.md State D spec:
- Double-bezel container matching AIPreviewCard outer dimensions
- Eyebrow pill (accent-light variant): "SLEUTH - UNLOCKED, READY WHEN YOU ARE"
- Fraunces 22px weight 400: computePreviewInsight(logs, conditions) - client-side, no API call
- Below: a three-line "answer preview" of realistic correlation response copy (~40 words total). First line fully visible, next two blurred via `filter: blur(4px)`. Use realistic but generic placeholder copy describing pattern analysis - no user-specific data leakage beyond the insight sentence.
- Primary CTA (sage green button-in-button trailing arrow): "Unlock Sleuth" → router.push('/upgrade')
- Secondary text below CTA (DM Sans 12px `--text-secondary`): "Your 14 days of data stay private. Sleuth only reads what you ask it to see."

--- STEP 11: app/(app)/insights/page.tsx ---

Client component. Compose the three-segment Insights screen. The page has a persistent segmented control (Timeline · AI · Community) shown in all non-empty states. The four AI states (A/B/C/D) apply within the AI segment only. Timeline and Community segments are always fully rendered when selected.

```tsx
const { isAIThresholdMet, hasAIAccess, loggedDaysCount, daysRemaining, logsRemaining, totalLogEntries } = useAIAccess();
const { state } = useAppState();
const { logs, profile } = state;
const { isPremium } = useTrial();
const condition = profile.conditions[selectedConditionIndex] ?? 'Other';
const weekNumber = getISOWeek(new Date());
const [activeSegment, setActiveSegment] = useState<'timeline' | 'ai' | 'community'>('timeline');

// State A: day 0 - no segments yet
if (loggedDaysCount === 0) return <EmptyTrailState />;

// All non-empty states: hero + segmented control + active segment content
return (
  <>
    <HeroDateBlock
      heading={`Your sleuth - Week ${Math.max(1, Math.ceil(loggedDaysCount / 7))}`}
      secondary={`${loggedDaysCount} days logged · ${totalLogEntries} entries`}
    />
    {/* Segmented control - three tabs, underline indicator, not pills */}
    <InsightsSegmentedControl active={activeSegment} onChange={setActiveSegment} />

    {/* Timeline segment (default) */}
    {activeSegment === 'timeline' && (
      <TimelineSegment logs={logs} symptoms={profile.symptoms} isPremium={isPremium} />
    )}

    {/* AI segment - four internal states */}
    {activeSegment === 'ai' && (
      <>
        {hasAIAccess && <AIChat loggedDaysCount={loggedDaysCount} />}
        {isAIThresholdMet && !isPremium && <AILockedPreview logs={logs} conditions={profile.conditions} />}
        {!isAIThresholdMet && (
          <>
            <AIPreviewCard condition={condition} weekNumber={weekNumber} daysRemaining={daysRemaining} logsRemaining={logsRemaining} />
            <ProgressToUnlock daysRemaining={daysRemaining} logsRemaining={logsRemaining} loggedDaysCount={loggedDaysCount} totalLogEntries={totalLogEntries} />
          </>
        )}
      </>
    )}

    {/* Community segment */}
    {activeSegment === 'community' && <CommunityOverview conditions={profile.conditions} />}
  </>
);
```

EmptyTrailState is a small local component: Fraunces 44px "Your journey starts with one tap.", DM Mono 12px "Log today to begin.", sage green CTA "Start logging" routing to /log. Centered.

HeroDateBlock is a small local component: Fraunces 44px weight 400 heading + DM Mono 12px `--text-secondary` secondary line. Used in all non-empty states.

InsightsSegmentedControl is a small local component: three text tabs (Timeline · AI · Community), compact ~36px height, underline indicator on active tab in `--accent`, DM Sans 13px weight 500. Not pills - same visual language as the date range tabs in TimelineSegment.

TimelineSegment is imported from `components/timeline/TimelineSegment.tsx` - the composable wrapper built in Prompt 4.

--- STEP 12: Nav restructure + Account tab + default landing logic in app/(app)/layout.tsx ---

**12a - Bottom nav restructure:**

Replace the current four tabs (Log, Timeline, Insights, Report) with:

| Tab | Route | Icon |
|---|---|---|
| Log | /log | notebook SVG (existing) |
| Insights | /insights | sparkle or data-lines SVG |
| Report | /report | document SVG (existing) |
| Account | /account | person/circle SVG |

Remove the Timeline tab. The Timeline route (`app/(app)/timeline/page.tsx`) already redirects to `/insights` - no further action needed.

**12b - Account page:**

Create `app/(app)/account/page.tsx` as a client component:
- Hero: Fraunces 44px "Account" heading, DM Mono 12px secondary showing auth state ("Signed in with Google" / "Local account - data on this device only")
- Subscription section (eyebrow tag): current plan badge derived from `useTrial()`, trial end date if active, "Manage plan" → Stripe customer portal
- Settings section (eyebrow tag): Community opt-in toggle wired to `profile.communityOptIn` via dispatch
- Data section (eyebrow tag): "Reset account" - two-tap confirmation, clears localStorage, routes to `/onboarding`. Remove the reset button from wherever it currently exists in Insights.
- Design: `divide-y` rows, section eyebrow tags, no card elevation (see Grouping Patterns).

**12c - Default landing tab logic (unchanged):**

On cold app open, redirect based on loggedDaysCount:
- If loggedDaysCount < 4: stay on /log
- If loggedDaysCount >= 4: redirect to /insights

Implementation: client-side redirect in (app)/layout.tsx useEffect, fires once per mount when the current pathname is exactly '/log' AND no explicit navigation has occurred this session. Use sessionStorage flag `hasNavigated` set to 'true' on first navigation to prevent redirect from interfering with user choice.

--- STEP 13: Verify ---

- Insights screen shows segmented control (Timeline · AI · Community) in all non-empty states
- Default segment on cold open is Timeline
- Timeline segment renders the chart and daily log list correctly within Insights
- AI chat is inaccessible (State B preview shown in AI segment) when loggedDaysCount < 14 OR totalLogEntries < 20, regardless of premium
- AI chat is accessible (State C) when threshold met AND premium (trial or paid)
- AI paywall (State D) appears when threshold met but premium has lapsed
- Community segment renders CommunityOverview independently (not duplicated below AI content)
- Bottom nav shows Log · Insights · Report · Account (no Timeline tab)
- `/timeline` URL redirects to `/insights`
- Account page renders auth state, subscription status, community toggle, and reset action
- Cold app open with loggedDaysCount >= 4 lands on Insights, not Log
- Rate limit caps at 20/24h client-side, displays reset countdown inline
- profile.aiUsage.messages correctly prunes entries older than 24h on every check
- AI responses stream in smoothly with visible caret
- /api/ai-chat rejects requests from users below threshold with 403
- AI system prompt includes the medical safety scaffolding
- computePreviewInsight never hits the API and returns a valid sentence for all code paths
```

-----

## PROMPT 6: Doctor Report Generation

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code.

Build the Doctor Report screen with Claude API integration. Refer to CLAUDE.md for the spec.

Report Generator:
- Date range picker (default: last 30 days) - simple, clean, two date inputs with DM Sans. Not a full calendar widget.
- "Generate Report" button - sage green, same style as the Save button on the Log screen for consistency
- Loading state: NOT a generic spinner. Use a skeleton placeholder matching the report layout (gray bars where text will appear) with a subtle shimmer animation and the text "Analyzing your symptom data..." in secondary color. The shimmer should be slow and calm (2s cycle).

Create the serverless API route at app/api/generate-report/route.ts (Next.js Route Handler):
- Accepts POST with: dateRange, symptoms, logs (including context data), conditions
- Builds a system prompt that instructs Claude to produce a structured clinical summary formatted for a doctor:
  - Patient-reported conditions
  - Date range covered
  - Per-symptom: frequency reported, average severity, min/max, trend direction
  - Context factors: average sleep quality, stress levels, exercise frequency, food triggers logged (frequency and correlation with high-severity days), and any correlations observed in the personal data
  - Notable patterns (e.g., "Headache severity increased from avg 2.1 to 3.8 over the last 2 weeks", "Higher severity days correlated with low sleep quality in 8 of 12 instances", "Dairy was logged on 6 of 7 high-severity days")
  - Patient notes summary
  - Format as clean sections with headers, not conversational prose
- Uses claude-sonnet-4-5-20250929, max_tokens 1500
- Returns the generated text

Report Display:
- Render the report with clear typographic hierarchy: section headers in Fraunces (medium weight), body in DM Sans, data points in DM Mono or tabular DM Sans. The report should look like a professional clinical document, not a chat response.
- "Copy Report" button and "Share" button - styled as text buttons with icons, not big colored buttons. These are secondary actions.
- Small footer: "Generated by SymptomSleuth. This is patient-reported data, not a medical diagnosis." - in small, secondary text.

Trial gate: if not premium, this entire screen shows the locked UpgradeScreen component instead.
```

-----

## PROMPT 7: Paywall & Stripe Integration

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code.

Build the paywall/upgrade screen and Stripe payment flow. Refer to CLAUDE.md for the spec. This screen must convert without feeling manipulative - the design should be honest and calm, not urgent or fear-based.

Upgrade Screen component (shown when non-premium users access locked features):
- Header in Fraunces: "Your 7-day full access has ended" (or "Unlock full access" if they tap a locked feature during trial)
- Anchor text below header in DM Sans, secondary color: "The average migraine patient spends $8,500/year managing their condition. SymptomSleuth helps you understand your patterns for less than a single copay."
- Show what's locked - NOT as a feature grid with checkmarks. Instead, a clean vertical list with brief descriptions in secondary text:
  - "Full symptom history & trends"
  - "See how your patterns compare to thousands of others"
  - "Doctor-ready reports"
  - "Track multiple conditions"
- Three pricing options with clear visual hierarchy — annual is the no-brainer:
  - PRIMARY (annual card, visually dominant): full-width sage-green filled card, "BEST VALUE" pill top-left. Price: "$39.99 / year" in Fraunces. Subtext: "That's just $3.33/month" in DM Mono. Trial callout: "14-day free trial included". Primary CTA button: "Start Free Trial" (filled white button inside the green card, high contrast).
  - SECONDARY (monthly card, recessive): smaller visual weight, standard double-bezel card on the warm surface. Price: "$9.99 / month" in Fraunces. Trial callout: "7-day free trial". CTA: "Try Monthly" (outlined/ghost style).
  - TERTIARY (lifetime option, below the fold): NOT a full card. Rendered as a subdued centered text link beneath both cards. Copy: "Prefer to pay once? $79.99 lifetime access →". No trial language.
- Trust text below all options in secondary color: "Cancel anytime. Your data is always yours."
- NO urgency tactics (countdown timers, "limited time", scarcity language). The product sells itself.
- Each option triggers Stripe Checkout. Annual/monthly use `mode: 'subscription'` with `trial_period_days: 14` or `7`. Lifetime uses `mode: 'payment'` for the one-time $79.99 charge — no trial.

Create app/api/create-checkout/route.ts:
- NOTE: This route handles the upgrade flow for users whose trial has expired (not initial onboarding - that uses /api/create-setup-intent and /api/activate-trial).
- Accepts a `plan` parameter: 'annual' | 'monthly' | 'lifetime', plus `email?` and `customerId?` (from profile.stripeCustomerId if present)
- For annual/monthly: creates a Stripe Checkout session in subscription mode with `trial_period_days: 14` (annual) or `7` (monthly). Uses STRIPE_ANNUAL_PRICE_ID or STRIPE_MONTHLY_PRICE_ID.
- For lifetime: creates a Stripe Checkout session in payment mode for the one-time $79.99 charge. Uses STRIPE_LIFETIME_PRICE_ID. No trial.
- Success URL: /payment-success?session_id={CHECKOUT_SESSION_ID}&plan={plan}
- Cancel URL: /upgrade
- Returns { url, sessionId }

Create app/(app)/payment-success/page.tsx (client component):
- On mount, reads session_id from URL params and POSTs to /api/confirm-checkout to verify the session and extract plan + customer details.
- For lifetime sessions: dispatches SET_LIFETIME { customerId, email } — sets premium.type = 'lifetime' with no expiresAt.
- For annual/monthly sessions: dispatches SET_TRIAL_DATA { subscriptionId, customerId, email, trialEndsAt, plan }.
- Shows a confirmation then auto-redirects to /log.

Create app/api/confirm-checkout/route.ts:
- Accepts { sessionId }. Retrieves the Stripe Checkout Session (with subscription + customer expanded) and returns normalized { plan, customerId, email, subscriptionId?, trialEndsAt?, expiresAt? } to the client.

Create app/api/stripe-webhook/route.ts:
- Handles: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed.
- Uses STRIPE_WEBHOOK_SECRET for signature verification on all events.
- Existing handlers are stubs — the client-side confirm-checkout flow is the authoritative state update path. Webhook grows once a server-side subscription ledger is added.

Create app/api/create-portal/route.ts:
- Creates a Stripe Customer Portal session using profile.stripeCustomerId.
- Used for annual and monthly subscribers only — lifetime members have no renewal to manage.

Add to the Account screen:
- For annual/monthly subscribers: "Manage Subscription" link that opens Stripe Customer Portal. Show current plan: "Monthly plan" / "Annual plan" + renewal date from premium.expiresAt.
- For lifetime members: show a "Lifetime Member ✦" badge in place of the plan row. No Manage link — there is no renewal.
```

-----

## PROMPT 8: Zero-Knowledge Sync, Key Escrow & Local Export

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code.

Build the complete zero-knowledge sync system. Personal health data is encrypted client-side before it touches any server. The server stores only the encrypted blob. This is the technical foundation of the "we cannot read your data" privacy claim.

Create utils/cryptoKey.ts:
- generateKey(): generates a non-extractable AES-256-GCM CryptoKey via Web Crypto API. Stores it in IndexedDB (not localStorage - localStorage is synchronous and leaks to JS). Returns the key.
- getKey(): retrieves the CryptoKey from IndexedDB. Returns null if not found (new device).
- wrapKeyForServer(key: CryptoKey, pin: string, userId: string): 
  - POST to /api/sync/pepper to get the server pepper (server-side secret, never exposed to client directly - the endpoint requires a valid Supabase session and returns only the pepper for that userId)
  - Derive wrapping key: PBKDF2(pin + userId + pepper, 100k iterations, SHA-256) - client-side
  - AES-KW wrap the CryptoKey - returns ArrayBuffer
  - POST wrapped key to /api/sync/store-wrapped-key
- unwrapKeyFromServer(pin: string, userId: string):
  - Fetch pepper from /api/sync/pepper (requires session)
  - Fetch wrapped key from /api/sync/wrapped-key (requires session)
  - Derive wrapping key, AES-KW unwrap - returns CryptoKey
  - Store in IndexedDB

Create utils/syncEngine.ts:
- encryptState(state: AppState, key: CryptoKey): generates random 12-byte IV, encrypts JSON.stringify(state) with AES-256-GCM - returns { iv_b64, ciphertext_b64 }
- decryptState(payload: { iv_b64: string, ciphertext_b64: string }, key: CryptoKey): decrypts and JSON.parse - returns AppState
- pushSync(state: AppState): called after every Save (non-blocking). Gets key from IndexedDB. If no key (anonymous user), returns early. Encrypts state. POST to /api/sync/push. Handles offline gracefully - queues in localStorage if navigator.onLine is false.
- pullSync(): called on app mount after auth is confirmed. Gets key from IndexedDB. GET /api/sync/pull. Decrypts. Returns AppState or null if no blob exists yet.
- Conflict resolution: compare updatedAt timestamp. If server blob is newer than localStorage, server wins (user logged on another device). Merge daily logs: union by date, server entry wins on conflict.

Create the API routes:
- app/api/sync/push/route.ts: requires Supabase session. UPSERT into encrypted_profiles (user_id, blob, iv, updated_at).
- app/api/sync/pull/route.ts: requires Supabase session. SELECT from encrypted_profiles WHERE user_id = auth.uid().
- app/api/sync/store-wrapped-key/route.ts: requires session. UPSERT into wrapped_keys. Resets pin_attempts to 0.
- app/api/sync/wrapped-key/route.ts: requires session. SELECT wrapped_key, pin_attempts, locked_until from wrapped_keys.
- app/api/sync/pepper/route.ts: requires session. Returns HMAC(SYNC_SERVER_PEPPER, userId) so each user gets a unique pepper without storing per-user secrets. Never exposes the raw SYNC_SERVER_PEPPER.
- app/api/sync/verify-subscription/route.ts: accepts subscriptionId. Calls Stripe to check status. Returns { active: boolean, expiresAt: string }.

Build the PIN setup screen (components/sync/PinSetup.tsx):
- Shown once after auth, before onboarding Screen 1
- Heading: "Set a recovery PIN" 
- Body: "If you get a new phone, sign in and enter this PIN to restore your data. Choose something you’ll remember."
- 6-digit PIN input (large digit buttons, not a text input - looks native)
- Confirm PIN entry
- "Continue" button - calls wrapKeyForServer, stores wrapped key, navigates to Screen 1
- No skip option - if they dismiss, they are on anonymous path (no sync)

Build the PIN recovery screen (components/sync/PinRecovery.tsx):
- Shown on new device after sign-in when no local CryptoKey exists
- Heading: "Restore your data"
- Body: "Enter your recovery PIN"
- 6-digit input, "Restore" button
- On success: decrypts blob, hydrates state, navigates to /log
- On failure: show attempt count remaining. After 10 failures: show "Too many attempts. Sign out and sign back in to reset your PIN." (which triggers Google re-auth PIN reset flow)
- "Forgot your PIN?" link - triggers sign-out → sign back in → /api/sync/reset-pin → new PIN setup flow

Local export (keeps the file backup for anonymous users and as an optional "own your data" feature):
- Create utils/localExport.ts:
  - exportToFile(state: AppState, passphrase: string): PBKDF2 passphrase → AES-256-GCM encrypt → download as symptomsleuth-backup-YYYY-MM-DD.json
  - importFromFile(file: File, passphrase: string): decrypt → validate schema → migrate if needed → dispatch HYDRATE + trigger pushSync
- For authenticated users: this is a secondary "Export a local copy" option in Settings.
- For anonymous users: this is the PRIMARY backup mechanism (same banner reminder logic as before).

Update providers.tsx:
- On every SAVE_LOG/UPDATE_LOG action, call pushSync(newState) in a useEffect (non-blocking, fire-and-forget).
- On mount, after localStorage hydration, if userId is set: call pullSync(). If pull returns a state newer than localStorage, dispatch HYDRATE with merged state.
```

-----

## PROMPT 9: Polish, Settings, Offline & Install Prompt

```
Final polish pass. Go through every screen and refine:

Settings Screen (app/(app)/settings/page.tsx):
- Accessible from a gear icon on the Log tab header
- Sections with clean dividers (border-top, not cards):

  "Your Conditions"
  - List of conditions with edit/remove
  - "Add condition" button

  "Your Symptoms"
  - List of symptoms grouped by condition, with edit/remove/reorder
  - "Add symptom" button per condition

  "Context Fields"
  - Toggles for which context fields appear on the daily log (sleep, stress, exercise, cycle day, food triggers)
  - All on by default, user can turn off ones they don't want

  "Community Data"
  - Toggle: "Contribute anonymous data to community patterns"
  - Shows current opt-in status
  - Small text explaining what is/isn't shared (same language as onboarding)

  "Subscription"
  - If premium: show plan type, renewal date, "Manage Subscription" link (Stripe portal)
  - If not premium: "Upgrade" link to paywall

  "Sync & Backup"
  - Show sync status: "Synced just now" / "Syncing..." / "Sync failed - check your connection"
  - Show billing email from profile.email
  - "Add Google sign-in" / "Add Facebook sign-in" buttons - links to Supabase OAuth for that provider. Links to the Supabase account already seeded from billing email. Only shown if the provider is not already connected.
  - "Export a local copy" button - triggers passphrase → file download (localExport.ts)
  - "Restore from file" button - file picker → passphrase → import
  - "Recovery PIN" - "Change recovery PIN" for authenticated users
  - "Export data as JSON" - unencrypted full export (always available)
  - "Delete all data" - destructive, requires confirmation. Red text, not red background.

PWA & Offline:
- Verify next-pwa service worker precaches all app shell assets
- Ensure runtime caching for Google Fonts works
- Test that daily logging works fully offline (localStorage writes don't need network)
- Community data submission queues locally if offline, submits on next online session (use a simple queue in localStorage)
- Show a subtle "You're offline" banner when navigator.onLine is false, noting that Doctor Reports and Community Insights require internet
- Add a custom install prompt: after the user's 3rd daily log, show a dismissible banner at the top: "Add SymptomSleuth to your home screen for quick daily access" with an "Install" button that triggers the beforeinstallprompt event. Save dismissal to localStorage so it doesn't reappear.

Visual Polish - re-read the frontend-design SKILL.md and CLAUDE.md Design Philosophy before this pass:
- Add page transition animations between tabs: 150ms opacity fade only. No slide, no scale. Calm.
- Add micro-interaction on Save: brief checkmark that fades in (opacity 0→1, 150ms) then fades out (300ms delay, then opacity 1→0, 200ms). The checkmark should be a simple SVG stroke animation (dash-offset), not a Lottie or GIF.
- Ensure the severity color scale renders correctly in both light and dark contexts (if adding dark mode support - optional but recommended for people logging at night while in pain)
- Add an empty state for Timeline when there's less than 2 days of data: Fraunces heading "Your trends are building" with secondary text "Keep logging - patterns will appear here after a few days." Centered, generous whitespace, no illustration or decorative image.
- Review every component against the design anti-patterns list in CLAUDE.md. Specifically check for: accidental gradient usage, rounded-everything pill buttons, generic card-with-shadow patterns, any emoji used as UI elements, any bounce/spring animations.

Accessibility:
- All interactive elements have aria-labels
- Severity selector is keyboard navigable
- Color is never the only indicator (always paired with numbers or icons)
- Screen reader announces log save confirmation
- Community insight cards include alt text for screen readers

Performance:
- Next.js handles code splitting per route automatically - verify Timeline, Insights, and Report pages don't bloat the initial bundle by checking `npm run build` output
- Debounce localStorage writes (don't write on every tap, batch on Save)
- Limit chart data points for smooth rendering on older phones (aggregate to weekly for 90D+ views)
- Community aggregate fetches are cached in memory - don't refetch on every tab switch
```

-----

## PROMPT 10: Landing Page, SEO/AEO Content Pages & Pre-Launch Checklist

```
Read the frontend-design SKILL.md and the Design Philosophy section of CLAUDE.md before writing any component code. This prompt covers the marketing site, SEO/AEO content infrastructure, and final checks.

--- PART A: Landing Page ---

The landing/marketing page at app/page.tsx should be a server component for SEO. The landing page is the first impression and must feel designed, not templated:
- Hero section: left-aligned on desktop (split layout - text left, app screenshot/mockup right), full-width stacked on mobile. Heading in Fraunces, large: "Track your symptoms. See the bigger picture." Subheading in DM Sans, secondary color: "Log how you feel in 10 seconds. See your patterns. Compare with thousands of others. Generate a report your doctor can actually use." This is the one place we use a split layout per the frontend-design skill's anti-center-bias rule - the rest of the site stays centered.
- Below hero: 4 value props, each with a small custom SVG icon (not from an icon library - draw simple, distinctive line icons that match the clinical warmth aesthetic), a DM Sans heading, and one line of body text:
  - "10-second daily logging" - "Tap your severity, hit save. Done before your coffee cools."
  - "Visual trends over time" - "See what your body's been telling you. Patterns your memory misses."
  - "Community patterns" - "See how your experience compares to thousands of others with the same condition."
  - "Doctor-ready reports" - "Hand your doctor a structured summary, not a blank stare."
- "Get Started - Free for 14 Days" button - sage green, centered. Links to /log (triggers onboarding if first visit). 14 days reflects the annual trial (the recommended plan); users who pick monthly during onboarding get 7 days.
- Below CTA: trust line in small secondary text: "Optional Google sign-in. End-to-end encrypted. No one can read your data but you. Plans from $9.99/month or $39.99/year. Lifetime available for $79.99."
- Layout: max-width 960px on desktop (wider than app’s 480px), generous vertical rhythm (80–120px between sections)
- Add a staggered load-in animation on the value props: CSS animation-delay cascade (0ms, 100ms, 200ms, 300ms), opacity 0→1 + translateY(12px→0), 400ms ease-out. This is the ONE moment of motion on the marketing site.
- This page is server-rendered - verify it appears in View Source
- NO generic landing page patterns: no floating mockup screenshots, no testimonial carousels, no "trusted by X users" badges (until you actually have the community numbers to back it up), no gradient hero backgrounds. The page should feel like the app itself - quiet, confident, clinical warmth.

--- PART B: SEO/AEO Content Infrastructure ---

Build a dynamic content page system for programmatic SEO and answer engine optimization. This is critical for long-term distribution.

1. Create a content data structure at content/conditions.ts:
```typescript
interface ConditionPage {
  slug: string;                    // URL slug: "migraine-symptom-tracker"
  condition: string;               // "Migraine"
  title: string;                   // "Migraine Symptom Tracker - Log Triggers, Patterns & Reports"
  metaDescription: string;         // 155 chars max, keyword-rich
  heroHeading: string;             // "Track your migraines. Show your neurologist."
  heroSubheading: string;          // Condition-specific pain point
  symptoms: string[];              // Common symptoms for this condition
  doctorType: string;              // "neurologist", "gastroenterologist", etc.
  communityStatEnabled: boolean;   // whether to show "Join X,XXX users" (only if above threshold)
  faqs: FAQ[];                     // 5-8 structured Q&A pairs per condition
}

interface FAQ {
  question: string;                // "How do I track migraine triggers?"
  answer: string;                  // Structured, citation-worthy answer (3-5 sentences)
}
```

2. Populate content/conditions.ts with data for these conditions (write genuinely useful, medically informed content - NOT AI filler):
- Migraine (slug: migraine-symptom-tracker)
- IBS (slug: ibs-symptom-diary)
- Fibromyalgia (slug: fibromyalgia-symptom-tracker)
- Chronic Pain (slug: chronic-pain-log)
- Endometriosis (slug: endometriosis-symptom-tracker)
- PCOS (slug: pcos-symptom-tracker)
- Rheumatoid Arthritis (slug: rheumatoid-arthritis-symptom-tracker)
- Anxiety (slug: anxiety-symptom-tracker)
- Crohn's Disease (slug: crohns-disease-symptom-tracker)
- Lupus (slug: lupus-symptom-tracker)
- Chronic Fatigue Syndrome (slug: chronic-fatigue-symptom-tracker)
- GERD / Acid Reflux (slug: gerd-symptom-tracker)

3. Create the dynamic route at app/[conditionSlug]/page.tsx (server component):
- Uses generateStaticParams() to pre-render all condition pages at build time
- Uses generateMetadata() for per-page title, description, and Open Graph tags
- Page layout matches the landing page aesthetic but with condition-specific content:
  - Heading: conditionPage.heroHeading in Fraunces
  - Subheading: conditionPage.heroSubheading in DM Sans
  - "Common symptoms tracked" section showing the condition's symptom list
  - If communityStatEnabled: "Join X,XXX [Condition] users tracking patterns together" - pulls from condition_aggregates via a server-side Supabase call
  - "What to bring to your [doctorType] appointment" section - 3-4 practical tips
  - FAQ section with proper HTML structure (use <details>/<summary> or a clean accordion)
  - CTA: "Start Tracking Your [Condition] Symptoms - Free for 7 Days"
- Same visual style as landing page - same max-width, same typography, same spacing

4. Add JSON-LD structured data to each condition page:
- FAQPage schema for the FAQ section
- WebApplication schema for SymptomSleuth itself
- MedicalCondition schema referencing the condition

5. Create app/guides/page.tsx - a server-rendered index page listing all condition pages:
- Title: "Symptom Tracking Guides"
- Grid of condition cards linking to each /[conditionSlug] page
- This serves as an internal linking hub for SEO authority distribution

6. Add to the landing page footer: links to all condition pages + a link to /guides. Internal linking is essential for SEO.

--- PART C: Supplementary AEO Pages ---

Create 5 standalone guide pages at app/guides/[guideSlug]/page.tsx targeting the highest-intent questions chronic illness patients ask:

- "how-to-track-symptoms-for-doctor" - "How to Track Symptoms for a Doctor Appointment"
- "what-to-bring-to-specialist-appointment" - "What to Bring to a Specialist Appointment"
- "symptom-diary-vs-symptom-tracker" - "Symptom Diary vs. Symptom Tracker: What Works Better"
- "how-to-describe-pain-to-doctor" - "How to Describe Pain to Your Doctor (So They Actually Understand)"
- "why-doctors-want-symptom-data" - "Why Your Doctor Wants Symptom Data (And How to Give It to Them)"

Each guide page should:
- Be a server component with generateMetadata()
- Have JSON-LD Article schema
- Be 400-600 words of genuinely useful content (NOT keyword-stuffed filler)
- Include a natural CTA to SymptomSleuth at the end
- Link to relevant condition pages for internal linking
- Use the same visual style as condition pages

--- PART D: Technical SEO ---

1. Create app/sitemap.ts that generates a dynamic sitemap including all pages
2. Create app/robots.ts allowing all crawlers, pointing to the sitemap
3. Add canonical URLs to all pages via metadata
4. Verify all content pages render fully in View Source (no client-side rendering for content)

--- PART E: Pre-Launch Checklist ---

1. PWA audit: run Lighthouse PWA audit, fix any failures
2. Meta tags verified on landing page, all condition pages, and all guide pages
3. Error boundaries: wrap each tab in an ErrorBoundary component so a crash in one tab doesn't kill the app
4. Data migration: verify the version number in localStorage schema works - loading a version 1 schema (from before community/context updates) should migrate cleanly to version 2
5. Analytics: add a simple, privacy-respecting event layer (no PII, no external analytics service - just log to console in dev, can swap in Plausible later). Key events: onboarding_complete, community_opted_in, community_opted_out, daily_log_saved, context_logged, report_generated, insight_saved, upgrade_tapped, payment_complete, backup_created, backup_restored, condition_page_viewed
6. Create a README.md with setup instructions, environment variables needed, Supabase setup steps, and deployment steps for Vercel
7. Run `npm run build` - verify no errors, check bundle sizes, confirm all static pages generate correctly
```

-----

## Post-Build: Deployment Steps (Manual)

1. Create a Vercel project, connect your Git repo (Next.js is auto-detected - zero config)
2. Create a Supabase project:
   - Enable Google and Facebook OAuth providers in Supabase Auth settings (Authentication → Providers). Add the OAuth credentials from Google Cloud Console and Facebook Developer App.
   - Set the redirect URL in Supabase Auth to: https://symptomsleuth.com/auth/callback (and http://localhost:3000/auth/callback for dev)
   - Add the Google and Facebook OAuth redirect URLs to their respective developer consoles
   - Run the SQL from Prompt 5 to create anonymous_logs and condition_aggregates tables
   - Run the SQL from Prompt 8 to create encrypted_profiles and wrapped_keys tables (with RLS policies)
   - Set up the nightly aggregation function (Edge Function or pg_cron)
   - Copy the project URL and anon key
3. Set environment variables in Vercel:
   - `ANTHROPIC_API_KEY` - your Claude API key
   - `STRIPE_SECRET_KEY` - Stripe secret key
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
   - `STRIPE_ANNUAL_PRICE_ID` - create a $39.99/year recurring product/price in Stripe Dashboard (primary plan, 14-day trial)
   - `STRIPE_MONTHLY_PRICE_ID` - create a $9.99/month recurring product/price in Stripe Dashboard (secondary plan, 7-day trial)
   - `STRIPE_LIFETIME_PRICE_ID` - create a $79.99 one-time product/price in Stripe Dashboard (tertiary plan, no trial)
   - `STRIPE_WEBHOOK_SECRET` - from Stripe webhook setup
   - `NEXT_PUBLIC_SUPABASE_URL` - your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - your Supabase anon key
   - `SYNC_SERVER_PEPPER` - generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` and never rotate it (rotating invalidates all wrapped keys)
4. Deploy to Vercel
5. Set up Stripe webhook pointing to symptomsleuth.com/api/stripe-webhook (events: checkout.session.completed, customer.subscription.deleted, invoice.payment_failed)
6. Test the full flow: onboarding → community opt-in → 7 days of logging with context → trial expiry → paywall → payment → premium unlock → community insights → doctor report → backup → restore
7. Connect symptomsleuth.com domain
8. Submit sitemap to Google Search Console
9. Submit sitemap to Bing Webmaster Tools (Bing feeds into Copilot/ChatGPT citations)
10. Verify condition pages and guide pages are indexing
11. Submit to PWA directories (PWA Store, AppScope) for discoverability
12. Test AEO: search for "how to track symptoms for a doctor appointment" in Perplexity and ChatGPT

-----

## Distribution Strategy (Post-Ship)

### Immediate (Week 1 - launch week):

1. **Reddit** - r/migraine (350K+), r/ibs (100K+), r/fibromyalgia (80K+), r/ChronicPain (150K+), r/autoimmune, r/endometriosis, r/PCOS. Post as a genuine member showing the tool, not as a marketer. Format: "I built a free symptom tracker because I was tired of telling my doctor 'I don't know, it's been bad I guess'" - show a screenshot of the 10-second log and the generated report. Mention the community pattern feature as upcoming ("once enough people are logging, you'll be able to see how your patterns compare to others with the same condition").
2. **Chronic illness Facebook groups** - massive, active, and members constantly ask "how do you track symptoms?" Share as a free tool (the 7-day trial is generous enough to feel free).
3. **TikTok/Reels** - "POV: You finally have something to show your doctor" format. Screen recording of the 10-second log + generated report. Follow up with community insight screenshots once data is flowing.

### Short-term (Weeks 2-4):

4. **Community data seeding** - The community intelligence layer needs critical mass to be valuable. Priority is getting 50+ active users per condition for the top 4 conditions (Migraine, IBS, Fibromyalgia, Chronic Pain). Reddit posts targeting these specific communities are the highest-leverage activity in weeks 2-4.
5. **Brand content from community data** - Once community data crosses the 50-user threshold for any condition, start posting condition-specific insight cards from SymptomSleuth's own social accounts. "71% of migraine users who logged poor sleep also logged higher severity" - post this to r/migraine, migraine Facebook groups, TikTok, and Twitter. These are content marketing assets that don't look like ads because they're genuinely useful data. This is a content engine you control - don't depend on users sharing publicly, because chronic illness patients share health data privately and selectively.
6. **Free tool as top-of-funnel** - Build a standalone "Symptom Severity Quiz" at symptomsleuth.com/quiz.

### Medium-term (Month 2+):

7. **SEO compounding** - The 12 condition pages and 5 guide pages start ranking. Add 5-10 more condition pages per month. Each new page is a new entry point. Once community stats are available, add dynamic "Join X,XXX [Condition] users" to condition pages - social proof that updates automatically.
8. **AEO monitoring** - Use Otterly or manual testing to check if Perplexity/ChatGPT cite your pages.
9. **Newsletter acquisition** - Search for chronic illness newsletters on Substack. A 5,000-10,000 subscriber newsletter in the migraine niche could be acquired for $5-15K and gives you a direct channel.
10. **Doctor/practitioner referrals** - Create a one-page PDF ("Recommend SymptomSleuth to your patients") that doctors can download.
11. **Content repurposing engine** - Record one 15-minute video per week showing a real symptom logging session + doctor report walkthrough + community insights demo. Transcribe with AI, turn into social content.

### The flywheel:

More users logging → richer community data → more compelling insights → more brand content to post across chronic illness communities → more installs → more users logging. The community intelligence layer IS the growth engine, but the distribution is brand-driven, not user-driven. You post the insights. Users benefit from them privately (ammunition for doctors, validation, personal understanding). Every other distribution tactic is a spark to ignite the flywheel. Once it's spinning, the data produces your marketing for you.
