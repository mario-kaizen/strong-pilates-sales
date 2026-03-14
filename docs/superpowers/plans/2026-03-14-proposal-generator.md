# STRONG Pilates Proposal Generator — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Next.js app that processes uploaded data (Hapana Core CSVs, Meta Ads CSV, GHL API, call transcripts) and generates branded sales proposal pages for STRONG Pilates prospects.

**Architecture:** Next.js 16 App Router with Prisma 7 + SQLite. Upload wizard collects data, server-side processors extract metrics, Claude analyses transcripts, proposal pages render dynamically from stored data. Deployed to Coolify at `strong.kaizencollective.com.au`.

**Tech Stack:** Next.js 16, Prisma 7 (SQLite), Tailwind v4, Chart.js 4, Anthropic SDK, Docker/Coolify

**Spec:** `docs/superpowers/specs/2026-03-14-strong-pilates-sales-generator-design.md`

**Reference implementation:** `strong-the-beach-to-report.html` — the existing static proposal for The Beach TO. All proposal components should match this file's design, layout, and chart configurations.

---

## Chunk 1: Project Scaffold + Data Layer

### Task 1: Initialize Next.js Project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`
- Create: `postcss.config.ts`
- Preserve: `docs/`, `CLAUDE.md`, `strong-the-beach-to-report.html`, `chart.min.js`

- [ ] **Step 1: Initialize Next.js with TypeScript and Tailwind**

```bash
cd ~/Projects/strong-pilates-sales
npx create-next-app@latest . --typescript --tailwind --app --src-dir --import-alias "@/*" --use-npm --yes
```

Note: Since directory already has files, may need to answer prompts. Preserve existing `docs/`, `CLAUDE.md`, `strong-the-beach-to-report.html`, `chart.min.js`, `data/`.

- [ ] **Step 2: Install dependencies**

```bash
npm install prisma @prisma/client @anthropic-ai/sdk chart.js csv-parse
npm install -D @types/node
```

- [ ] **Step 3: Configure Tailwind with Kaizen design system**

In `src/app/globals.css`, set up CSS variables matching the existing proposal:

```css
@import "tailwindcss";

:root {
  --cream: #FAF7F2;
  --cream-dark: #F0EBE3;
  --ink: #1A1A1A;
  --ink-light: #3D3D3D;
  --ink-muted: #6B6B6B;
  --gold: #C8A951;
  --gold-light: #D4BC72;
  --gold-dark: #A88B3A;
  --gold-glow: rgba(200, 169, 81, 0.15);
  --red: #C44536;
  --red-light: rgba(196, 69, 54, 0.08);
  --green: #4A7C59;
  --green-light: rgba(74, 124, 89, 0.08);
  --orange: #D4853A;
  --orange-light: rgba(212, 133, 58, 0.08);
  --blue: #4A6FA5;
  --blue-light: rgba(74, 111, 165, 0.08);
  --purple: #7B5EA7;
}
```

- [ ] **Step 4: Set up layout with Kaizen fonts**

`src/app/layout.tsx` — import Playfair Display + DM Sans from Google Fonts (use `next/font/google`). Set body to DM Sans, cream background, ink text.

- [ ] **Step 5: Create placeholder dashboard page**

`src/app/page.tsx` — simple "STRONG Pilates Sales" heading with "New Prospect" link. Just enough to verify the app runs.

- [ ] **Step 6: Verify app runs**

```bash
npm run dev
```

Open `http://localhost:3000` — should see the placeholder dashboard with Kaizen fonts and cream background.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: initialize Next.js 16 with Tailwind and Kaizen design system"
```

---

### Task 2: Prisma Schema + Database

**Files:**
- Create: `prisma/schema.prisma`
- Create: `src/lib/db.ts`
- Create: `data/.gitkeep`
- Create: `.env`

- [ ] **Step 1: Create Prisma schema**

`prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Prospect {
  id            String   @id @default(cuid())
  slug          String   @unique
  locationName  String
  city          String
  country       String
  address       String   @default("")
  ghlLocationId String   @default("")
  ghlPit        String   @default("")
  openingDate   DateTime
  status        String   @default("draft")
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  data      ProspectData?
  diagnosis Diagnosis?
  uploads   Upload[]
}

