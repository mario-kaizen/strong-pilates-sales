'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface SuspendedPlan {
  name: string
  count: number
}

interface RetentionRiskProps {
  suspendedCount: number
  suspendedBreakdown: SuspendedPlan[]
  avgMemberValue: number
  totalCancellations: number
}

export default function RetentionRisk({ suspendedCount, suspendedBreakdown, avgMemberValue, totalCancellations }: RetentionRiskProps) {
  const revenueAtRisk = (suspendedCount ?? 0) * (avgMemberValue ?? 0)
  const formattedRisk = revenueAtRisk >= 1000 ? `$${(revenueAtRisk / 1000).toFixed(1)}K` : `$${(revenueAtRisk ?? 0).toFixed(0)}`

  const chartConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: suspendedBreakdown.map(d => d.name),
      datasets: [{
        label: 'Suspended',
        data: suspendedBreakdown.map(d => d.count),
        backgroundColor: COLORS.red,
        borderRadius: 6,
        barPercentage: 0.6,
      }],
    },
    options: {
      indexAxis: 'y',
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP_CONFIG },
      },
      scales: {
        x: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true },
        y: { grid: { display: false }, border: { display: false } },
      },
    },
  }), [suspendedBreakdown])

  return (
    <SectionWrapper
      id="section-06"
      label="06 — Retention Risk"
      title={`${suspendedCount} Suspended Memberships`}
      description={`These are members who have paused — they're at high risk of cancellation without proactive outreach. And with ${totalCancellations} cancellations already on record (zero reasons logged), churn is a proven pattern here.`}
    >
      <ChartWrap title="Suspended by Plan Type" subtitle="Which membership plans have the highest suspension rates">
        <ChartWrapper config={chartConfig} height={250} />
      </ChartWrap>

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
        <div
          style={{
            position: 'absolute',
            top: '-50%',
            right: '-20%',
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(200,169,81,0.08) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: '48px' }}>
          <div style={{ flex: 1 }}>
            <h3
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '26px',
                fontWeight: 600,
                marginBottom: '16px',
                position: 'relative',
              }}
            >
              {suspendedCount ?? 0} suspended members = up to ${(revenueAtRisk ?? 0).toLocaleString()}/month at risk.
            </h3>
            <p
              style={{
                fontSize: '15px',
                color: 'rgba(250, 247, 242, 0.7)',
                lineHeight: 1.8,
                position: 'relative',
                maxWidth: '600px',
              }}
            >
              At an average membership value of ${(avgMemberValue ?? 0).toFixed(0)}/month, every suspended member who doesn&apos;t return is a direct hit to MRR. A simple reactivation campaign targeting these {suspendedCount ?? 0} people could recover a significant chunk of revenue with zero ad spend.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '72px',
                fontWeight: 700,
                color: 'var(--red)',
                lineHeight: 1,
                marginBottom: '8px',
                position: 'relative',
              }}
            >
              {formattedRisk}
            </div>
            <div
              style={{
                fontSize: '14px',
                color: 'rgba(250, 247, 242, 0.5)',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontWeight: 600,
                position: 'relative',
              }}
            >
              Monthly Revenue at Risk
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
