import React from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import StatCard from '@/components/ui/StatCard'

export default function HowWeWork() {
  return (
    <SectionWrapper
      id="section-12"
      label="12 — How We Work"
      title="Done With You — Not Done For You"
      description="We don't just run ads and send reports. We work alongside you — coaching, building, and executing together so the systems become yours."
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard label="Weekly Investment" value="$300" sub="Per week — no lock-in contracts" />
        <StatCard label="What's Included" value="Full DWY" sub="Ads, CRM, copy, design, strategy" />
        <StatCard label="STRONG Setup" value="7 Days" sub="First campaign live within a week" />
      </div>

      <ChartWrap title="What $300/Week Gets You" subtitle="The full Kaizen DWY (Done With You) service">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', fontSize: '14px', lineHeight: 1.8, padding: '8px 0' }}>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>Execution</div>
            <ul style={{ color: 'var(--ink-muted)', marginLeft: '16px', listStyleType: '"\\2714  "' }}>
              <li>Meta ad campaign management</li>
              <li>Ad creative design (graphics + video editing)</li>
              <li>Copywriting (ads, emails, SMS, nurture sequences)</li>
              <li>CRM build-out and automation</li>
              <li>Funnel setup and optimisation</li>
            </ul>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: 'var(--gold-dark)', marginBottom: '8px', textTransform: 'uppercase', fontSize: '11px', letterSpacing: '1px' }}>Strategy &amp; Support</div>
            <ul style={{ color: 'var(--ink-muted)', marginLeft: '16px', listStyleType: '"\\2714  "' }}>
              <li>Live strategy calls 4x per week</li>
              <li>Monthly growth planning sessions</li>
              <li>Quarterly growth sprints</li>
              <li>Dedicated Slack channel for support</li>
              <li>Weekly metrics tracking and reporting</li>
            </ul>
          </div>
        </div>
      </ChartWrap>

      {/* Break-even callout */}
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
              The math makes itself.
            </h3>
            <p style={{ fontSize: '15px', color: 'rgba(250, 247, 242, 0.7)', lineHeight: 1.8, position: 'relative', maxWidth: '600px' }}>
              At $300/week ($1,200/month), you need to convert just <strong>8 additional members</strong> at $165/month avg to be cash-flow positive on this investment — and the system is designed to deliver multiples of that. Kelowna added 45 members in 14 weeks.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '72px', fontWeight: 700, color: 'var(--green)', lineHeight: 1, marginBottom: '8px', position: 'relative' }}>8</div>
            <div style={{ fontSize: '14px', color: 'rgba(250, 247, 242, 0.5)', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 600, position: 'relative' }}>Members to break even</div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  )
}
