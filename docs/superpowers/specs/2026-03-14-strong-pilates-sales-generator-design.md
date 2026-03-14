# STRONG Pilates Sales Proposal Generator — Design Spec

**Date:** 2026-03-14
**Status:** Approved
**Author:** Mario Paguio + Claude

---

## Purpose

Internal tool that generates data-driven sales proposals for STRONG Pilates prospects. Takes raw data inputs (call transcript, Hapana Core CSVs, Meta Ads CSV, GHL PIT) and produces a branded, shareable proposal page with charts, metrics, and a 12-week DWY pathway.

Deployed at `strong.kaizencollective.com.au`. Each prospect gets a route: `/the-beach-to`, `/kelowna`, etc.

## Users

Mario only. No auth required — the URL itself is sufficiently private.

---

## Tech Stack

- **Framework:** Next.js 16 + App Router
- **Database:** Prisma 7 + SQLite (single-user internal tool, no need for Postgres)
- **Styling:** Tailwind v4, Kaizen design system (Playfair Display + DM Sans, cream/ink/gold)
- **Charts:** Chart.js 4 (bundled, not CDN — for reliability)
- **AI:** Anthropic SDK (Claude Sonnet for transcript analysis)
- **Deployment:** Coolify (Docker, `strong.kaizencollective.com.au`)

---

## Pages

### 1. Dashboard (`/`)

List of all prospects. Each row shows:
- Location name, city, country
- Status badge: `draft` | `processing` | `ready` | `sent`
- Key stats preview: active members, MRR, intro conversion rate
- Link to proposal page
- Created date

Actions: "New Prospect" button.

### 2. New Prospect Wizard (`/new`)

Multi-step form with 5 steps. Progress indicator at top.

**Step 1 — Location Details**
- Location name (text input)
- City, country, address (text inputs)
- GHL Location ID (text input)
- GHL PIT (text input, masked)
- Approximate opening date (date picker)
- Slug (auto-generated from location name, editable)

**Step 2 — Call Transcript**
- Toggle: "Paste text" or "Upload file"
- Text area (paste mode): placeholder "Paste your sales call notes or transcript here. Include the challenges they mentioned and your diagnosis."
- File upload (upload mode): accepts `.txt` files
- Either input is sufficient

**Step 3 — Hapana Core**
- Drag-and-drop zone accepting multiple CSV files (1-3)
- Instructions panel:
  ```
  Export getMembershipDetails from Hapana Core. We need up to 3 reports:
  1. Active members (Active, Scheduled, Pending, Suspended)
  2. Cancelled memberships
  3. Completed/expired intros and packages

  Upload any combination — we'll detect what's in each file
  from the Package Status column.
  ```
- As files are dropped, show processing status:
  - "Active records: 1,579 rows found"
  - "Cancelled records: 230 rows found"
  - "Completed records: 1,089 rows found"
- Validation: must have at least one file with recognisable columns

**Step 4 — Meta Ads**
- Single file drag-and-drop zone
- Instructions panel:
  ```
  From Meta Ads Manager:
  1. Select all campaigns for this location
  2. Set date range to cover the full history (from first ad to today)
  3. Set Breakdown → By Time → Month
  4. Columns needed: Amount Spent, Results, Result Indicator,
     Leads, Impressions, Link Clicks, Purchases, Landing Page Views
  5. Export → Export Table Data → CSV

  Tip: Make sure "Result Indicator" is included — this tells us
  what Meta counted as a "result" each month, which changes over time.
  ```
- Processing status shows: total spend, date range, number of campaigns detected

**Step 5 — Review & Generate**
- Summary cards showing what was uploaded and key stats detected:
  - Hapana: X records across Y files, date range
  - Meta Ads: $X total spend, Y campaigns, date range
  - GHL: Connected / Not connected (tests PIT on this step)
  - Transcript: X words / characters
- "Generate Proposal" button
- Processing state: spinner with status messages ("Analysing transcript...", "Processing Hapana data...", "Pulling GHL contacts...", "Building proposal...")
- On completion: redirect to `/[slug]`

### 3. Proposal Page (`/[slug]`)