model ProspectData {
  id         String @id @default(cuid())
  prospectId String @unique
  prospect   Prospect @relation(fields: [prospectId], references: [id], onDelete: Cascade)

  totalContacts       Int    @default(0)
  contactsWithEmail   Int    @default(0)
  totalIntros         Int    @default(0)
  totalMemberships    Int    @default(0)
  totalCancellations  Int    @default(0)
  totalPackages       Int    @default(0)
  activeMemberships   Int    @default(0)
  activeIntros        Int    @default(0)
  suspendedCount      Int    @default(0)
  uniqueIntroBuyers   Int    @default(0)
  uniqueMemberHolders Int    @default(0)
  introConversionRate Float  @default(0)
  churnRate           Float  @default(0)
  totalMrr            Float  @default(0)
  avgMemberValue      Float  @default(0)
  totalAdSpend        Float  @default(0)
  presaleAdSpend      Float  @default(0)
  operatingAdSpend    Float  @default(0)
  operatingLeads      Int    @default(0)
  operatingCpl        Float  @default(0)
  costPerIntro        Float  @default(0)
  monthlyData         String @default("{}")
  membershipBreakdown String @default("{}")
  introBreakdown      String @default("{}")
  campaignBreakdown   String @default("{}")
  suspendedBreakdown  String @default("{}")
  memberTiers         String @default("{}")
  funnelData          String @default("{}")
  cancellationReasons String @default("{}")
}

model Diagnosis {
  id              String @id @default(cuid())
  prospectId      String @unique
  prospect        Prospect @relation(fields: [prospectId], references: [id], onDelete: Cascade)

  challenges      String @default("[]")
  blindspots      String @default("[]")
  recommendations String @default("[]")
  summary         String @default("")
  rawTranscript   String @default("")
}

model Upload {
  id         String   @id @default(cuid())
  prospectId String
  prospect   Prospect @relation(fields: [prospectId], references: [id], onDelete: Cascade)

  type       String
  filename   String
  status     String   @default("pending")
  rowCount   Int      @default(0)
  metadata   String   @default("{}")
  createdAt  DateTime @default(now())
}
```

- [ ] **Step 2: Create .env file**

```
DATABASE_URL="file:./data/strong-pilates-sales.db"
ANTHROPIC_API_KEY=""
```

Add `.env` to `.gitignore`. Create `.env.example` with the same keys but empty values.

- [ ] **Step 3: Create Prisma client singleton**

`src/lib/db.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

- [ ] **Step 4: Generate Prisma client and push schema**

```bash
npx prisma generate
npx prisma db push
```

Verify: `data/strong-pilates-sales.db` should be created.

- [ ] **Step 5: Add data/ to .gitignore (except .gitkeep)**

```
data/*.db
data/*.db-journal
!data/.gitkeep
```

- [ ] **Step 6: Commit**

```bash
git add prisma/ src/lib/db.ts .env.example .gitignore data/.gitkeep
git commit -m "feat: add Prisma schema with SQLite for prospects, data, diagnosis, uploads"
```

---

### Task 3: Prospect API Routes

**Files:**
- Create: `src/app/api/prospects/route.ts`
- Create: `src/app/api/prospects/[id]/route.ts`

- [ ] **Step 1: Create list + create endpoint**

`src/app/api/prospects/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/prospects — list all
export async function GET() {
  const prospects = await prisma.prospect.findMany({
    include: { data: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(prospects)
}

// POST /api/prospects — create new (draft)
export async function POST(req: NextRequest) {
  const body = await req.json()
  const { locationName, city, country, address, ghlLocationId, ghlPit, openingDate, slug } = body

  if (!locationName || !city || !country || !openingDate || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  // Check slug uniqueness
  const existing = await prisma.prospect.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const prospect = await prisma.prospect.create({
    data: {
      locationName,
      city,
      country,
      address: address || '',
      ghlLocationId: ghlLocationId || '',
      ghlPit: ghlPit || '',
      openingDate: new Date(openingDate),
      slug,
      status: 'draft',
    },
  })

  return NextResponse.json(prospect, { status: 201 })
}
```

- [ ] **Step 2: Create single + update + delete endpoint**

