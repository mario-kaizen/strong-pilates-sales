import { parse } from 'csv-parse/sync'
import type { HapanaResult, MonthlyData, PlanBreakdown, TierData } from './types'

interface HapanaRow {
  'Full Name': string
  'Email': string
  'Phone': string
  'Address': string
  'Postal Code': string
  'Member Created Date': string
  'Package Name': string
  'Package Type': string
  'Package Category': string
  'Package Price': string
  'Package Status': string
  'Date Sold': string
  'Intro Offer Purchase Date': string
  'Auto Renew': string
  'Auto Renew Date': string
  'Expiry date': string
  'Completed Date': string
  'Last Payment Date': string
  'Last Payment Amount': string
  'Next Payment Date': string
  'Next Payment Amount': string
  'Member Inactive Date': string
  'Cancel Date': string
  'Cancellation Reason': string
  [key: string]: string
}

/** Parse DD/MM/YYYY into a Date object. Returns null if blank or invalid. */
function parseDMY(value: string): Date | null {
  if (!value || !value.trim()) return null
  const parts = value.trim().split('/')
  if (parts.length !== 3) return null
  const [day, month, year] = parts.map(Number)
  if (isNaN(day) || isNaN(month) || isNaN(year)) return null
  return new Date(year, month - 1, day)
}

