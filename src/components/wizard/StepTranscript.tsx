'use client'

import React, { useState } from 'react'
import DropZone from '@/components/ui/DropZone'

interface StepTranscriptProps {
  onNext: (transcript: string) => void
  onBack: () => void
  initialValue?: string
}

export default function StepTranscript({ onNext, onBack, initialValue = '' }: StepTranscriptProps) {
  const [mode, setMode] = useState<'paste' | 'upload'>('paste')
  const [text, setText] = useState(initialValue)

  const handleFiles = (files: File[]) => {
    const file = files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result
      if (typeof content === 'string') setText(content)
    }
    reader.readAsText(file)
  }

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0

  const tabStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.5rem 1.25rem',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--font-dm-sans), sans-serif',
    transition: 'all 0.15s ease',
    backgroundColor: active ? 'var(--ink)' : 'transparent',
    color: active ? 'white' : 'var(--ink-muted)',
  })

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
        Sales Call Transcript
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.5rem' }}>
        Paste your transcript or upload a text file. This powers the AI diagnosis section of the proposal.
      </p>

      {/* Tab toggle */}
      <div
        style={{
          display: 'inline-flex',
          gap: '0.25rem',
          padding: '0.3rem',
          backgroundColor: 'var(--cream)',
          borderRadius: '8px',
          border: '1px solid rgba(0,0,0,0.08)',
          marginBottom: '1.25rem',
        }}
      >
        <button style={tabStyle(mode === 'paste')} onClick={() => setMode('paste')}>
          Paste Text
        </button>
        <button style={tabStyle(mode === 'upload')} onClick={() => setMode('upload')}>
          Upload File
        </button>
      </div>

      {mode === 'paste' ? (
        <div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your sales call notes or transcript here..."
            style={{
              width: '100%',
              minHeight: 260,
              padding: '0.875rem',
              border: '1px solid rgba(0,0,0,0.15)',
              borderRadius: '10px',
              fontSize: '0.875rem',
              color: 'var(--ink)',
              backgroundColor: 'white',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              lineHeight: 1.65,
              boxSizing: 'border-box',
            }}
          />
          {text.trim() && (
            <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.35rem' }}>
              {wordCount.toLocaleString()} words
            </p>
          )}
        </div>
      ) : (
        <div>
          <DropZone
            label="Drop your transcript file here"
            accept=".txt"
            onFiles={handleFiles}
          />
          {text && (
            <div
              style={{
                marginTop: '1rem',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--green-light)',
                border: '1px solid rgba(74,124,89,0.2)',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: 'var(--green)',
              }}
            >
              File loaded — {wordCount.toLocaleString()} words ready
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)', marginTop: '0.75rem' }}>
        Optional — you can skip and still generate a proposal from the data alone.
      </p>

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
          onClick={() => onNext(text)}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: 'var(--ink)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          Next →
        </button>
      </div>
    </div>
  )
}
