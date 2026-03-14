'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import InsightCard from '@/components/ui/InsightCard'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface MonthlyDataEntry {
  month: string
  membershipsPurchased: number
  membershipsCancelled: number
}

interface CancellationDeepDiveProps {
  totalCancellations: number
  totalMemberships: number
  churnRate: number
  avgMemberValue: number
  monthlyData: MonthlyDataEntry[]
}

export default function CancellationDeepDive({
  totalCancellations,
  totalMemberships,
  churnRate,
  avgMemberValue,
  monthlyData,
}: CancellationDeepDiveProps) {
  // Skip the first month (often pre-opening with 0 cancellations)
  const cancData = monthlyData.filter(d => d.membershipsCancelled > 0 || d.membershipsPurchased > 0)
  const months = cancData.map(d => d.month)
  const cancellations = cancData.map(d => d.membershipsCancelled)
  const membSold = cancData.map(d => d.membershipsPurchased)
  const netGrowth = membSold.map((m, i) => m - cancellations[i])

  // Find worst net month
  const worstNetIdx = netGrowth.indexOf(Math.min(...netGrowth))
  const worstNet = netGrowth[worstNetIdx]
  const worstMonth = months[worstNetIdx]

  const cancConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Cancellations',
        data: cancellations,
        backgroundColor: COLORS.red,
        borderRadius: 6,
        barPercentage: 0.65,
      }],
    },
    options: {
      plugins: { legend: { display: false }, tooltip: TOOLTIP_CONFIG },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true },
      },
    },
  }), [months, cancellations])

  const netConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: months,
      datasets: [
        {
          label: 'Memberships Sold',
          data: membSold,
          backgroundColor: COLORS.green,
          borderRadius: 4,
          barPercentage: 0.75,
          categoryPercentage: 0.7,
          order: 2,
        },
        {
          label: 'Cancellations',
          data: cancellations.map(v => -v),
          backgroundColor: COLORS.red,
          borderRadius: 4,
          barPercentage: 0.75,
          categoryPercentage: 0.7,
          order: 3,
        },
        {
          label: 'Net Growth',
          data: netGrowth,
          type: 'line',
          borderColor: COLORS.gold,
          backgroundColor: COLORS.goldLight,
          fill: false,
          tension: 0.3,
          pointRadius: 5,
          pointBackgroundColor: netGrowth.map(v => v < 0 ? COLORS.red : COLORS.gold),
          borderWidth: 2.5,
          order: 1,
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
              const val = ctx.parsed.y
              if (ctx.dataset.label === 'Cancellations') return ` Cancellations: ${Math.abs(val)}`
              if (ctx.dataset.label === 'Net Growth') return ` Net: ${val >= 0 ? '+' : ''}${val}`
              return ` Sold: ${val}`
            }) as any,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false } },
      },
    },
  }), [months, membSold, cancellations, netGrowth])

  return (
    <SectionWrapper
      id="section-06b"
      label="06b — The Blind Spot"
      title={`${totalCancellations} Cancellations — Zero Reasons Logged`}
      description={`With full cancelled and completed records from Hapana Core, the churn picture is now visible. ${totalCancellations} members have cancelled — and not a single one has a reason logged. You can't fix what you can't see.`}
    >
      <ChartWrap title="Cancellations by Month" subtitle={`Monthly membership cancellations — ${months[0]} to ${months[months.length - 1]}`}>
        <ChartWrapper config={cancConfig} height={260} />
      </ChartWrap>

      <ChartWrap title="Net Member Growth" subtitle="Memberships sold minus cancellations — the real growth picture">
        <ChartWrapper config={netConfig} height={260} />
      </ChartWrap>

      {/* Callout */}
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
              {worstMonth} was net negative — more members cancelled than joined.
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
              {membSold[worstNetIdx]} memberships sold vs. {cancellations[worstNetIdx]} cancellations. When churn exceeds intake, growth reverses. And without cancellation reasons, you&apos;re flying blind — is it price? Experience? Competition? Seasonal? Nobody knows.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--red)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>{worstNet}</div>
            <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>Net Members ({worstMonth})</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <InsightCard number={`0 of ${totalCancellations}`} title="Cancellations Have a Reason">
          <p>Every single one of the {totalCancellations} cancellations has a blank &ldquo;Cancellation Reason&rdquo; field. This means every member who left did so without the business knowing why. A simple cancellation survey would transform your ability to reduce churn.</p>
        </InsightCard>
        <InsightCard number={`${churnRate.toFixed(1)}%`} title="Churn Rate">
          <p>{totalCancellations} of {totalMemberships} total membership records ended in cancellation. Industry benchmark is under 10%. You&apos;re losing a third of the members you work so hard to acquire — and every one represents ${avgMemberValue.toFixed(0)}/month walking out the door.</p>
        </InsightCard>
      </div>
    </SectionWrapper>
  )
}