Public-facing proposal page. Same 14-section structure as the current `strong-the-beach-to-report.html`, rendered dynamically from stored data.

**Sections:**
1. Hero + location details
2. Snapshot (8 stat cards)
3. The Core Problem (conversion funnel)
4. Month-by-Month Activity (pipeline chart + sub-charts)
5. Revenue (MRR breakdown, plan table)
6. Intro Offer Analysis (offer complexity)
7. Retention Risk (suspended members)
8. Cancellation Deep-Dive (monthly cancellations, net growth)
9. The Real Cost (ad spend analysis, period breakdown, campaign chart)
10. Membership Value (tier analysis, STRONG 4 callout)
11. The Opportunity (projection based on actual conversion + churn rates)
12. Case Study: STRONG Kelowna (static for now)
13. The 12-Week Pathway (mostly static, with prospect-specific numbers injected)
14. How We Work + Next Steps (static DWY offer)

Design system: Kaizen (Playfair Display + DM Sans, cream/ink/gold palette). Mobile responsive. Chart.js for all charts.

### 4. Edit Prospect (`/[slug]/edit`)

Simple form to update location details or re-upload files. Allows regenerating the proposal with updated data without creating a new prospect.

---

## Data Model

```prisma
model Prospect {
  id            String   @id @default(cuid())
  slug          String   @unique
  locationName  String
  city          String
  country       String
  address       String   @default("")
  ghlLocationId String   @default("")
  ghlPit        String   @default("")
  openingDate   DateTime?
  status        String   @default("draft") // draft, processing, ready, sent
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

  // GHL / Grow data
  totalContacts      Int @default(0)
  contactsWithEmail  Int @default(0)

  // Hapana Core aggregates
  totalIntros        Int @default(0)
  totalMemberships   Int @default(0)
  totalCancellations Int @default(0)
  totalPackages      Int @default(0)
  activeMemberships  Int @default(0)
  activeIntros       Int @default(0)
  suspendedCount     Int @default(0)
  uniqueIntrobuyers  Int @default(0)
  uniqueMemberHolders Int @default(0)
  introConversionRate Float @default(0)
  churnRate          Float @default(0)
  totalMrr           Float @default(0)
  avgMemberValue     Float @default(0)

  // Ad spend aggregates
  totalAdSpend       Float @default(0)
  presaleAdSpend     Float @default(0)
  operatingAdSpend   Float @default(0)
  operatingLeads     Int @default(0)
  operatingCpl       Float @default(0)
  costPerIntro       Float @default(0)

  // JSON blobs for chart data
  monthlyData          String @default("{}") // JSON: { contacts, accounts, intros, memberships, packages, cancellations per month }
  membershipBreakdown  String @default("{}") // JSON: plan name -> { count, revenue, price }
  introBreakdown       String @default("{}") // JSON: offer name -> count
  campaignBreakdown    String @default("{}") // JSON: grouped campaign data
  suspendedBreakdown   String @default("{}") // JSON: plan name -> count
  memberTiers          String @default("{}") // JSON: { premium, mid, low } counts + revenue
  funnelData           String @default("{}") // JSON: { contacts, accounts, introBuyers, converted, active }
  cancellationReasons  String @default("{}") // JSON: reason -> count
}

model Diagnosis {
  id            String @id @default(cuid())
  prospectId    String @unique
  prospect      Prospect @relation(fields: [prospectId], references: [id], onDelete: Cascade)

  challenges     String @default("[]") // JSON array of strings
  blindspots     String @default("[]") // JSON array of strings
  recommendations String @default("[]") // JSON array of strings
  summary        String @default("") // One-paragraph executive summary
  rawTranscript  String @default("")
}

model Upload {
  id         String @id @default(cuid())
  prospectId String
  prospect   Prospect @relation(fields: [prospectId], references: [id], onDelete: Cascade)

  type       String // hapana_core, meta_ads, transcript
  filename   String
  status     String @default("pending") // pending, processed, error
  rowCount   Int    @default(0)
  metadata   String @default("{}") // JSON: detected statuses, date range, etc.
  createdAt  DateTime @default(now())
}
```

---

