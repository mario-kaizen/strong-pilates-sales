'use client'

import React, { useMemo } from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import StatCard from '@/components/ui/StatCard'
import { ChartWrapper } from '@/components/charts/ChartWrapper'
import { COLORS, TOOLTIP_CONFIG } from './constants'
import type { ChartConfiguration } from 'chart.js'

interface CaseStudyKelownaProps {
  locationName?: string
}

const kelownaWeeks = ['Dec 8', 'Dec 15', 'Dec 22', 'Dec 29', 'Jan 5', 'Jan 12', 'Jan 19', 'Jan 26', 'Feb 2', 'Feb 9', 'Feb 16', 'Feb 23', 'Mar 2']
const kelownaGross = [13111, 11723, 14688, 14410, 19094, 15427, 14611, 19948, 21173, 19065, 14593, 23694, 19605]
const kelownaIntros = [1, 7, 10, 41, 52, 44, 33, 50, 46, 26, 11, 19, 15]
const kelownaNewMembers = [4, 1, 3, 5, 10, 1, 6, 11, 16, 9, 15, 17, 14]
const kelownaCPL = [15.30, 11.36, 7.90, 2.50, 3.77, 5.39, 7.44, 7.43, 10.27, 8.42, 7.70, 12.11, 10.19]
const kelownaCPC = [9.95, 4.11, 3.80, 1.17, 2.20, 2.90, 2.96, 2.79, 4.95, 2.64, 4.89, 4.93, 4.17]

export default function CaseStudyKelowna({ locationName = 'The Beach TO' }: CaseStudyKelownaProps) {
  const revenueConfig = useMemo<ChartConfiguration>(() => ({
    type: 'bar',
    data: {
      labels: kelownaWeeks,
      datasets: [{
        label: 'Gross Revenue',
        data: kelownaGross,
        backgroundColor: kelownaGross.map(v => v >= 19000 ? COLORS.green : COLORS.gold),
        borderRadius: 6,
        barPercentage: 0.7,
      }],
    },
    options: {
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP_CONFIG, callbacks: { label: ((ctx: any) => ` $${ctx.parsed.y.toLocaleString()}`) as any } },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true, ticks: { callback: (v: string | number) => '$' + (Number(v) / 1000).toFixed(0) + 'K' } },
      },
    },
  }), [])

  const introMemberConfig = useMemo<ChartConfiguration>(() => ({
    type: 'line',
    data: {
      labels: kelownaWeeks,
      datasets: [
        { label: 'Intro Offers/Week', data: kelownaIntros, borderColor: COLORS.orange, backgroundColor: COLORS.orangeLight, fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: COLORS.orange, borderWidth: 2.5 },
        { label: 'New Members/Week', data: kelownaNewMembers, borderColor: COLORS.green, backgroundColor: COLORS.greenLight, fill: true, tension: 0.35, pointRadius: 3, pointBackgroundColor: COLORS.green, borderWidth: 2.5 },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: { legend: { position: 'top', align: 'end' }, tooltip: TOOLTIP_CONFIG },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true },
      },
    },
  }), [])

  const costConfig = useMemo<ChartConfiguration>(() => ({
    type: 'line',
    data: {
      labels: kelownaWeeks,
      datasets: [
        { label: 'Cost Per Meta Lead', data: kelownaCPL, borderColor: COLORS.blue, tension: 0.35, pointRadius: 3, pointBackgroundColor: COLORS.blue, borderWidth: 2.5 },
        { label: 'Cost Per Contact', data: kelownaCPC, borderColor: COLORS.gold, tension: 0.35, pointRadius: 3, pointBackgroundColor: COLORS.gold, borderWidth: 2.5 },
      ],
    },
    options: {
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'top', align: 'end' },
        tooltip: { ...TOOLTIP_CONFIG, callbacks: { label: ((ctx: any) => ` $${ctx.parsed.y.toFixed(2)}`) as any } },
      },
      scales: {
        x: { grid: { display: false }, border: { display: false } },
        y: { grid: { color: 'rgba(0,0,0,0.04)' }, border: { display: false }, beginAtZero: true, ticks: { callback: (v: string | number) => '$' + v } },
      },
    },
  }), [])

  return (
    <SectionWrapper
      id="section-10"
      label="10 — Case Study"
      title="STRONG Pilates Kelowna — 14 Weeks of Results"
      description={`A STRONG Pilates location that started working with Kaizen Collective in December 2025. Here's what happened when we applied the same principles we're recommending for ${locationName}.`}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <StatCard label="Gross Revenue" value="$13.1K → $23.7K" sub="+81% in 14 weeks" variant="success" />
        <StatCard label="Total Members" value="231 → 276" sub="+45 members (+19%)" variant="success" />
        <StatCard label="Intro Offers/Week" value="1 → 52" sub="Peak week (Jan 5, 2026)" variant="success" />
        <StatCard label="Ad Spend" value="~$260/wk" sub="$37/day average — not $50-100" variant="success" />
      </div>

      <ChartWrap title="Kelowna Weekly Revenue" subtitle="Gross revenue per week — Dec 8, 2025 to Mar 2, 2026">
        <ChartWrapper config={revenueConfig} height={250} />
      </ChartWrap>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <ChartWrap title="Kelowna Weekly Intro Offers & New Members" subtitle="The intake pipeline building over time">
          <ChartWrapper config={introMemberConfig} height={220} />
        </ChartWrap>
        <ChartWrap title="Kelowna Cost Per Lead & Contact" subtitle="Efficient spend = quality leads at low cost">
          <ChartWrapper config={costConfig} height={220} />
        </ChartWrap>
      </div>

      {/* Callout */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a2a1a 0%, var(--ink) 100%)',
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
              The Kelowna Playbook
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
              Lower spend ($37/day vs $50-100/day). Better lead quality. Proper nurture systems. Focused intro-to-member conversion. The same approach we&apos;re recommending for {locationName} — and it&apos;s already working.
            </p>
            <div style={{ marginTop: '16px', fontSize: '13px', color: 'rgba(250,247,242,0.5)', position: 'relative' }}>
              <strong style={{ color: 'var(--gold)' }}>Key milestones:</strong> Week 1-4 = system setup + first campaigns live. Week 5-8 = intro offers climbing. Week 9-14 = membership conversions accelerating, revenue up 81%.
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--green)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>+81%</div>
            <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>Revenue Growth</div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