`src/app/api/prospects/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/prospects/[id]
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prospect = await prisma.prospect.findUnique({
    where: { id },
    include: { data: true, diagnosis: true, uploads: true },
  })
  if (!prospect) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(prospect)
}

// PATCH /api/prospects/[id]
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const prospect = await prisma.prospect.update({ where: { id }, data: body })
  return NextResponse.json(prospect)
}

// DELETE /api/prospects/[id]
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await prisma.prospect.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 3: Test with curl**

```bash
# Create
curl -s -X POST http://localhost:3000/api/prospects \
  -H "Content-Type: application/json" \
  -d '{"locationName":"Test Location","city":"Toronto","country":"Canada","openingDate":"2024-12-01","slug":"test-location"}' | jq .

# List
curl -s http://localhost:3000/api/prospects | jq .

# Delete (use id from create response)
curl -s -X DELETE http://localhost:3000/api/prospects/<ID> | jq .
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/
git commit -m "feat: add prospect CRUD API routes"
```

---

## Chunk 2: Data Processors

### Task 4: Hapana Core Processor

**Files:**
- Create: `src/lib/processors/hapana.ts`
- Create: `src/lib/processors/types.ts`

- [ ] **Step 1: Define shared types**

`src/lib/processors/types.ts`:

```typescript
export interface MonthlyData {
  [month: string]: {
    contacts?: number
    accounts?: number
    intros: number
    memberships: number
    packages: number
    cancellations: number
  }
}

export interface PlanBreakdown {
  [planName: string]: {
    count: number
    revenue: number
    price: number
  }
}

export interface TierData {
  premium: { count: number; revenue: number }
  mid: { count: number; revenue: number }
  low: { count: number; revenue: number }
}

export interface FunnelData {
  contacts: number
  contactsWithEmail: number
  accounts: number
  introBuyers: number
  converted: number
  active: number
  suspended: number
  cancelled: number
}

export interface HapanaResult {
  totalIntros: number
  totalMemberships: number
  totalCancellations: number
  totalPackages: number
  activeMemberships: number
  activeIntros: number
  suspendedCount: number
  uniqueIntroBuyers: number
  uniqueMemberHolders: number
  introConversionRate: number
  churnRate: number
  totalMrr: number
  avgMemberValue: number
  monthlyData: MonthlyData
  membershipBreakdown: PlanBreakdown
  introBreakdown: { [name: string]: number }
  suspendedBreakdown: { [name: string]: number }
  memberTiers: TierData
  cancellationReasons: { [reason: string]: number }
}
```

- [ ] **Step 2: Build Hapana processor**

`src/lib/processors/hapana.ts`:

The processor must:
1. Accept an array of CSV file contents (strings)
2. Parse each CSV using `csv-parse/sync`
3. Detect content by `Package Status` values (Active, Cancelled, Complete, etc.)
4. Combine all rows
5. Parse dates as `DD/MM/YYYY`, prices as `$X,XXX.XX`
6. Compute all metrics from the spec (see spec section "Hapana Core Processing")
7. Return `HapanaResult`

Key logic to port from the Python analysis we ran in this session:
- Unique intro buyers by email (Package Category = "Intro Offer")
- Unique membership holders by email (Package Category = "Memberships")
- Conversion = intersection of intro buyers and membership holders
- Monthly breakdown by Date Sold and Cancel Date
- Active membership breakdown by plan (name, count, price, MRR)
- Tier analysis: Premium ($196+), Mid ($100-195), Low (under $100) — exclude $0 trainer accounts
- Cancellation reasons from `Cancellation Reason` column

Reference: the Python code in this session's analysis produced the correct numbers. Match those outputs.

- [ ] **Step 3: Test with The Beach TO data**

Create a quick test script or API endpoint that processes the 3 Beach TO CSVs and verifies:
- Total intro records: 547
- Total membership records: 702
- Unique intro buyers: 504
- Conversion rate: 29.6% (149 of 504)
- Cancellations: 230
- Active memberships: 248
- MRR: ~$40,671

- [ ] **Step 4: Commit**

```bash
git add src/lib/processors/
git commit -m "feat: add Hapana Core CSV processor with metrics extraction"
```

---

### Task 5: Meta Ads Processor

**Files:**
- Create: `src/lib/processors/meta-ads.ts`

- [ ] **Step 1: Build Meta Ads processor**

`src/lib/processors/meta-ads.ts`:

The processor must:
1. Accept CSV content string
2. Parse CSV, matching column headers by prefix (e.g., `Amount spent` not `Amount spent (CAD)`) for currency independence
3. Group by month from `Reporting starts`
4. For each month sum: spend, real leads, impressions, clicks, purchases, landing page views
5. Classify results by `Result indicator`:
   - `actions:lead` + `actions:leadgen.other` → lead forms
   - `actions:offsite_conversion.fb_pixel_lead` → pixel leads
   - `actions:offsite_conversion.custom.*` → custom events
   - `actions:omni_landing_page_view` → NOT leads (exclude)
6. Real leads = forms + pixel + custom (exclude LPV)
7. Accept an `openingDate` to split presale/opening/operating periods
8. Group campaigns by type (presale conversions, conversion campaigns, lead form, traffic, other)
9. Return structured result with monthly arrays and aggregates

Key numbers to verify against The Beach TO:
- Total spend: $44,718
- Operating spend (Jan 2025+): $34,340
- Real leads: 1,684
- Operating CPL: $20.39

- [ ] **Step 2: Commit**

```bash
git add src/lib/processors/meta-ads.ts
git commit -m "feat: add Meta Ads CSV processor with result indicator classification"
```

---

### Task 6: GHL Contact Processor

**Files:**
- Create: `src/lib/processors/ghl.ts`

- [ ] **Step 1: Build GHL contact puller**

`src/lib/processors/ghl.ts`:

The processor must:
1. Accept `locationId` and `pit` (PIT token)
2. Paginate through `GET https://services.leadconnectorhq.com/contacts/?locationId={locationId}&limit=100` with `Authorization: Bearer {pit}` and `Version: 2021-07-28` headers
3. Follow `meta.nextPageUrl` for pagination
4. Filter to contacts with non-null, non-empty email
5. Group by month from `dateAdded`
6. Return: totalContacts, contactsWithEmail, monthly breakdown
7. 100ms delay between pages

