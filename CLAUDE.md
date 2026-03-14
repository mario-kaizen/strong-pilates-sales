# STRONG Pilates Sales — Project Instructions

## What This Is
Sales intelligence and proposal generation system for STRONG Pilates prospects. Uses a 3-source data stack (Sales Transcript + CRM Data + Member Management Data) to build data-driven proposals and 12-week DWY pathways.

## The Sales Intelligence Stack
1. **Sales call transcript** — Mario's diagnosis of the prospect's blindspots
2. **Hapana Grow (CRM)** — contact data via GHL PIT (whitelabelled GoHighLevel)
3. **Hapana Core (Member Management)** — membership/intro/package data via CSV export (getMembershipDetails)
4. **Meta Ads data** — campaign CSV export from Ads Manager

## STRONG Pilates Context
- Hapana Grow = GoHighLevel (whitelabelled). Access via PIT (Private Integration Token)
- Hapana Core = member management system. Data comes as CSV export (getMembershipDetails)
- STRONG HQ sets the intro offer structure — franchisees don't control this
- We already have access to Core and Grow for STRONG clients
- Setup completes in 7 days (vs 14 for non-STRONG) because offers are pre-set
- Kaizen DWY offer: $300/week, includes ads, CRM, copy, design, strategy

## Key Data Caveats
- Hapana Core `getMembershipDetails` export ONLY shows Active, Scheduled, Pending, and Suspended records
- Expired intros, completed packages, and cancelled memberships are NOT included unless a separate cancelled/completed report is pulled
- Meta Ads "Results" column changes meaning based on the conversion event set — always check the "Result indicator" column
- Landing page views (omni_landing_page_view) are NOT leads — exclude from lead counts
- GHL creates contacts from IG messages that don't have emails — filter to email-only for accurate contact counts

## Proposal Structure (13 sections)
1. Snapshot — key stats
2. The Core Problem — intro offer conversion leak
3. Month-by-Month Activity — full pipeline chart
4. Revenue — MRR breakdown by plan
5. Intro Offer Analysis — offer complexity
6. Retention Risk — suspended members
7. The Real Cost — ad spend analysis (presale separated from operating)
8. Membership Value — price tier analysis
9. The Opportunity — conversion improvement projection
10. Case Study: STRONG Kelowna — live results
11. The Pathway — 12-week DWY runway with "What We Need from You" per phase
12. How We Work — $300/week DWY, what's included
13. Next Steps — CTA

## Design System
- Kaizen brand: Playfair Display + DM Sans, cream/ink/gold palette
- Charts: Chart.js (include local fallback `chart.min.js`)
- Self-contained HTML — opens in Chrome, no server needed
- Mobile responsive (breakpoints at 768px and 480px)

## File Structure
- `strong-the-beach-to-report.html` — The Beach TO proposal (first client)
- `chart.min.js` — Chart.js local fallback
- Future: template generator, internal playbook app
