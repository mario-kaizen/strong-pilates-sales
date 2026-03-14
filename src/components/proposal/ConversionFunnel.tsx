import React from 'react'
import SectionWrapper from './SectionWrapper'
import ChartWrap from './ChartWrap'
import InsightCard from '@/components/ui/InsightCard'

interface FunnelStep {
  label: string
  value: number
  source: string
  color: string
  colorLight: string
}

interface ConversionFunnelProps {
  funnelData: {
    crmContacts: number
    accountsCreated: number
    introPurchased: number
    convertedToMember: number
    stillActive: number
    totalMembershipRecords: number
    cancelled: number
    suspended: number
  }
  introConversionRate: number
  avgMemberValue: number
  activeIntros: number
  activeMemberships: number
}

export default function ConversionFunnel({
  funnelData,
  introConversionRate,
  avgMemberValue,
  activeIntros,
  activeMemberships,
}: ConversionFunnelProps) {
  const neverConvertCount = funnelData.introPurchased - funnelData.convertedToMember
  const neverConvertPct = funnelData.introPurchased > 0
    ? Math.round((neverConvertCount / funnelData.introPurchased) * 100)
    : 0

  const steps: FunnelStep[] = [
    {
      label: 'CRM Contacts with Email',
      value: funnelData.crmContacts,
      source: 'Source: Hapana Grow (excludes IG message contacts without email)',
      color: 'var(--blue)',
      colorLight: 'rgba(74, 111, 165, 0.08)',
    },
    {
      label: 'Account Created',
      value: funnelData.accountsCreated,
      source: 'Source: Hapana Core — full unique emails across all records',
      color: 'var(--gold)',
      colorLight: 'rgba(200, 169, 81, 0.15)',
    },
    {
      label: 'Purchased Intro Offer',
      value: funnelData.introPurchased,
      source: `Source: Hapana Core — ${funnelData.introPurchased} unique people`,
      color: 'var(--orange)',
      colorLight: 'rgba(212, 133, 58, 0.08)',
    },
    {
      label: 'Converted to Membership',
      value: funnelData.convertedToMember,
      source: `${(introConversionRate).toFixed(1)}% conversion rate — ${funnelData.convertedToMember} of ${funnelData.introPurchased} intro buyers became members`,
      color: 'var(--green)',
      colorLight: 'rgba(74, 124, 89, 0.08)',
    },
    {
      label: 'Still Active',
      value: funnelData.stillActive,
      source: `Of ${funnelData.totalMembershipRecords} total membership records: ${funnelData.stillActive} active, ${funnelData.cancelled} cancelled, ${funnelData.suspended} suspended`,
      color: 'var(--green)',
      colorLight: 'rgba(74, 124, 89, 0.08)',
    },
  ]

  const maxValue = steps[0].value
  const dropOffs = [
    { pct: funnelData.crmContacts > 0 ? ((1 - funnelData.accountsCreated / funnelData.crmContacts) * 100).toFixed(1) : '0', label: 'lost — never created an account' },
    { pct: funnelData.accountsCreated > 0 ? ((1 - funnelData.introPurchased / funnelData.accountsCreated) * 100).toFixed(0) : '0', label: "lost — didn't purchase an intro offer" },
    { pct: funnelData.introPurchased > 0 ? ((1 - funnelData.convertedToMember / funnelData.introPurchased) * 100).toFixed(1) : '0', label: 'lost — never became a member' },
    { pct: '', label: `${funnelData.cancelled} cancelled \u00B7 ${funnelData.suspended} suspended` },
  ]

  const unrealisedRevenue = neverConvertCount * avgMemberValue

  return (
    <SectionWrapper
      id="section-02"
      label="02 — The Core Problem"
      title="The Intro Offer Conversion Leak"
      description="This is where the real problem lives. You're generating intro offer sales — but the vast majority never convert to paying members. The bucket has a hole in the bottom."
    >
      {/* Big Callout */}
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
              {neverConvertCount} people bought an intro offer and never became a member. {funnelData.cancelled} members cancelled — and nobody knows why.
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
              Your business has two compounding leaks. Over half of intro buyers never convert to a membership. And of the ones who do, a third eventually cancel — with zero reasons logged. You can&apos;t fix churn you can&apos;t see.
            </p>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <div
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '72px',
                fontWeight: 700,
                color: 'var(--gold)',
                lineHeight: 1,
                marginBottom: '8px',
                position: 'relative',
              }}
            >
              {neverConvertPct}%
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
              Never Convert to Member
            </div>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <ChartWrap title="The Conversion Funnel" subtitle="From Hapana Grow contact to paying member — where the drop-off happens">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0, margin: '32px auto', maxWidth: '700px' }}>
          {steps.map((step, i) => (
            <React.Fragment key={i}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '24px',
                  padding: '20px 0',
                  position: 'relative',
                }}
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      left: '40px',
                      bottom: '-1px',
                      width: '2px',
                      height: '24px',
                      background: 'rgba(26, 26, 26, 0.08)',
                      zIndex: 1,
                    }}
                  />
                )}

                {/* Step number */}
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                    flexShrink: 0,
                    fontWeight: 700,
                    background: step.colorLight,
                    color: step.color,
                  }}
                >
                  {i + 1}
                </div>

                {/* Bar */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '6px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{step.label}</span>
                    <span
                      style={{
                        fontFamily: 'var(--font-playfair), serif',
                        fontSize: '22px',
                        fontWeight: 700,
                        color: i >= 3 ? 'var(--green)' : undefined,
                      }}
                    >
                      {step.value.toLocaleString()}
                    </span>
                  </div>
                  <div style={{ height: '40px', borderRadius: '8px', position: 'relative', overflow: 'hidden', background: step.colorLight }}>
                    <div
                      style={{
                        height: '100%',
                        borderRadius: '8px',
                        width: `${Math.max((step.value / maxValue) * 100, 2)}%`,
                        background: step.color,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--ink-muted)', marginTop: '4px' }}>{step.source}</div>
                </div>
              </div>

              {/* Drop-off badge */}
              {i < dropOffs.length && (
                <div style={{ textAlign: 'center', padding: '8px 0', marginLeft: '64px' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      background: 'rgba(196, 69, 54, 0.08)',
                      color: 'var(--red)',
                      fontSize: '13px',
                      fontWeight: 700,
                      padding: '4px 14px',
                      borderRadius: '100px',
                      border: '1px solid rgba(196, 69, 54, 0.12)',
                    }}
                  >
                    {dropOffs[i].pct ? `\u2193 ${dropOffs[i].pct}% ${dropOffs[i].label}` : `\u2193 ${dropOffs[i].label}`}
                  </span>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </ChartWrap>

      {/* Insight cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
        <InsightCard number={neverConvertCount.toString()} title="People Left on the Table">
          <p>
            {neverConvertCount} people paid for an intro offer and never converted to a membership.
            At ${avgMemberValue.toFixed(0)}/month avg membership value, that&apos;s{' '}
            <strong>${(unrealisedRevenue / 1000).toFixed(0)}K+/month</strong> in unrealised recurring revenue sitting in your database right now.
          </p>
        </InsightCard>
        <InsightCard number={activeIntros.toString()} title="Sitting in Intro Offers Right Now">
          <p>
            Almost as many people are sitting in active intro offers as you have actual members ({activeMemberships}).
            These are warm, paying prospects who need nurture — not more ads.
          </p>
        </InsightCard>
      </div>
    </SectionWrapper>
  )
}