Key numbers to verify against The Beach TO:
- Total contacts: 6,510
- With email: 5,748

- [ ] **Step 2: Create GHL test endpoint**

`src/app/api/ghl/test/route.ts`:

POST with `{ locationId, pit }` body. Returns `{ connected: true, totalContacts, contactsWithEmail }` or `{ connected: false, error }`.

- [ ] **Step 3: Commit**

```bash
git add src/lib/processors/ghl.ts src/app/api/ghl/
git commit -m "feat: add GHL contact puller with pagination and email filtering"
```

---

### Task 7: Transcript Analyser

**Files:**
- Create: `src/lib/processors/transcript.ts`

- [ ] **Step 1: Build transcript analyser**

`src/lib/processors/transcript.ts`:

1. Accept raw transcript text
2. Call Claude Sonnet via Anthropic SDK with structured prompt (see spec)
3. Parse JSON response: `{ challenges, blindspots, recommendations, summary }`
4. Return typed result

Use `claude-sonnet-4-20250514` model. Max tokens 4096.

- [ ] **Step 2: Commit**

```bash
git add src/lib/processors/transcript.ts
git commit -m "feat: add transcript analyser with Claude Sonnet"
```

---

### Task 8: Proposal Data Generator

**Files:**
- Create: `src/lib/generators/proposal.ts`
- Create: `src/app/api/prospects/[id]/generate/route.ts`

- [ ] **Step 1: Build proposal generator**

`src/lib/generators/proposal.ts`:

Pure computation — takes results from all processors and computes the `ProspectData` record fields including all JSON blobs. This is where:
- Funnel data is assembled (contacts → accounts → intro buyers → converted → active)
- Monthly arrays are aligned across all data sources
- Opportunity projections are calculated (conversion improvement + churn reduction)
- Period splits (presale/opening/operating) are applied to ad data

- [ ] **Step 2: Build generate API endpoint**

`src/app/api/prospects/[id]/generate/route.ts`:

POST triggers the full pipeline:
1. Set status to `processing`
2. Pull GHL contacts (if PIT provided)
3. Process stored Hapana + Meta Ads data (from Upload records)
4. Analyse transcript (if provided)
5. Generate ProspectData record
6. Set status to `ready`

Note: Hapana and Meta Ads CSVs are processed in-memory during upload (Task 10) and the extracted data stored. This endpoint orchestrates the final assembly.

- [ ] **Step 3: Commit**

```bash
git add src/lib/generators/ src/app/api/prospects/[id]/generate/
git commit -m "feat: add proposal data generator and generate API endpoint"
```

