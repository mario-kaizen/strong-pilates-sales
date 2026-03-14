'use client'

import React, { useState } from 'react'

interface StepLocationProps {
  onNext: (data: LocationData & { prospectId: string }) => void
}

export interface LocationData {
  locationName: string
  city: string
  country: string
  address: string
  ghlLocationId: string
  ghlPit: string
  openingDate: string
  slug: string
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.65rem 0.875rem',
  border: '1px solid rgba(0,0,0,0.15)',
  borderRadius: '8px',
  fontSize: '0.9rem',
  color: 'var(--ink)',
  backgroundColor: 'white',
  outline: 'none',
  fontFamily: 'var(--font-dm-sans), sans-serif',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ink-muted)',
  marginBottom: '0.4rem',
}

export default function StepLocation({ onNext }: StepLocationProps) {
  const [form, setForm] = useState<LocationData>({
    locationName: '',
    city: '',
    country: 'Australia',
    address: '',
    ghlLocationId: '',
    ghlPit: '',
    openingDate: '',
    slug: '',
  })
  const [slugEdited, setSlugEdited] = useState(false)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')

  const fetchFromGhl = async () => {
    if (!form.ghlLocationId || !form.ghlPit) return
    setFetching(true)
    setError('')
    try {
      const res = await fetch(`https://services.leadconnectorhq.com/locations/${form.ghlLocationId}`, {
        headers: {
          'Authorization': `Bearer ${form.ghlPit}`,
          'Version': '2021-07-28',
          'Accept': 'application/json',
        },
      })
      if (!res.ok) throw new Error('Could not connect — check Location ID and PIT')
      const data = await res.json()
      const loc = data.location || {}
      const name = loc.name || ''
      const city = loc.city || ''
      const country = loc.country || ''
      const address = [loc.address, loc.city, loc.state, loc.postalCode].filter(Boolean).join(', ')

      setForm(prev => ({
        ...prev,
        locationName: name || prev.locationName,
        city: city || prev.city,
        country: country || prev.country,
        address: address || prev.address,
        slug: !slugEdited && name ? toSlug(name) : prev.slug,
      }))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to fetch location details')
    } finally {
      setFetching(false)
    }
  }

  const set = (field: keyof LocationData, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value }
      if (field === 'locationName' && !slugEdited) {
        next.slug = toSlug(value)
      }
      return next
    })
  }

  const handleSlugChange = (value: string) => {
    setSlugEdited(true)
    setForm((prev) => ({ ...prev, slug: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Failed to create prospect')
        setLoading(false)
        return
      }

      onNext({ ...form, prospectId: data.id })
    } catch {
      setError('Network error — please try again')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2
        style={{
          fontFamily: 'var(--font-playfair)',
          fontSize: '1.4rem',
          fontWeight: 700,
          color: 'var(--ink)',
          marginBottom: '0.35rem',
        }}
      >
        Location Details
      </h2>
      <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.75rem' }}>
        Tell us about the STRONG Pilates location we&apos;re building a proposal for.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        {/* Location Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>
            Location Name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            style={inputStyle}
            type="text"
            required
            placeholder="e.g. STRONG The Beach"
            value={form.locationName}
            onChange={(e) => set('locationName', e.target.value)}
          />
        </div>

        {/* City */}
        <div>
          <label style={labelStyle}>
            City <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            style={inputStyle}
            type="text"
            required
            placeholder="Sydney"
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
          />
        </div>

        {/* Country */}
        <div>
          <label style={labelStyle}>
            Country <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            style={inputStyle}
            type="text"
            required
            placeholder="Australia"
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
          />
        </div>

        {/* Address */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Address</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="123 Beach Rd, Bondi NSW 2026"
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
          />
        </div>

        {/* GHL Location ID */}
        <div>
          <label style={labelStyle}>GHL Location ID</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Hapana Grow location ID"
            value={form.ghlLocationId}
            onChange={(e) => set('ghlLocationId', e.target.value)}
          />
        </div>

        {/* GHL PIT */}
        <div>
          <label style={labelStyle}>GHL PIT (Private Integration Token)</label>
          <input
            style={inputStyle}
            type="password"
            placeholder="pit-xxxxxxxx-..."
            value={form.ghlPit}
            onChange={(e) => set('ghlPit', e.target.value)}
          />
        </div>

        {/* Fetch from GHL button */}
        {form.ghlLocationId && form.ghlPit && (
          <div style={{ gridColumn: '1 / -1' }}>
            <button
              type="button"
              onClick={fetchFromGhl}
              disabled={fetching}
              style={{
                padding: '0.5rem 1.25rem',
                backgroundColor: 'var(--gold-glow)',
                color: 'var(--gold-dark)',
                border: '1px solid rgba(200,169,81,0.3)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: fetching ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--font-dm-sans), sans-serif',
              }}
            >
              {fetching ? 'Fetching...' : 'Auto-fill from Hapana Grow →'}
            </button>
            <span style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginLeft: '0.75rem' }}>
              Pulls location name, address, city from the PIT
            </span>
          </div>
        )}

        {/* Opening Date */}
        <div>
          <label style={labelStyle}>Opening Date</label>
          <input
            style={inputStyle}
            type="date"
            value={form.openingDate}
            onChange={(e) => set('openingDate', e.target.value)}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>
            Optional — we&apos;ll auto-detect from ads and membership data
          </p>
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>
            Slug <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            style={{ ...inputStyle, fontFamily: 'monospace', fontSize: '0.85rem' }}
            type="text"
            required
            placeholder="strong-the-beach"
            value={form.slug}
            onChange={(e) => handleSlugChange(e.target.value)}
          />
          <p style={{ fontSize: '0.72rem', color: 'var(--ink-muted)', marginTop: '0.3rem' }}>
            Auto-generated URL path — editable
          </p>
        </div>
      </div>

      {error && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            backgroundColor: 'var(--red-light)',
            border: '1px solid rgba(196,69,54,0.2)',
            borderRadius: '8px',
            color: 'var(--red)',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <div style={{ marginTop: '1.75rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '0.75rem 2rem',
            backgroundColor: loading ? 'var(--ink-muted)' : 'var(--ink)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: loading ? 'not-allowed' : 'pointer',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          {loading ? 'Creating...' : 'Next →'}
        </button>
      </div>
    </form>
  )
}
