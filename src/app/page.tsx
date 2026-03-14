export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { prisma } from '@/lib/db'
import DeleteButton from '@/components/DeleteButton'

type ProspectStatus = 'draft' | 'processing' | 'ready' | 'sent'

function StatusBadge({ status }: { status: string }) {
  const configs: Record<ProspectStatus, { label: string; bg: string; color: string; border: string }> = {
    draft: {
      label: 'Draft',
      bg: 'rgba(107,107,107,0.08)',
      color: 'var(--ink-muted)',
      border: 'rgba(107,107,107,0.2)',
    },
    processing: {
      label: 'Processing',
      bg: 'var(--gold-glow)',
      color: 'var(--gold-dark)',
      border: 'rgba(200,169,81,0.3)',
    },
    ready: {
      label: 'Ready',
      bg: 'var(--green-light)',
      color: 'var(--green)',
      border: 'rgba(74,124,89,0.2)',
    },
    sent: {
      label: 'Sent',
      bg: 'var(--blue-light)',
      color: 'var(--blue)',
      border: 'rgba(74,111,165,0.2)',
    },
  }

  const cfg = configs[status as ProspectStatus] ?? configs.draft

  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.7rem',
        fontWeight: 600,
        fontFamily: 'var(--font-dm-sans), sans-serif',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        padding: '0.2rem 0.6rem',
        borderRadius: '100px',
        backgroundColor: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      {cfg.label}
    </span>
  )
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default async function DashboardPage() {
  const prospects = await prisma.prospect.findMany({
    include: { data: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--cream)',
        fontFamily: 'var(--font-dm-sans), sans-serif',
      }}
    >
      {/* Top Nav */}
      <nav
        style={{
          borderBottom: '1px solid rgba(26,26,26,0.08)',
          backgroundColor: 'var(--cream)',
          padding: '0 2rem',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            maxWidth: '1100px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: '60px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem' }}>
            <span
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
              }}
            >
              Kaizen Collective
            </span>
            <span style={{ color: 'rgba(26,26,26,0.15)', fontSize: '0.875rem' }}>/</span>
            <span
              style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--ink)',
              }}
            >
              STRONG Pilates Sales
            </span>
          </div>

          <Link
            href="/new"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              backgroundColor: 'var(--gold)',
              color: 'var(--ink)',
              fontSize: '0.8rem',
              fontWeight: 600,
              letterSpacing: '0.04em',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              textDecoration: 'none',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              transition: 'background-color 0.15s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Prospect
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Page Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1
            style={{
              fontFamily: 'var(--font-playfair), serif',
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              fontWeight: 700,
              color: 'var(--ink)',
              lineHeight: 1.2,
              marginBottom: '0.5rem',
            }}
          >
            STRONG Pilates Sales
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: 'var(--ink-muted)',
              lineHeight: 1.5,
            }}
          >
            {prospects.length === 0
              ? 'No prospects yet — create your first one to get started.'
              : `${prospects.length} prospect${prospects.length === 1 ? '' : 's'} total`}
          </p>
        </div>

        {/* Empty State */}
        {prospects.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '4rem 2rem',
              border: '2px dashed rgba(26,26,26,0.12)',
              borderRadius: '16px',
              backgroundColor: 'white',
            }}
          >
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--cream)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '1.2rem',
                fontWeight: 600,
                color: 'var(--ink)',
                marginBottom: '0.5rem',
              }}
            >
              No prospects yet
            </p>
            <p style={{ fontSize: '0.875rem', color: 'var(--ink-muted)', marginBottom: '1.75rem' }}>
              Create your first prospect to generate a data-driven sales proposal.
            </p>
            <Link
              href="/new"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'var(--gold)',
                color: 'var(--ink)',
                fontSize: '0.85rem',
                fontWeight: 600,
                padding: '0.75rem 1.5rem',
                borderRadius: '8px',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              Create First Prospect
            </Link>
          </div>
        )}

        {/* Prospect List */}
        {prospects.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >
            {prospects.map((prospect) => {
              const data = prospect.data

              return (
                <div
                  key={prospect.id}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '12px',
                    border: '1px solid rgba(26,26,26,0.07)',
                    padding: '1.25rem 1.5rem',
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: '1rem',
                    alignItems: 'start',
                  }}
                >
                  {/* Left: Main Info */}
                  <div>
                    {/* Row 1: Name + Badge */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.35rem', flexWrap: 'wrap' }}>
                      <Link
                        href={`/${prospect.slug}`}
                        style={{
                          fontFamily: 'var(--font-playfair), serif',
                          fontSize: '1.1rem',
                          fontWeight: 700,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                        }}
                      >
                        {prospect.locationName}
                      </Link>
                      <StatusBadge status={prospect.status} />
                    </div>

                    {/* Row 2: Location */}
                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: 'var(--ink-muted)',
                        marginBottom: data ? '0.85rem' : '0',
                      }}
                    >
                      {prospect.city}, {prospect.country}
                    </p>

                    {/* Row 3: Data Stats (if available) */}
                    {data && (
                      <div
                        style={{
                          display: 'flex',
                          gap: '1.5rem',
                          flexWrap: 'wrap',
                          padding: '0.75rem 1rem',
                          backgroundColor: 'var(--cream)',
                          borderRadius: '8px',
                          marginBottom: '0.85rem',
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--ink-muted)',
                              marginBottom: '0.15rem',
                            }}
                          >
                            Active Members
                          </p>
                          <p
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--ink)',
                              fontFamily: 'var(--font-playfair), serif',
                            }}
                          >
                            {data.activeMemberships.toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--ink-muted)',
                              marginBottom: '0.15rem',
                            }}
                          >
                            MRR
                          </p>
                          <p
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: 'var(--ink)',
                              fontFamily: 'var(--font-playfair), serif',
                            }}
                          >
                            ${data.totalMrr.toLocaleString('en-AU', { maximumFractionDigits: 0 })}
                          </p>
                        </div>

                        <div>
                          <p
                            style={{
                              fontSize: '0.65rem',
                              fontWeight: 600,
                              letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: 'var(--ink-muted)',
                              marginBottom: '0.15rem',
                            }}
                          >
                            Intro Conversion
                          </p>
                          <p
                            style={{
                              fontSize: '1rem',
                              fontWeight: 700,
                              color: data.introConversionRate < 30 ? 'var(--red)' : data.introConversionRate < 50 ? 'var(--orange)' : 'var(--green)',
                              fontFamily: 'var(--font-playfair), serif',
                            }}
                          >
                            {data.introConversionRate.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Row 4: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      {prospect.status === 'ready' && (
                        <Link
                          href={`/${prospect.slug}`}
                          style={{
                            fontSize: '0.8rem',
                            fontWeight: 600,
                            color: 'white',
                            backgroundColor: 'var(--ink)',
                            padding: '0.4rem 0.9rem',
                            borderRadius: '6px',
                            textDecoration: 'none',
                            fontFamily: 'var(--font-dm-sans), sans-serif',
                          }}
                        >
                          View Proposal
                        </Link>
                      )}
                      <Link
                        href={`/${prospect.slug}/edit`}
                        style={{
                          fontSize: '0.8rem',
                          fontWeight: 500,
                          color: 'var(--ink)',
                          textDecoration: 'none',
                          fontFamily: 'var(--font-dm-sans), sans-serif',
                          padding: '0.4rem 0',
                          borderBottom: '1px solid rgba(26,26,26,0.2)',
                        }}
                      >
                        Edit
                      </Link>
                      <DeleteButton prospectId={prospect.id} locationName={prospect.locationName} />
                    </div>
                  </div>

                  {/* Right: Date */}
                  <div style={{ textAlign: 'right' }}>
                    <p
                      style={{
                        fontSize: '0.75rem',
                        color: 'var(--ink-muted)',
                        fontFamily: 'var(--font-dm-sans), sans-serif',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {formatDate(prospect.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}
