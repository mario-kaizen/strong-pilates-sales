'use client'

import React, { useState } from 'react'
import DropZone from '@/components/ui/DropZone'

interface StepMetaAdsProps {
  prospectId: string
  onNext: (summary: MetaAdsSummary) => void
  onBack: () => void
}

export interface MetaAdsSummary {
  totalSpend: number
  dateRange: string
  campaigns: number
  rows: number
  uploadId: string
}

export default function StepMetaAds({ prospectId, onNext, onBack }: StepMetaAdsProps) {
  const [uploading, setUploading] = useState(false)
  const [summary, setSummary] = useState<MetaAdsSummary | null>(null)
  const [error, setError] = useState('')

  const handleFiles = async (files: File[]) => {
    const file = files[0]
    if (!file) return
    setError('')
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', 'meta_ads')
      formData.append('prospectId', prospectId)

      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Upload failed')

      setSummary({
        totalSpend: data.summary?.totalSpend ?? 0,
        dateRange: data.summary?.dateRange ?? '',
        campaigns: data.summary?.campaigns ?? 0,
        rows: data.summary?.rows ?? 0,
        uploadId: data.upload?.id ?? '',
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const instructions = (
    <div>
      <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
        From Meta Ads Manager:
      </p>
      <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li>Select all campaigns for this location</li>
        <li>Set date range to cover full history</li>
        <li>Breakdown → By Time → Month</li>
        <li>
          Include columns: Amount Spent, Results, Result Indicator, Leads, Impressions, Link Clicks,
          Purchases
        </li>
        <li>Export → CSV</li>
      </ol>
      <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
        Tip: Include &quot;Result Indicator&quot; — it shows what Meta counted as a &quot;result&quot; each month.
      </p>
    </div>
  )

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
        Meta Ads Data
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
        Upload the monthly breakdown CSV from Meta Ads Manager.
      </p>

      {uploading ? (
        <div
          style={{
            padding: '2rem',
            textAlign: 'center',
            border: '2px dashed rgba(0,0,0,0.1)',
            borderRadius: '12px',
            color: 'var(--ink-muted)',
            fontSize: '0.9rem',
          }}
        >
          Uploading and processing...
        </div>
      ) : !summary ? (
        <DropZone
          label="Drop Meta Ads CSV here"
          accept=".csv"
          onFiles={handleFiles}
          instructions={instructions}
        />
      ) : (
        <div
          style={{
            padding: '1.25rem',
            borderRadius: '12px',
            border: '1px solid rgba(74,124,89,0.2)',
            backgroundColor: 'var(--green-light)',
          }}
        >
          <p style={{ fontWeight: 600, color: 'var(--green)', marginBottom: '0.75rem', fontSize: '0.9rem' }}>
            ✓ Meta Ads data uploaded
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Total Spend:</span>{' '}
              <strong style={{ color: 'var(--ink)' }}>
                ${summary.totalSpend.toLocaleString('en-AU', { minimumFractionDigits: 2 })}
              </strong>
            </div>
            {summary.dateRange && (
              <div>
                <span style={{ color: 'var(--ink-muted)' }}>Date Range:</span>{' '}
                <strong style={{ color: 'var(--ink)' }}>{summary.dateRange}</strong>
              </div>
            )}
            <div>
              <span style={{ color: 'var(--ink-muted)' }}>Rows:</span>{' '}
              <strong style={{ color: 'var(--ink)' }}>{summary.rows.toLocaleString()}</strong>
            </div>
          </div>
          <button
            onClick={() => setSummary(null)}
            style={{
              marginTop: '0.75rem',
              fontSize: '0.75rem',
              color: 'var(--ink-muted)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Replace file
          </button>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--red-light)',
            border: '1px solid rgba(196,69,54,0.2)',
            borderRadius: '8px',
            color: 'var(--red)',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'space-between' }}>
        <button
          onClick={onBack}
          style={{
            padding: '0.75rem 1.5rem',
            border: '1px solid rgba(0,0,0,0.15)',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            backgroundColor: 'white',
            color: 'var(--ink)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          ← Back
        </button>
        <button
          onClick={() => summary && onNext(summary)}
          disabled={!summary}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: summary ? 'var(--ink)' : 'var(--ink-muted)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: summary ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
