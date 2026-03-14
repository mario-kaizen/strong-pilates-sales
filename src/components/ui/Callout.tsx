import React from 'react'

interface CalloutProps {
  children: React.ReactNode
  variant?: 'default' | 'danger' | 'success'
}

const variantStyles: Record<
  NonNullable<CalloutProps['variant']>,
  { bg: string; border: string; glow: string }
> = {
  default: {
    bg: 'var(--ink)',
    border: 'rgba(200,169,81,0.35)',
    glow: 'rgba(200,169,81,0.08)',
  },
  danger: {
    bg: '#1F0D0B',
    border: 'rgba(196,69,54,0.35)',
    glow: 'rgba(196,69,54,0.06)',
  },
  success: {
    bg: '#0B1710',
    border: 'rgba(74,124,89,0.35)',
    glow: 'rgba(74,124,89,0.06)',
  },
}

export default function Callout({ children, variant = 'default' }: CalloutProps) {
  const styles = variantStyles[variant]

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: '12px',
        padding: '1.5rem 1.75rem',
        boxShadow: `0 0 32px ${styles.glow}`,
        color: 'white',
        lineHeight: 1.7,
        fontSize: '0.9rem',
      }}
    >
      {/* Gold/accent left rule */}
      <div style={{ display: 'flex', gap: '1.25rem' }}>
        <div
          style={{
            width: 3,
            minHeight: '100%',
            borderRadius: 4,
            backgroundColor:
              variant === 'default'
                ? 'var(--gold)'
                : variant === 'danger'
                ? 'var(--red)'
                : 'var(--green)',
            flexShrink: 0,
            alignSelf: 'stretch',
          }}
        />
        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  )
}