---

## Chunk 3: Upload Wizard UI

### Task 9: Shared UI Components

**Files:**
- Create: `src/components/ui/StatCard.tsx`
- Create: `src/components/ui/Callout.tsx`
- Create: `src/components/ui/InsightCard.tsx`
- Create: `src/components/ui/DropZone.tsx`

- [ ] **Step 1: Build DropZone component**

`src/components/ui/DropZone.tsx` — client component. Drag-and-drop file upload zone. Props: `onFiles(files: File[])`, `accept` (MIME types), `multiple` (boolean), `label`, `instructions` (ReactNode). Shows file list with processing status.

- [ ] **Step 2: Build StatCard, Callout, InsightCard**

Port the styling from the existing HTML proposal. These are reused in both the wizard summary and the proposal page.

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add shared UI components (DropZone, StatCard, Callout, InsightCard)"
```

---

### Task 10: Upload Wizard

**Files:**
- Create: `src/app/new/page.tsx`
- Create: `src/components/wizard/WizardShell.tsx`
- Create: `src/components/wizard/StepLocation.tsx`
- Create: `src/components/wizard/StepTranscript.tsx`
- Create: `src/components/wizard/StepHapanaCore.tsx`
- Create: `src/components/wizard/StepMetaAds.tsx`
- Create: `src/components/wizard/StepReview.tsx`
- Create: `src/app/api/upload/route.ts`

- [ ] **Step 1: Build WizardShell**

Client component managing wizard state: current step (1-5), prospect ID (created at Step 1), collected data from each step. Progress bar at top showing 5 steps with labels.

- [ ] **Step 2: Build StepLocation**

Form fields: location name, city, country, address, GHL Location ID, GHL PIT, opening date, slug (auto-generated, editable). On submit: `POST /api/prospects`, store returned prospect ID in wizard state.

Slug auto-generation: lowercase, replace spaces with hyphens, strip non-alphanumeric except hyphens.

- [ ] **Step 3: Build StepTranscript**

Toggle between "Paste text" and "Upload file". Text area or file dropzone. Stores transcript text in wizard state.

- [ ] **Step 4: Build StepHapanaCore**

DropZone accepting multiple CSVs. On drop: read files client-side, send to `/api/upload` with `type: hapana_core` and `prospectId`. Server parses CSV in-memory, detects statuses, stores Upload record with metadata and extracted metrics. Display processing results (rows found, statuses detected).

- [ ] **Step 5: Build upload API endpoint**

`src/app/api/upload/route.ts`:

POST accepts multipart form data with file + `type` + `prospectId`. For Hapana Core: parse CSV, extract metrics, store in Upload record metadata. For Meta Ads: same pattern. For transcript: store text directly.

Files are processed in-memory — raw CSVs are NOT persisted to disk. Only metadata and extracted metrics are stored in the Upload record's `metadata` JSON field.

- [ ] **Step 6: Build StepMetaAds**

Single file DropZone. Same pattern as Hapana — upload, server processes, show summary (total spend, date range, campaigns).

- [ ] **Step 7: Build StepReview**

Summary of all uploaded data. Test GHL connection button (calls `/api/ghl/test`). "Generate Proposal" button that calls `POST /api/prospects/[id]/generate`. Show processing spinner with status. On completion: redirect to `/[slug]`.

- [ ] **Step 8: Commit**

```bash
git add src/app/new/ src/components/wizard/ src/app/api/upload/
git commit -m "feat: add 5-step upload wizard with file processing"
```

---

## Chunk 4: Proposal Page

### Task 11: Chart Wrapper

**Files:**
- Create: `src/components/charts/ChartWrapper.tsx`

- [ ] **Step 1: Build Chart.js client component**

`src/components/charts/ChartWrapper.tsx` — `'use client'` component that takes Chart.js config as props and renders a canvas. Handles: responsive sizing, container div with explicit height, Chart.js instance lifecycle (create on mount, destroy on unmount).

Import Chart.js from bundled `chart.js` package (installed in Task 1).

- [ ] **Step 2: Commit**

```bash
git add src/components/charts/
git commit -m "feat: add Chart.js client wrapper component"
```

---

### Task 12: Proposal Section Components

**Files:**
- Create: `src/components/proposal/Hero.tsx`
- Create: `src/components/proposal/Snapshot.tsx`
- Create: `src/components/proposal/ConversionFunnel.tsx`
- Create: `src/components/proposal/MonthlyActivity.tsx`
- Create: `src/components/proposal/Revenue.tsx`
- Create: `src/components/proposal/IntroOfferAnalysis.tsx`
- Create: `src/components/proposal/RetentionRisk.tsx`
- Create: `src/components/proposal/CancellationDeepDive.tsx`
- Create: `src/components/proposal/RealCost.tsx`
- Create: `src/components/proposal/MembershipValue.tsx`
- Create: `src/components/proposal/Opportunity.tsx`
- Create: `src/components/proposal/CaseStudyKelowna.tsx`
- Create: `src/components/proposal/TwelveWeekPathway.tsx`
- Create: `src/components/proposal/HowWeWork.tsx`
- Create: `src/components/proposal/NextSteps.tsx`

- [ ] **Step 1: Build static sections first**

Start with the sections that don't change per prospect: `CaseStudyKelowna.tsx`, `TwelveWeekPathway.tsx` (with props for prospect-specific numbers), `HowWeWork.tsx`, `NextSteps.tsx`.

Port the HTML/CSS directly from `strong-the-beach-to-report.html`. Use Tailwind classes where possible, inline styles from the reference where Tailwind doesn't cover it.

- [ ] **Step 2: Build Hero + Snapshot**

`Hero.tsx` — location name, date, data sources. Props: `locationName`, `city`, `country`, `address`, `reportDate`.

`Snapshot.tsx` — 8 stat cards. Props: all the aggregate numbers from ProspectData.

- [ ] **Step 3: Build ConversionFunnel**

The funnel visualisation with 5 steps and drop-off percentages. Props: `funnelData` (contacts, accounts, introBuyers, converted, active, suspended, cancelled). Pure HTML/CSS — no Chart.js needed for the funnel itself.

- [ ] **Step 4: Build MonthlyActivity**

Three charts: full pipeline (line), contacts vs accounts (bar), purchases by category (bar). Props: `monthlyData` JSON parsed into arrays. Uses `ChartWrapper`.

- [ ] **Step 5: Build Revenue**

Donut chart + plan table. Props: `membershipBreakdown`, `totalMrr`. Uses `ChartWrapper` for donut.

- [ ] **Step 6: Build IntroOfferAnalysis**

Donut chart + complexity callout. Props: `introBreakdown`. Count unique offer types for the "14 different types" stat.

- [ ] **Step 7: Build RetentionRisk + CancellationDeepDive**

RetentionRisk: suspended by plan horizontal bar chart. Props: `suspendedBreakdown`, `suspendedCount`, `avgMemberValue`.

CancellationDeepDive: monthly cancellations bar chart, net member growth chart. Props: `monthlyData` (cancellations array), `totalCancellations`, `cancellationReasons`.

- [ ] **Step 8: Build RealCost**

Period breakdown cards, ad spend vs leads chart, CPA escalation chart, campaign breakdown chart. Props: all ad spend aggregates + `campaignBreakdown` + `monthlyData`.

- [ ] **Step 9: Build MembershipValue**

Tier donut charts (count + revenue), plan value bar chart, STRONG 4 callout. Props: `memberTiers`, `membershipBreakdown`.

- [ ] **Step 10: Build Opportunity**

Projection callout based on actual conversion + churn rates. Props: `introConversionRate`, `churnRate`, `avgMemberValue`, `activeMemberships`. Calculate: what happens if conversion goes from X% to X+20% AND churn drops from Y% to Y/2.

- [ ] **Step 11: Commit**

```bash
git add src/components/proposal/
git commit -m "feat: add all 15 proposal section components"
```

---

### Task 13: Proposal Page Route

**Files:**
- Create: `src/app/[slug]/page.tsx`

- [ ] **Step 1: Build proposal page**

`src/app/[slug]/page.tsx` — Server component that:
1. Fetches prospect by slug (with data + diagnosis)
2. Returns 404 if not found or status !== 'ready'
3. Parses all JSON fields from ProspectData
4. Renders all 15 section components with props
5. Includes Kaizen design system CSS (cream background, proper typography)
6. Sets metadata (title, description) for sharing

- [ ] **Step 2: Test with manually seeded data**

Create a seed script or use the API to create a prospect with The Beach TO data, then verify the proposal renders correctly at `/the-beach-to`.

- [ ] **Step 3: Commit**

```bash
git add src/app/[slug]/
git commit -m "feat: add dynamic proposal page route"
```

---

## Chunk 5: Dashboard + Edit + Deploy

### Task 14: Dashboard Page

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Build dashboard**

Replace placeholder with proper dashboard:
- Fetch all prospects via `prisma.prospect.findMany`
- Render table/card list with: location name, status badge, key stats (if ready), created date, view link, delete button
- "New Prospect" button linking to `/new`
- Delete with confirmation dialog
- Kaizen design system styling

- [ ] **Step 2: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: build dashboard with prospect list and delete"
```

