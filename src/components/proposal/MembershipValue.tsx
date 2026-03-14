'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import InsightCard from '@/components/ui/InsightCard'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface MemberTier {
  label: string
  count: number
  revenue: number
  color: string
}

interface PlanDetail {
  name: string
  price: number
  count: number
  revenue: number
  tier: 'premium' | 'mid' | 'low'
}

interface MembershipValueProps {
  activeMemberships: number
  totalMrr: number
  memberTiers: MemberTier[]
  planDetails?: PlanDetail[]
  lowTierCount?: number
  lowTierRevenue?: number
  lowTierRevenuePct?: number
  midTierPlanName?: string
  midTierCount?: number
  midTierUpgradeValue?: number
}

export default function MembershipValue({
  activeMemberships,
  totalMrr,
  memberTiers,
  planDetails,
  lowTierCount = 0,
  lowTierRevenue = 0,
  lowTierRevenuePct = 0,
  midTierPlanName = 'STRONG 4',
  midTierCount = 0,
  midTierUpgradeValue = 0,
}: MembershipValueProps) {
  const totalMembers = memberTiers.reduce((sum, t) => sum + t.count, 0)

  const countConfig = useMemo<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: memberTiers.map(t => t.label),
      datasets: [{
        data: memberTiers.map(t => t.count),
        backgroundColor: memberTiers.map(t => t.color),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            label: ((ctx: any) => ` ${ctx.parsed} members (${Math.round(ctx.parsed / totalMembers * 100)}%)`) as any,
          },
        },
      },
    },
  }), [memberTiers, totalMembers])

  const revConfig = useMemo<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: memberTiers.map(t => t.label),
      datasets: [{
        data: memberTiers.map(t => t.revenue),
        backgroundColor: memberTiers.map(t => t.color),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '60%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 14, font: { size: 11 } } },
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            label: ((ctx: any) => ` $${ctx.parsed.toLocaleString()}/mo (${Math.round(ctx.parsed / totalMrr * 100)}%)`) as any,
          },
        },
      },
    },
  }), [memberTiers, totalMrr])

  const barConfig = useMemo<ChartConfiguration>(() => {
    if (!planDetails || planDetails.length === 0) return { type: 'bar' as const, data: { labels: [] as string[], datasets: [] }, options: {} }
    const tierColorMap = { premium: COLORS.green, mid: COLORS.gold, low: COLORS.red }
    return {
      type: 'bar',
      data: {
        labels: planDetails.map(p => `${p.name}\n$${p.price}`),
        datasets: [{
          label: 'Monthly Revenue ($)',
          data: planDetails.map(p => p.revenue),
          backgroundColor: planDetails.map(p => tierColorMap[p.tier]),
          borderRadius: 6,
          barPercentage: 0.7,
        }],
      },
      options: {
        plugins: {
          legend: { display: false },
          tooltip: {
            ...TOOLTIP_CONFIG,
            callbacks: {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              label: ((ctx: any) => {
                return [` Revenue: $${ctx.parsed.y.toLocaleString()}/mo`, ` Members: ${planDetails[ctx.dataIndex].count}`]
              }) as any,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 } } },
          y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true, ticks: { callback: (v: string | number) => '$' + (Number(v) / 1000).toFixed(0) + 'K' } },
        },
      },
    }
  }, [planDetails])

  return (
    <SectionWrapper
      id="section-08"
      label="08 — Membership Value"
      title="Not All Members Are Created Equal"
      description={`${activeMemberships} active members sounds healthy — but when you look at what they're actually paying, a significant portion are on low-fee plans that barely move the needle on revenue.`}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ChartWrap title="Members by Price Tier" subtitle="How many members fall into each value bracket">
          <ChartWrapper config={countConfig} height={260} />
        </ChartWrap>
        <ChartWrap title="Revenue by Price Tier" subtitle="What each tier actually contributes to MRR">
          <ChartWrapper config={revConfig} height={260} />
        </ChartWrap>
      </div>

      {planDetails && planDetails.length > 0 && (
        <ChartWrap title="Every Membership Plan — Price vs. Members" subtitle="Bubble size = monthly revenue contribution.">
          <ChartWrapper config={barConfig} height={300} />
        </ChartWrap>
      )}

      {/* Low tier callout */}
      {lowTierCount > 0 && (
        <div
          style={{
            background: 'var(--ink)',
            color: 'var(--cream)',
            borderRadius: '20px',
            padding: '40px 48px',
            margin: '32px 0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(200,169,81,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', fontWeight: 600, marginBottom: '16px', position: 'relative' }}>
                {lowTierCount} members ({Math.round(lowTierCount / activeMemberships * 100)}%) are paying under $100/month.
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
                These {lowTierCount} members contribute just ${lowTierRevenue.toLocaleString()}/month — only {lowTierRevenuePct.toFixed(1)}% of your total MRR. The opportunity isn&apos;t just <em>more</em> members — it&apos;s more members on the <strong>right plans</strong>.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>{lowTierRevenuePct.toFixed(1)}%</div>
              <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>Revenue from under-$100 members</div>
            </div>
          </div>
        </div>
      )}

      {/* Mid-tier upgrade callout */}
      {midTierCount > 0 && (
        <div
          style={{
            background: 'linear-gradient(135deg, #2a2a1a 0%, var(--ink) 100%)',
            color: 'var(--cream)',
            borderRadius: '20px',
            padding: '40px 48px',
            margin: '32px 0',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(200,169,81,0.08) 0%, transparent 70%)', pointerEvents: 'none' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '26px', fontWeight: 600, marginBottom: '16px', position: 'relative' }}>
                {midTierPlanName} should be a backup option, not the default path.
              </h3>
              <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
                {midTierCount} members are on {midTierPlanName}. If just half upgraded, that&apos;s an additional ~${(midTierUpgradeValue / 1000).toFixed(0)}K/month in MRR — with zero new members needed.
              </p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--gold)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>+${(midTierUpgradeValue / 1000).toFixed(0)}K</div>
              <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>If half of {midTierPlanName} upgraded</div>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <InsightCard number={`$${memberTiers.find(t => t.label.includes('Under') || t.label.includes('Low'))?.count || 0} on low plans`} title="The Low-Tier Plans">
          <p>Members on low-fee plans need to be pathways to higher-value plans, not destinations.</p>
        </InsightCard>
        <InsightCard number={`${midTierCount} on ${midTierPlanName}`} title="The Mid-Tier Ceiling">
          <p>{midTierCount} members on {midTierPlanName} represent {Math.round(midTierCount / activeMemberships * 100)}% of all members. Removing {midTierPlanName} as a primary option would add significant MRR.</p>
        </InsightCard>
      </div>
    </SectionWrapper>
  )
}
