import { parse } from 'csv-parse/sync'
import type { MetaAdsResult, MetaAdsMonthlyData, CampaignGroup } from './types'

interface MetaAdsRow {
  'Reporting starts': string
  'Reporting ends': string
  'Campaign name': string
  'Result indicator': string
  'Results': string
  'Reach': string
  'Impressions': string
  'Clicks (all)': string
  'Purchases': string
  'Landing page views': string
  [key: string]: string
}

/** Find the value of the first column whose name starts with the given prefix. */
function getByPrefix(row: MetaAdsRow, prefix: string): string {
  for (const key of Object.keys(row)) {
    if (key.startsWith(prefix)) return row[key] || ''
  }
  return ''
}

/** Parse a numeric string (may be empty, '-', or a number). Returns 0 if invalid. */
function parseNum(value: string): number {
  if (!value || !value.trim() || value.trim() === '-') return 0
  const cleaned = value.replace(/,/g, '').trim()
  const num = parseFloat(cleaned)
  return isNaN(num) ? 0 : num
}

/** Format a YYYY-MM-DD date string as a YYYY-MM month key. */
function toMonthKey(dateStr: string): string {
  if (!dateStr || dateStr.length < 7) return ''
  return dateStr.substring(0, 7)
}

/** Classify result indicator into lead type buckets. */
function classifyResultIndicator(indicator: string): {
  isLeadForm: boolean
  isPixelLead: boolean
  isCustomEvent: boolean
  isLpv: boolean
} {
  const ind = (indicator || '').trim()
  return {
    isLeadForm:
      ind === 'actions:lead' || ind === 'actions:leadgen.other',
    isPixelLead:
      ind === 'actions:offsite_conversion.fb_pixel_lead',
    isCustomEvent:
      ind.startsWith('actions:offsite_conversion.custom.'),
    isLpv:
      ind === 'actions:omni_landing_page_view',
  }
}

/** Classify a campaign name into a campaign group label. First match wins. */
function classifyCampaign(name: string): string {
  if (/Conversions/i.test(name)) return 'Presale Conversions'
  if (/CONV/i.test(name)) return 'Conversion Campaigns'
  // LF campaigns in old pipe-separated format (contains '|')
  if (/LF/i.test(name) && name.includes('|')) return 'Lead Form Campaigns'
  if (/Traffic/i.test(name)) return 'Traffic Campaigns'
  // SF_ prefix = new underscore format
  if (/^SF_/i.test(name)) return 'New Format Campaigns'
  return 'Other'
}

export function processMetaAdsCsv(
  csvContent: string,
  openingDate: Date
): MetaAdsResult {
  if (!csvContent || !csvContent.trim()) {
    return {
      totalSpend: 0,
      presaleSpend: 0,
      operatingSpend: 0,
      operatingLeads: 0,
      operatingCpl: 0,
      costPerIntro: 0,
      monthlyData: {},
      campaignBreakdown: [],
      realLeads: 0,
    }
  }

  const rows = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as MetaAdsRow[]

  // Opening month key (YYYY-MM)
  const openingMonthKey = toMonthKey(
    `${openingDate.getFullYear()}-${String(openingDate.getMonth() + 1).padStart(2, '0')}-01`
  )

  const monthlyData: MetaAdsMonthlyData = {}

  // Campaign groups: name → { spend, leads }
  const campaignMap: { [groupName: string]: { spend: number; leads: number } } = {}

  let totalSpend = 0
  let presaleSpend = 0
  let operatingSpend = 0
  let operatingLeads = 0

  for (const row of rows) {
    const reportingStart = (row['Reporting starts'] || '').trim()
    if (!reportingStart) continue

    const monthKey = toMonthKey(reportingStart)
    if (!monthKey) continue

    const spend = parseNum(getByPrefix(row, 'Amount spent'))
    const results = parseNum(row['Results'] || '')
    const impressions = parseNum(row['Impressions'] || '')
    const clicks = parseNum(row['Clicks (all)'] || '')
    const purchases = parseNum(row['Purchases'] || '')
    const landingPageViews = parseNum(row['Landing page views'] || '')

    // Classify result indicator
    const indicator = (row['Result indicator'] || '').trim()
    const { isLeadForm, isPixelLead, isCustomEvent, isLpv } =
      classifyResultIndicator(indicator)

    const leadForms = isLeadForm ? results : 0
    const pixelLeads = isPixelLead ? results : 0
    const customEvents = isCustomEvent ? results : 0
    const lpvResults = isLpv ? results : 0
    const realLeads = leadForms + pixelLeads + customEvents
    // "leads" column = all result rows that are not LPV
    const leads = isLpv ? 0 : results

    // Ensure month bucket
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = {
        spend: 0,
        leads: 0,
        realLeads: 0,
        impressions: 0,
        clicks: 0,
        purchases: 0,
        landingPageViews: 0,
        leadForms: 0,
        pixelLeads: 0,
        customEvents: 0,
        lpvResults: 0,
      }
    }
    monthlyData[monthKey].spend += spend
    monthlyData[monthKey].leads += leads
    monthlyData[monthKey].realLeads += realLeads
    monthlyData[monthKey].impressions += impressions
    monthlyData[monthKey].clicks += clicks
    monthlyData[monthKey].purchases += purchases
    monthlyData[monthKey].landingPageViews += landingPageViews
    monthlyData[monthKey].leadForms += leadForms
    monthlyData[monthKey].pixelLeads += pixelLeads
    monthlyData[monthKey].customEvents += customEvents
    monthlyData[monthKey].lpvResults += lpvResults

    // Total spend
    totalSpend += spend

    // Period classification
    if (monthKey < openingMonthKey) {
      presaleSpend += spend
    } else if (monthKey > openingMonthKey) {
      operatingSpend += spend
      operatingLeads += realLeads
    }
    // Opening month itself is excluded from presale and operating totals

    // Campaign grouping
    const campaignName = (row['Campaign name'] || '').trim()
    const groupName = classifyCampaign(campaignName)
    if (!campaignMap[groupName]) {
      campaignMap[groupName] = { spend: 0, leads: 0 }
    }
    campaignMap[groupName].spend += spend
    campaignMap[groupName].leads += realLeads
  }

  const operatingCpl =
    operatingLeads > 0
      ? parseFloat((operatingSpend / operatingLeads).toFixed(2))
      : 0

  // Build campaign breakdown array, sorted by spend descending
  const campaignBreakdown: CampaignGroup[] = Object.entries(campaignMap)
    .map(([name, data]) => ({
      name,
      spend: parseFloat(data.spend.toFixed(2)),
      leads: data.leads,
    }))
    .sort((a, b) => b.spend - a.spend)

  // Total real leads across all months
  const realLeads = Object.values(monthlyData).reduce(
    (sum, m) => sum + m.realLeads,
    0
  )

  return {
    totalSpend: parseFloat(totalSpend.toFixed(2)),
    presaleSpend: parseFloat(presaleSpend.toFixed(2)),
    operatingSpend: parseFloat(operatingSpend.toFixed(2)),
    operatingLeads,
    operatingCpl,
    costPerIntro: 0, // calculated later when combined with Hapana data
    monthlyData,
    campaignBreakdown,
    realLeads,
  }
}