---

### Task 15: Edit Page

**Files:**
- Create: `src/app/[slug]/edit/page.tsx`

- [ ] **Step 1: Build edit page**

Simple form pre-filled with prospect data. Allow:
- Updating location details
- Re-uploading Hapana Core / Meta Ads CSVs
- Re-entering transcript
- "Regenerate Proposal" button

- [ ] **Step 2: Commit**

```bash
git add src/app/[slug]/edit/
git commit -m "feat: add prospect edit page with re-upload capability"
```

---

### Task 16: Docker + Coolify Deployment

**Files:**
- Modify: `Dockerfile`
- Create: `.dockerignore`

- [ ] **Step 1: Update Dockerfile for Next.js**

```dockerfile
FROM node:22-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
RUN mkdir -p /app/data && chown nextjs:nodejs /app/data
USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
CMD ["node", "server.js"]
```

- [ ] **Step 2: Create .dockerignore**

```
node_modules
.next
.git
data/*.db
data/*.db-journal
docs/
*.md
```

- [ ] **Step 3: Update next.config.ts for standalone output**

```typescript
const nextConfig = {
  output: 'standalone',
}
export default nextConfig
```

- [ ] **Step 4: Push and configure Coolify**

```bash
git add Dockerfile .dockerignore next.config.ts
git commit -m "feat: add Docker config for Coolify deployment"
git push
```

