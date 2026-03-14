'use client'

import React, { useState } from 'react'
import DropZone from '@/components/ui/DropZone'

interface StepHaponaCoreProps {
  prospectId: string
  onNext: (summary: HapanaSummary) => void
  onBack: () => void
}

export interface HapanaSummary {
  uploads: UploadResult[]
  totalRows: number
}

interface UploadResult {
  filename: string
  rows: number
  statuses: string[]
  uploadId: string
}

interface UploadState {
  filename: string
  status: 'uploading' | 'done' | 'error'
  result?: UploadResult
  error?: string
}

export default function StepHapanaCore({ prospectId, onNext, onBack }: StepHaponaCoreProps) {
  const [uploadStates, setUploadStates] = useState<UploadState[]>([])

  const handleFiles = async (files: File[]) => {
    for (const file of files) {
      setUploadStates((prev) => [
        ...prev,
        { filename: file.name, status: 'uploading' },
      ])

      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('type', 'hapana_core')
        formData.append('prospectId', prospectId)

        const res = await fetch('/api/upload', { method: 'POST', body: formData })
        const data = await res.json()

        if (!res.ok) throw new Error(data.error || 'Upload failed')

        const result: UploadResult = {
          filename: file.name,
          rows: data.summary?.rows ?? 0,
          statuses: data.summary?.statuses ?? [],
          uploadId: data.upload?.id ?? '',
        }

        setUploadStates((prev) =>
          prev.map((u) =>
            u.filename === file.name ? { ...u, status: 'done', result } : u
          )
        )
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        setUploadStates((prev) =>
          prev.map((u) =>
            u.filename === file.name ? { ...u, status: 'error', error: message } : u
          )
        )
      }
    }
  }

  const doneUploads = uploadStates.filter((u) => u.status === 'done' && u.result)
  const totalRows = doneUploads.reduce((sum, u) => sum + (u.result?.rows ?? 0), 0)

  const canProceed = doneUploads.length > 0

  const handleNext = () => {
    onNext({
      uploads: doneUploads.map((u) => u.result!),
      totalRows,
    })
  }

  const instructions = (
    <div>
      <p style={{ fontWeight: 600, color: 'var(--ink)', marginBottom: '0.5rem', fontSize: '0.82rem' }}>
        Export getMembershipDetails from Hapana Core. We need up to 3 reports:
      </p>
      <ol style={{ paddingLeft: '1.25rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        <li>Active members (Active, Scheduled, Pending, Suspended)</li>
        <li>Cancelled memberships</li>
        <li>Completed/expired intros and packages</li>
      </ol>
      <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>
        Upload any combination — we&apos;ll detect what&apos;s in each file.
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
        Hapana Core Data
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
        Upload CSV exports from Hapana Core&apos;s getMembershipDetails report.
      </p>

      <DropZone
        label="Drop Hapana Core CSVs here"
        accept=".csv"
        multiple={true}
        onFiles={handleFiles}
        instructions={instructions}
      />

      {/* Upload status list */}
      {uploadStates.length > 0 && (
        <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {uploadStates.map((u, i) => (
            <div
              key={i}
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                border: '1px solid',
                borderColor:
                  u.status === 'done'
                    ? 'rgba(74,124,89,0.2)'
                    : u.status === 'error'
                    ? 'rgba(196,69,54,0.2)'
                    : 'rgba(0,0,0,0.1)',
                backgroundColor:
                  u.status === 'done'
                    ? 'var(--green-light)'
                    : u.status === 'error'
                    ? 'var(--red-light)'
                    : 'var(--cream)',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink)' }}>{u.filename}</span>
                {u.status === 'uploading' && (
                  <span style={{ color: 'var(--ink-muted)' }}>Uploading...</span>
                )}
                {u.status === 'done' && (
                  <span style={{ color: 'var(--green)' }}>✓ {u.result?.rows?.toLocaleString()} rows</span>
                )}
                {u.status === 'error' && (
                  <span style={{ color: 'var(--red)' }}>Failed</span>
                )}
              </div>
              {u.status === 'done' && u.result?.statuses && u.result.statuses.length > 0 && (
                <p style={{ marginTop: '0.3rem', color: 'var(--ink-muted)' }}>
                  Statuses: {u.result.statuses.join(', ')}
                </p>
              )}
              {u.status === 'error' && (
                <p style={{ marginTop: '0.3rem', color: 'var(--red)' }}>{u.error}</p>
              )}
            </div>
          ))}

          {totalRows > 0 && (
            <div
              style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                backgroundColor: 'var(--ink)',
                color: 'white',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              Total records uploaded: {totalRows.toLocaleString()}
            </div>
          )}
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
          onClick={handleNext}
          disabled={!canProceed}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: canProceed ? 'var(--ink)' : 'var(--ink-muted)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: canProceed ? 'pointer' : 'not-allowed',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
