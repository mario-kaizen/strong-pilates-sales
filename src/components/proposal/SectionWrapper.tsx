import React from 'react'

interface SectionWrapperProps {
  id?: string
  label: string
  title: string
  description?: string
  children: React.ReactNode
  noBorder?: boolean
}

export default function SectionWrapper({ id, label, title, description, children, noBorder }: SectionWrapperProps) {
  return (
    <div
      id={id}
      style={{
        padding: '56px 0',
        borderBottom: noBorder ? 'none' : '1px solid rgba(26, 26, 26, 0.08)',
      }}
    >
      <div
        style={{
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          color: 'var(--gold)',
          marginBottom: '8px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '32px',
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: '8px',
        }}
      >
        {title}
      </div>
      {description && (
        <div
          style={{
            fontSize: '15px',
            color: 'var(--ink-muted)',
            maxWidth: '640px',
            marginBottom: '36px',
            lineHeight: 1.7,
          }}
        >
          {description}
        </div>
      )}
      {children}
    </div>
  )
}