Then via Coolify API:
- Update existing app `pw0p4ev6g4tn9hlqtvnuuc3j` to use the new Dockerfile
- Add persistent volume mount: `/app/data`
- Set env vars: `DATABASE_URL=file:/app/data/strong-pilates-sales.db`, `ANTHROPIC_API_KEY`
- Deploy

- [ ] **Step 5: Set up DNS**

Mario sets up `strong` A record → `170.64.153.122` in Cloudflare (Full SSL mode).

- [ ] **Step 6: Verify deployment**

```bash
curl -s https://strong.kaizencollective.com.au/ | head -20
```

- [ ] **Step 7: Commit any deployment fixes**

---

### Task 17: Seed The Beach TO as First Prospect

- [ ] **Step 1: Use the wizard to create The Beach TO**

Upload the actual data files through the wizard:
- Location: STRONG Pilates The Beach TO, Toronto, Canada
- GHL: `VBDY1rIvKpCxClcmbAqy` / `pit-21f1b82b-3ba9-4960-a15c-96774a061246`
- Opening date: 2024-12-01
- Hapana Core: 3 CSVs from Google Drive
- Meta Ads: campaign CSV from Google Drive
- Transcript: Mario's notes from the sales call

- [ ] **Step 2: Verify proposal matches the static HTML version**

Compare `https://strong.kaizencollective.com.au/the-beach-to` against the existing `strong-the-beach-to-report.html`. All numbers, charts, and sections should match.

- [ ] **Step 3: Commit any fixes**

---

## Chunk 6: Lighthouse STRONG Project Template

> This chunk operates in the **Lighthouse** codebase (`~/Projects/the-lighthouse/`), not the generator app.

### Task 18: Create STRONG Pilates Project Template

**Codebase:** `~/Projects/the-lighthouse/`

**Lighthouse schema (already exists):**
```prisma
model ProjectTemplate {
  id             String         @id @default(cuid())
  name           String
  description    String?
  category       String?
  estimatedHours Float?
  requirements   String[]
  isSystem       Boolean        @default(false)
  tasks          TemplateTask[]
  projects       Project[]
}

model TemplateTask {
  id              String          @id @default(cuid())
  templateId      String
  template        ProjectTemplate @relation(...)
  name            String
  description     String?
  defaultAssignee String?
  estimatedHours  Float?
  sortOrder       Int             @default(0)
}
```

