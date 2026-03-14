import React from 'react'
import SectionWrapper from './SectionWrapper'
import InsightCard from '@/components/ui/InsightCard'

interface OpportunityProps {
  currentConversion: number
  targetConversion: number
  currentChurn: number
  targetChurn: number
  avgMemberValue: number
  extraMembersPerYear: number
  fewerCancellationsPerYear: number
  netMembersPerYear: number
  additionalMrrPerMonth: number
  currentMrr: number
}

export default function Opportunity({
  currentConversion,
  targetConversion,
  currentChurn,
  targetChurn,
  avgMemberValue,
  extraMembersPerYear,
  fewerCancellationsPerYear,
  netMembersPerYear,
  additionalMrrPerMonth,
  currentMrr,
}: OpportunityProps) {
  const additionalAnnualRevenue = (netMembersPerYear ?? 0) * (avgMemberValue ?? 0) * 12
  const targetMrr = (currentMrr ?? 0) + (additionalMrrPerMonth ?? 0)

  return (
    <SectionWrapper
      id="section-09"
      label="09 — The Opportunity"
      title="Where the Money Is Hiding"
      description={`Your conversion rate is actually ${(currentConversion ?? 0).toFixed(0)}% — not terrible. The real opportunity is two levers: converting more intros AND keeping the members you already have.`}
    >
      {/* Big projection callout */}
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

        <h3
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '26px',
            fontWeight: 600,
            color: 'var(--gold)',
            marginBottom: '24px',
            position: 'relative',
          }}
        >
          If you move intro conversion from {(currentConversion ?? 0).toFixed(0)}% to {(targetConversion ?? 0).toFixed(0)}% AND cut churn from {(currentChurn ?? 0).toFixed(0)}% to {(targetChurn ?? 0).toFixed(0)}%...
        </h3>

        {/* Two lever boxes */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', position: 'relative' }}>
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)', marginBottom: '12px' }}>Lever 1: Conversion</div>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '36px', fontWeight: 700, color: 'var(--cream)' }}>
              {(currentConversion ?? 0).toFixed(0)}% &rarr; {(targetConversion ?? 0).toFixed(0)}%
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(250,247,242,0.5)', marginTop: '8px' }}>
              Intro-to-member conversion<br />+{extraMembersPerYear ?? 0} extra members/year at current volume
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--gold)', marginBottom: '12px' }}>Lever 2: Retention</div>
            <div style={{ fontFamily: 'var(--font-playfair), serif', fontSize: '36px', fontWeight: 700, color: 'var(--cream)' }}>
              {(currentChurn ?? 0).toFixed(0)}% &rarr; {(targetChurn ?? 0).toFixed(0)}%
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(250,247,242,0.5)', marginTop: '8px' }}>
              Churn rate halved<br />~{fewerCancellationsPerYear ?? 0} fewer cancellations/year
            </div>
          </div>
        </div>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '16px', color: 'var(--cream)', position: 'relative' }}>
          Combined: <strong style={{ color: 'var(--gold)' }}>+{netMembersPerYear ?? 0} net members/year</strong> at ${(avgMemberValue ?? 0).toFixed(0)}/month avg = <strong style={{ color: 'var(--gold)' }}>+${((additionalMrrPerMonth ?? 0) / 1000).toFixed(0)}K/month in MRR</strong>
          <br />
          <span style={{ color: 'rgba(250,247,242,0.5)' }}>
            More intros converting + fewer members leaving = compounding growth. Taking you from ${((currentMrr ?? 0) / 1000).toFixed(1)}K toward ${((targetMrr ?? 0) / 1000).toFixed(0)}K/month.
          </span>
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <InsightCard number={`$${((additionalAnnualRevenue ?? 0) / 1000).toFixed(0)}K+`} title="Additional Annual Revenue">
          <p>{netMembersPerYear ?? 0} net members &times; ${(avgMemberValue ?? 0).toFixed(0)}/month &times; 12 months. This is revenue available from two levers: better conversion AND better retention — both fixable with the right systems.</p>
        </InsightCard>
        <InsightCard number="$0" title="Additional Ad Spend Required">
          <p>This growth comes entirely from converting existing leads better and keeping members longer — not from generating more. The unconverted intros and cancelled members are revenue waiting to be recovered.</p>
        </InsightCard>
      </div>
    </SectionWrapper>
  )
}
