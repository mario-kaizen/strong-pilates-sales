'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { HapanaSummary } from './StepHapanaCore'
import type { MetaAdsSummary } from './StepMetaAds'

interface StepReviewProps {
  prospectId: string
  prospectSlug: string
  ghlLocationId: string
  ghlPit: string
  transcript: string
  hapana: HapanaSummary | null
  metaAds: MetaAdsSummary | null
  onBack: () => void
}

type GhlStatus = 'idle' | 'testing' | 'connected' | 'failed'

const STATUS_MESSAGES = [
  'Processing data...',
  'Analysing transcript...',
  'Building proposal...',
]

export default function StepReview({
  prospectId,
  prospectSlug,
  ghlLocationId,
  ghlPit,
  transcript,
  hapana,
  metaAds,
  onBack,
}: StepReviewProps) {
  const router = useRouter()
  const [ghlStatus, setGhlStatus] = useState<GhlStatus>('idle')
  const [ghlMessage, setGhlMessage] = useState('')
  const [generating, setGenerating] = useState(false)
  const [genStatusIdx, setGenStatusIdx] = useState(0)
  const [genError, setGenError] = useState('')

  const testGhl = async () => {
    if (!ghlLocationId || !ghlPit) {
      setGhlMessage('No GHL credentials provided')
      setGhlStatus('failed')
      return
    }
    setGhlStatus('testing')
    setGhlMessage('')

    try {
      const res = await fetch('/api/ghl/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: ghlLocationId, pit: ghlPit }),
      })
      const data = await res.json()
      if (data.connected) {
        setGhlStatus('connected')
        setGhlMessage(data.locationName ? `Connected: ${data.locationName}` : 'Connected')
      } else {
        setGhlStatus('failed')
        setGhlMessage(data.error || 'Connection failed')
      }
    } catch {
      setGhlStatus('failed')
      setGhlMessage('Network error')
    }
  }

  const handleGenerate = async () => {
    setGenerating(true)
    setGenError('')
    setGenStatusIdx(0)

    // Cycle through status messages
    const interval = setInterval(() => {
      setGenStatusIdx((i) => Math.min(i + 1, STATUS_MESSAGES.length - 1))
    }, 3000)

    try {
      // Save transcript to Diagnosis if present
      if (transcript.trim()) {
        await fetch(`/api/prospects/${prospectId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ diagnosis: { rawTranscript: transcript } }),
        })
      }

      // Trigger generation
      const res = await fetch(`/api/prospects/${prospectId}/generate`, { method: 'POST' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `Generation failed (${res.status})`)
      }

      clearInterval(interval)
      router.push(`/${prospectSlug}`)
    } catch (err) {
      clearInterval(interval)
      setGenError(err instanceof Error ? err.message : 'Generation failed')
      setGenerating(false)
    }
  }

  const wordCount = transcript.trim() ? transcript.trim().split(/\s+/).length : 0

  const cardStyle: React.CSSProperties = {
    backgroundColor: 'white',
    border: '1px solid rgba(0,0,0,0.08)',
    borderRadius: '12px',
    padding: '1.25rem',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    marginBottom: '0.5rem',
  }

  return (
    <div>
      <h2
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '0.35rem',
        }}
      >
        Review & Generate
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
        Check your data sources below, then generate the proposal.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {/* Hapana Core */}
        <div style={cardStyle}>
          <p style={labelStyle}>Hapana Core</p>
          {hapana ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ </span>
              {hapana.totalRows.toLocaleString()} total records across {hapana.uploads.length} file
              {hapana.uploads.length !== 1 ? 's' : ''}
              {hapana.uploads.length > 0 && (
                <ul style={{ marginTop: '0.4rem', paddingLeft: '1.25rem', color: 'var(--ink-muted)', fontSize: '0.78rem' }}>
                  {hapana.uploads.map((u, i) => (
                    <li key={i}>
                      {u.filename} — {u.rows.toLocaleString()} rows
                      {u.statuses.length > 0 ? ` (${u.statuses.join(', ')})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>No files uploaded</p>
          )}
        </div>

        {/* Meta Ads */}
        <div style={cardStyle}>
          <p style={labelStyle}>Meta Ads</p>
          {metaAds ? (
            <div style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ </span>
              ${metaAds.totalSpend.toLocaleString('en-AU', { minimumFractionDigits: 2 })} total spend
              {metaAds.dateRange && ` · ${metaAds.dateRange}`}
              {` · ${metaAds.rows.toLocaleString()} rows`}
            </div>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>No file uploaded</p>
          )}
        </div>

        {/* GHL Connection */}
        <div style={cardStyle}>
          <p style={labelStyle}>Hapana Grow (GHL)</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {ghlLocationId && ghlPit ? (
              <>
                <button
                  onClick={testGhl}
                  disabled={ghlStatus === 'testing'}
                  style={{
                    padding: '0.4rem 1rem',
                    border: '1px solid rgba(0,0,0,0.15)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: ghlStatus === 'testing' ? 'not-allowed' : 'pointer',
                    backgroundColor:
                      ghlStatus === 'connected'
                        ? 'var(--green-light)'
                        : ghlStatus === 'failed'
                        ? 'var(--red-light)'
                        : 'white',
                    color:
                      ghlStatus === 'connected'
                        ? 'var(--green)'
                        : ghlStatus === 'failed'
                        ? 'var(--red)'
                        : 'var(--ink)',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                  }}
                >
                  {ghlStatus === 'testing'
                    ? 'Testing...'
                    : ghlStatus === 'connected'
                    ? '✓ Connected'
                    : ghlStatus === 'failed'
                    ? '✗ Failed'
                    : 'Test Connection'}
                </button>
                {ghlMessage && (
                  <span style={{ fontSize: '0.78rem', color: 'var(--ink-muted)' }}>{ghlMessage}</span>
                )}
              </>
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>No GHL credentials provided — skipping</p>
            )}
          </div>
        </div>

        {/* Transcript */}
        <div style={cardStyle}>
          <p style={labelStyle}>Sales Transcript</p>
          {transcript.trim() ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--ink)' }}>
              <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ </span>
              {wordCount.toLocaleString()} words
            </p>
          ) : (
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)' }}>Not provided</p>
          )}
        </div>
      </div>

      {genError && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--red-light)',
            border: '1px solid rgba(196,69,54,0.2)',
            borderRadius: '8px',
            color: 'var(--red)',
            fontSize: '0.85rem',
          }}
        >
          {genError}
        </div>
      )}

      {generating && (
        <div
          style={{
            marginBottom: '1rem',
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--ink)',
            borderRadius: '10px',
            color: 'white',
            fontSize: '0.9rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⏳</span>
          <span>{STATUS_MESSAGES[genStatusIdx]}</span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={onBack}
          disabled={generating}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: generating ? 'not-allowed' : 'pointer',
            backgroundColor: 'white',
            color: 'var(--ink)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            opacity: generating ? 0.5 : 1,
          }}
        >
          ← Back
        </button>

        <button
          onClick={handleGenerate}
          disabled={generating}
          style={{
            padding: '0.875rem 2.5rem',
            backgroundColor: generating ? 'var(--ink-muted)' : 'var(--gold)',
            color: 'var(--ink)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: generating ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-playfair)',
            boxShadow: generating ? 'none' : '0 4px 16px rgba(200,169,81,0.3)',
            transition: 'all 0.2s ease',
          }}
        >
          {generating ? 'Generating...' : 'Generate Proposal'}
        </button>
      </div>
    </div>
  )
}
