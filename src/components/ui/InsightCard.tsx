import React from 'react'

interface InsightCardProps {
  number?: string
  title: string
  children: React.ReactNode
}

export default function InsightCard({ number, title, children }: InsightCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: '12px',
        padding: '1.5rem',
        display: 'flex',
        gap: '1rem',
      }}
    >
      {number && (
        <div
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '2rem',
            fontWeight: 700,
            color: 'var(--gold)',
            lineHeight: 1,
            flexShrink: 0,
            minWidth: '2.5rem',
          }}
        >
          {number}
        </div>
      )}

      <div style={{ flex: 1 }}>
        <h3
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '0.5rem',
            lineHeight: 1.3,
          }}
        >
          {title}
        </h3>
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--ink-muted)',
            lineHeight: 1.65,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
