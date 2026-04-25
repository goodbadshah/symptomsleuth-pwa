# SymptomSleuth - Chronic Symptom Logger PWA

<div align="center">
  
  **A privacy-first PWA helping people with chronic conditions log daily symptoms in under 10 seconds, generate structured doctor reports, and discover patterns through community intelligence.**
</div>

## Note for Felice

Hi Felice, thank you for your patience and getting me to push myself further. 

This is SymptomSleuth and my hunch is that I can get this to $1M ARR in a year. 

Some important notes as you're using it:

- ** As a first time user going through the onboarding, when you hit the paywall, select Annual and, on the Stripe page, use these dummy card credentials

card number 4242424242424242 exp 1229 CVV 123

I'm using the Stripe sandbox for now. As soon as I've finished everything, I'll switch to live.

- ** Log in using your Google account (the email / password is a little buggy)

- ** When you land on the main dashboard / symptom log screen, depending on if you chose more than one condition to track, you'll see collapsed boxes. Open them, tap the buttons for the symptom severities, scroll down, and save. That's it.

- ** The Insights tab is where the (eventual) SleuthAI (which is just an anthropic API) and visualizations live. To load up demo data so that you can see the visualizations, go to the Account page from the bottom nav, scroll down to the bottom and press Load demo data. This will take you back to the Insights screen. Tap on Timeline and you'll get to see the charts in action.

- ** The Doctor Report feature isn't working yet -- I didn't have time to execute the prompts.

- ** Overall, it works. But there's clearly some features and design bugs I need to get sorted. 

- ** I plan to ship this within the week. 

- ** Thanks again for all your help this year. You're the best!

## 🎯 Overview

SymptomSleuth is designed for people managing chronic conditions like migraine, IBS, fibromyalgia, PCOS, arthritis, and more. It enables lightning-fast symptom logging while keeping personal health data completely private on your device, with optional encrypted cloud backup that only you can decrypt.

### Key Features

- **⚡ 10-Second Logging**: Editorial-style interface optimized for users experiencing pain, fatigue, or brain fog
- **🔒 Privacy-First**: Personal data stays on-device via localStorage, with zero-knowledge encrypted sync
- **🤖 AI Sleuth**: Personal AI assistant analyzes your patterns (unlocks after 14 days + 20 log entries)
- **👥 Community Intelligence**: Anonymous, aggregated insights from thousands of users with similar conditions
- **📊 Doctor Reports**: Structured clinical summaries generated via Claude API
- **📱 PWA**: Works offline, installable, feels like a native app

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router) with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Charts**: Recharts for symptom timeline visualization
- **AI**: Anthropic Claude API (Sonnet 4.5) with prompt caching
- **Payments**: Stripe Checkout (inline Elements, no redirect)
- **Auth**: Supabase Auth (Google OAuth + email/password)
- **Backend**: Supabase (community data aggregation, encrypted profile sync)
- **PWA**: next-pwa with Workbox for offline support
- **Encryption**: Web Crypto API (AES-256-GCM) for zero-knowledge sync
- **Hosting**: Vercel


### First-Time User Journey

1. **Landing Page** (`/`) - Hero, value props, pricing
2. **Onboarding** (`/onboarding`) - 3 screens: condition selection → symptom setup → plan selection
3. **Payment** (`/welcome?plan=annual`) - Stripe Elements inline checkout
4. **Account Setup** (`/welcome` State 2) - Google OAuth or email/password
5. **Daily Logging** (`/log`) - Core 10-second symptom logging loop

### Daily Usage Loop

1. **App Launch** - Defaults to `/log` (days 0-3) or `/insights` (day 4+)
2. **Quick Logging** - Tap severity levels, optional context, save
3. **Pattern Discovery** - Timeline charts, AI insights (premium), community comparisons
4. **Doctor Reports** - Generate structured summaries for appointments

## 🏗 Architecture Highlights

### Privacy-First Design

- **Local Storage**: All personal data in browser localStorage
- **Zero-Knowledge Sync**: Client-side encryption before cloud storage  
- **Community Anonymization**: Only aggregated, anonymized data shared (opt-in)
- **Medical Safety**: AI includes emergency detection and medical disclaimers

### Progressive Disclosure UI

- **Mobile-First**: Optimized for 480px, works one-handed while lying down
- **Editorial Design**: Typography-driven, inspired by Japanese stationery + editorial layout
- **Severity Glyph System**: Custom abstract glyphs instead of emoji faces
- **Collapsed by Default**: Context fields, notes, and condition groups minimize cognitive load

### AI Integration

- **Claude Sonnet 4.5**: Pattern analysis with medical safety scaffolding
- **Prompt Caching**: 5-minute TTL, reduces costs by 90% for subsequent messages
- **Rate Limiting**: 20 messages/24h client-side, safety backup server-side
- **Data Requirements**: Unlocks after 14 days + 20 log entries to ensure quality insights

