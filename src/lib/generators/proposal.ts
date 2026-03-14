import { prisma } from '@/lib/db'
import { processHapanaCsvs } from '@/lib/processors/hapana'
import { processMetaAdsCsv } from '@/lib/processors/meta-ads'
import { pullGhlContacts } from '@/lib/processors/ghl'
import { analyseTranscript } from '@/lib/processors/transcript'
import type { FunnelData, HapanaResult, MetaAdsResult, GhlResult } from '@/lib/processors/types'

/**
 * Optional raw CSV overrides for testing before upload wizard (Task 10) is built.
 */
export interface GenerateOverrides {
  hapanaCsvContents?: string[]
  metaAdsCsvContent?: string
}

export async function generateProposalData(
  prospectId: string,
  overrides?: GenerateOverrides
): Promise<void> {
  // ── 1. Fetch prospect with all related data ────────────────────────────────
  const prospect = await prisma.prospect.findUnique({
    where: { id: prospectId },
    include: { uploads: true, diagnosis: true },
  })

  if (!prospect) {
    throw new Error(`Prospect not found: ${prospectId}`)
  }

  // ── 2. Process Hapana uploads ──────────────────────────────────────────────
  let hapanaResult: HapanaResult | null = null

  const hapanaCsvContents: string[] = overrides?.hapanaCsvContents ?? []

  if (hapanaCsvContents.length === 0) {
    // Read from upload metadata (rows stored as JSON string arrays)
    const hapanaUploads = prospect.uploads.filter(u => u.type === 'hapana_core')
    for (const upload of hapanaUploads) {
      try {
        const meta = JSON.parse(upload.metadata) as { csvContent?: string; rows?: unknown[] }
        // Support either raw csvContent or serialised rows reconstructed as CSV
        if (meta.csvContent && typeof meta.csvContent === 'string') {
          hapanaCsvContents.push(meta.csvContent)
        } else if (Array.isArray(meta.rows) && meta.rows.length > 0) {
          // Reconstruct a minimal CSV from stored rows for the processor
          const rows = meta.rows as Record<string, string>[]
          const headers = Object.keys(rows[0])
          const lines = [
            headers.join(','),
            ...rows.map(r =>
              headers
                .map(h => {
                  const v = String(r[h] ?? '')
                  return v.includes(',') || v.includes('"') ? `"${v.replace(/"/g, '""')}"` : v
                })
                .join(',')
            ),
          ]
          hapanaCsvContents.push(lines.join('\n'))
        }
      } catch {
        // Malformed metadata — skip this upload
      }
    }
  }

  if (hapanaCsvContents.length > 0) {
    hapanaResult = processHapanaCsvs(hapanaCsvContents)
  }

  // ── 3. Process Meta Ads upload ─────────────────────────────────────────────
  let metaAdsResult: MetaAdsResult | null = null

  const metaAdsCsvContent: string =
    overrides?.metaAdsCsvContent ??
    (() => {
      const metaUpload = prospect.uploads.find(u => u.type === 'meta_ads')
      if (!metaUpload) return ''
      try {
        const meta = JSON.parse(metaUpload.metadata) as { csvContent?: string }
        return meta.csvContent ?? ''
      } catch {
        return ''
      }
    })()

  if (metaAdsCsvContent.trim()) {
    // Auto-detect opening date if not provided
    // Heuristic: first month with memberships sold in Hapana data, or first month with leads in Meta
    let openingDate = prospect.openingDate
    if (!openingDate && hapanaResult) {
      const months = Object.keys(hapanaResult.monthlyData).sort()
      const firstMemberMonth = months.find(m => hapanaResult!.monthlyData[m].memberships > 0)
      if (firstMemberMonth) {
        openingDate = new Date(firstMemberMonth + '-01')
      }
    }
    if (!openingDate) {
      // Fallback: treat everything as operating period
      openingDate = new Date('2000-01-01')
    }
    metaAdsResult = processMetaAdsCsv(metaAdsCsvContent, openingDate)
  }

  // ── 4. Pull GHL contacts (optional) ───────────────────────────────────────
  let ghlResult: GhlResult | null = null

  if (prospect.ghlLocationId && prospect.ghlPit) {
    ghlResult = await pullGhlContacts(prospect.ghlLocationId, prospect.ghlPit)
  }

  // ── 5. Analyse transcript (optional) ──────────────────────────────────────
  if (prospect.diagnosis?.rawTranscript?.trim()) {
    const diagnosisResult = await analyseTranscript(prospect.diagnosis.rawTranscript)
    await prisma.diagnosis.update({
      where: { prospectId },
      data: {
        challenges: JSON.stringify(diagnosisResult.challenges),
        blindspots: JSON.stringify(diagnosisResult.blindspots),
        recommendations: JSON.stringify(diagnosisResult.recommendations),
        summary: diagnosisResult.summary,
      },
    })
  }

  // ── 6. Compute costPerIntro ────────────────────────────────────────────────
  let costPerIntro = 0
  if (metaAdsResult && hapanaResult && hapanaResult.totalIntros > 0) {
    costPerIntro = parseFloat(
      (metaAdsResult.operatingSpend / hapanaResult.totalIntros).toFixed(2)
    )
    metaAdsResult.costPerIntro = costPerIntro
  }

  // ── 7. Assemble FunnelData ─────────────────────────────────────────────────
  const funnelData: FunnelData = {
    contacts: ghlResult?.totalContacts ?? 0,
    contactsWithEmail: ghlResult?.contactsWithEmail ?? 0,
    accounts: hapanaResult
      ? hapanaResult.uniqueIntroBuyers + hapanaResult.uniqueMemberHolders
      : 0,
    introBuyers: hapanaResult?.uniqueIntroBuyers ?? 0,
    converted: hapanaResult
      ? Math.round((hapanaResult.introConversionRate / 100) * hapanaResult.uniqueIntroBuyers)
      : 0,
    active: hapanaResult?.activeMemberships ?? 0,
    suspended: hapanaResult?.suspendedCount ?? 0,
    cancelled: hapanaResult?.totalCancellations ?? 0,
  }

  // ── 8. Merge monthly data from Hapana and Meta Ads ────────────────────────
  // Build a combined monthlyData blob (keyed by YYYY-MM)
  const combinedMonthlyData: Record<string, object> = {}

  if (hapanaResult) {
    for (const [month, data] of Object.entries(hapanaResult.monthlyData)) {
      combinedMonthlyData[month] = {
        ...combinedMonthlyData[month],
        hapana: data,
      }
    }
  }
  if (metaAdsResult) {
    for (const [month, data] of Object.entries(metaAdsResult.monthlyData)) {
      combinedMonthlyData[month] = {
        ...combinedMonthlyData[month],
        meta: data,
      }
    }
  }
  if (ghlResult) {
    for (const [month, count] of Object.entries(ghlResult.monthlyContacts)) {
      combinedMonthlyData[month] = {
        ...combinedMonthlyData[month],
        ghlContacts: count,
      }
    }
  }

  // ── 9. Upsert ProspectData ─────────────────────────────────────────────────
  await prisma.prospectData.upsert({
    where: { prospectId },
    create: {
      prospectId,
      // GHL
      totalContacts: ghlResult?.totalContacts ?? 0,
      contactsWithEmail: ghlResult?.contactsWithEmail ?? 0,
      // Hapana
      totalIntros: hapanaResult?.totalIntros ?? 0,
      totalMemberships: hapanaResult?.totalMemberships ?? 0,
      totalCancellations: hapanaResult?.totalCancellations ?? 0,
      totalPackages: hapanaResult?.totalPackages ?? 0,
      activeMemberships: hapanaResult?.activeMemberships ?? 0,
      activeIntros: hapanaResult?.activeIntros ?? 0,
      suspendedCount: hapanaResult?.suspendedCount ?? 0,
      uniqueIntroBuyers: hapanaResult?.uniqueIntroBuyers ?? 0,
      uniqueMemberHolders: hapanaResult?.uniqueMemberHolders ?? 0,
      introConversionRate: hapanaResult?.introConversionRate ?? 0,
      churnRate: hapanaResult?.churnRate ?? 0,
      totalMrr: hapanaResult?.totalMrr ?? 0,
      avgMemberValue: hapanaResult?.avgMemberValue ?? 0,
      // Meta Ads
      totalAdSpend: metaAdsResult?.totalSpend ?? 0,
      presaleAdSpend: metaAdsResult?.presaleSpend ?? 0,
      operatingAdSpend: metaAdsResult?.operatingSpend ?? 0,
      operatingLeads: metaAdsResult?.operatingLeads ?? 0,
      operatingCpl: metaAdsResult?.operatingCpl ?? 0,
      costPerIntro,
      // JSON blobs
      monthlyData: JSON.stringify(combinedMonthlyData),
      membershipBreakdown: JSON.stringify(hapanaResult?.membershipBreakdown ?? {}),
      introBreakdown: JSON.stringify(hapanaResult?.introBreakdown ?? {}),
      campaignBreakdown: JSON.stringify(metaAdsResult?.campaignBreakdown ?? []),
      suspendedBreakdown: JSON.stringify(hapanaResult?.suspendedBreakdown ?? {}),
      memberTiers: JSON.stringify(hapanaResult?.memberTiers ?? {}),
      funnelData: JSON.stringify(funnelData),
      cancellationReasons: JSON.stringify(hapanaResult?.cancellationReasons ?? {}),
    },
    update: {
      // GHL
      totalContacts: ghlResult?.totalContacts ?? 0,
      contactsWithEmail: ghlResult?.contactsWithEmail ?? 0,
      // Hapana
      totalIntros: hapanaResult?.totalIntros ?? 0,
      totalMemberships: hapanaResult?.totalMemberships ?? 0,
      totalCancellations: hapanaResult?.totalCancellations ?? 0,
      totalPackages: hapanaResult?.totalPackages ?? 0,
      activeMemberships: hapanaResult?.activeMemberships ?? 0,
      activeIntros: hapanaResult?.activeIntros ?? 0,
      suspendedCount: hapanaResult?.suspendedCount ?? 0,
      uniqueIntroBuyers: hapanaResult?.uniqueIntroBuyers ?? 0,
      uniqueMemberHolders: hapanaResult?.uniqueMemberHolders ?? 0,
      introConversionRate: hapanaResult?.introConversionRate ?? 0,
      churnRate: hapanaResult?.churnRate ?? 0,
      totalMrr: hapanaResult?.totalMrr ?? 0,
      avgMemberValue: hapanaResult?.avgMemberValue ?? 0,
      // Meta Ads
      totalAdSpend: metaAdsResult?.totalSpend ?? 0,
      presaleAdSpend: metaAdsResult?.presaleSpend ?? 0,
      operatingAdSpend: metaAdsResult?.operatingSpend ?? 0,
      operatingLeads: metaAdsResult?.operatingLeads ?? 0,
      operatingCpl: metaAdsResult?.operatingCpl ?? 0,
      costPerIntro,
      // JSON blobs
      monthlyData: JSON.stringify(combinedMonthlyData),
      membershipBreakdown: JSON.stringify(hapanaResult?.membershipBreakdown ?? {}),
      introBreakdown: JSON.stringify(hapanaResult?.introBreakdown ?? {}),
      campaignBreakdown: JSON.stringify(metaAdsResult?.campaignBreakdown ?? []),
      suspendedBreakdown: JSON.stringify(hapanaResult?.suspendedBreakdown ?? {}),
      memberTiers: JSON.stringify(hapanaResult?.memberTiers ?? {}),
      funnelData: JSON.stringify(funnelData),
      cancellationReasons: JSON.stringify(hapanaResult?.cancellationReasons ?? {}),
    },
  })

  // ── 10. Set prospect status to ready ──────────────────────────────────────
  await prisma.prospect.update({
    where: { id: prospectId },
    data: { status: 'ready' },
  })
}
