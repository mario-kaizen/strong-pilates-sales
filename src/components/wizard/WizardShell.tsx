'use client'

import React, { useState } from 'react'
import StepLocation, { type LocationData } from './StepLocation'
import StepTranscript from './StepTranscript'
import StepHapanaCore, { type HapanaSummary } from './StepHapanaCore'
import StepMetaAds, { type MetaAdsSummary } from './StepMetaAds'
import StepReview from './StepReview'

const STEPS = [
  { label: 'Location' },
  { label: 'Transcript' },
  { label: 'Hapana Core' },
  { label: 'Meta Ads' },
  { label: 'Review' },
]

interface WizardData {
  prospectId: string
  location: (LocationData & { prospectId: string }) | null
  transcript: string
  hapana: HapanaSummary | null
  metaAds: MetaAdsSummary | null
}

export default function WizardShell() {
  const [step, setStep] = useState(1)
  const [data, setData] = useState<WizardData>({
    prospectId: '',
    location: null,
    transcript: '',
    hapana: null,
    metaAds: null,
  })

  const goNext = () => setStep((s) => Math.min(s + 1, 5))
  const goBack = () => setStep((s) => Math.max(s - 1, 1))

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--cream)',
        padding: '2rem 1rem',
        fontFamily: 'var(--font-dm-sans), sans-serif',
      }}
    >
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
          <p
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              marginBottom: '0.4rem',
            }}
          >
            STRONG Pilates · Kaizen Collective
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-playfair)',
              fontSize: '1.75rem',
              fontWeight: 700,
              color: 'var(--ink)',
            }}
          >
            New Proposal
          </h1>
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            {STEPS.map((s, i) => {
              const num = i + 1
              const isCompleted = num < step
              const isCurrent = num === step
              const isFuture = num > step

              return (
                <React.Fragment key={s.label}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.8rem',
                        fontWeight: 700,
                        transition: 'all 0.2s ease',
                        backgroundColor: isCompleted
                          ? 'var(--gold)'
                          : isCurrent
                          ? 'var(--ink)'
                          : 'rgba(0,0,0,0.08)',
                        color: isCompleted
                          ? 'var(--ink)'
                          : isCurrent
                          ? 'white'
                          : 'var(--ink-muted)',
                        border: isCurrent ? '2px solid var(--ink)' : '2px solid transparent',
                      }}
                    >
                      {isCompleted ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        num
                      )}
                    </div>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: isCurrent ? 600 : 500,
                        color: isFuture ? 'var(--ink-muted)' : 'var(--ink)',
                        textAlign: 'center',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div
                      style={{
                        flex: 2,
                        height: 2,
                        borderRadius: 1,
                        backgroundColor: isCompleted ? 'var(--gold)' : 'rgba(0,0,0,0.1)',
                        marginBottom: '1.4rem',
                        transition: 'background-color 0.2s ease',
                      }}
                    />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        </div>

        {/* Step Content Card */}
        <div
          style={{
            backgroundColor: 'white',
            border: '1px solid rgba(0,0,0,0.08)',
            borderRadius: '16px',
            padding: '2rem',
            boxShadow: '0 2px 16px rgba(0,0,0,0.05)',
          }}
        >
          {step === 1 && (
            <StepLocation
              onNext={(locationData) => {
                setData((prev) => ({
                  ...prev,
                  prospectId: locationData.prospectId,
                  location: locationData,
                }))
                goNext()
              }}
            />
          )}

          {step === 2 && (
            <StepTranscript
              initialValue={data.transcript}
              onNext={(transcript) => {
                setData((prev) => ({ ...prev, transcript }))
                goNext()
              }}
              onBack={goBack}
            />
          )}

          {step === 3 && (
            <StepHapanaCore
              prospectId={data.prospectId}
              onNext={(hapana) => {
                setData((prev) => ({ ...prev, hapana }))
                goNext()
              }}
              onBack={goBack}
            />
          )}

          {step === 4 && (
            <StepMetaAds
              prospectId={data.prospectId}
              onNext={(metaAds) => {
                setData((prev) => ({ ...prev, metaAds }))
                goNext()
              }}
              onBack={goBack}
            />
          )}

          {step === 5 && (
            <StepReview
              prospectId={data.prospectId}
              prospectSlug={data.location?.slug ?? ''}
              ghlLocationId={data.location?.ghlLocationId ?? ''}
              ghlPit={data.location?.ghlPit ?? ''}
              transcript={data.transcript}
              hapana={data.hapana}
              metaAds={data.metaAds}
              onBack={goBack}
            />
          )}
        </div>

        {/* Step counter footer */}
        <p
          style={{
            textAlign: 'center',
            marginTop: '1.25rem',
            fontSize: '0.75rem',
            color: 'var(--ink-muted)',
          }}
        >
          Step {step} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
