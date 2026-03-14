'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface MembershipPlan {
  name: string
  count: number
  price: number | null
  revenue: number
  color?: string
}

interface RevenueProps {
  totalMrr: number
  membershipBreakdown: MembershipPlan[]
}

const defaultColors = [
  '#C8A951', '#A88B3A', '#D4BC72', '#4A6FA5', '#6B8FBD', '#4A7C59', '#6B9D7A', '#D4853A', '#7B5EA7', '#999',
]

export default function Revenue({ totalMrr, membershipBreakdown }: RevenueProps) {
  const formattedMrr = totalMrr >= 1000 ? `$${(totalMrr / 1000).toFixed(1)}K` : `$${totalMrr.toFixed(0)}`
  const maxRev = Math.max(...membershipBreakdown.map(p => p.revenue))

  const donutConfig = useMemo<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: membershipBreakdown.map(d => d.name),
      datasets: [{
        data: membershipBreakdown.map(d => d.revenue),
        backgroundColor: membershipBreakdown.map((d, i) => d.color || defaultColors[i % defaultColors.length]),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '62%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 16, font: { size: 11 } } },
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            label: ((ctx: any) => ` $${ctx.parsed.toLocaleString()}/mo`) as any,
          },
        },
      },
    },
  }), [membershipBreakdown])

  return (
    <SectionWrapper
      id="section-04"
      label="04 — Revenue"
      title={`Where Your ${formattedMrr}/Month Comes From`}
      description="A breakdown of active membership plans and their monthly revenue contribution. Source: Hapana Core."
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ChartWrap title="Revenue by Plan" subtitle="Monthly recurring revenue distribution">
          <ChartWrapper config={donutConfig} height={280} />
        </ChartWrap>
        <ChartWrap title="Plan Breakdown" subtitle="All active membership plans ranked by revenue" style={{ overflowY: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              fontSize: '14px',
            }}
          >
            <thead>
              <tr>
                {['Plan', 'Members', '$/mo', 'Revenue', ''].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      textAlign: 'left',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '1px',
                      color: 'var(--ink-muted)',
                      padding: '12px 16px',
                      borderBottom: '2px solid rgba(26, 26, 26, 0.08)',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {membershipBreakdown.map((plan, i) => (
                <tr
                  key={i}
                  style={{ borderBottom: '1px solid rgba(26, 26, 26, 0.08)' }}
                >
                  <td style={{ padding: '14px 16px', fontWeight: 600 }}>{plan.name}</td>
                  <td style={{ padding: '14px 16px' }}>{plan.count}</td>
                  <td style={{ padding: '14px 16px' }}>{plan.price ? `$${plan.price}` : '\u2014'}</td>
                  <td
                    style={{
                      padding: '14px 16px',
                      fontFamily: 'var(--font-playfair), serif',
                      fontWeight: 700,
                      fontSize: '16px',
                    }}
                  >
                    ${plan.revenue.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 16px', width: '120px' }}>
                    <div
                      style={{
                        height: '8px',
                        borderRadius: '4px',
                        background: 'var(--gold)',
                        width: `${(plan.revenue / maxRev) * 100}%`,
                        transition: 'width 1s ease',
                      }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </ChartWrap>
      </div>
    </SectionWrapper>
  )
}
