# Float Health — Infusion Capacity + Unit Economics Diagnostic

A production-ready lead magnet web app for Float Health's enterprise ICP (specialty pharmacies that do home infusion).

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
- **With Supabase** (recommended for production): add your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
- **Without Supabase** (local dev): leave blank — submissions save to `data/submissions.json`

### 3. Run locally

```bash
npm run dev
# Open http://localhost:3000
```

### 4. Deploy to Vercel

```bash
npx vercel
```

Add environment variables in Vercel dashboard → Settings → Environment Variables.

---

## Setting Up Supabase (optional but recommended for production)

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/schema.sql` in the SQL editor
3. Copy your **Project URL** and **service_role key** to `.env.local`

---

## Where to Edit Key Things

| What | File | Notes |
|---|---|---|
| **All benchmarks** | `lib/benchmarks.ts` | Edit constants at top — clearly labeled |
| **Scoring weights** | `lib/benchmarks.ts` → `scoringWeights` | Must sum to 1.0 per score group |
| **Recovery % assumptions** | `lib/benchmarks.ts` → `timeToStartRecovery` | Conservative / base / aggressive |
| **Form copy & hints** | `app/diagnostic/page.tsx` | Edit `hint=` props and label text |
| **Landing page copy** | `app/page.tsx` | Edit JSX directly |
| **PDF layout** | `app/api/pdf/route.ts` → `buildHTML()` | Edit CSS and HTML structure |
| **Score grade thresholds** | `app/results/page.tsx` → `scoreLabel()` | Adjust numeric thresholds |
| **Bottleneck logic** | `lib/calculations.ts` → `calcBottlenecks()` | Add/remove bottleneck conditions |
| **Database** | `lib/db.ts` | Switches automatically based on `SUPABASE_URL` env var |

---

## File Structure

```
├── app/
│   ├── layout.tsx           # Root layout + metadata
│   ├── globals.css          # Tailwind base
│   ├── page.tsx             # Landing page
│   ├── diagnostic/
│   │   └── page.tsx         # Multi-step form (5 steps)
│   ├── results/
│   │   └── page.tsx         # Results dashboard
│   └── api/
│       ├── submit/
│       │   └── route.ts     # Runs calculations + saves lead
│       └── pdf/
│           └── route.ts     # Generates HTML for print-to-PDF
├── lib/
│   ├── benchmarks.ts        # ← EDIT BENCHMARKS HERE
│   ├── calculations.ts      # All scoring + opportunity logic
│   └── db.ts               # Supabase or local JSON storage
├── types/
│   └── index.ts            # TypeScript interfaces
└── supabase/
    └── schema.sql          # Database table definition
```

---

## Notes on PDF Generation

The PDF uses HTML-to-print (opens new window → `window.print()`). Works natively with no paid APIs.

For true server-side PDF generation, install `@sparticuz/chromium` + `puppeteer-core` and modify `app/api/pdf/route.ts` to return a Buffer with `application/pdf` content type.

---

## Benchmark Disclaimer

All benchmarks are configurable assumptions, not verified industry standards. They are clearly labeled as assumptions in the UI and PDF output. Float Health should validate these against actual industry data before publishing.

---

*Prepared by Float Health — for internal evaluation*