**Instantiation:** `createProjectFromTemplate(clientId, templateId)` in `src/app/(dashboard)/projects/actions.ts` — creates a Project with Tasks from the template's TemplateTasks.

**Files:**
- Create: `~/Projects/the-lighthouse/scripts/seed-strong-template.ts`

- [ ] **Step 1: Create seed script for the STRONG Pilates template**

`~/Projects/the-lighthouse/scripts/seed-strong-template.ts`:

Uses Prisma to create a `ProjectTemplate` with `TemplateTask` records. Run via `npx tsx scripts/seed-strong-template.ts`.

Define the STRONG Pilates DWY template with 4 phases, each containing specific tasks:

**Phase 1: Onramp Fast Track (Weeks 1-2)**
- Audit Hapana Grow + Core setup
- Simplify intro offer types (reduce to 1-2)
- Rebuild CRM pipeline in Hapana Grow
- Create ad creative + copy (needs studio photos/video from client)
- Build nurture sequences
- Set up weekly metrics dashboard
- Launch first campaign
- Onboarding call with client (30 min)

**Phase 2: Attract & Convert (Weeks 3-6)**
- Optimise ad campaigns from Week 1-2 data
- Reduce spend, focus on CPA
- Refine intro offer nurture sequences
- Train team on instant connection systems
- Implement magic moments framework
- Weekly strategy calls with client

**Phase 3: Deliver & Retain (Weeks 7-10)**
- Optimise intro-to-member conversion systems
- Build follow-up cadence (Day 1, 3, 7, 14)
- Launch re-engagement campaigns for unconverted intros
- Launch win-back campaigns for cancelled members
- Implement cancellation reason tracking
- STRONG 4 phase-down strategy
- Team training on magic moments playbook

**Phase 4: Scale & Systematise (Weeks 11-12)**
- Quarterly planning session
- Ad creative refresh
- Advanced segmentation
- Document team SOPs
- Lock in monthly reporting cadence

- [ ] **Step 3: Run seed script against Lighthouse prod DB**

```bash
cd ~/Projects/the-lighthouse
# Load prod DATABASE_URL from .env
npx tsx scripts/seed-strong-template.ts
```

This creates the ProjectTemplate + 20-25 TemplateTasks with correct sortOrder (phases ordered sequentially: Phase 1 tasks = sortOrder 1-8, Phase 2 = 9-14, etc.)

- [ ] **Step 4: Verify template appears in Lighthouse UI**

Open `lighthouse.mariopaguio.com` → Project Templates page. The "STRONG Pilates — DWY Onboard" template should appear with all tasks listed.

- [ ] **Step 5: Test template instantiation**

Use the Lighthouse "New Project" dialog to create a project from the STRONG template for a test client. Verify:
- Project is created with correct name and description
- All tasks are created with correct names, descriptions, and ordering
- Tasks appear in the correct phase order

Delete the test project after verification.

- [ ] **Step 6: Commit and push**

```bash
cd ~/Projects/the-lighthouse
git add scripts/seed-strong-template.ts
git commit -m "feat: add STRONG Pilates DWY project template seed script

4-phase, 12-week template with ~25 tasks covering:
Phase 1: Onramp Fast Track (Weeks 1-2)
Phase 2: Attract & Convert (Weeks 3-6)
Phase 3: Deliver & Retain (Weeks 7-10)
Phase 4: Scale & Systematise (Weeks 11-12)

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>"
git push
```

---

## Summary

| Chunk | Tasks | What it delivers |
|-------|-------|-----------------|
| 1: Scaffold + Data | Tasks 1-3 | Running Next.js app with database and API |
| 2: Processors | Tasks 4-8 | All 4 data processors + proposal generator |
| 3: Wizard UI | Tasks 9-10 | 5-step upload wizard with file processing |
| 4: Proposal Page | Tasks 11-13 | Dynamic proposal rendering with charts |
| 5: Dashboard + Deploy | Tasks 14-17 | Complete app deployed to Coolify with Beach TO seeded |
| 6: Lighthouse Template | Task 18 | STRONG Pilates project template in Lighthouse |

Total: 18 tasks across 6 chunks. Chunks 1-5 are the generator app (sequential). Chunk 6 (Lighthouse template) is independent and can be done in parallel.
