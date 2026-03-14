import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import EditProspectForm from '@/components/EditProspectForm'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const prospect = await prisma.prospect.findUnique({ where: { slug } })
  if (!prospect) return { title: 'Not Found' }
  return { title: `Edit — ${prospect.locationName} | STRONG Pilates Sales` }
}

export default async function EditProspectPage({ params }: PageProps) {
  const { slug } = await params

  const prospect = await prisma.prospect.findUnique({
    where: { slug },
    include: { uploads: { orderBy: { createdAt: 'desc' } } },
  })

  if (!prospect) notFound()

  // Format date to YYYY-MM-DD for the date input
  const openingDateStr = prospect.openingDate
    ? new Date(prospect.openingDate).toISOString().split('T')[0]
    : ''

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
            maxWidth: '900px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            height: '60px',
          }}
        >
          <Link
            href="/"
            style={{
              fontSize: '0.8rem',
              color: 'var(--ink-muted)',
              textDecoration: 'none',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}
          >
            Dashboard
          </Link>
          <span style={{ color: 'rgba(26,26,26,0.25)', fontSize: '0.875rem' }}>/</span>
          {prospect.status === 'ready' ? (
            <Link
              href={`/${slug}`}
              style={{
                fontSize: '0.8rem',
                color: 'var(--ink-muted)',
                textDecoration: 'none',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              {prospect.locationName}
            </Link>
          ) : (
            <span style={{ fontSize: '0.8rem', color: 'var(--ink-muted)' }}>{prospect.locationName}</span>
          )}
          <span style={{ color: 'rgba(26,26,26,0.25)', fontSize: '0.875rem' }}>/</span>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: 'var(--ink)',
              fontFamily: 'var(--font-dm-sans), sans-serif',
            }}
          >
            Edit
          </span>
        </div>
      </nav>

      {/* Content */}
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
          padding: '2.5rem 2rem',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '2rem',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '0.7rem',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'var(--gold)',
                marginBottom: '0.4rem',
              }}
            >
              Edit Prospect
            </p>
            <h1
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                fontWeight: 700,
                color: 'var(--ink)',
                lineHeight: 1.2,
              }}
            >
              {prospect.locationName}
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginTop: '0.4rem' }}>
              {prospect.city}, {prospect.country}
            </p>
          </div>

          {prospect.status === 'ready' && (
            <Link
              href={`/${slug}`}
              style={{
                display: 'inline-block',
                backgroundColor: 'var(--ink)',
                color: 'white',
                fontSize: '0.82rem',
                fontWeight: 600,
                fontFamily: 'var(--font-dm-sans), sans-serif',
                padding: '0.6rem 1.25rem',
                borderRadius: '8px',
                textDecoration: 'none',
              }}
            >
              View Proposal
            </Link>
          )}
        </div>

        {/* Upload history summary */}
        {prospect.uploads.length > 0 && (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '12px',
              border: '1px solid rgba(26,26,26,0.07)',
              padding: '1.25rem 1.5rem',
              marginBottom: '1.25rem',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-playfair), serif',
                fontSize: '0.95rem',
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: '0.85rem',
              }}
            >
              Existing Uploads ({prospect.uploads.length})
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              {prospect.uploads.map((upload) => (
                <div
                  key={upload.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: 'var(--cream)',
                    fontFamily: 'var(--font-dm-sans), sans-serif',
                    flexWrap: 'wrap',
                    gap: '0.5rem',
                  }}
                >
                  <span style={{ fontWeight: 500, color: 'var(--ink)' }}>{upload.filename}</span>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        letterSpacing: '0.07em',
                        textTransform: 'uppercase',
                        color: upload.type === 'hapana_core' ? 'var(--blue)' : 'var(--purple)',
                        backgroundColor: upload.type === 'hapana_core' ? 'var(--blue-light)' : 'rgba(123,94,167,0.08)',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '100px',
                      }}
                    >
                      {upload.type === 'hapana_core' ? 'Core' : 'Meta Ads'}
                    </span>
                    <span style={{ color: 'var(--ink-muted)' }}>
                      {upload.rowCount} rows ·{' '}
                      {new Date(upload.createdAt).toLocaleDateString('en-AU', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Edit Form (client component) */}
        <EditProspectForm
          prospect={{
            id: prospect.id,
            slug: prospect.slug,
            locationName: prospect.locationName,
            city: prospect.city,
            country: prospect.country,
            address: prospect.address,
            ghlLocationId: prospect.ghlLocationId,
            ghlPit: prospect.ghlPit,
            openingDate: openingDateStr,
            status: prospect.status,
          }}
        />
      </div>
    </main>
  )
}
