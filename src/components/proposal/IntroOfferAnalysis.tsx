'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface IntroOffer {
  name: string
  count: number
  color?: string
}

interface IntroOfferAnalysisProps {
  activeIntros: number
  introBreakdown: IntroOffer[]
}

const defaultIntroColors = ['#D4853A', '#C8A951', '#4A6FA5', '#4A7C59', '#6B8FBD', '#A88B3A', '#6B9D7A', '#D4BC72', '#999']

export default function IntroOfferAnalysis({ activeIntros, introBreakdown }: IntroOfferAnalysisProps) {
  const offerTypeCount = introBreakdown.length
  const top3Count = introBreakdown.slice(0, 3).reduce((sum, o) => sum + o.count, 0)
  const top3Pct = activeIntros > 0 ? Math.round((top3Count / activeIntros) * 100) : 0

  const donutConfig = useMemo<ChartConfiguration>(() => ({
    type: 'doughnut',
    data: {
      labels: introBreakdown.map(d => d.name),
      datasets: [{
        data: introBreakdown.map(d => d.count),
        backgroundColor: introBreakdown.map((d, i) => d.color || defaultIntroColors[i % defaultIntroColors.length]),
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      }],
    },
    options: {
      cutout: '55%',
      plugins: {
        legend: { position: 'bottom', labels: { padding: 12, font: { size: 11 } } },
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            label: ((ctx: any) => ` ${ctx.parsed} active`) as any,
          },
        },
      },
    },
  }), [introBreakdown])

  return (
    <SectionWrapper
      id="section-05"
      label="05 — Offer Analysis"
      title="The Intro Offer Landscape"
      description='What intro offers are active and how they&apos;re distributed. Too many offer types creates confusion and dilutes the conversion path. Source: Hapana Core — Package Category = "Intro Offer".'
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ChartWrap title="Active Intro Offers by Type" subtitle={`${activeIntros} people across ${offerTypeCount} different offer types`}>
          <ChartWrapper config={donutConfig} height={280} />
        </ChartWrap>
        <ChartWrap title="Offer Complexity" subtitle="Diagnosis">
          <div style={{ padding: '12px 0' }}>
            <div style={{ padding: '16px 0' }}>
              <div
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '48px',
                  fontWeight: 700,
                  color: 'var(--gold)',
                  marginBottom: '4px',
                }}
              >
                {offerTypeCount}
              </div>
              <h4
                style={{
                  fontFamily: 'var(--font-playfair), serif',
                  fontSize: '16px',
                  fontWeight: 600,
                  marginBottom: '8px',
                }}
              >
                Different Intro Offer Types
              </h4>
              <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.7, marginTop: '8px' }}>
                Ranging from $0 to $99 across {offerTypeCount} different naming conventions. This creates confusion for both the team and the prospect. A simpler, singular intro path with clear next steps would dramatically improve conversion.
              </p>
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid rgba(26, 26, 26, 0.08)', margin: '16px 0' }} />
            <div style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.8 }}>
              <strong style={{ color: 'var(--ink-light)' }}>Key observation:</strong> The top 3 offers
              ({introBreakdown.slice(0, 3).map(o => o.name).join(', ')}) account for {top3Pct}% of all active intros.
              The remaining {offerTypeCount - 3} offer types fragment the funnel and make it harder to build a consistent nurture sequence.
            </div>
          </div>
        </ChartWrap>
      </div>
    </SectionWrapper>
  )
}