/** Format a Date as YYYY-MM for monthly grouping. */
function toMonthKey(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${y}-${m}`
}

/** Strip currency formatting ($1,234.56 → 1234.56). Returns 0 if blank/invalid. */
function parsePrice(value: string): number {
  if (!value || !value.trim()) return 0
  const cleaned = value.replace(/[$,]/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/** Ensure a month bucket exists in monthlyData. */
function ensureMonth(monthlyData: MonthlyData, key: string): void {
  if (!monthlyData[key]) {
    monthlyData[key] = {
      intros: 0,
      memberships: 0,
      packages: 0,
      cancellations: 0,
    }
  }
}

export function processHapanaCsvs(csvContents: string[]): HapanaResult {
  // Parse all CSVs and combine into one flat array
  const allRows: HapanaRow[] = []
  for (const content of csvContents) {
    if (!content || !content.trim()) continue
    const rows = parse(content, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as HapanaRow[]
    allRows.push(...rows)
  }

  // ── Category & status sets ───────────────────────────────────────────────
  const INTRO_CATEGORY = 'Intro Offer'
  const MEMBERSHIP_CATEGORY = 'Memberships'

  // ── Unique buyer sets ────────────────────────────────────────────────────
  const introBuyerEmails = new Set<string>()
  const memberHolderEmails = new Set<string>()

  // ── Counters ─────────────────────────────────────────────────────────────
  let totalIntros = 0
  let totalMemberships = 0
  let totalCancellations = 0
  let totalPackages = 0
  let activeMemberships = 0
  let activeIntros = 0
  let suspendedCount = 0
  let totalMrr = 0

  // ── Monthly data ─────────────────────────────────────────────────────────
  const monthlyData: MonthlyData = {}

  // ── Breakdowns ────────────────────────────────────────────────────────────
  const membershipBreakdown: PlanBreakdown = {}
  const introBreakdown: { [name: string]: number } = {}
  const suspendedBreakdown: { [name: string]: number } = {}
  const cancellationReasons: { [reason: string]: number } = {}

  // ── Tier data ─────────────────────────────────────────────────────────────
  const memberTiers: TierData = {
    premium: { count: 0, revenue: 0 },
    mid: { count: 0, revenue: 0 },
    low: { count: 0, revenue: 0 },
  }

  // ── Process each row ──────────────────────────────────────────────────────
  for (const row of allRows) {
    const category = (row['Package Category'] || '').trim()
    const status = (row['Package Status'] || '').trim()
    const email = (row['Email'] || '').trim().toLowerCase()
    const packageName = (row['Package Name'] || '').trim()
    const price = parsePrice(row['Package Price'])
    const dateSold = parseDMY(row['Date Sold'])
    const cancelDate = parseDMY(row['Cancel Date'])

    // ── Classify by category ────────────────────────────────────────────────
    if (category === INTRO_CATEGORY) {
      totalIntros++
      if (email) introBuyerEmails.add(email)

      // Monthly intro by Date Sold
      if (dateSold) {
        const key = toMonthKey(dateSold)
        ensureMonth(monthlyData, key)
        monthlyData[key].intros++
      }

      // Active intro breakdown
      if (status === 'Active') {
        activeIntros++
        introBreakdown[packageName] = (introBreakdown[packageName] || 0) + 1
      }
    } else if (category === MEMBERSHIP_CATEGORY) {
      totalMemberships++
      if (email) memberHolderEmails.add(email)

      // Monthly membership by Date Sold
      if (dateSold) {
        const key = toMonthKey(dateSold)
        ensureMonth(monthlyData, key)
        monthlyData[key].memberships++
      }

      if (status === 'Active') {
        activeMemberships++
        totalMrr += price

        // Membership breakdown
        if (!membershipBreakdown[packageName]) {
          membershipBreakdown[packageName] = { count: 0, revenue: 0, price: 0 }
        }
        membershipBreakdown[packageName].count++
        membershipBreakdown[packageName].revenue += price

        // Tier classification (only non-zero priced memberships)
        if (price > 0) {
          if (price >= 196) {
            memberTiers.premium.count++
            memberTiers.premium.revenue += price
          } else if (price >= 100) {
            memberTiers.mid.count++
            memberTiers.mid.revenue += price
          } else {
            memberTiers.low.count++
            memberTiers.low.revenue += price
          }
        }
      } else if (status === 'Suspended') {
        suspendedCount++
        suspendedBreakdown[packageName] = (suspendedBreakdown[packageName] || 0) + 1
      }

      // Cancellations (membership category)
      if (status === 'Cancelled') {
        totalCancellations++
        if (cancelDate) {
          const key = toMonthKey(cancelDate)
          ensureMonth(monthlyData, key)
          monthlyData[key].cancellations++
        }
        const reason = (row['Cancellation Reason'] || '').trim() || 'Unknown'
        cancellationReasons[reason] = (cancellationReasons[reason] || 0) + 1
      }
    } else {
      // Other packages (not intro or membership)
      totalPackages++
      if (dateSold) {
        const key = toMonthKey(dateSold)
        ensureMonth(monthlyData, key)
        monthlyData[key].packages++
      }
    }
  }

  // Finalise average price per membership plan
  for (const planName of Object.keys(membershipBreakdown)) {
    const plan = membershipBreakdown[planName]
    plan.price = plan.count > 0 ? plan.revenue / plan.count : 0
  }

  // ── Derived metrics ───────────────────────────────────────────────────────
  // Count emails that appear in BOTH intro buyers AND membership holders
  let converted = 0
  for (const email of introBuyerEmails) {
    if (memberHolderEmails.has(email)) converted++
  }

  const uniqueIntroBuyers = introBuyerEmails.size
  const uniqueMemberHolders = memberHolderEmails.size
  const introConversionRate =
    uniqueIntroBuyers > 0
      ? parseFloat(((converted / uniqueIntroBuyers) * 100).toFixed(1))
      : 0
  const churnRate =
    totalMemberships > 0
      ? parseFloat(((totalCancellations / totalMemberships) * 100).toFixed(1))
      : 0
  const avgMemberValue =
    activeMemberships > 0
      ? parseFloat((totalMrr / activeMemberships).toFixed(2))
      : 0

  return {
    totalIntros,
    totalMemberships,
    totalCancellations,
    totalPackages,
    activeMemberships,
    activeIntros,
    suspendedCount,
    uniqueIntroBuyers,
    uniqueMemberHolders,
    introConversionRate,
    churnRate,
    totalMrr: parseFloat(totalMrr.toFixed(2)),
    avgMemberValue,
    monthlyData,
    membershipBreakdown,
    introBreakdown,
    suspendedBreakdown,
    memberTiers,
    cancellationReasons,
  }
}
