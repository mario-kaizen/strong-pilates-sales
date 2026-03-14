'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteButtonProps {
  prospectId: string
  locationName: string
}

export default function DeleteButton({ prospectId, locationName }: DeleteButtonProps) {
  const router = useRouter()
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/prospects/${prospectId}`, { method: 'DELETE' })
      if (res.ok) {
        router.refresh()
      } else {
        alert('Failed to delete prospect.')
        setLoading(false)
        setConfirming(false)
      }
    } catch {
      alert('An error occurred.')
      setLoading(false)
      setConfirming(false)
    }
  }

  if (confirming) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
        <span
          style={{
            fontSize: '0.75rem',
            color: 'var(--ink-muted)',
            fontFamily: 'var(--font-dm-sans), sans-serif',
          }}
        >
          Delete &ldquo;{locationName}&rdquo;?
        </span>
        <button
          onClick={handleDelete}
          disabled={loading}
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            fontFamily: 'var(--font-dm-sans), sans-serif',
            color: 'var(--red)',
            background: 'none',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            padding: '0.25rem 0.5rem',
            borderRadius: '4px',
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Deleting…' : 'Yes, delete'}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          style={{
            fontSize: '0.75rem',
            fontFamily: 'var(--font-dm-sans), sans-serif',
            color: 'var(--ink-muted)',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '0.25rem 0.5rem',
          }}
        >
          Cancel
        </button>
      </span>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      style={{
        fontSize: '0.75rem',
        fontFamily: 'var(--font-dm-sans), sans-serif',
        color: 'var(--ink-muted)',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '0.25rem 0',
        textDecoration: 'underline',
        textDecorationStyle: 'dotted',
      }}
    >
      Delete
    </button>
  )
}