## 🎨 Design System

The app follows an **Editorial Stationery** design philosophy - think Moleskine journal meets medical tool:

- **Typography**: Fraunces (serif headers) + DM Sans (UI) + DM Mono (data)
- **Colors**: Near-monochromatic with sage green accent (#2D6A4F)
- **Severity Scale**: The only polychromatic element (green → yellow → orange → red)
- **Motion**: Minimal, medicinal - slow exhales, not heartbeats
- **Craft Patterns**: Double-bezel architecture, button-in-button trailing icons

### Design Tokens

```css
--bg-primary: #FAFAF8        /* warm off-white */
--text-primary: #1A1A1A
--text-secondary: #6B6B6B
--accent: #2D6A4F            /* deep sage green */
--severity-1: #C5DFB8        /* mild - olive-sage */
--severity-2: #A8CC97        /* moderate-low */
--severity-3: #F4C95D        /* moderate - mustard */
--severity-4: #E8823A        /* significant - warm orange */
--severity-5: #C8472F        /* severe - terracotta red */
```

## 🧪 Development

### Key Commands

```bash
npm run dev          # Development server
npm run build        # Production build  
npm run start        # Production server
npm run lint         # ESLint
npm run type-check   # TypeScript check
```

### Project Structure

```
app/                 # Next.js App Router pages
├── (app)/          # App shell with bottom nav
│   ├── log/        # Daily symptom logging
│   ├── insights/   # AI Sleuth + community insights  
│   ├── report/     # Doctor report generation
│   └── account/    # Settings and subscription management
├── onboarding/     # 3-step onboarding flow
├── welcome/        # Post-payment account setup
└── api/            # API routes (AI, Stripe, Supabase)
components/         # Reusable UI components
├── log/            # Daily logging components  
├── insights/       # AI + community components
├── timeline/       # Chart and visualization components
└── ui/             # Base UI primitives
utils/              # Business logic and helpers
content/            # Static content (conditions, guides)
```

### Contributing Guidelines

1. **Mobile-First**: All designs start at 480px max-width
2. **Accessibility**: 48px minimum tap targets, semantic HTML, ARIA labels
3. **TypeScript**: No `any` types, strict mode enabled
4. **Privacy**: Personal data never leaves device without explicit user action
5. **Performance**: Optimize for older phones, minimal JavaScript
6. **Medical Safety**: Never diagnose, always include disclaimers

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard
```

### Environment Variables

Set these in your Vercel project settings:

**Required Secrets:**
- `ANTHROPIC_API_KEY` - Claude API for AI features
- `STRIPE_SECRET_KEY` - Stripe payments
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook verification
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase admin operations
- `SYNC_SERVER_PEPPER` - Encryption salt (generate random 32-byte hex)

**Price IDs:**
- `STRIPE_ANNUAL_PRICE_ID`
- `STRIPE_MONTHLY_PRICE_ID`  
- `STRIPE_LIFETIME_PRICE_ID`

**Public Variables** (auto-detected by `NEXT_PUBLIC_` prefix):
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Domain Setup

1. Configure custom domain in Vercel
2. Update Supabase Auth redirect URLs
3. Update Stripe webhook endpoint URL

## 📄 API Reference

### AI Endpoints

- `POST /api/ai-chat` - Streaming AI conversations (SSE)
- `POST /api/generate-report` - Doctor report generation

### Payment Endpoints  

- `POST /api/create-plan-intent` - Create Stripe payment intent
- `POST /api/activate-plan` - Activate subscription after payment
- `POST /api/stripe-webhook` - Handle Stripe events

### Sync Endpoints

- `POST /api/sync/push` - Encrypted profile backup
- `GET /api/sync/pull` - Encrypted profile restore

## 🔒 Security & Privacy

- **Zero-Knowledge Architecture**: Server cannot decrypt user health data
- **AES-256-GCM Encryption**: Industry-standard encryption for synced data
- **Local-First**: All personal data stored in browser localStorage
- **HIPAA Considerations**: Designed for compliance (consult legal for certification)
- **Rate Limiting**: Prevents API abuse and ensures fair usage

## 📚 Additional Documentation

- [AGENTS.md](./AGENTS.md) - AI agent configurations and prompts
- [CLAUDE.md](./CLAUDE.md) - Complete project specification
- See `/content/guides.ts` for user-facing help content

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Support & Community

- **Issues**: Report bugs and request features via GitHub Issues
- **Medical Disclaimer**: This is not medical advice - always consult healthcare providers
- **Privacy**: We cannot access your health data - it stays on your device

---

<div align="center">
  <strong>Built with ❤️ for the chronic illness community</strong><br>
  <em>Helping people track symptoms with dignity, privacy, and intelligence</em>
</div>