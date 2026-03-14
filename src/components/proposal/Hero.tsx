import React from 'react'

interface HeroProps {
  locationName: string
  address: string
  reportDate: string
  dataSources?: string
}

export default function Hero({ locationName, address, reportDate, dataSources = 'Hapana Core + Hapana Grow' }: HeroProps) {
  return (
    <div
      style={{
        padding: '80px 0 60px',
        borderBottom: '1px solid rgba(26, 26, 26, 0.08)',
        position: 'relative',
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: '-100vw',
          right: '-100vw',
          height: '100%',
          background: 'linear-gradient(135deg, var(--cream) 0%, var(--cream-dark) 50%, var(--cream) 100%)',
          zIndex: -1,
        }}
      />

      {/* Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'rgba(200, 169, 81, 0.15)',
          border: '1px solid rgba(200, 169, 81, 0.25)',
          padding: '6px 16px',
          borderRadius: '100px',
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: 'var(--gold-dark)',
          marginBottom: '24px',
        }}
      >
        <span
          style={{
            width: '6px',
            height: '6px',
            background: 'var(--gold)',
            borderRadius: '50%',
            display: 'inline-block',
          }}
        />
        Business Diagnostic
      </div>

      {/* Title */}
      <h1
        style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '52px',
          fontWeight: 600,
          lineHeight: 1.1,
          letterSpacing: '-1px',
          marginBottom: '12px',
        }}
      >
        STRONG Pilates
        <br />
        <em style={{ color: 'var(--gold)', fontStyle: 'italic' }}>{locationName}</em>
      </h1>

      <p
        style={{
          fontSize: '18px',
          color: 'var(--ink-muted)',
          fontWeight: 400,
          marginBottom: '32px',
        }}
      >
        A data-driven analysis of your current business health, revenue leaks, and untapped opportunity.
      </p>

      {/* Meta */}
      <div
        style={{
          display: 'flex',
          gap: '32px',
          fontSize: '13px',
          color: 'var(--ink-muted)',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ color: 'var(--ink-light)', fontWeight: 600 }}>Location</strong>
          {address}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ color: 'var(--ink-light)', fontWeight: 600 }}>Report Date</strong>
          {reportDate}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <strong style={{ color: 'var(--ink-light)', fontWeight: 600 }}>Data Sources</strong>
          {dataSources}
        </span>
      </div>
    </div>
  )
}
