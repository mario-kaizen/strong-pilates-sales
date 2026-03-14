import React from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  variant?: 'default' | 'danger' | 'warning' | 'success'
}

const variantStyles: Record<
  NonNullable<StatCardProps['variant']>,
  { bg: string; text: string; border: string }
> = {
  default: {
    bg: 'white',
    text: 'var(--ink)',
    border: 'rgba(0,0,0,0.08)',
  },
  danger: {
    bg: 'var(--red-light)',
    text: 'var(--red)',
    border: 'rgba(196,69,54,0.18)',
  },
  warning: {
    bg: 'var(--orange-light)',
    text: 'var(--orange)',
    border: 'rgba(212,133,58,0.18)',
  },
  success: {
    bg: 'var(--green-light)',
    text: 'var(--green)',
    border: 'rgba(74,124,89,0.18)',
  },
}

export default function StatCard({ label, value, sub, variant = 'default' }: StatCardProps) {
  const styles = variantStyles[variant]

  return (
    <div
      style={{
        backgroundColor: styles.bg,
        border: `1px solid ${styles.border}`,
        borderRadius: '12px',
        padding: '1.25rem 1.5rem',
        position: 'relative',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
      }}
      className="stat-card"
    >
      {/* Gold top accent bar — only on default variant */}
      {variant === 'default' && (
        <div
          className="stat-card-accent"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            backgroundColor: 'var(--gold)',
            opacity: 0,
            transition: 'opacity 0.2s ease',
          }}
        />
      )}

      <p
        style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: variant === 'default' ? 'var(--ink-muted)' : styles.text,
          marginBottom: '0.5rem',
        }}
      >
        {label}
      </p>

      <p
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.75rem',
          fontWeight: 700,
          color: styles.text,
          lineHeight: 1.1,
          marginBottom: sub ? '0.35rem' : 0,
        }}
      >
        {value}
      </p>

      {sub && (
        <p
          style={{
            fontSize: '0.78rem',
            color: variant === 'default' ? 'var(--ink-muted)' : styles.text,
            opacity: variant === 'default' ? 1 : 0.8,
          }}
        >
          {sub}
        </p>
      )}

      <style>{`
        .stat-card:hover .stat-card-accent {
          opacity: 1;
        }
        .stat-card:hover {
          box-shadow: 0 4px 20px rgba(200,169,81,0.12);
          border-color: rgba(200,169,81,0.3);
        }
      `}</style>
    </div>
  )
}
