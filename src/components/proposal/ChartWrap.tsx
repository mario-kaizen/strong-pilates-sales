import React from 'react'

interface ChartWrapProps {
  title: string
  subtitle?: string
  children: React.ReactNode
  style?: React.CSSProperties
}

export default function ChartWrap({ title, subtitle, children, style }: ChartWrapProps) {
  return (
    <div
      style={{
        background: 'white',
        borderRadius: '20px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: '1px solid rgba(26, 26, 26, 0.08)',
        marginBottom: '24px',
        ...style,
      }}
    >
      <h3
        style={{
          fontFamily: 'var(--font-playfair), serif',
          fontSize: '20px',
          fontWeight: 600,
          marginBottom: '4px',
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <div
          style={{
            fontSize: '13px',
            color: 'var(--ink-muted)',
            marginBottom: '24px',
          }}
        >
          {subtitle}
        </div>
      )}
      {children}
    </div>
  )
}
