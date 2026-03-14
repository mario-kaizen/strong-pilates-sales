import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import Hero from '@/components/proposal/Hero'
import Snapshot from '@/components/proposal/Snapshot'
import ConversionFunnel from '@/components/proposal/ConversionFunnel'
import MonthlyActivity from '@/components/proposal/MonthlyActivity'
import Revenue from '@/components/proposal/Revenue'
import IntroOfferAnalysis from '@/components/proposal/IntroOfferAnalysis'
import RetentionRisk from '@/components/proposal/RetentionRisk'
import CancellationDeepDive from '@/components/proposal/CancellationDeepDive'
import RealCost from '@/components/proposal/RealCost'
import MembershipValue from '@/components/proposal/MembershipValue'
import Opportunity from '@/components/proposal/Opportunity'
import CaseStudyKelowna from '@/components/proposal/CaseStudyKelowna'
import TwelveWeekPathway from '@/components/proposal/TwelveWeekPathway'
import HowWeWork from '@/components/proposal/HowWeWork'
import NextSteps from '@/components/proposal/NextSteps'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const prospect = await prisma.prospect.findUnique({ where: { slug } })
  if (!prospect) return { title: 'Not Found' }

  return {
    title: `STRONG Pilates — ${prospect.locationName} | Business Diagnostic`,
    description: `Data-driven analysis and growth roadmap for STRONG Pilates ${prospect.locationName}.`,
  }
}

export default async function ProposalPage({ params }: PageProps) {
  const { slug } = await params

  const prospect = await prisma.prospect.findUnique({
    where: { slug },
    include: {
      data: true,
      diagnosis: true,
    },
  })

  if (!prospect || prospect.status !== 'ready' || !prospect.data) {
    notFound()
  }

  const data = prospect.data

  // Parse JSON fields
  const monthlyData = safeParseJson(data.monthlyData, [])
  const membershipBreakdown = safeParseJson(data.membershipBreakdown, [])
  const introBreakdown = safeParseJson(data.introBreakdown, [])
  const campaignBreakdown = safeParseJson(data.campaignBreakdown, [])
  const suspendedBreakdown = safeParseJson(data.suspendedBreakdown, [])
  const memberTiers = safeParseJson(data.memberTiers, [])
  const funnelData = safeParseJson(data.funnelData, {
    crmContacts: data.totalContacts,
    accountsCreated: 0,
    introPurchased: data.uniqueIntroBuyers,
    convertedToMember: 0,
    stillActive: data.activeMemberships,
    totalMembershipRecords: data.totalMemberships,
    cancelled: data.totalCancellations,
    suspended: data.suspendedCount,
  })

  // Compute derived values for Opportunity section
  const currentConversion = data.introConversionRate
  const targetConversion = 50
  const currentChurn = data.churnRate
  const targetChurn = 15
  const avgMemberValue = data.avgMemberValue || 165

  // Rough projection calcs
  const yearlyIntros = data.uniqueIntroBuyers || 0
  const extraMembersPerYear = Math.round(yearlyIntros * ((targetConversion - currentConversion) / 100))
  const fewerCancellationsPerYear = Math.round(data.totalCancellations * ((currentChurn - targetChurn) / currentChurn))
  const netMembersPerYear = extraMembersPerYear + fewerCancellationsPerYear
  const additionalMrrPerMonth = Math.round(netMembersPerYear * avgMemberValue)

  // Compute unconverted intros for TwelveWeekPathway
  const unconvertedIntros = funnelData.introPurchased - (funnelData.convertedToMember || 0)

  // Extract monthly ad data from campaign breakdown or monthlyData
  const monthlyAdData = monthlyData.map((m: Record<string, unknown>) => ({
    month: m.month as string,
    spend: (m.adSpend as number) || 0,
    leads: (m.adLeads as number) || 0,
    purchases: (m.adPurchases as number) || 0,
  }))

  // Compute periods from data
  const periods = safeParseJson(
    typeof data.campaignBreakdown === 'string' ? '[]' : '[]',
    []
  )

  // Format report date
  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Intro count for pathway
  const introTypeCount = introBreakdown.length || 14

  // Operating period intros sold
  const introsSold = monthlyData.reduce(
    (sum: number, m: Record<string, unknown>) => sum + ((m.introsPurchased as number) || 0),
    0
  )

  return (
    <main
      style={{
        backgroundColor: 'var(--cream)',
        minHeight: '100vh',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '0 40px',
        }}
      >
        <Hero
          locationName={prospect.locationName}
          address={prospect.address || `${prospect.city}, ${prospect.country}`}
          reportDate={reportDate}
        />

        <Snapshot
          activeMemberships={data.activeMemberships}
          totalMrr={data.totalMrr}
          activeIntros={data.activeIntros}
          suspendedCount={data.suspendedCount}
          totalContacts={data.totalContacts}
          uniqueMemberHolders={data.uniqueMemberHolders}
          totalPackages={data.totalPackages}
          avgMemberValue={avgMemberValue}
          churnRate={data.churnRate}
          totalCancellations={data.totalCancellations}
          totalMemberships={data.totalMemberships}
        />

        <ConversionFunnel
          funnelData={funnelData}
          introConversionRate={data.introConversionRate}
          avgMemberValue={avgMemberValue}
          activeIntros={data.activeIntros}
          activeMemberships={data.activeMemberships}
        />

        {monthlyData.length > 0 && (
          <MonthlyActivity
            monthlyData={monthlyData}
            dataNote={getDataNote(monthlyData)}
          />
        )}

        {membershipBreakdown.length > 0 && (
          <Revenue
            totalMrr={data.totalMrr}
            membershipBreakdown={membershipBreakdown}
          />
        )}

        {introBreakdown.length > 0 && (
          <IntroOfferAnalysis
            activeIntros={data.activeIntros}
            introBreakdown={introBreakdown}
          />
        )}

        {suspendedBreakdown.length > 0 && (
          <RetentionRisk
            suspendedCount={data.suspendedCount}
            suspendedBreakdown={suspendedBreakdown}
            avgMemberValue={avgMemberValue}
            totalCancellations={data.totalCancellations}
          />
        )}

        {monthlyData.length > 0 && (
          <CancellationDeepDive
            totalCancellations={data.totalCancellations}
            totalMemberships={data.totalMemberships}
            churnRate={data.churnRate}
            avgMemberValue={avgMemberValue}
            monthlyData={monthlyData}
          />
        )}

        {(data.totalAdSpend > 0 || monthlyAdData.some((m: { spend: number }) => m.spend > 0)) && (
          <RealCost
            totalAdSpend={data.totalAdSpend}
            presaleAdSpend={data.presaleAdSpend}
            operatingAdSpend={data.operatingAdSpend}
            operatingLeads={data.operatingLeads}
            operatingCpl={data.operatingCpl}
            costPerIntro={data.costPerIntro}
            introsSold={introsSold}
            introConversionRate={data.introConversionRate}
            periods={periods.length > 0 ? periods : getDefaultPeriods(data)}
            monthlyAdData={monthlyAdData}
            campaignBreakdown={campaignBreakdown}
          />
        )}

        {memberTiers.length > 0 && (
          <MembershipValue
            activeMemberships={data.activeMemberships}
            totalMrr={data.totalMrr}
            memberTiers={memberTiers}
          />
        )}

        <Opportunity
          currentConversion={currentConversion}
          targetConversion={targetConversion}
          currentChurn={currentChurn}
          targetChurn={targetChurn}
          avgMemberValue={avgMemberValue}
          extraMembersPerYear={extraMembersPerYear}
          fewerCancellationsPerYear={fewerCancellationsPerYear}
          netMembersPerYear={netMembersPerYear}
          additionalMrrPerMonth={additionalMrrPerMonth}
          currentMrr={data.totalMrr}
        />

        <CaseStudyKelowna locationName={prospect.locationName} />

        <TwelveWeekPathway
          unconvertedIntros={unconvertedIntros}
          suspendedCount={data.suspendedCount}
          cancelledCount={data.totalCancellations}
          introTypeCount={introTypeCount}
        />

        <HowWeWork />

        <NextSteps locationName={prospect.locationName} />
      </div>
    </main>
  )
}