## Processing Pipeline

### 1. Hapana Core Processing (`lib/processors/hapana.ts`)

Input: 1-3 CSV files (any combination of active/cancelled/completed).

Processing steps:
1. Parse each CSV, detect content by `Package Status` column values
2. Combine all rows into unified dataset
3. For each row, parse: `Full Name`, `Email`, `Package Name`, `Package Type`, `Package Category`, `Package Price`, `Package Status`, `Date Sold`, `Member Created Date`, `Cancel Date`, `Member Inactive Date`
4. Date parsing: handle `DD/MM/YYYY` format (Hapana's format)
5. Price parsing: strip `$` and `,`, parse as float

Computed metrics:
- Unique intro buyers (by email, where Package Category = "Intro Offer")
- Unique membership holders (by email, where Package Category = "Memberships")
- Intro-to-member conversion: intersection of intro buyers and membership holders
- Monthly breakdown: intros, memberships, packages, cancellations by `Date Sold` / `Cancel Date`
- Active membership breakdown by plan: name, count, price, revenue
- Intro offer breakdown by name: count per type
- Suspended breakdown by plan
- Membership tier analysis: Premium ($196+), Mid ($100-195), Low (under $100)
- Cancellation reasons (from `Cancellation Reason` column)
- MRR: sum of active membership prices

### 2. Meta Ads Processing (`lib/processors/meta-ads.ts`)

Input: Single CSV from Meta Ads Manager.

Processing steps:
1. Parse CSV with columns: `Reporting starts`, `Reporting ends`, `Campaign name`, `Results`, `Result indicator`, `Amount spent (CAD)`, `Impressions`, `Link clicks`, `Leads`, `Purchases`, `Landing page views`
2. Group by month (from `Reporting starts`)
3. For each month, sum: spend, leads (from `Leads` column), impressions, clicks, purchases, landing page views
4. Classify results by `Result indicator`:
   - `actions:lead` + `actions:leadgen.other` = lead form submissions
   - `actions:offsite_conversion.fb_pixel_lead` = pixel lead events
   - `actions:offsite_conversion.custom.*` = custom pixel events
   - `actions:omni_landing_page_view` = NOT leads (exclude from lead counts)
5. Real leads = lead forms + pixel leads + custom events (exclude LPV)
6. Split into periods based on prospect's opening date:
   - Presale: before opening month
   - Opening: the opening month
   - Operating: after opening month
7. Calculate operating CPL, cost per intro (using Hapana intro count)
8. Group campaigns by type (presale, conversion, lead form, traffic, other)

### 3. GHL Contact Pull (`lib/processors/ghl.ts`)

Input: GHL Location ID + PIT.

Processing steps:
1. Paginate through all contacts via GHL API (`/contacts/?locationId=X&limit=100`)
2. Filter to contacts with a non-empty email
3. Group by month (from `dateAdded`)
4. Store: total contacts, contacts with email, monthly breakdown

Rate limiting: 100ms delay between pages to avoid API throttling.

### 4. Transcript Analysis (`lib/processors/transcript.ts`)

Input: Raw transcript text or pasted notes.

Processing: Single Claude API call (Sonnet) with system prompt:

```
You are analysing a sales call transcript or notes from a business coach
(Mario Paguio, Kaizen Collective) with a STRONG Pilates studio owner.

Extract:
1. challenges: The problems the prospect described (their words/perspective)
2. blindspots: What Mario identified that the prospect can't see
3. recommendations: What Mario prescribed as the solution
4. summary: A 2-3 sentence executive summary of the diagnosis

Return as JSON: { challenges: string[], blindspots: string[], recommendations: string[], summary: string }
```

### 5. Proposal Generation (`lib/generators/proposal.ts`)

Takes all processed data and generates the `ProspectData` record with all JSON fields populated. This is a pure computation step — no AI, just data transformation and calculation.

The proposal page (`/[slug]`) reads from this record and renders the 14-section template with the data injected.

---

## Proposal Template

The proposal page is a React Server Component that:
1. Fetches the prospect + data + diagnosis from the database
2. Renders the 14-section layout with Kaizen design system
3. Injects Chart.js charts via a client component wrapper
4. Responsive (mobile + desktop)

The current `strong-the-beach-to-report.html` is the reference implementation. The React version follows the same structure, styles, and chart configurations — just with dynamic data instead of hardcoded values.

Static sections (Kelowna case study, 12-week pathway, DWY offer, next steps) are shared components used across all proposals.

Dynamic sections receive props from the database and render accordingly.

---

## File Structure

```
strong-pilates-sales/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout, fonts, global styles
│   │   ├── page.tsx                # Dashboard — list of prospects
│   │   ├── new/
│   │   │   └── page.tsx            # Upload wizard (client component)
│   │   ├── [slug]/
│   │   │   ├── page.tsx            # Proposal page (server component)
│   │   │   └── edit/
│   │   │       └── page.tsx        # Edit prospect
│   │   └── api/
│   │       ├── prospects/
│   │       │   ├── route.ts        # POST: create prospect
│   │       │   └── [id]/
│   │       │       ├── route.ts    # PATCH: update prospect
│   │       │       └── generate/
│   │       │           └── route.ts # POST: trigger processing
│   │       ├── upload/
│   │       │   └── route.ts        # POST: file upload handler
│   │       └── ghl/
│   │           └── test/
│   │               └── route.ts    # POST: test GHL PIT connection
│   ├── components/
│   │   ├── proposal/               # All 14 proposal sections as components
│   │   │   ├── Hero.tsx
│   │   │   ├── Snapshot.tsx
│   │   │   ├── ConversionFunnel.tsx
│   │   │   ├── MonthlyActivity.tsx
│   │   │   ├── Revenue.tsx
│   │   │   ├── IntroOfferAnalysis.tsx
│   │   │   ├── RetentionRisk.tsx
│   │   │   ├── CancellationDeepDive.tsx
│   │   │   ├── RealCost.tsx
│   │   │   ├── MembershipValue.tsx
│   │   │   ├── Opportunity.tsx
│   │   │   ├── CaseStudyKelowna.tsx
│   │   │   ├── TwelveWeekPathway.tsx
│   │   │   ├── HowWeWork.tsx
│   │   │   └── NextSteps.tsx
│   │   ├── charts/
│   │   │   └── ChartWrapper.tsx    # Client component for Chart.js
│   │   ├── wizard/
│   │   │   ├── WizardShell.tsx
│   │   │   ├── StepLocation.tsx
│   │   │   ├── StepTranscript.tsx
│   │   │   ├── StepHapanaCore.tsx
│   │   │   ├── StepMetaAds.tsx
│   │   │   └── StepReview.tsx
│   │   └── ui/
│   │       ├── StatCard.tsx
│   │       ├── Callout.tsx
│   │       ├── InsightCard.tsx
│   │       └── DropZone.tsx
│   └── lib/
│       ├── processors/
│       │   ├── hapana.ts
│       │   ├── meta-ads.ts
│       │   ├── ghl.ts
│       │   └── transcript.ts
│       ├── generators/
│       │   └── proposal.ts
│       └── db.ts                   # Prisma client
├── prisma/
│   └── schema.prisma
├── public/
│   └── fonts/                      # Playfair Display + DM Sans
├── docs/
│   └── superpowers/specs/
│       └── 2026-03-14-strong-pilates-sales-generator-design.md
├── Dockerfile
├── CLAUDE.md
└── package.json
```

---

## Deployment

- **Coolify** on existing DigitalOcean droplet (`170.64.153.122`)
- **Domain:** `strong.kaizencollective.com.au`
- **DNS:** A record `strong` → `170.64.153.122` in Cloudflare
- **Docker:** Multi-stage build (Node alpine)
- **Environment variables:** `DATABASE_URL` (SQLite path), `ANTHROPIC_API_KEY`
- **Auto-deploy on push to main**

---

## Out of Scope (Future)

- Lighthouse project template integration (auto-create onboarding tasks)
- Multiple case studies (currently Kelowna only)
- PDF export
- Email sending from the app
- Non-STRONG Pilates prospects (different offer structure)
- Meta Marketing API integration (currently CSV upload)
