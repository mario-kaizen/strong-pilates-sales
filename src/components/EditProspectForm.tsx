'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import DropZone from '@/components/ui/DropZone'

interface ProspectFields {
  id: string
  slug: string
  locationName: string
  city: string
  country: string
  address: string
  ghlLocationId: string
  ghlPit: string
  openingDate: string
  status: string
}

interface EditProspectFormProps {
  prospect: ProspectFields
}

type UploadResult = {
  filename: string
  rowCount: number
  error?: string
}

export default function EditProspectForm({ prospect }: EditProspectFormProps) {
  const router = useRouter()

  const [form, setForm] = useState({
    locationName: prospect.locationName,
    city: prospect.city,
    country: prospect.country,
    address: prospect.address,
    ghlLocationId: prospect.ghlLocationId,
    ghlPit: prospect.ghlPit,
    openingDate: prospect.openingDate,
  })

  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const [coreFiles, setCoreFiles] = useState<File[]>([])
  const [metaFile, setMetaFile] = useState<File | null>(null)

  const [uploadingCore, setUploadingCore] = useState(false)
  const [uploadingMeta, setUploadingMeta] = useState(false)
  const [coreResults, setCoreResults] = useState<UploadResult[]>([])
  const [metaResult, setMetaResult] = useState<UploadResult | null>(null)

  const [generating, setGenerating] = useState(false)
  const [generateMsg, setGenerateMsg] = useState<string | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    setSaveError(null)
    try {
      const res = await fetch(`/api/prospects/${prospect.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          locationName: form.locationName,
          city: form.city,
          country: form.country,
          address: form.address,
          ghlLocationId: form.ghlLocationId,
          ghlPit: form.ghlPit,
          openingDate: form.openingDate ? new Date(form.openingDate).toISOString() : undefined,
        }),
      })
      if (res.ok) {
        setSaveMsg('Saved successfully.')
        router.refresh()
      } else {
        const err = await res.json()
        setSaveError(err.error ?? 'Failed to save.')
      }
    } catch {
      setSaveError('Network error.')
    } finally {
      setSaving(false)
    }
  }

  const uploadFile = async (file: File, type: 'hapana_core' | 'meta_ads'): Promise<UploadResult> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    formData.append('prospectId', prospect.id)
    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()
    if (!res.ok) return { filename: file.name, rowCount: 0, error: json.error ?? 'Upload failed' }
    return { filename: file.name, rowCount: json.summary?.rows ?? json.upload?.rowCount ?? 0 }
  }

  const handleCoreFiles = useCallback((files: File[]) => {
    setCoreFiles((prev) => [...prev, ...files])
  }, [])

  const handleMetaFile = useCallback((files: File[]) => {
    if (files.length > 0) setMetaFile(files[0])
  }, [])

  const handleUploadCore = async () => {
    if (coreFiles.length === 0) return
    setUploadingCore(true)
    setCoreResults([])
    const results: UploadResult[] = []
    for (const file of coreFiles) {
      const result = await uploadFile(file, 'hapana_core')
      results.push(result)
    }
    setCoreResults(results)
    setUploadingCore(false)
    setCoreFiles([])
  }

  const handleUploadMeta = async () => {
    if (!metaFile) return
    setUploadingMeta(true)
    setMetaResult(null)
    const result = await uploadFile(metaFile, 'meta_ads')
    setMetaResult(result)
    setUploadingMeta(false)
    setMetaFile(null)
  }

  const handleRegenerate = async () => {
    setGenerating(true)
    setGenerateMsg(null)
    setGenerateError(null)
    try {
      const res = await fetch(`/api/prospects/${prospect.id}/generate`, { method: 'POST' })
      if (res.ok) {
        setGenerateMsg('Proposal generated. Redirecting…')
        setTimeout(() => router.push(`/${prospect.slug}`), 1500)
      } else {
        const err = await res.json()
        setGenerateError(err.error ?? 'Generation failed.')
      }
    } catch {
      setGenerateError('Network error.')
    } finally {
      setGenerating(false)
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.65rem 0.875rem',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-dm-sans), sans-serif',
    color: 'var(--ink)',
    backgroundColor: 'white',
    border: '1px solid rgba(26,26,26,0.15)',
    borderRadius: '8px',
    outline: 'none',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 600,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    color: 'var(--ink-muted)',
    marginBottom: '0.4rem',
    fontFamily: 'var(--font-dm-sans), sans-serif',
  }

  const fieldGroupStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.4rem',
  }

  const sectionStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid rgba(26,26,26,0.07)',
    padding: '1.5rem',
    marginBottom: '1.25rem',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontFamily: 'var(--font-playfair), serif',
    fontSize: '1rem',
    fontWeight: 700,
    color: 'var(--ink)',
    marginBottom: '1.25rem',
  }

  return (
    <div>
      {/* ── Details Form ── */}
      <form onSubmit={handleSave}>
        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Location Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Location Name *</label>
              <input
                style={inputStyle}
                name="locationName"
                value={form.locationName}
                onChange={handleChange}
                required
                placeholder="e.g. STRONG Pilates The Beach"
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>City *</label>
              <input
                style={inputStyle}
                name="city"
                value={form.city}
                onChange={handleChange}
                required
                placeholder="e.g. Sydney"
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Country *</label>
              <input
                style={inputStyle}
                name="country"
                value={form.country}
                onChange={handleChange}
                required
                placeholder="e.g. Australia"
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Address</label>
              <input
                style={inputStyle}
                name="address"
                value={form.address}
                onChange={handleChange}
                placeholder="e.g. 123 Beach Rd, The Beach NSW 2000"
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>Opening Date *</label>
              <input
                style={inputStyle}
                name="openingDate"
                type="date"
                value={form.openingDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>Hapana Grow (GHL) Credentials</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>GHL Location ID</label>
              <input
                style={inputStyle}
                name="ghlLocationId"
                value={form.ghlLocationId}
                onChange={handleChange}
                placeholder="e.g. yEF2oYlzb4LW6NLFHlrP"
              />
            </div>
            <div style={fieldGroupStyle}>
              <label style={labelStyle}>GHL Private Integration Token (PIT)</label>
              <input
                style={inputStyle}
                name="ghlPit"
                value={form.ghlPit}
                onChange={handleChange}
                placeholder="pit-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              />
            </div>
          </div>
        </section>

        {/* Save Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              backgroundColor: 'var(--ink)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans), sans-serif',
              padding: '0.7rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: saving ? 'not-allowed' : 'pointer',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          {saveMsg && (
            <span style={{ fontSize: '0.85rem', color: 'var(--green)', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              {saveMsg}
            </span>
          )}
          {saveError && (
            <span style={{ fontSize: '0.85rem', color: 'var(--red)', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
              {saveError}
            </span>
          )}
        </div>
      </form>

      {/* ── Re-upload CSV Files ── */}
      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Re-upload Hapana Core CSVs</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1rem', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6 }}>
          Upload one or more <code>getMembershipDetails</code> exports (memberships, intros, packages). New uploads are appended — they don&apos;t replace existing ones.
        </p>
        <DropZone
          label="Hapana Core CSV(s)"
          accept=".csv"
          multiple
          onFiles={handleCoreFiles}
        />
        {coreFiles.length > 0 && (
          <button
            type="button"
            onClick={handleUploadCore}
            disabled={uploadingCore}
            style={{
              marginTop: '0.75rem',
              backgroundColor: 'var(--gold)',
              color: 'var(--ink)',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans), sans-serif',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: uploadingCore ? 'not-allowed' : 'pointer',
              opacity: uploadingCore ? 0.7 : 1,
            }}
          >
            {uploadingCore ? 'Uploading…' : `Upload ${coreFiles.length} file${coreFiles.length === 1 ? '' : 's'}`}
          </button>
        )}
        {coreResults.length > 0 && (
          <ul style={{ marginTop: '0.75rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {coreResults.map((r, i) => (
              <li
                key={i}
                style={{
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-dm-sans), sans-serif',
                  padding: '0.4rem 0.75rem',
                  borderRadius: '6px',
                  backgroundColor: r.error ? 'var(--red-light)' : 'var(--green-light)',
                  color: r.error ? 'var(--red)' : 'var(--green)',
                  border: `1px solid ${r.error ? 'rgba(196,69,54,0.2)' : 'rgba(74,124,89,0.2)'}`,
                }}
              >
                {r.error ? `${r.filename}: ${r.error}` : `${r.filename} — ${r.rowCount} rows uploaded`}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={sectionStyle}>
        <h2 style={sectionTitleStyle}>Re-upload Meta Ads CSV</h2>
        <p style={{ fontSize: '0.82rem', color: 'var(--ink-muted)', marginBottom: '1rem', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6 }}>
          Upload the campaign performance export from Meta Ads Manager.
        </p>
        <DropZone
          label="Meta Ads CSV"
          accept=".csv"
          multiple={false}
          onFiles={handleMetaFile}
        />
        {metaFile && (
          <button
            type="button"
            onClick={handleUploadMeta}
            disabled={uploadingMeta}
            style={{
              marginTop: '0.75rem',
              backgroundColor: 'var(--gold)',
              color: 'var(--ink)',
              fontSize: '0.82rem',
              fontWeight: 600,
              fontFamily: 'var(--font-dm-sans), sans-serif',
              padding: '0.55rem 1.25rem',
              borderRadius: '6px',
              border: 'none',
              cursor: uploadingMeta ? 'not-allowed' : 'pointer',
              opacity: uploadingMeta ? 0.7 : 1,
            }}
          >
            {uploadingMeta ? 'Uploading…' : 'Upload Meta Ads CSV'}
          </button>
        )}
        {metaResult && (
          <div
            style={{
              marginTop: '0.75rem',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-dm-sans), sans-serif',
              padding: '0.4rem 0.75rem',
              borderRadius: '6px',
              backgroundColor: metaResult.error ? 'var(--red-light)' : 'var(--green-light)',
              color: metaResult.error ? 'var(--red)' : 'var(--green)',
              border: `1px solid ${metaResult.error ? 'rgba(196,69,54,0.2)' : 'rgba(74,124,89,0.2)'}`,
            }}
          >
            {metaResult.error
              ? `${metaResult.filename}: ${metaResult.error}`
              : `${metaResult.filename} — ${metaResult.rowCount} rows uploaded`}
          </div>
        )}
      </section>

      {/* ── Regenerate Proposal ── */}
      <section style={{ ...sectionStyle, borderColor: 'rgba(200,169,81,0.25)', backgroundColor: 'var(--gold-glow)' }}>
        <h2 style={{ ...sectionTitleStyle, color: 'var(--gold-dark)' }}>Regenerate Proposal</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--ink-muted)', marginBottom: '1.25rem', fontFamily: 'var(--font-dm-sans), sans-serif', lineHeight: 1.6 }}>
          Re-runs the full data analysis across all uploaded files and rebuilds the proposal. Use this after uploading new CSVs or correcting data.
        </p>
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={generating}
          style={{
            backgroundColor: 'var(--gold)',
            color: 'var(--ink)',
            fontSize: '0.875rem',
            fontWeight: 600,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            border: 'none',
            cursor: generating ? 'not-allowed' : 'pointer',
            opacity: generating ? 0.7 : 1,
          }}
        >
          {generating ? 'Generating…' : 'Regenerate Proposal'}
        </button>
        {generateMsg && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--green)', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            {generateMsg}
          </p>
        )}
        {generateError && (
          <p style={{ marginTop: '0.75rem', fontSize: '0.85rem', color: 'var(--red)', fontFamily: 'var(--font-dm-sans), sans-serif' }}>
            {generateError}
          </p>
        )}
      </section>
    </div>
  )
}
