'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import StatCard from '@/components/ui/StatCard'
import InsightCard from '@/components/ui/InsightCard'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface CampaignGroup {
  name: string
  spend: number
  leads: number
}

interface MonthlyAdData {
  month: string
  spend: number
  leads: number
  purchases: number
}

interface PeriodBreakdown {
  label: string
  period: string
  spend: number
  description: string
  highlight?: boolean
}

interface RealCostProps {
  totalAdSpend: number
  presaleAdSpend: number
  operatingAdSpend: number
  operatingLeads: number
  operatingCpl: number
  costPerIntro: number
  introsSold: number
  introConversionRate: number
  periods: PeriodBreakdown[]
  monthlyAdData: MonthlyAdData[]
  campaignBreakdown: CampaignGroup[]
  eventsChangedCount?: number
}

export default function RealCost({
  totalAdSpend,
  presaleAdSpend,
  operatingAdSpend,
  operatingLeads,
  operatingCpl,
  costPerIntro,
  introsSold,
  introConversionRate,
  periods,
  monthlyAdData,
  campaignBreakdown,
  eventsChangedCount = 5,
}: RealCostProps) {
  const months = (monthlyAdData || []).map(d => d.month)
  const adSpend = (monthlyAdData || []).map(d => d.spend ?? 0)
  const adLeads = (monthlyAdData || []).map(d => d.leads ?? 0)
  const adPurchases = (monthlyAdData || []).map(d => d.purchases ?? 0)

  const lostIntros = Math.round((introsSold ?? 0) * (1 - (introConversionRate ?? 0) / 100))
  const lostAdSpend = lostIntros * (costPerIntro ?? 0)

  const adSpendConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Ad Spend ($)',
          data: adSpend,
          backgroundColor: adLeads.map(l => l === 0 ? 'rgba(196, 69, 54, 0.4)' : COLORS.red),
          borderRadius: 4,
          barPercentage: 0.7,
          categoryPercentage: 0.8,
          yAxisID: 'y',
          order: 3,
        },
        {
          label: 'Actual Leads',
          data: adLeads,
          type: 'line',
          borderColor: COLORS.blue,
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: COLORS.blue,
          borderWidth: 2.5,
          yAxisID: 'y1',
          order: 1,
        },
        {
          label: 'Purchases (Meta Pixel)',
          data: adPurchases,
          type: 'line',
          borderColor: COLORS.green,
          fill: false,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: COLORS.green,
          borderWidth: 2.5,
          yAxisID: 'y1',
          order: 2,
        },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end' },
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: ((ctx: any) => {
              if (ctx.dataset.label?.includes('Spend')) return ` Spend: $${ctx.parsed.y.toLocaleString()}`
              if (ctx.dataset.label?.includes('Purchases')) return ` Purchases: ${ctx.parsed.y}`
              return ` Leads: ${ctx.parsed.y}`
            }) as any,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { position: 'left', grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true, ticks: { callback: (v: string | number) => '$' + (Number(v) / 1000).toFixed(0) + 'K' } },
        y1: { position: 'right', grid: { display: false }, border: { display: false }, beginAtZero: true },
      },
    },
  }), [months, adSpend, adLeads, adPurchases])

  const cpaConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: [`Cost Per Lead\n($${(operatingAdSpend ?? 0).toLocaleString()} \u00F7 ${(operatingLeads ?? 0).toLocaleString()} leads)`, `Cost Per Intro Offer\n($${(operatingAdSpend ?? 0).toLocaleString()} \u00F7 ${introsSold ?? 0} intros)`, `Cost Per Lost Intro\n(${Math.round(100 - (introConversionRate ?? 0))}% never convert = $${(costPerIntro ?? 0).toFixed(0)} burned)`],
      datasets: [{
        data: [operatingCpl, costPerIntro, costPerIntro],
        backgroundColor: [COLORS.blue, COLORS.orange, COLORS.red],
        borderRadius: 8,
        barPercentage: 0.5,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP_CONFIG, callbacks: { label: ((ctx: any) => ` $${ctx.parsed.y.toFixed(2)} per acquisition`) as any } },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold' } } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true, ticks: { callback: (v: string | number) => '$' + v } },
      },
    },
  }), [operatingAdSpend, operatingLeads, introsSold, operatingCpl, costPerIntro, introConversionRate])

  const campConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: campaignBreakdown.map(c => c.name),
      datasets: [
        { label: 'Spend ($)', data: campaignBreakdown.map(c => c.spend), backgroundColor: COLORS.red, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.7, yAxisID: 'y' },
        { label: 'Leads', data: campaignBreakdown.map(c => c.leads), backgroundColor: COLORS.blue, borderRadius: 4, barPercentage: 0.8, categoryPercentage: 0.7, yAxisID: 'y1' },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end' },
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: ((ctx: any) => {
              if (ctx.dataset.label?.includes('Spend')) return ` Spend: $${ctx.parsed.y.toLocaleString()}`
              return ` Leads: ${ctx.parsed.y}`
            }) as any,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false }, ticks: { font: { size: 10 }, maxRotation: 45 } },
        y: { position: 'left', grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true, ticks: { callback: (v: string | number) => '$' + (Number(v) / 1000).toFixed(0) + 'K' } },
        y1: { position: 'right', grid: { display: false }, border: { display: false }, beginAtZero: true },
      },
    },
  }), [campaignBreakdown])

  return (
    <SectionWrapper
      id="section-07"
      label="07 — The Real Cost"
      title={`$${(totalAdSpend ?? 0).toLocaleString()} in Ad Spend — What Did It Actually Buy?`}
      description="We pulled the actual Meta Ads data and cross-referenced it with Hapana Core. We've separated pre-opening (presale) from operating spend so the numbers are fair and accurate."
    >
      {/* Top stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="Total Lifetime Spend" value={`$${(totalAdSpend ?? 0).toLocaleString()}`} sub={`${months[0] ?? '—'} — ${months[months.length - 1] ?? '—'}`} />
        <StatCard label="Pre-Open Spend" value={`$${(presaleAdSpend ?? 0).toLocaleString()}`} sub="Presale + opening period" />
        <StatCard label="Operating CPL" value={`$${(operatingCpl ?? 0).toFixed(2)}`} sub={`${(operatingLeads ?? 0).toLocaleString()} real leads`} variant="warning" />
        <StatCard label="Cost Per Intro Offer" value={`$${(costPerIntro ?? 0).toFixed(2)}`} sub={`${introsSold ?? 0} intros sold (operating period)`} variant="warning" />
      </div>

      {/* Period breakdown */}
      <ChartWrap title="Spend by Period" subtitle="We understand there was a presale before opening — here's how the spend breaks down" style={{ marginTop: '8px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '13px', lineHeight: 1.8, padding: '8px 0' }}>
          {periods.map((period, i) => (
            <div
              key={i}
              style={{
                padding: '16px',
                background: period.highlight ? 'white' : 'var(--cream-dark)',
                borderRadius: '10px',
                border: period.highlight ? '2px solid var(--gold)' : '1px solid rgba(26, 26, 26, 0.08)',
                position: 'relative',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  color: period.highlight ? 'var(--gold-dark)' : 'var(--ink-muted)',
                  fontSize: '11px',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: '8px',
                }}
              >
                {period.label} ({period.period})
              </div>
              <div
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '24px',
                  fontWeight: 700,
                  marginBottom: '4px',
                  color: period.highlight ? 'var(--gold-dark)' : undefined,
                }}
              >
                ${(period.spend ?? 0).toLocaleString()}
              </div>
              <p style={{ color: 'var(--ink-muted)', fontSize: '12px' }}>{period.description}</p>
            </div>
          ))}
        </div>
      </ChartWrap>

      <ChartWrap title="Monthly Ad Spend vs. Real Leads & Purchases" subtitle="Actual Meta Ads data — operating period highlighted. Pre-open spend shown in faded bars." style={{ marginTop: '24px' }}>
        <ChartWrapper config={adSpendConfig} height={300} />
      </ChartWrap>

      <ChartWrap title="The Real Cost Escalation" subtitle="Every lost intro is ad spend that never converts to a member">
        <ChartWrapper config={cpaConfig} height={220} />
      </ChartWrap>

      {/* Events changed callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, #2a1a1a 0%, var(--ink) 100%)',
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
              The &ldquo;Results&rdquo; number changed meaning {eventsChangedCount} times.
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
              The conversion event tracked as a &ldquo;result&rdquo; shifted multiple times. When we strip out page views and count only real leads (forms + pixel + custom events), the actual lead count is significantly lower than reported.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--red)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>{eventsChangedCount}x</div>
            <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>Events Changed</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <InsightCard number={`$${(operatingCpl ?? 0).toFixed(2)}`} title="Operating CPL (Post-Opening)">
          <p>Once the studio was open and lead tracking was active, the real CPL across all lead types (forms, pixel, custom events — excluding page views) is ${(operatingCpl ?? 0).toFixed(2)}. That&apos;s the fair number to benchmark against.</p>
        </InsightCard>
        <InsightCard number={`$${(costPerIntro ?? 0).toFixed(2)} per Intro`} title="The Real Cost of an Intro Offer">
          <p>Operating spend (${(operatingAdSpend ?? 0).toLocaleString()}) divided by {introsSold ?? 0} intro offers sold = ${(costPerIntro ?? 0).toFixed(2)} per intro buyer. {Math.round(100 - (introConversionRate ?? 0))}% of those never become members — that&apos;s {lostIntros} lost intros at ${(costPerIntro ?? 0).toFixed(0)} each = <strong>${(lostAdSpend / 1000).toFixed(0)}K+ in ad spend that led nowhere</strong>.</p>
        </InsightCard>
      </div>

      <ChartWrap title="Ad Spend by Campaign Type" subtitle="Grouped by strategy — not individual campaign names" style={{ marginTop: '24px' }}>
        <ChartWrapper config={campConfig} height={280} />
      </ChartWrap>
    </SectionWrapper>
  )
}
