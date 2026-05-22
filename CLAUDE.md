# SymptomSleuth - Chronic Symptom Logger PWA

## Project Overview

SymptomSleuth is a PWA that helps people with chronic conditions (migraine, IBS, fibromyalgia, autoimmune disorders, chronic pain, PCOS, endometriosis, hypertension, obesity, periodontal disease, depression, arthritis, type 2 diabetes, COPD, asthma, heart disease, chronic kidney disease, cancer, dementia & Alzheimer's, stroke, osteoporosis, atrial fibrillation, liver disease, thyroid disease, IBD) log daily symptoms in under 10 seconds, generate structured doctor reports, and see how their patterns compare to thousands of others with the same condition. Personal data stays on-device via localStorage with optional encrypted cloud backup the user controls. Anonymous, aggregated pattern data powers a community intelligence layer that gets smarter with every user. Monetized via a reverse trial into one of three plans: $39.99/year (14-day trial, primary), $9.99/month (7-day trial, secondary), or a $79.99 one-time lifetime purchase (no trial). All payments via Stripe.

## Tech Stack

- **Framework:** Next.js 14+ (App Router) with TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts for symptom timeline visualization
- **AI:** Anthropic Claude API (claude-sonnet-4-5-20250929) for doctor report generation, AI Sleuth chat, and pattern narrative
- **Payments:** Stripe Checkout Sessions (subscription mode for annual/monthly; payment mode for lifetime)
- **Auth:** Supabase Auth - Google OAuth and email + password. Account creation runs at `/welcome` after the user completes Stripe Checkout, not at the start of onboarding. Returning members sign in from the landing page. Magic links are not used for sign-in (they break in PWA standalone mode because the email link opens in an external browser, not the installed PWA, leaving the session in the wrong context). Password reset is the one place a recovery link is sent - rare, friction acceptable. **Supabase config:** disable "Confirm email" in the project's Auth settings. Stripe already verified the billing email at checkout; requiring a second confirmation reintroduces the magic-link friction we're avoiding. Anonymous/UUID-only mode is retired - every user either authenticates at `/welcome` or is pre-auth with local-only data during the onboarding/trial window. Apple Sign-In is deferred until App Store submission.
- **Backend:** Supabase (anonymous community data aggregation, pattern computation, encrypted profile sync)
- **Hosting:** Vercel
- **PWA:** next-pwa (or @ducanh2912/next-pwa) with Workbox for service worker, offline support, and install prompt
- **Encryption:** Web Crypto API (AES-256-GCM) for zero-knowledge cloud sync and optional local file export
- **Design Skill:** `npx skills add https://github.com/anthropics/skills --skill frontend-design` - installed at project root. ALWAYS read SKILL.md before writing any UI component.

## Design Philosophy

**CRITICAL: Read the frontend-design SKILL.md before writing ANY component that renders UI.** Every component must reflect intentional design, not default AI output.

### Design Thinking

**Purpose:** This interface helps people with chronic illness log daily symptoms in under 10 seconds, see how their patterns compare to others with the same condition, and generate structured reports for their doctors. The users are often in pain, fatigued, or brain-fogged when they open the app. Every design decision must prioritize speed, clarity, and calm.

**Tone: Modern Interactive Journal.** SymptomSleuth reads as a fluid, premium, tech-forward medical journal. The reference points are editorial layout discipline (hierarchical typography, generous margins) crossed with dynamic, living interfaces (fluid spring mechanics, ambient murmuration particle backgrounds, glassmorphic panels). It is **authored warmth with premium dynamism** - typography carries the voice, interactive depth carries the feel, and ambient motion responds to the user's data.

**Constraints & Layout:** 
- Mobile-first approach transitioning to a **Responsive Split-View Dashboard** on desktop (>768px). 
  - Mobile: fluid max-width, bottom navigation, fluid spring bottom-sheets.
  - Desktop: 2-column layout (Sticky Context Sidebar on the left, fluid Masonry Grid or centered content on the right).
- All tap targets 48px minimum.
- Use `framer-motion` for tactile spring physics and layout animations.
- Use `react-tsparticles` for the ambient murmuration background effect.

**Differentiation - the one thing someone should remember:** This app feels like it was designed by someone who *has* a chronic condition, not by someone who read a brief about chronic conditions. It's quiet, respectful of bad days, and never gamified or falsely cheerful. The typography is the voice; the paper warmth is the feel; the restraint IS the design. It reads as an authored journal a thoughtful adult keeps, for themselves and for their doctor. The community intelligence layer shows you that you're not alone - without ever being a social network.

### Progressive Disclosure - First-Class Design Principle

**This principle governs every screen.** Default views show the minimum viable information. Detail, options, and secondary actions expand on demand. No screen should present more than 5 interactive elements above the fold.

Apply this to:
- Symptom groups (collapsed by condition when 2+ conditions selected)
- Food Triggers (open by default - exception: food is the most common symptom driver and benefits from immediate visibility)
- Context fields (collapsed by default, tap to expand)
- Notes (collapsed, tap to expand)
- Any future feature with optional depth

**The rule:** If the user hasn't asked for it, don't show it. When they ask, expand it with a calm height transition (200ms ease-out). Their expanded/collapsed state persists for the session.

### Frontend Aesthetics

**Typography:** Fraunces (variable serif) for display/headers - warm, personal, trustworthy. Paired with DM Sans for body/UI - clean, geometric, highly legible at small sizes. DM Mono for data/numbers and all numeric values (severity scores, percentages, counts). This is a deliberate serif + sans-serif pairing where the serif communicates "personal journal" and the sans-serif communicates "reliable tool."

**Minimum text sizes:** Instructional/helper body text (subheadings under section headers, field-level hints) minimum **14px**. Chip and control labels minimum **12px**. The 10px size is reserved exclusively for uppercase eyebrow pill tags (tracked, all-caps). Never use 10–11px for readable prose or instructional copy.

**Color & Theme:** Almost monochromatic. Warm paper base (#F7F6EF — "Editorial Stationery"), warm grays for text, single sage green accent (#2D6A4F). The ONLY polychromatic element is the severity scale, which runs **green → blue → gold → orange → red** (severity-1 through severity-5). The blue at severity-2 is deliberate — it widens chromatic distance between Mild and Medium so the chip row reads clearly at a glance, and it is the only non-warm hue permitted in the app. Everything else stays quiet so the severity colors carry meaning.

**Motion:** Fluid, tactile, and highly responsive. Use `framer-motion` for spring physics on tactile micro-interactions — chip taps, button presses, modal entries. Buttons and severity chips have satisfying "squish" physics (`scale` interactions). Context menus and modals use swipeable spring bottom-sheets. Charts and section entries use staggered scroll-in animations on the cubic-bezier curves below (not springs — springs are reserved for tactile feedback). **Never animate `top`, `left`, `width`, or `height` via CSS - use Framer Motion layout animations or exclusively animate `transform` and `opacity`.**

**Spatial Composition:** Responsive and adaptive. Desktop utilizes a two-column sidebar/main stage layout with masonry-like grids for condition viewing. Mobile maintains a layered, scrollable feed. Generous negative space everywhere. 

**Backgrounds & Visual Details:** Warm off-white base (`--bg-primary`) enhanced with a **Murmuration Particle Background** using `tsparticles`. 
- On desktop, particles disperse smoothly around the cursor. 
- On mobile, they drift naturally and respond slightly to scroll/gyroscope.
- Panels, nav bars, and major containers should utilize **Glassmorphism** (`backdrop-blur-md` + translucent overlays) stacked over the murmuration background to create premium, macOS-like depth.
- **Severity Chips:** Living gradients. Selected states feature a breathing/pulsing radial glow, now larger (85% spread) and deeply saturated.
- **Button Interactions:** Rigidly lock into deep, fully saturated pure colors on hover, tap, and selection without washing out to pastel. Text dynamically snaps to pure `#ffffff` white to contrast against the heavy cores.

### Grouping Patterns (in order of preference)

When visual grouping is needed, use these in order - reach for the lightest option that works:

1. **Typographic hierarchy** - size/weight contrast alone
2. **`divide-y` with `--border` color** - a hairline between rows
3. **Section label** - 11px DM Sans uppercase, tracked, `--text-secondary` color, 4px top spacer. No border, just the label and space.
4. **Subtle left border** - `2px solid --border` for indented secondary content (context fields, sub-items)
5. **Elevation (card with shadow + white surface)** - ONLY when a group is independently actionable (e.g., a card you can swipe, long-press, or tap as a unit)

Never reach for card elevation when a divider or label will do. Cards add visual weight; use them when the elevation communicates something meaningful about the interaction.

### Severity Glyph System

Emoticon faces (😊 😐 😖 style) are BANNED across the app. They read as pediatric pain-scale posters and undermine the "refined medical tool for adults" positioning. Use the custom abstract glyph set defined in `utils/severityGlyphs.tsx` - 5 inline SVG components that escalate in visual density to mirror severity without literal emotional illustration.

The glyph set:

- **None** (severity 0): a single 12px horizontal hairline - absence marker. Stroke `currentColor` at 1.25px.
- **Mild** (severity 1): a single 3px filled dot, centered. Density: one unit.
- **Moderate-low** (severity 2): two 2.5px filled dots, stacked vertically with 2px gap. Density: two units.
- **Moderate** (severity 3): three 2.5px filled dots arranged in a tight triangle (one top, two bottom). Density: three units.
- **Severe** (severity 4): a 7px filled circle with a thin 1px outer ring at 10px diameter. Density: pressurized single mark.
- **Extreme** (legacy value=5 only): the severe glyph with a second outer ring at 13px diameter - concentric pressure.

**Chip → glyph mapping:** `SeverityChipSelector` ships five chips (values 0–4) mapped to glyphs `None → Mild → ModerateLow → Moderate → Severe`. The Extreme glyph is reserved for rendering legacy `value: 5` entries in TimelineChart and the Doctor Report — it never appears on a chip. Do not "fix" the chip selector by remapping it; the mapping is intentional and aligned with the 0–4 chip scale.

Glyphs render at `currentColor` so they inherit the chip's text color (which shifts with selection state). They are authored, unified, and the signature visual element of the severity system - reuse them in Timeline tooltips, Insights summaries, and the Doctor Report header. Never substitute emoji, emoticons, or Phosphor Icons for severity indication.

### Editorial Layout Patterns

The app is laid out like a well-designed personal journal, not a dashboard. Five patterns govern the editorial feel - apply each where relevant:

**1. Hero date treatment.** Every primary screen (Log, Insights, Report) opens with a Fraunces 44px weight 400 date or section title as the first element below the header. Below it, a single line of DM Mono 12px `--text-secondary` context - e.g., "Day 23 · Last logged yesterday" on Log, "Week 4 · 23 days logged" on Insights. This line is dynamic and derived from user state. No decoration, no icons - the typography is the decoration.

**2. Eyebrow + Title + Hairline stack for condition groups.** Condition headers inside the Log screen (currently styled as a grey pill reading "MIGRAINE") are replaced with a chapter-marker treatment: a 1px `--border` hairline rule running the inner card width, with the condition name centered on the rule in DM Sans 10px uppercase, tracked `0.15em`, `--accent` color, with 8px of negative space around the text so the rule visually breaks around it. This is a classic editorial device - treat each condition as a chapter of the day's entry.

**3. Section eyebrows above Fraunces section headers.** Any Fraunces section heading (e.g., "Rate Your Symptoms") gains a DM Sans 10px uppercase tracked eyebrow above it, `--text-secondary` color, sitting 4px above the heading baseline. The eyebrow names the section in functional terms ("TODAY'S LOG"), the heading names it in voice terms ("Rate Your Symptoms"). This doubling is not redundant - it is the editorial device that signals authored layout.

**4. Marginalia micro-stats.** For every symptom row with ≥3 data points in the user's history, show a single DM Mono 11px `--text-secondary` right-aligned micro-stat inside the row: "7d avg 2.1" or "last: 3" or "trend ↗". No background, no border, no icon beyond a minimal ↗ ↘ → arrow. Marginalia appears only when there is signal to report - absent rows stay clean. This is the primary device that makes the app feel dense-but-calm as a user's history grows.

**5. Marginalia rules.** Never marginalia for unlogged symptoms. Never marginalia on day 1. Never marginalia that requires a hover to read. Never more than one marginalia element per row. Marginalia is a whisper, not a feature.

### Copy Density Rules

UI text must be minimal. Claude Code will always err toward more words - resist it.

- **UI labels:** 3 words maximum
- **Section headers:** 2 words maximum
- **Helper text:** only when a user could make an error without it
- **Empty states:** one line of guidance, no paragraph
- **Error messages:** one sentence, action-oriented ("Try again" not "An error occurred")
- **If a label needs more than 3 words to be understood, the UI structure is wrong** - fix the structure, not the label

### Design Anti-Patterns (NEVER do these)

- No basic/flat color buttons if a dynamic state makes sense (use glowing states for selected severity)
- No rounded-everything pill shapes (selective use of border-radius, not universal)
- No jerky/linear animations - tactile interactions use framer-motion springs; scroll/section entries use the cubic-bezier curves in Transitions
- No emoji as UI elements - use Phosphor Icons (@phosphor-icons/react) or clean inline SVGs
- No emoticon faces (😊 😐 😖) anywhere - severity is expressed via the Severity Glyph System (see Frontend Aesthetics), never via faces. Faces read as pediatric pain-scale posters and undermine the "refined medical tool for adults" positioning.
- No "wellness app" pastel palette. Only use vibrant, saturated colors for active/selected states.
- No noise/grain textures on interactive surfaces (cards, chips, buttons, inputs, modals, text containers). Paper-grain noise at ≤0.04 opacity on the base background shell is permitted and specified - see Backgrounds & Visual Details.
- No card-heavy layouts as default grouping - see Grouping Patterns above. When elevation is justified, the container must use the Double-Bezel architecture; cards stay reserved for independently actionable units (swipe, long-press, tap-as-unit).
- No generic health iconography (hearts, plus signs, stethoscopes)
- No pure black (#000000) - use `--text-primary` (#1A1A1A)
- No AI purple/blue aesthetic - no neon gradients, no neon box-shadows on cards or buttons. The severity-chip pulse/glow defined in Backgrounds & Visual Details is the one sanctioned glow effect — do not strip it.
- Always embrace fully saturated colors for active/selected states, ensuring text stays pure `#ffffff` white against them.
- No generic 3-column equal card rows for feature sections
- No generic placeholder data - use realistic, messy numbers (47.2%, not 99.99%)
- No filler copy: "Elevate", "Seamless", "Unleash", "Next-Gen", "Empower"
- No toggle/yes-no type for symptoms - all symptoms use the SeverityChipSelector. No exceptions.
- No drag gestures for severity input - use the SeverityChipSelector (5-chip tap pattern: None - Mild - Medium - Severe - Extreme). One deliberate tap commits. Chips use value scale 0-4 (0 = None/unlogged, 1 = Mild, 2 = Medium, 3 = Severe, 4 = Extreme). This also applies to context fields (sleep quality, stress level) - they share the same chip selector with `onChange(v === 0 ? undefined : v)` to treat None as "not captured".

### Writing Style Rules (AI tells — NEVER do these)

These patterns mark text as AI-generated and erode the authored, editorial voice of SymptomSleuth. They are banned in all code comments, JSX string content, copy, and documentation.

**Punctuation tells:**
- No em dashes (—). Use a hyphen (-), colon (:), or restructure the sentence. There are zero em dashes in this codebase and it must stay that way.
- No en dashes (–) used as em dashes. Plain hyphen only.
- No ellipsis (...) used for dramatic pause. Write complete sentences.

**Vocabulary tells (banned words and phrases):**
- "Delve", "dive deep", "dive into"
- "In the realm of", "in the world of"
- "It is worth noting", "it is important to note", "notably"
- "Furthermore", "moreover", "additionally" (use plain "and" or restructure)
- "In conclusion", "to summarize", "in summary"
- "Seamless", "seamlessly"
- "Elevate", "elevate your experience"
- "Unleash", "unlock your potential" (product unlock CTAs are fine; this bans the generic empowerment framing)
- "Leverage" (use "use")
- "Utilize" (use "use")
- "Facilitate" (use "help" or "let")
- "Robust", "comprehensive solution"
- "Cutting-edge", "state-of-the-art", "next-gen"
- "Empower", "empower users"
- "Holistic approach"
- "Streamline", "streamlined"
- "At the end of the day"
- "Move the needle"
- "Game-changer", "game-changing"
- "Best-in-class"
- "Innovative solution"

**Structural tells:**
- No bullet lists where prose reads better. If listing 2 items, write a sentence.
- No rhetorical questions as section openers ("What makes SymptomSleuth different?")
- No self-congratulatory framing ("SymptomSleuth is the only app that...")
- No hedging qualifiers on direct statements ("This might help users to potentially...")
- No Oxford summary closers ("In summary, SymptomSleuth helps chronic illness patients...")

**Tone calibration:**
- Write as an engineer or editor, not a product marketer.
- Comments explain the *why*, not the *what*. If the code is clear, no comment is needed.
- Copy speaks directly to the user. No passive voice. No corporate warmth.
- The voice is calm, authored, adult. Not cheerful. Not clinical-cold. Not startup-excited.

### Technical CSS & Layout Guardrails

- **Viewport height:** NEVER use `h-screen`. ALWAYS use `min-h-[100dvh]` to prevent layout jumping on iOS Safari.
- **Grid over flex math:** NEVER use complex flexbox percentage math (`w-[calc(33%-1rem)]`). Use CSS Grid (`grid grid-cols-X gap-Y`).
- **Hardware acceleration:** Never animate `top`, `left`, `width`, or `height`. Animate exclusively via `transform` and `opacity`.
- **Z-index discipline:** Use z-index only for systemic layers (sticky nav, modals, overlays). No arbitrary `z-50` scattered through components.
- **Shadows:** Tint shadows warm to match background hue - not default gray/black. Use `0 1px 3px rgba(26,26,26,0.06)`.
- **Tailwind version:** Check `package.json` before using any Tailwind syntax. Do not mix v3/v4 conventions.
- **Dependency verification:** Before importing ANY third-party library, check `package.json`. If missing, install it first.
- **Form patterns:** Labels above inputs. Helper text optional. Error text below input. Standard `gap-2` for input blocks.

### Required UI States (every interactive component must implement all four)

- **Loading:** Skeleton loaders matching the component's layout shape - no generic circular spinners
- **Empty:** Composed empty states with clear one-line guidance on how to populate data
- **Error:** Inline error messages (not toast notifications for form errors)
- **Active/pressed:** On `:active`, use `scale-[0.98]` or `-translate-y-[1px]` for tactile feedback on buttons

### Design Tokens

**Colors ("Editorial Stationery" palette — current aesthetic benchmark):**

```css
--bg-primary: #F7F6EF        /* warm paper */
--bg-surface: #FFFFFF
--header-bg: #2D6A4F          /* deep sage band on global App Header (darkens to surface in dark mode) */
--text-primary: #1A1A1A
--text-secondary: #6B6B6B
--accent: #2D6A4F             /* deep sage green */
--accent-light: #D8F3DC
--severity-0-fill: transparent          /* unlogged - no fill */
--severity-0-border: #737373            /* richer grey ring - unlogged state */
--severity-1: #00A36C                   /* Rich Green - Mild */
--severity-2: #007AFF                   /* True Blue - Medium (only non-warm hue in the app) */
--severity-3: #FFB600                   /* Rich Gold - Severe-low */
--severity-4: #F95700                   /* Rich Orange - Severe */
--severity-5: #E60000                   /* Rich Red - Extreme (legacy value=5 only; chips top out at 4) */
--context-slider-low: #D1D1CE          /* neutral warm gray - context sliders only (legacy) */
--context-slider-high: #4A4A4A         /* dark warm gray - context sliders only (legacy) */
--border: #E8E8E4
--premium-locked: #F5F5F0
--community: #4A90A4          /* muted teal for community insights */
--paper-noise-opacity: 0.03   /* warm paper grain on base background only */
--shadow: 0 1px 3px rgba(26,26,26,0.06)
```

**Theme system:** All color decisions must reference CSS variables, never hardcoded hex. Dark mode is implemented as a token swap under `[data-theme="dark"]` and `@media (prefers-color-scheme: dark)` in `app/globals.css` — it is not a feature flag and not optional code. When tidying or auditing, do not delete dark-mode token overrides as orphan code.

**CRITICAL - Severity visual states:**
The distinction between severity-0 (unlogged/None) and severity-1 (Mild) must always be visually unambiguous. Unlogged = absence of data. Mild = a real reading. The severity color scale (green → red) is semantically reserved for symptom severity only. Context fields (sleep quality, stress level) share the SeverityChipSelector for input; their stored values follow the same 1–4 scale (undefined when not captured). The `--context-slider-low` / `--context-slider-high` tokens are legacy and no longer used in production components.

**Fonts (via next/font/google):**

- Display/Headers: Fraunces (variable)
- Body/UI: DM Sans (400, 500, 600)
- Data/Numbers: DM Mono

**Spacing & Layout:**

- Max content width: 480px
- Tap targets: minimum 48x48px
- Bottom tab navigation: Log, Insights, Report, Account (four tabs)
- Vertical rhythm: minimum 12px between log rows (grouped), 16px between ungrouped rows, 24px between sections

**Transitions (ALL existing and future components):**

- Chip tap / severity commit: `cubic-bezier(0.16, 1, 0.3, 1)` 150ms (same curve as tap feedback - chip bg/border color change)
- Collapse/expand sections: `cubic-bezier(0.16, 1, 0.3, 1)` 400ms
- Save confirmation pulse: `cubic-bezier(0.32, 0.72, 0, 1)` 600ms
- Scroll entry animations: `cubic-bezier(0.32, 0.72, 0, 1)` 600ms
- Tap feedback (buttons): `cubic-bezier(0.16, 1, 0.3, 1)` 150ms
- Bottom sheets: `cubic-bezier(0.32, 0.72, 0, 1)` 300ms
- Skeleton shimmer: CSS gradient animation, 2s cycle, ease-in-out (exception - shimmer only)
- Countdown drain bars: `linear` timing permitted - a timer must deplete at a constant rate to read as a timer. Current use: `SaveConfirmModal` 4-second auto-dismiss bar.
- Tactile spring physics (framer-motion) are REQUIRED on severity chips and primary CTAs - that is what gives the interface its "living journal" feel.
- BANNED for scroll/section entries and CSS transitions: `linear` (except shimmer and countdown drain), `ease-in-out`, `ease-out`, overshoot, any JS per-frame animation. Springs are scoped to framer-motion micro-interactions only.

### Premium Craft Patterns

**These apply to ALL existing and future components - including everything built in Prompts 1–3. When revisiting any component, audit it against these patterns and retrofit where missing.**

---

**1. Double-Bezel Architecture (Doppelrand) - retrofit ALL major containers**

Every interactive container - symptom rows, condition cards, context section, paywall card, insight cards, the Save button, input fields, the bottom nav - must use nested enclosure. Elements must look physical, not painted onto a flat surface.

**Do not hardcode bezel values. Always use the CSS variables defined in `app/globals.css`. They adapt automatically to dark mode.**

```
Outer shell: padding 6px  border-radius 1.25rem
  box-shadow: 0 0 0 1px var(--bezel-ring)          ← adapts in dark mode
  background-color: var(--bezel-outer-bg)           ← adapts in dark mode

Inner core:  border-radius 0.875rem  (= 1.25rem − 0.375rem, concentric-smaller)
  background-color: var(--bg-surface)
  box-shadow: var(--bezel-inset-shadow)             ← none in dark mode (no white highlight)
```

**CSS utility classes** (preferred for new components — avoids inline repetition):
```html
<div class="bezel-outer">
  <div class="bezel-inner p-4">
    content
  </div>
</div>
```

**Token values** (defined in `:root` and `[data-theme="dark"]` in `globals.css`):

| Token | Light | Dark |
|---|---|---|
| `--bezel-outer-bg` | `rgba(255,255,255,0.6)` | `var(--bg-surface)` |
| `--bezel-ring` | `rgba(0,0,0,0.06)` | `var(--border)` |
| `--bezel-inset-shadow` | `inset 0 1px 1px rgba(255,255,255,0.9)` | `none` |

**Never hardcode** `rgba(255,255,255,0.6)`, `rgba(0,0,0,0.06)`, or `inset 0 1px 1px rgba(255,255,255,0.9)` in component files. Onboarding screens (ConditionSelect, SymptomSetup, TrialConfirmation) and all app components use the tokens above.

- **Symptom rows:** outer shell wraps each row group, inner core holds the name + slider
- **Condition cards (onboarding):** outer shell with green tint when selected (`ring-[--accent]/20 bg-[--accent-light]/30`)
- **Context section:** outer shell for the entire collapsed/expanded block
- **Save/Update button:** outer shell is the button boundary, inner core is the label + icon container
- **Bottom nav:** outer shell as the nav container, inner core for the active tab pill

---

**2. Button-in-Button Trailing Icon - retrofit all primary CTAs**

The trailing icon (arrow, checkmark, chevron) on any primary CTA must NEVER sit naked beside the text. It must be nested inside its own circular wrapper, flush to the button's inner right padding.

```tsx
<button className="flex items-center gap-3 px-5 py-3 rounded-[1.25rem] bg-[--accent] ...">
  <span>Save Log</span>
  <span className="w-7 h-7 rounded-full bg-black/[0.12] flex items-center justify-center
                   group-hover:translate-x-0.5 group-hover:-translate-y-px
                   transition-transform duration-150 cubic-bezier(0.16,1,0.3,1)">
    <CheckCircle size={14} weight="light" />
  </span>
</button>
```

Apply to: Save button, Generate Report, Upgrade CTAs, Continue (onboarding), Start Logging.

---

**3. Eyebrow Tags - retrofit all section labels and metadata text**

Replace any plain secondary-color text used as a section label, badge, or metadata indicator with a proper pill eyebrow tag.

```tsx
<span className="inline-flex items-center rounded-full px-2.5 py-0.5
                 text-[10px] uppercase tracking-[0.15em] font-medium
                 bg-[--accent-light] text-[--accent]">
  Optional
</span>
```

Apply to: "Optional" label on context section, condition group headers, "Day X" streak counter, community sample size badge, "Save 40%" badge on annual plan, any section header that currently reads as plain small text.

For neutral/non-accent contexts (e.g., community data, locked features), use:
```
bg-[--border] text-[--text-secondary]
```

---

**4. Scroll Entry Animations - retrofit all major section entries**

No element should appear statically on load or scroll. Use IntersectionObserver (never `window.addEventListener('scroll')` - causes continuous reflows and kills mobile performance).

Entry pattern for all major UI blocks:
```css
/* Initial state */
transform: translateY(2rem);
filter: blur(4px);
opacity: 0;

/* Resolved state (on intersection) */
transform: translateY(0);
filter: blur(0);
opacity: 1;
transition: all 600ms cubic-bezier(0.32, 0.72, 0, 1);
```

Stagger: 100ms delay per item in lists (condition cards, symptom rows, insight cards, feature list on paywall).

Apply to:
- Onboarding: condition cards stagger in on Screen 1
- Daily Log: symptom groups stagger in on load
- Timeline: chart and daily log list items
- Insights: correlation cards, comparison bars

### Insights Tab Order

The Insights segmented control renders tabs in this order: **Sleuth AI - Timeline - Community**. Sleuth AI is rendered first because it is the premium differentiator. **Default active segment on cold open is Timeline** — Timeline carries existing navigation muscle memory and is the lowest-friction surface for the daily reflective loop. The Sleuth AI segment is one tap away.
- Paywall: feature list items, pricing options
- Landing page: all sections

---

**5. Magnetic Button Physics - retrofit all interactive buttons**

On hover/active, buttons must simulate physical pressing - not just color change.

```tsx
// On the button element:
className="group active:scale-[0.98] transition-transform duration-150 cubic-bezier(0.16,1,0.3,1)"

// On the trailing icon circle:
className="group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-[1.05]
           transition-transform duration-150 cubic-bezier(0.16,1,0.3,1)"
```

The nested icon circle translates diagonally on hover, creating internal kinetic tension that registers as quality without being animated noise.

---

**6. Macro-Whitespace - landing page and Upgrade screen only**

Inside the app shell (Log, Insights, Report, Account): keep existing 12–24px rhythm - users in pain need proximity between related items.

On the landing page (`app/page.tsx`) and Upgrade screen (`app/(app)/upgrade/page.tsx`): minimum `py-24` between sections. Let the design breathe heavily. The whitespace IS the premium signal on marketing surfaces.

---

**7. `backdrop-blur` - only on fixed/sticky elements**

Never apply `backdrop-blur` to scrolling containers or large content areas - causes continuous GPU repaints and severe mobile frame drops.

Permitted uses only:
- Bottom nav bar (fixed)
- Collapsed group header when sticky while user scrolls within the group (`backdrop-blur-sm` - subtle)
- Modal/overlay backgrounds
- Install prompt banner (fixed)

---

**Pre-Retrofit Checklist (run against every existing component)**

Before marking any component done, verify:
- [ ] Major containers use Double-Bezel (outer shell + inner core with inset highlight)
- [ ] Primary CTAs use Button-in-Button trailing icon with hover physics
- [ ] Section labels / badges use eyebrow pill tags
- [ ] All entry animations use IntersectionObserver with translate-y + blur + opacity pattern
- [ ] All transitions use specified cubic-bezier curves - no `ease-out`, no `ease-in-out`
- [ ] `backdrop-blur` only on fixed/sticky elements
- [ ] `active:scale-[0.98]` on all tappable elements
- [ ] No `will-change` on non-animating elements

## Architecture

### Data Model (localStorage - personal data, never leaves device)

```typescript
interface AppState {
  version: 5;                       // schema version for migrations (bumped for auth-flow restructure)
  profile: {
    userId?: string;                // local UUID pre-account; Supabase auth.uid after /welcome migration
    email?: string;                 // collected at Stripe Checkout - billing + recovery email
    supabaseLinked: boolean;        // true once /welcome successfully migrated data into Supabase
    awaitingAccountSetup: boolean;  // true after payment, until /welcome completes account setup
    stripeCustomerId?: string;      // Stripe Customer ID
    conditions: string[];           // e.g., ["Migraine", "IBS"]
    symptoms: Symptom[];            // per-condition symptom list
    createdAt: string;              // ISO date - onboarding start
    trialEndsAt?: string;           // ISO date - createdAt + 7 or 14 days, set by Stripe
    premium: PremiumStatus;
    communityOptIn: boolean;        // defaults to true. Toggle lives in Settings → Privacy only.
    aiUnlockedAt?: string;          // ISO date - first moment loggedDays >= 14 AND totalLogs >= 20
    aiUsage?: AIUsage;              // rolling-24h message counter, client-side rate-limit state
  };
  logs: DailyLog[];
}

interface AIUsage {
  messages: { sentAt: string }[];   // ISO timestamps of AI messages sent in the last 24h. Prune entries older than 24h on every read. Max length 20 within any 24h window.
}

interface PremiumStatus {
  type: 'none' | 'monthly' | 'annual' | 'lifetime';
  stripeSubscriptionId?: string;    // annual/monthly only
  stripeCustomerId?: string;        // tracked on the profile for all paid types
  expiresAt?: string;               // ISO date - current period end (annual/monthly). Undefined for lifetime — lifetime never expires.
}

interface Symptom {
  id: string;                       // uuid
  name: string;                     // e.g., "Headache intensity"
  condition: string;                // parent condition name - used for grouping in the log screen
  // NOTE: No 'type' field. All symptoms use 1–5 severity. No yes/no toggle type.
}

interface DailyLog {
  date: string;                     // YYYY-MM-DD
  entries: SymptomEntry[];
  context?: DailyContext;
  note?: string;
  loggedAt: string;                 // ISO timestamp
}

interface SymptomEntry {
  symptomId: string;
  value: number;                    // SeverityChipSelector scale: 0 = None/unlogged (never stored - omit entry), 1 = Mild, 2 = Medium, 3 = Severe, 4 = Extreme. Legacy logs may store 5 (treat as Extreme/4 on display).
}

interface DailyContext {
  sleepQuality?: number;            // 1–4 (SeverityChipSelector; undefined = not captured)
  stressLevel?: number;             // 1–4 (SeverityChipSelector; undefined = not captured)
  exercise?: boolean;               // yes/no - the one remaining boolean field
  menstrualCycleDay?: number;       // only for PCOS/endo users
  foodTriggers?: string[];          // e.g. ["Dairy", "Gluten"] - selected from fixed list
}
```

### Anonymous Community Data Model (Supabase - aggregated, no PII)

```typescript
// What gets sent to Supabase on each save (if communityOptIn === true)
interface AnonymousLogEntry {
  condition: string;
  symptomName: string;
  value: number;                    // 1–4 (chip levels: 1=Mild, 2=Medium, 3=Severe, 4=Extreme). Legacy entries may store 5 (treat as 4).
  weekOf: string;                   // ISO week (YYYY-Wnn) - never more specific than week
  context?: {
    sleepQuality?: number;
    stressLevel?: number;
    exercise?: boolean;
    foodTriggers?: string[];        // included in community data for correlation analysis
  };
  // NO user ID, NO device ID, NO timestamp more specific than week
  // NO symptomType field (all severity now)
  // NO free-text notes
}

interface ConditionAggregate {
  condition: string;
  totalActiveUsers: number;
  symptoms: SymptomAggregate[];
  correlations: Correlation[];
  updatedAt: string;
}

interface SymptomAggregate {
  symptomName: string;
  trackingCount: number;
  avgSeverity: number;
  severityDistribution: number[];   // [count_1, count_2, count_3, count_4, count_5]
  trendDirection: 'improving' | 'stable' | 'worsening';
}

interface Correlation {
  factorA: string;
  factorB: string;
  percentage: number;
  sampleSize: number;
}
```

### Community Intelligence - Minimum Thresholds

- Community insights are available to ALL users regardless of premium status (see Trial Logic > Community access rationale).
- Do NOT display community insights for any condition with fewer than 50 active users
- Below threshold: "We need more [Condition] users logging to surface community patterns."
- Correlations require minimum 200 data points
- All percentages rounded to nearest whole number - no false precision
- Every insight card includes sample size: "Based on 3,200 migraine users"

### AI Sleuth - Access, Cost, and Safety

**Access model:**
- AI chat ("Sleuth") unlocks when `loggedDaysCount >= 14` AND `totalLogEntries >= 20`, AND user is premium.
- The dual data gate prevents low-signal users from hitting a useless AI experience that damages trust.
- Previews and data-derived teasers shown below threshold are computed client-side from localStorage - zero API spend on non-premium or below-threshold users.

**Model and cost:**
- Model: `claude-sonnet-4-5-20250929` (Sonnet 4.5). Sonnet over Haiku because chronic illness reasoning quality directly affects trust and safety - pattern recognition across symptoms, medication mentions, and "see a doctor" flags.
- Prompt caching: user's logs + system prompt cached for 5 minutes per session. First message pays full input cost; subsequent messages in session hit cached tokens at 10% of base rate.
- Expected cost per active AI user: ~$0.30/month at 20 messages/month with caching enabled.
- Rate limit: 20 messages per rolling 24h, enforced client-side via `profile.aiUsage.messages[]`. When limit hit, input is replaced with a reset countdown - no upgrade CTA (user already paid).

**Input payload:**
- System prompt with medical safety scaffolding (see utils/aiSystemPrompt.ts - do not include in this doc, treat as a build-time file)
- User's last 90 days of structured logs (symptoms, severity, context, food triggers). Notes fields are EXCLUDED by default - only included if the user's question explicitly references a note.
- Last 5 conversation turns for context.
- User's new question.
- Typical total: ~8,000 input tokens / ~500 output tokens per message.

**Safety rules enforced in the system prompt:**
- Never diagnose. Never recommend medications or dosages. Never interpret medication interactions.
- If the user's question implies a medical emergency (suicidal ideation, chest pain, stroke symptoms, severe allergic reaction), respond with a brief acknowledgment and direct them to emergency services - do not pattern-analyze.
- Always frame insights as "patterns in your data" not "diagnoses."
- If asked something unanswerable from the data (e.g., "why do I have migraines"), acknowledge the limit and redirect to pattern-level observations.
- Include a soft footer on every response: "This is pattern observation from your logged data, not medical advice."

**Conversation persistence:**
- Session-scoped only. React state holds the turns; navigation away from Insights or tab close clears the conversation.
- We do NOT persist conversations to the server. Persistence would inflate input tokens over time (direct cost) and require server storage of health-adjacent queries (liability and privacy cost). Session-scoped is correct for v1.
- A subtle "New conversation" text button (top-right of AIChat, DM Sans 12px `--text-secondary`) clears the current session without confirmation.

### Trial Logic

```
trialStartDate = profile.createdAt
trialLengthDays = (selected plan === 'annual') ? 14 : 7   // lifetime has no trial
trialEndDate = trialStartDate + trialLengthDays
isTrialActive = now < trialEndDate  // lifetime bypasses this - immediate access

isPremium:
  - If premium.type === 'lifetime' → true (never expires)
  - If premium.type === 'monthly' && premium.expiresAt > now → true
  - If premium.type === 'annual' && premium.expiresAt > now → true
  - If isTrialActive (profile.trialEndsAt > now, or trialEndsAt not set and createdAt + 7d > now) → true
  - Otherwise → false

isAIThresholdMet:
  - loggedDaysCount = count of distinct YYYY-MM-DD dates in logs[]
  - totalLogEntries = sum of entries.length across logs[]
  - Returns (loggedDaysCount >= 14) AND (totalLogEntries >= 20)
  - When this first returns true, set profile.aiUnlockedAt = now()

hasAIAccess:
  - isAIThresholdMet AND isPremium → true
  - Otherwise → false

If NOT isPremium:
  - Timeline chart: show last 7 days only, rest blurred with upgrade CTA
  - Doctor Report: locked entirely
  - Insights screen: community layer is AVAILABLE (was previously fully locked - see "Community access" below). AI Sleuth card shows the locked paywall state with a data-derived teaser.
  - Daily logging: always available (never lock data entry)
  - Context fields: always available
  - Multi-condition: locked to first condition only

If NOT isAIThresholdMet (regardless of premium):
  - Insights screen: shows State B preview (AIPreviewCard + ProgressToUnlock + Community). AI chat surface is NOT interactive yet.

Community access rationale:
  - Insights is now the default landing tab from day 4 onward (see Insights screen spec).
  - Locking community behind premium would mean the default landing for free-tier users past day 4 is a paywall - a churn pattern.
  - Community insights stay free for all users. The AI chat layer is the premium-gated surface within Insights.
```

### Default Landing Tab Logic

```
The app shell (app/(app)/layout.tsx) selects the default landing tab on each cold open:
  - If loggedDaysCount < 4 → default landing = /log
  - If loggedDaysCount >= 4 → default landing = /insights
  - User's last-visited tab is always remembered within a session; this rule applies on cold app open only.

Rationale: In the habit-formation phase (days 0–3), the primary job is "record and leave." From day 4 onward, the question users carry between sessions shifts to "what is my data telling me?" - and Insights becomes the reflective daily loop that drives retention.
```

### Zero-Knowledge Sync & Key Escrow

SymptomSleuth uses end-to-end encrypted cloud sync. The server stores only an encrypted blob - it cannot decrypt personal health data under any circumstances.

User identity is created at `/welcome` after Stripe payment succeeds. The flow:
1. User enters their billing email inside Stripe Elements; payment confirms (SetupIntent for sub plans, PaymentIntent for lifetime).
2. The `/welcome` page transitions to State 2 ("Secure your data") with the billing email pre-filled and read-only.
3. User picks a password (min 8 chars, confirmed) → `supabase.auth.signUp({ email, password })`. Supabase returns an active session immediately because email-confirmation is disabled on the project.
4. `auth.uid` becomes `profile.userId`; `migrateLocalData` upserts the profile row and any captured `daily_logs`; user routes to `/log`.

Google OAuth is offered as a one-tap alternative on the same `/welcome` State 2 surface, and on the landing page for returning members. Returning members on the landing page sign in with email + password (`signInWithPassword`) and use a "Forgot password?" link if they need recovery. Password reset emails the only recovery link (`resetPasswordForEmail` → `/auth/reset`); we do not use magic links anywhere else.

```
Key generation (first onboarding - after card collected):
1. Generate a 256-bit encryption key via Web Crypto API (crypto.subtle.generateKey, AES-GCM non-extractable)
2. Export the raw key bytes (JWK format) - this will be wrapped for server storage
3. User sets a 6-digit recovery PIN
4. Wrap the key: AES-KW(rawKey, PBKDF2(PIN + userId + SERVER_PEPPER, 100k iterations))
5. POST wrapped key to /api/sync/store-wrapped-key - server stores only the wrapped form
6. Key itself is stored in IndexedDB (non-exportable CryptoKey) - never in localStorage

Sync push (after every Save):
1. Serialize AppState to JSON
2. Encrypt with the local CryptoKey (AES-256-GCM, random IV per write)
3. POST { userId, iv_b64, ciphertext_b64 } to /api/sync/push
4. Server stores encrypted blob in encrypted_profiles table by userId (upsert)

Sync pull (new device, after sign-in):
1. User signs in with Google or email + password → Supabase Auth session established
2. Prompt for 6-digit recovery PIN
3. Fetch wrapped key from server: GET /api/sync/wrapped-key
4. Rate limit: max 10 PIN attempts; lockout after 10 failures until re-auth
5. Unwrap: derive wrapping key from PIN + userId + SERVER_PEPPER → AES-KW unwrap
6. Store CryptoKey in IndexedDB
7. GET /api/sync/pull → decrypt blob → hydrate AppState

Recovery chain:
  Forgot PIN → re-authenticate with Google or email + password (or password reset) → reset PIN → new key setup
```

**Supabase schema additions:**
```sql
-- Encrypted profile blob (one row per user - upsert on every push)
CREATE TABLE encrypted_profiles (
  user_id   uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  blob      text NOT NULL,   -- base64(AES-256-GCM ciphertext)
  iv        text NOT NULL,   -- base64(12-byte IV)
  updated_at timestamptz DEFAULT now()
);

-- Server-side AES-wrapped encryption keys
CREATE TABLE wrapped_keys (
  user_id     uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  wrapped_key text NOT NULL,  -- base64(AES-KW wrapped 256-bit key)
  pin_attempts integer DEFAULT 0,
  locked_until timestamptz
);

-- Row-Level Security: users can only read/write their own rows
ALTER TABLE encrypted_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE wrapped_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own row" ON encrypted_profiles USING (auth.uid() = user_id);
CREATE POLICY "own row" ON wrapped_keys USING (auth.uid() = user_id);
```

**New env vars required:**
```
SYNC_SERVER_PEPPER=<random 32-byte hex string, generated at deploy time>
```

**0. App Header (shared across all screens inside the app shell)**

A single global header renders at the top of every screen inside `app/(app)/layout.tsx`. It is the primary brand surface and must read clearly in UGC screen-recordings and screenshots.

- **Height:** 72px fixed. Never collapses on scroll.
- **Background:** `--header-bg` (defaults to `--accent` #2D6A4F at full saturation in light mode; swaps to a dark surface tone in dark mode). The deep sage green is the brand's most memorable pigment in light mode and must stay bold for UGC recognition. Add a 1px bottom border in `--accent` at 60% brightness to give the band a subtle edge (not a hard line).
- **Wordmark:** Use the existing SymptomSleuth logomark - two-line "SYMPTOM SLEUTH" with the magnifying glass curling around the tail of the "S" (following the trail of symptoms). The mark is already authored and must NOT be recreated, redrawn, or substituted. Ship it as a static asset (`public/brand/wordmark.svg`) and render it via `components/brand/Wordmark.tsx` as a thin wrapper (simple `<img>` or inline include - no proportional changes, no restyling). Required sizing in the header: 48px tall, left-aligned with 20px left padding, vertically centered in the 72px band. The wordmark must remain clearly legible at header size for UGC screen-recordings and TikTok content.
- **Streak badge (right side):** `StreakBadge` component, right-aligned with 20px right padding. Renders as a translucent white pill - `bg-white/20 backdrop-blur-sm` with 1px ring at `white/30`. Inside: a small inline-stroke SVG flame (14px, white fill) + DM Mono 12px number. Shows from Day 1. At 55% opacity when today has not been logged yet (motivational dimming). Eyebrow-adjacent in language: the number wears the authority, the flame is a whisper.
- **NO icons, menu buttons, or other chrome in the header.** The wordmark and streak own the band. Navigation lives in the bottom nav only.

The deep green band is load-bearing for brand recognition in UGC and TikTok content. Do NOT desaturate it, do NOT replace it with a cream tone, do NOT shrink the wordmark. This is the one screen element that reads instantly as "SymptomSleuth" at thumb-size preview.

---

### Key Screens

**1. Onboarding (3 screens, ~30 seconds)**

Onboarding is now plan-first, account-last. New users complete condition + symptom setup in localStorage only, then pick a plan and pay. Account creation happens at `/welcome` after successful payment. Community opt-in is removed from onboarding and now only lives in Settings → Privacy.

Screen 0 - Landing (`app/page.tsx`):
- Keep the existing hero, value-prop, privacy, and pricing sections.
- Primary CTA stays "Start free trial" → `/onboarding`.
- Below the hero CTA, appended after the reassurance line: a hairline rule, a "Already a member?" label, "Continue with Google" (Supabase OAuth), an OR divider, an email + password form (`signInWithPassword`), and a "Forgot password?" text link beneath the submit button.
- "Forgot password?" calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/auth/reset' })`. The recovery email is the only place we still use a Supabase email link.
- Sign-in returns to `/auth/callback`, which looks up the profile: found → `/log`; not found → `/upgrade?missing=1` with a banner reading "No account found. Start your free trial below."

Screen 1 - Condition Select:
- Grid of tappable condition cards. Multi-select.
- Unselected = light border. Selected = sage green border + faint green wash.
- Typography-forward - condition name does the work, no icon.
- "Continue" enabled when at least one selected.

Screen 2 - Symptom Setup:
- Pre-populated symptom suggestions from utils/symptoms.ts, based on selected conditions.
- User toggles suggestions on/off, adds custom symptoms via "Add symptom" input.
- Each symptom row shows: symptom name + on/off toggle (whether to track it). No type selector - all symptoms are severity 1–5.
- List-like, not card-per-symptom. Think settings screen.

Screen 3 - Trial Confirmation (`TrialConfirmation.tsx`):
- Heading: "You're ready." Subheading: "Pick a plan to start your free trial."
- Short list of what the trial includes (symptom logging, community patterns, AI Sleuth unlock at 14 days, doctor report).
- CTA: "Choose your plan" → persists conditions + symptoms to localStorage and navigates to `/upgrade`.
- No card collection in onboarding. Payment happens inside Stripe Checkout.

There is no community opt-in step in onboarding. `profile.communityOptIn` defaults to `true` in AppState and `profiles` rows. The toggle is surfaced only in Settings → Privacy on the Account tab.

**Payment + Account Setup (`/welcome`)**

Payment and account creation both live on `/welcome`, which sits outside the `(app)/` shell so there is no bottom nav. There is no redirect to Stripe-hosted Checkout; card collection is inline via Stripe Elements on SymptomSleuth's own page. The page has two sequential states driven by the client-side `profile.premium.type` value:

*State 1 - Payment (before `profile.premium.type !== "none"`).* Requires `?plan=annual|monthly|lifetime` in the URL; missing plan redirects back to `/upgrade`.

- Heading: "Add a card." Subheading varies by plan ("No charge today. Cancel anytime during your free trial." for sub, "One payment. Never expires." for lifetime).
- Plan summary card (name + price + trial language).
- Stripe `<PaymentElement>` inside a double-bezel container. Annual/Monthly use a SetupIntent (no charge, payment method saved for the trial-end charge); Lifetime uses a PaymentIntent that charges $79.99 immediately.
- Single "Email" input above the card. CTA copy is plan-specific ("Start free trial" for sub, "Pay $79.99" for lifetime).
- On submit the client calls `stripe.confirmSetup` or `stripe.confirmPayment` with `redirect: 'if_required'` (3DS is the only reason we leave the page), then posts the intent id to `/api/activate-plan` which creates the Stripe customer, attaches the payment method, and (for subscriptions) creates the subscription with `trial_period_days`. The server response is dispatched as `SET_TRIAL_DATA` or `SET_LIFETIME`, both of which set `awaitingAccountSetup: true`.

*State 2 - Account auth (after payment succeeds, before `supabaseLinked`).*

- Heading: "Secure your data before we start." Subheading: "Create your account so your symptom history syncs across devices and is never lost."
- "Continue with Google" button at the top, then an OR divider, then a form: read-only email (pre-filled from billing), password (min 8), confirm password, "Create account" submit. Form calls `supabase.auth.signUp({ email, password })`. Supabase must have "Confirm email" disabled — Stripe already verified the email and we don't want a second email round-trip.
- Trust line: "Your logs are encrypted. We cannot read them."
- No skip option. The `(app)/layout.tsx` guard redirects back to `/welcome` from every app route while `awaitingAccountSetup` is true.

On successful sign-up or Google sign-in at `/welcome`:
1. Supabase establishes the auth session.
2. `migrateLocalData(userId, state)` (in `utils/migrateLocalData.ts`) upserts the `profiles` row, then inserts any `daily_logs` captured before migration. On any failure, localStorage is NOT cleared and the user sees a retry button. On success, `profile.userId` is set to `auth.uid()`, `supabaseLinked` flips to `true`, `awaitingAccountSetup` to `false`, and the user is routed to `/log`.

**Abandonment recovery:** No webhook-driven provisional profile is needed because the Stripe confirm happens on-page. If the user closes the tab between payment and account-auth, `awaitingAccountSetup` is already persisted in localStorage - the next visit lands on `/welcome` via the `(app)/layout` guard and resumes at State 2. The Stripe webhook (`/api/stripe-webhook`) only handles post-activation subscription lifecycle (`customer.subscription.deleted`, `invoice.payment_failed`).

**2. Daily Log (the core loop - 10 seconds)**

The Log screen is now an editorial journal entry. Top-to-bottom layout inside the main content area (beneath the global App Header):

**Hero date treatment (Fraunces 44px, weight 400):**
- Primary line: full date in Fraunces - "Tuesday, April 21"
- Secondary line beneath, DM Mono 12px `--text-secondary`: dynamic context string
  - Day 1: "Day 1 · First trail entry"
  - Day 2+ unlogged today: "Day {loggedDaysCount + 1} · Last logged {relativeDate}"
  - Already logged today: "Day {loggedDaysCount} · Logged {relativeTime} - tap to update"
  - `relativeDate` uses "yesterday" / "2 days ago" / "last {Weekday}" / ISO date if > 14 days
- 48px vertical space below the secondary line before the section header.

**Section header with eyebrow:**
- Eyebrow: "TODAY'S LOG" in DM Sans 10px uppercase, tracked `0.15em`, `--text-secondary`, 4px above the heading baseline
- Heading: "Rate Your Symptoms" in Fraunces 24px weight 400
- Body below: "One deliberate tap per symptom." - DM Sans 14px `--text-secondary`. Period, authoritative, not instructional.

**Symptom grouping (CRITICAL) - editorial chapter markers:**

Symptoms are grouped by condition using the **Eyebrow + Hairline chapter-marker pattern** (see Editorial Layout Patterns):
- Each condition group is introduced by a horizontal 1px `--border` hairline rule spanning the card's inner width, with the condition name centered on the rule in DM Sans 10px uppercase, tracked `0.15em`, `--accent` color. 8px negative space around the text so the rule visually breaks around it.
- Do NOT render the condition name as a grey pill or rounded badge. The hairline chapter marker is the canonical treatment.
- If 2+ conditions are selected: each condition group is **collapsed by default**
  - Below the chapter-marker rule (collapsed state): a mini severity preview - a row of small Severity Glyphs (from `utils/severityGlyphs.tsx`) showing today's logged severity per symptom in the group, or the `None` glyph if unlogged. Maximum 5 glyphs shown.
  - Tap the chapter-marker rule to expand. Expanded state persists for the session.
- If 1 condition: all symptoms expanded, no collapse UI. The chapter marker still renders.
- Within an expanded group: each symptom row = name left, SeverityChipSelector right. Vertical padding 12px.

**SeverityChipSelector - the canonical severity input:**

The chip selector replaces all sliders and circle buttons. 5 chips in a horizontal row (None · Mild · Medium · Severe · Extreme), tap-to-commit pattern.

- Each chip: double-bezel architecture (outer shell `ring-1 ring-black/[0.04]` with inner core `bg-[--bg-surface]` and `shadow-[inset_0_1px_1px_rgba(255,255,255,0.9)]`). This gives the chip a tactile upper-left light catch.
- Chip content (vertical stack inside the inner core):
  - Severity Glyph from `utils/severityGlyphs.tsx` (12px, centered) - NOT an emoticon face, NOT a Phosphor icon
  - Label beneath: DM Sans 12px, weight 500
- Chip dimensions: 64px wide × 56px tall (reduced from previous 72px height - tightens the row, feels more deliberate)
- Resting state: a 10% RGBA tint of the chip's own selected severity color over `--bg-surface`, with a 30%-opacity ring of the same hue. Label sits in `--text-primary`, glyph in `--text-secondary`. This is intentional — flat-white resting chips read as inert; tinted chips communicate "the row is alive." Do NOT replace the tint with `--bg-surface` flat fill.
- Hover and Tap states: Background fully floods with the deep, 100% saturated severity color (no pastel, no fade). Label and glyph snap to pure `#ffffff` white.
- Selected state - claimed, not highlighted: Preserves the heavy saturated core color and pure `#ffffff` white text. No fading to pastel, no text going back to dark gray.
- On `:active` (press feedback): `translateY(0.5px)` + `shadow-[inset_0_1px_2px_rgba(0,0,0,0.08)]` - chip feels pressed into the paper. 150ms `cubic-bezier(0.16, 1, 0.3, 1)`.
- Only one chip per symptom row can be selected at a time. Tapping a different chip commits the new value and animates the selected ring from old chip to new (opacity fade both, 200ms).
- Hidden `<input type="radio">` group behind each row for accessibility. Chips are labeled radio buttons semantically.

**Marginalia micro-stats (when data exists):**

For every symptom row with ≥3 logged data points in the user's history:
- Right-aligned inside the row, vertically centered with the chip row, absolute-positioned so it doesn't disturb chip layout
- DM Mono 11px `--text-secondary`
- Content logic:
  - If last log was today: "last: {value}"
  - If last log was within 7 days AND user has ≥7 days of history for this symptom: "7d avg {X.X}"
  - If symptom has 14+ days of history: pick between "7d avg {X.X}" and "trend {↗|↘|→}" by ISO week (deterministic rotation)
- Absent on day 1, absent on symptoms with < 3 logs. Never shown for the Food Triggers section (no severity to aggregate).

**Food Triggers section (open by default):**
- Positioned between the symptom groups and the Context section
- Label: "Food Triggers" with "Optional" eyebrow pill (accent variant)
- 2-column chip grid using the same double-bezel card pattern as onboarding ConditionSelect:
  - Unselected: `0 0 0 1px rgba(0,0,0,0.06)` outer ring, `--bg-surface` inner
  - Selected: `0 0 0 1.5px var(--accent)` outer ring, `rgba(216,243,220,0.5)` inner tint, accent text color
  - Transition: `200ms cubic-bezier(0.16,1,0.3,1)` on box-shadow, background-color, color
- Fixed trigger list: Dairy, Eggs, Poultry, Red Meat, Seafood, Legumes, Cruciferous Veg, Nightshades, Gluten
- No sliders - tap to select/deselect only
- Stored as `context.foodTriggers?: string[]`
- Collapsible (chevron header), but **open by default** (unlike Context which starts collapsed)

**Context section (collapsed by default):**
- Label: "Optional" - secondary text, 11px
- Sleep quality and Stress level: same SeverityChipSelector component, treating the chip scale as a quality/intensity measure. Since this is context (not symptom severity), the chips render in the neutral gray palette rather than the severity colors - selected state uses `--context-slider-high` (#4A4A4A) fill at 25% opacity with a matching 1.5px ring. The severity color scale is reserved for symptoms only.
- Exercise: simple custom-styled toggle switch (boolean - the one remaining toggle)
- Menstrual cycle day: number input, only shown if tracking PCOS or Endometriosis
- Context fields have a subtle left border (`2px solid --border`) to visually separate from symptom rows

**Notes section (collapsed by default):**
- Tap to expand, shows a textarea

**Save button:**
- Full width, sage green, solid (no gradient)
- On tap: button text changes to "Saved" with a CheckCircle icon (Phosphor)
- Row confirmation: each logged symptom row (value > 0) gets a left border flash in `--accent` color - `2px solid`, opacity 1→0, 600ms ease-out
- **Post-save modal:** `SaveConfirmModal` bottom sheet slides up after every successful save. Double-bezel architecture. Shows a randomly selected `LogMessage` from `utils/logMessages.ts` (40 messages: 15 encouraging, 15 tips/instructive, 10 insight/philosophy). Includes the current streak pill inside the modal. A 2px drain bar counts down 4 seconds at the base of the inner bezel (linear timing - permitted for countdown timers, same exception as shimmer). Auto-dismisses at 4s; backdrop tap also dismisses. Heading in Fraunces 22px, body in DM Sans 14px secondary.
- No toast.
- If today already logged: pre-populate values, button reads "Update"
- On save: if communityOptIn, fire AnonymousLogEntry to Supabase background (non-blocking, fire-and-forget)

**3. Timeline (composable segment within Insights)**

Timeline is NOT a standalone page route. Its components live in `components/timeline/` and are rendered inside the Insights screen as the default-selected segment. The `/timeline` URL is a redirect to `/insights` - it has no page component of its own and there is no Timeline tab in the bottom nav.

- Date range tabs: 7D, 30D, 90D, All - text tabs with underline indicator, not pills
- Recharts AreaChart: smooth curves, filled area at 0.1–0.15 opacity (watercolor, not block)
- X-axis: DM Sans, secondary color, small. Y-axis: severity 1–5, minimal faint grid lines.
- All symptoms are severity lines (no binary toggle markers - toggle type removed)
- Remove all default Recharts chrome; restyle to match app aesthetic
- Context overlay: small icons along x-axis (moon, lightning, running figure) - 12px, secondary color, below chart
- Below chart: scrollable list of daily log cards as borderless rows with bottom dividers
- Non-premium: 7D only, older data blurred with CSS backdrop-filter + "Unlock" CTA

**4. Insights (AI Sleuth + Community) - primary reflective surface**

This is the daily "what is my data telling me?" surface. From day 4 onward, this is the default landing tab on cold app open (see Default Landing Tab Logic).

**Architecture - segmented control:** Insights is a single screen with three segments navigated by a compact segmented control rendered directly below the HeroDateBlock in all non-empty states:

- **Timeline** (default) - the date-range chart and daily log list. Uses the composable `TimelineSegment` wrapper from `components/timeline/`. Default-selected on every cold open to preserve existing navigation muscle memory.
- **AI** - the Sleuth AI surface. Contains the four states (A/B/C/D) defined below, based on data threshold and premium status.
- **Community** - shows `CommunityOverview` from `components/insights/`. Free for all users.

The segmented control uses text tabs with an underline indicator in `--accent` (same visual language as the date range tabs). Not pills. Compact row, ~36px height, DM Sans 13px weight 500.

The four states below (A/B/C/D) describe the **AI segment** exclusively. Community always shows CommunityOverview when that segment is active. Timeline always shows the TimelineSegment (with its own premium date-range gate).

**State A - Day 0 (0 logs)**

Single composed empty state. No AI teaser yet - the user hasn't earned the anticipation, and showing a locked AI card on day 0 signals "this app is full of walls."

- Fraunces 44px weight 400: "Your journey starts with one tap."
- DM Mono 12px `--text-secondary` secondary line beneath: "Log today to begin."
- 64px spacer
- Primary CTA (sage green, button-in-button trailing arrow): "Start logging" → routes to /log
- Centered, generous whitespace. No feature preview. No countdown.

**State B - Days 1–13 OR below AI threshold (the Preview State)**

This is the conversion-and-habit screen. It must do three jobs simultaneously: show community value immediately, teach the AI mental model, and create anticipation for the unlock.

Vertical layout, top to bottom (inside the main content area, beneath the App Header):

1. **Hero date/status header** - Fraunces 44px: dynamic text
   - "Your sleuth - Week {N}" where N = `Math.ceil(loggedDaysCount / 7)`, minimum 1
   - DM Mono 12px `--text-secondary` below: "{loggedDaysCount} days logged · {totalLogEntries} entries"

2. **AIPreviewCard** (the hook - topmost section, most visual weight)
   - Double-bezel container (outer shell + inner core + inset highlight, per Premium Craft Patterns)
   - Eyebrow pill (neutral variant - `bg-[--border]` with `text-[--text-secondary]`): "ASK SLEUTH - UNLOCKS IN {X} DAYS"
     - X = `Math.max(0, 14 - loggedDaysCount)`. At 0: "ASK SLEUTH - NEEDS MORE LOGS" (means days threshold met but totalLogEntries < 20).
   - Fraunces 22px weight 400: a rotating sample question in first-person voice. Question rotates by ISO week number + primary condition - deterministic, so a given user sees a new question each week.
   - Examples per condition (write 6–10 per condition in `content/aiSampleQuestions.ts`):
     - Migraine: "What do my evening severity spikes have in common?" / "Is my sleep quality correlated with my headache days?" / "Which food triggers show up most on my worst days?"
     - IBS: "What am I eating on my flare days?" / "Is stress a bigger trigger than food for me?"
     - Fibromyalgia: "Do my low-sleep days become high-pain days?" / "What's my worst symptom been this month?"
   - Beneath the question: a greyed "answer preview" - 3 skeleton bars (NOT fake text, NOT lorem ipsum - just the visual shape of an answer lines). Gradient pulse at 2s cycle, same shimmer spec as loading states.
   - Footer inside the card (DM Sans 12px `--text-secondary`): "Your personal AI unlocks when your data has enough signal to answer you well."
   - The card is NOT tappable (nothing to reveal yet). No padlock icon - this is a preview, not a wall.

3. **ProgressToUnlock** (quiet, single-line strip below the AI card)
   - Thin row, no card container, just text and a hairline progress indicator
   - Left: DM Mono 11px `--text-secondary`: "{loggedDaysCount} of 14 days" or "{totalLogEntries} of 20 logs" (pick whichever gate is further from being met)
   - Right: 2px horizontal progress line, width 80px, `--border` track with `--accent` fill
   - No percentage label, no animation on mount beyond scroll-entry blur
   - Absent entirely in State A

Note: Community is shown in the **Community segment tab** (accessible via the segmented control), not inline below the AI content. The AI segment in State B shows only the AIPreviewCard and ProgressToUnlock strip.

State B is available to ALL users regardless of premium status.

**State C - Day 14+ threshold met, user is premium (trial or paid)**

The AIPreviewCard transforms into the live **AIChat** surface. Community is in the Community segment tab - the AI segment in State C shows only the AIChat component.

**AIChat component (`components/insights/AIChat.tsx`):**

- Double-bezel container - same outer dimensions as AIPreviewCard so the lock→live transition feels like the card "came online" rather than a new component appearing
- Eyebrow pill (accent variant - `bg-[--accent-light]` with `text-[--accent]`): "SLEUTH"
- Top-right inside the card: "New conversation" text button, DM Sans 12px `--text-secondary`, clears current session. No confirmation modal.
- Conversation area (max-height 480px, scroll-y; most recent turn at bottom, auto-scrolls on new message):
  - **User turns:** right-aligned, DM Sans 15px `--text-primary`, no background, left-padding of 48px so user text reads as quoted. No avatar, no label, no timestamp.
  - **AI turns:** left-aligned, DM Sans 15px `--text-primary`, prefix with a small `--accent`-colored dot (8px) as the speaker indicator. No avatar, no "Sleuth says" label.
  - Between turns: 16px vertical gap. Inside a turn: paragraphs separate with 8px gap.
  - AI responses may contain inline severity references - render the Severity Glyph inline where the AI response text mentions a specific severity level (the API post-processor handles this substitution).
- Bottom input area (anchored to card bottom):
  - Above the textarea: 3 suggested prompt chips, horizontally scrolling row on mobile. Tapping a chip fills the textarea AND immediately sends (one deliberate tap). Chips use the same double-bezel visual language as severity chips but are tap-to-submit actions.
  - Multiline textarea with auto-grow (max 4 lines visible), placeholder cycles through condition-specific prompts
  - Trailing send button inside the textarea bezel (button-in-button style, `--accent` fill, Phosphor ArrowUp 14px weight light)
- Empty state (first open, `aiConversationCount === 0`):
  - Fraunces 22px: "Your sleuth works for you."
  - DM Sans 14px `--text-secondary`: "Ask about your patterns, triggers, or symptoms. Sleuth reads your {loggedDaysCount} days of data - never your notes field unless you ask."
  - Three starter chips beneath
  - Footnote (DM Sans 11px `--text-secondary`): "Sleuth is not a doctor. For medical decisions, use the Doctor Report and see your clinician."

**Rate limit UI (when 20/24h cap hit):**
- Input area replaced with a centered message: "You've asked 20 questions in the last day. Sleuth resets in {Xh Ym}."
- DM Sans 14px `--text-secondary`, no CTA, no upgrade push
- Countdown recomputes on each render from `profile.aiUsage.messages[]`

**State D - Day 14+ threshold met, user is NOT premium (trial expired, no active subscription)**

The AIChat card is present but locked. This is a stronger paywall than the generic Upgrade screen because the user sees their *own data* being reasoned about, not a generic feature list.

- Same double-bezel container as States B and C (consistent card shape across all states)
- Eyebrow pill (accent-light variant): "SLEUTH - UNLOCKED, READY WHEN YOU ARE"
- Fraunces 22px weight 400: a pre-computed sample insight derived from the user's actual data, e.g.:
  - "You've logged 18 days. Your severity trends upward on low-sleep nights."
  - "Your migraines cluster on days you logged dairy."
  - "Stress appears in 60% of your high-severity entries."
- This insight is generated client-side from simple statistics in `utils/aiPreviewStats.ts` - zero Claude API spend on non-premium users.
- Below: a three-line "answer preview" - first ~40 words of what a correlation response might look like, first line fully readable, next two lines blurred via `filter: blur(4px)`.
- Primary CTA (sage green button-in-button, trailing arrow): "Unlock Sleuth" → routes to /upgrade
- Secondary text beneath (DM Sans 12px `--text-secondary`): "Your 14 days of data stay private. Sleuth only reads what you ask it to see."
- Community is always available in the Community segment tab - free tier users keep community access.

**5. Doctor Report**

- "Generate Report" button with date range picker
- Calls Claude API via /api/generate-report
- Output: condition, date range, symptom frequency & average severity, food trigger frequency and correlation with high-severity days, notable patterns, patient notes - formatted for a doctor to scan in 30 seconds
- Copy to clipboard / Share
- Non-premium: fully locked

**6. Account**

The Account tab surfaces auth, subscription, and settings - the chrome that previously had no permanent home in the four-tab nav.

- **Auth state:** shows current auth method (Google or email/password). Anonymous/UUID mode is retired and Facebook/Apple are deferred — do not add them back. Authenticated email/provider is shown in DM Mono small.
- **Subscription:** current plan badge (trial / monthly / annual / lifetime / expired), trial or renewal date if applicable. "Manage plan" link → Stripe customer portal for annual and monthly subscribers only. Lifetime members show a "Lifetime Member ✦" badge with no manage link — the subscription has no renewal to manage.
- **Settings:** Community data opt-in toggle wired to `profile.communityOptIn` via `SET_COMMUNITY_OPT_IN` dispatch.
- **Data:** "Reset account" - two-tap confirmation; clears localStorage, routes to `/onboarding`. This action moves here from its previous location in Insights.
- Design: `divide-y` rows with section eyebrow tags, no card elevation. Route: `app/(app)/account/page.tsx`.

**7. Paywall / Upgrade Screen**

Route: `app/(app)/upgrade/page.tsx`. Appears when a non-premium user taps a locked feature, and directly from the AILockedPreview CTA.

Visual hierarchy — annual is the no-brainer choice:

- **Annual card (primary, dominant):** full-width, sage-green filled card, "BEST VALUE" pill top-left. Price: "$39.99 / year" in Fraunces, subline "That's just $3.33/month" in DM Mono, trial callout "14-day free trial included". Primary CTA: "Start Free Trial" — high-contrast white button inside the green card.
- **Monthly card (secondary, recessive):** smaller weight, standard double-bezel card on the warm surface. Price: "$9.99 / month" + trial callout "7-day free trial". CTA: "Try Monthly" (outlined/ghost).
- **Lifetime link (tertiary):** rendered as a subdued centered text link below both cards, not a card. Copy: "Prefer to pay once? $79.99 lifetime access →". No trial language.
- **Trust line beneath all options:** "Cancel anytime. Your data is always yours."

Checkout flow (inline - no redirect to Stripe-hosted Checkout):
1. CTA → `router.push('/welcome?plan=annual|monthly|lifetime')`
2. `/welcome` calls `POST /api/create-plan-intent` to create either a SetupIntent (annual/monthly) or a PaymentIntent (lifetime) and gets a `clientSecret`.
3. Stripe `<PaymentElement>` renders inline with that client secret. Supports cards plus whatever payment methods Stripe enables via `automatic_payment_methods` (Apple Pay / Google Pay / Link when configured in the Stripe Dashboard).
4. On submit the client calls `confirmSetup` or `confirmPayment` with `redirect: 'if_required'`, then `POST /api/activate-plan` with the intent id. The server creates the Stripe customer, attaches the payment method, and (for subscriptions) creates the subscription with `trial_period_days`.
5. `SET_TRIAL_DATA` / `SET_LIFETIME` dispatch flips `awaitingAccountSetup: true`. The page transitions to State 2 for account setup (see `/welcome` spec).

NO urgency tactics. NO countdown timers.

### API Integration

**Claude API (Doctor Report):**
- Endpoint: /api/generate-report
- Sends: date range, symptom logs, conditions, context data, notes
- System prompt: structured clinical summary
- Model: claude-sonnet-4-5-20250929
- Max tokens: 1500

**Claude API (AI Sleuth - Insights chat):**
- Endpoint: /api/ai-chat (POST, streaming response via SSE)
- Sends: user's last 90 days of structured logs (notes excluded by default), last 5 conversation turns, new user message
- Model: claude-sonnet-4-5-20250929
- Max tokens: 800 per response
- Prompt caching enabled: system prompt + user logs cached for 5-minute TTL; subsequent messages in session hit cached tokens at 10% of base rate
- System prompt lives in `utils/aiSystemPrompt.ts` - includes medical safety scaffolding (never diagnose, flag emergencies, frame as "patterns in your data")
- Client-side rate limit: 20 messages per rolling 24h per user, enforced via `profile.aiUsage.messages[]`
- Server-side rate limit backup: 30 requests/hour per IP via Vercel Edge middleware (failsafe only)
- No conversation persistence server-side - session-scoped only

**Stripe:**
- Annual (primary): $39.99/year, 14-day free trial — `STRIPE_ANNUAL_PRICE_ID`
- Monthly (secondary): $9.99/month, 7-day free trial — `STRIPE_MONTHLY_PRICE_ID`
- Lifetime (tertiary): $79.99 one-time, no trial — `STRIPE_LIFETIME_PRICE_ID`
- Card collection is inline via Stripe Elements on `/welcome` (no hosted Checkout). `POST /api/create-plan-intent` returns `{ clientSecret, intentType }` (SetupIntent for annual/monthly, PaymentIntent for lifetime).
- `POST /api/activate-plan` takes `{ plan, intentId, email }`. For subscriptions it creates the customer, attaches the saved payment method, and creates the subscription with `trial_period_days`. For lifetime it verifies `payment_intent.status === 'succeeded'` and attaches the Customer.
- Webhook (`/api/stripe-webhook`) handles only post-activation lifecycle: `customer.subscription.deleted`, `invoice.payment_failed`. It does not provision profiles.
- Customer Portal link in Account settings — shown for annual and monthly subscribers only. Lifetime members have no renewal to manage, so the portal link is hidden and a "Lifetime Member ✦" badge renders instead.

**Supabase (Community Data):**
- Anonymous inserts on save (if communityOptIn)
- Read-only aggregate queries (cached, refreshed nightly)
- No RLS for anonymous inserts

### PWA Requirements

- manifest.json: name "SymptomSleuth", theme_color "#2D6A4F", background_color "#FAFAF8", display "standalone"
- Service worker via next-pwa: precache app shell, runtime cache for Google Fonts
- Offline: all features work offline except Doctor Report and Community Insights
- Install prompt: custom banner after 3rd daily log
- Apple touch icon and iOS meta tags

### File Structure

```
app/
  layout.tsx
  page.tsx                    # landing (client) - hero + value props + returning-member sign-in
  providers.tsx               # client-side context providers mounted into the root layout
  onboarding/
    page.tsx                  # 3-step flow (condition → symptoms → trial confirmation)
    ConditionSelect.tsx
    SymptomSetup.tsx
    TrialConfirmation.tsx     # Screen 3 - CTA "Choose your plan" routes to /upgrade
  welcome/
    page.tsx                  # Post-checkout account setup (Google / email + password). Outside (app)/ so no bottom nav.
  upgrade/
    page.tsx                  # Paywall (annual / monthly / lifetime) - taps route to /welcome?plan=X
  auth/
    callback/page.tsx         # OAuth code exchange + post-signin routing (no magic-link mode logic)
    reset/page.tsx            # Password reset destination - exchanges recovery code, sets new password via updateUser
  install/page.tsx            # PWA install instructions screen
  offline/page.tsx            # Service-worker offline fallback page
  (app)/
    layout.tsx                # app shell with bottom nav (use client); guards onto /onboarding or /welcome
    log/page.tsx
    timeline/page.tsx         # redirect('/insights') only - Timeline is a segment, not a standalone page
    insights/page.tsx
    report/page.tsx
    account/page.tsx
  api/
    generate-report/route.ts
    ai-chat/route.ts                  # Streaming SSE endpoint for AI Sleuth. Sonnet 4.5 with prompt caching.
    create-plan-intent/route.ts       # Returns { clientSecret, intentType } for inline Stripe Elements
    activate-plan/route.ts            # Creates customer + subscription (sub) or verifies PaymentIntent (lifetime)
    stripe-webhook/route.ts           # Post-activation subscription lifecycle only (no profile provisioning)
    community/
      submit/route.ts
      aggregates/route.ts
lib/
  supabase.ts                 # Browser-safe Supabase client (anon key). Use anywhere a client needs Supabase.
  supabaseAdmin.ts            # Server-only client (service-role key). Never import in a client component.
components/
  brand/
    Wordmark.tsx              # Thin wrapper around the existing /public/brand/wordmark.svg asset. Do NOT recreate the logo - it is authored and shipped as-is.
  auth/
    ReturningMemberSignIn.tsx   # Google + email/password sign-in (with "Forgot password?") appended to the landing page for existing members.
  log/
    SeverityChipSelector.tsx  # THE canonical severity input - 5 chips, tap-to-commit. Used everywhere severity is captured (symptoms + context fields).
    SeveritySelector.tsx      # Legacy wrapper retained for non-chip surfaces (e.g. context fields routing through the chip selector). Do NOT delete without auditing call sites.
    SeveritySlider.tsx        # Legacy slider implementation retained for fallback / context-field rendering. Do NOT delete without auditing call sites.
    SymptomRow.tsx
    SymptomWizard.tsx         # Multi-step add/edit symptom flow used in onboarding and account/settings.
    ConditionChapterMarker.tsx # Hairline + centered condition name editorial chapter-marker component
    ConditionManagerModal.tsx # Bottom-sheet modal for adding/removing tracked conditions after onboarding.
    ConditionProgress.tsx     # Per-condition progress strip shown inside the Log screen group headers.
    FoodTriggers.tsx          # 2-col chip grid, open by default, stores context.foodTriggers
    ContextFields.tsx
    ToggleSwitch.tsx          # Boolean toggle used for the lone yes/no context field (exercise).
    SaveConfirmModal.tsx      # bottom sheet post-save modal, double-bezel, drain bar, random logMessage, streak pill
    Marginalia.tsx            # Right-aligned DM Mono micro-stat for symptom rows with ≥3 data points
  ui/
    StreakBadge.tsx           # fixed-position streak overlay on app header, rendered in (app)/layout.tsx
    PaperGround.tsx           # SVG noise overlay at --paper-noise-opacity, applied once in app shell root
    MurmurationBackground.tsx # Ambient tsparticles canvas - see Backgrounds & Visual Details.
    EyebrowTag.tsx            # Reusable pill eyebrow tag component (see Eyebrow Tags pattern).
    FadeIn.tsx                # IntersectionObserver entry-animation wrapper (translateY + blur + opacity).
    TrailingIcon.tsx          # Button-in-Button trailing icon circle (see Premium Craft Patterns).
    ServiceWorkerRegister.tsx # Client-side registration for /public/sw.js.
  timeline/
    TimelineChart.tsx
    DateRangeSelector.tsx
    DailyLogList.tsx
    TimelineSegment.tsx       # Composable wrapper - combines the three above; rendered inside Insights as the default segment
  insights/
    AIPreviewCard.tsx         # State B: locked AI card with rotating sample question + skeleton answer preview
    ProgressToUnlock.tsx      # State B: quiet single-line strip showing loggedDays/totalLogs progress toward threshold
    AIChat.tsx                # State C: live AI chat surface - conversation area + input + suggested prompts
    AILockedPreview.tsx       # State D: post-threshold, non-premium paywall with data-derived teaser
    CommunityOverview.tsx
    PatternComparison.tsx
    CorrelationCard.tsx
    ShareableInsight.tsx
    ThresholdMessage.tsx
  layout/
    AppHeader.tsx             # 72px global header band with Wordmark left + StreakBadge right
content/
  aiSampleQuestions.ts        # Rotating sample questions per condition. Used by AIPreviewCard and AIChat suggested prompts.
hooks/
  useStreak.ts              # calculateStreak() + useStreak() → { count, loggedToday }. Consumed by StreakBadge and log/page.tsx.
  useTrial.ts
  useCommunity.ts
  useInView.ts              # IntersectionObserver hook for scroll entry animations
  useAIAccess.ts            # { isAIThresholdMet, hasAIAccess, daysRemaining, logsRemaining, aiUnlockedAt } - consumed by Insights screen to route between States A/B/C/D
  useAIChat.ts              # Chat state management - turns, rate limit counter, send function, streaming response handler
utils/
  storage.ts
  symptoms.ts               # default symptom suggestions per condition. No 'type' field.
  severityGlyphs.tsx        # 6 inline SVG components (None/Mild/ModerateLow/Moderate/Severe/Extreme). Authored abstract marks - see Severity Glyph System. Render at currentColor.
  anonymize.ts
  community.ts
  logMessages.ts            # 40 post-save messages (15 encouraging, 15 tips, 10 insight). pickRandomMessage().
  aiSystemPrompt.ts         # System prompt for /api/ai-chat - medical safety scaffolding, pattern framing, emergency redirect rules
  aiPreviewStats.ts         # Client-side computation of data-derived teaser insights for State D. Zero API spend. Used by AILockedPreview.
  migrateLocalData.ts       # One-shot migration from localStorage to Supabase after account setup at /welcome. Keeps localStorage on failure.
  hydrateFromSupabase.ts    # Inverse of migrateLocalData - pulls server profile back into local state on sign-in from a fresh device.
  generateDemoData.ts       # Seeded demo data generator used in development and onboarding previews.
  timelineData.ts           # Pure helpers for shaping logs into TimelineChart series.
supabase/
  migrations/                 # SQL migrations (profiles, daily_logs, encrypted_profiles, wrapped_keys).
  functions/compute-aggregates/  # Scheduled edge function rebuilding ConditionAggregate rows.
public/
  manifest.json
  sw.js                       # Service worker (registered by ServiceWorkerRegister).
  brand/wordmark.svg          # Authored logomark - ship as-is, do not recreate.
  icons/
```

**Roadmap (not yet implemented):** Programmatic SEO routes (`app/[conditionSlug]/`, `app/guides/[guideSlug]/`), encrypted client-side backup UI (`components/backup/`, `useBackup`, `utils/crypto.ts`), and Stripe customer-portal route (`api/create-portal/`) are planned but not on disk. Do not scaffold them as part of unrelated work; they are tracked separately in the SEO & AEO and Zero-Knowledge Sync sections.

### SEO & AEO

**Programmatic SEO pages** - 12 condition-specific pages at /[conditionSlug]. Each: condition-specific heading and copy, common symptoms list, community stat if above threshold, 5–8 FAQ pairs with JSON-LD (FAQPage schema), WebApplication and MedicalCondition JSON-LD, generateStaticParams().

**AEO guide pages** - 5 guides at /guides/[guideSlug]:
- how-to-track-symptoms-for-doctor
- what-to-bring-to-specialist-appointment
- symptom-diary-vs-symptom-tracker
- how-to-describe-pain-to-doctor
- why-doctors-want-symptom-data

Each: server component, generateMetadata(), JSON-LD Article schema, 400–600 words, natural CTA.

**Technical SEO:** Dynamic sitemap, robots.ts, canonical URLs, all content server-rendered.

## Privacy & Data Ethics

This section is non-negotiable.

- **Personal health data** NEVER leaves the device unless the user explicitly exports an encrypted backup. SymptomSleuth cannot read, access, or recover this data.
- **Anonymous community data** is opt-in (on by default, toggleable). What gets shared: condition, symptom name, severity value, context values, week-of-year. What NEVER gets shared: user identity, device ID, notes, specific dates, menstrual cycle data.
- **No account required.** No email. No login. No tracking pixels. No third-party analytics at launch.
- **Backup files** are encrypted client-side. SymptomSleuth never sees the passphrase or unencrypted data.
- State clearly on landing, onboarding, and settings: "We literally cannot see your health data, even if we wanted to."

## Code Quality Rules

- All components are functional with hooks
- No `any` types - strict TypeScript throughout
- localStorage operations wrapped in try/catch with fallbacks
- All tap targets minimum 48x48px
- Semantic HTML (labels, roles, aria attributes)
- No external state management - React context + useReducer
- Mobile-first (optimized for phone, works on desktop)
- Supabase calls wrapped in try/catch - community features degrade gracefully if unreachable
- SeverityChipSelector must have an accessible radio group (hidden `<input type="radio" name={symptomId}>` per chip) underlying the custom visual

## Deployment

- Vercel (zero config)
- Environment variables: ANTHROPIC_API_KEY (shared by /api/generate-report and /api/ai-chat), STRIPE_SECRET_KEY, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY, STRIPE_ANNUAL_PRICE_ID, STRIPE_MONTHLY_PRICE_ID, STRIPE_LIFETIME_PRICE_ID, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SYNC_SERVER_PEPPER
- Landing page (app/page.tsx) server-rendered; all app screens under (app)/ are client components