// ── Helpers ──

function safeParseJson<T>(value: string | undefined | null, fallback: T): T {
  if (!value || value === '{}' || value === '[]') return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

function getDataNote(monthlyData: Record<string, unknown>[]): string | undefined {
  if (monthlyData.length < 3) return undefined
  // Check for opening rush pattern (first 2 months with high intro counts)
  const firstIntros = (monthlyData[0]?.introsPurchased as number) || 0
  const secondIntros = (monthlyData[1]?.introsPurchased as number) || 0
  if (firstIntros > 50 || secondIntros > 50) {
    return `Early months reflect the grand opening rush. The normalised ongoing rate is significantly lower.`
  }
  return undefined
}

function getDefaultPeriods(data: { presaleAdSpend: number; operatingAdSpend: number; totalAdSpend: number }) {
  const openingSpend = data.totalAdSpend - data.presaleAdSpend - data.operatingAdSpend
  return [
    {
      label: 'Presale',
      period: 'Pre-opening',
      spend: data.presaleAdSpend,
      description: 'Brand awareness before doors opened. Zero lead tracking — expected for presale phase.',
    },
    {
      label: 'Grand Opening',
      period: 'Opening month',
      spend: openingSpend > 0 ? openingSpend : 0,
      description: 'Opening month. Still limited lead tracking.',
    },
    {
      label: 'Operating',
      period: 'Post-opening',
      spend: data.operatingAdSpend,
      description: 'Ongoing operating spend. This is the period we analyse — fair, post-opening numbers only.',
      highlight: true,
    },
  ]
}
