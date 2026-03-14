import React from 'react'
import SectionWrapper from './SectionWrapper'

interface NextStepsProps {
  locationName?: string
}

export default function NextSteps({ locationName = '' }: NextStepsProps) {
  const steps = [
    {
      number: 1,
      title: 'Confirm & Onboard',
      description: 'Confirm the partnership, get you into our client systems, and schedule your onboarding call.',
    },
    {
      number: 2,
      title: 'Send Studio Assets',
      description: "Send us your raw studio photos and video. That's the only thing we need from you to get started.",
    },
    {
      number: 3,
      title: 'First Campaign Live',
      description: 'Within 7 days, your new marketing ecosystem is built, first campaign is live, and leads start flowing.',
    },
  ]

  return (
    <SectionWrapper
      id="section-13"
      label="13 — Next Steps"
      title="Ready to Fix the Leak?"
      description="Here's what happens from here."
      noBorder
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
        {steps.map((step) => (
          <div
            key={step.number}
            style={{
              background: 'white',
              borderRadius: '20px',
              padding: '32px 24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
              border: '1px solid rgba(26, 26, 26, 0.08)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(200, 169, 81, 0.15)',
                color: 'var(--gold-dark)',
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '24px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              {step.number}
            </div>
            <h3
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '18px',
                fontWeight: 600,
                marginBottom: '8px',
              }}
            >
              {step.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-muted)', lineHeight: 1.7 }}>
              {step.description}
            </p>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '40px 0',
          textAlign: 'center',
          color: 'var(--ink-muted)',
          fontSize: '12px',
          marginTop: '40px',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-playfair), serif',
            fontSize: '16px',
            fontWeight: 600,
            color: 'var(--ink-light)',
            marginBottom: '4px',
          }}
        >
          Kaizen Collective
        </div>
        <p>Prepared by Mario Paguio &middot; kaizencollective.com.au</p>
        {locationName && (
          <p style={{ marginTop: '4px', fontSize: '11px', opacity: 0.5 }}>
            Confidential — prepared for STRONG Pilates {locationName}
          </p>
        )}
      </div>
    </SectionWrapper>
  )
}
