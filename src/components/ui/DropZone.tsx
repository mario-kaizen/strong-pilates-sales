'use client'

import React, { useCallback, useRef, useState } from 'react'

interface DropZoneProps {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label: string
  instructions?: React.ReactNode
  className?: string
}

export default function DropZone({
  onFiles,
  accept,
  multiple = false,
  label,
  instructions,
  className = '',
}: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [droppedFiles, setDroppedFiles] = useState<File[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return
      const arr = Array.from(files)
      setDroppedFiles((prev) => (multiple ? [...prev, ...arr] : arr))
      onFiles(multiple ? arr : arr.slice(0, 1))
    },
    [multiple, onFiles]
  )

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const onClick = () => inputRef.current?.click()

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
    // reset so same file can be re-selected
    e.target.value = ''
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Upload area: ${label}`}
        onClick={onClick}
        onKeyDown={(e) => e.key === 'Enter' && onClick()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        style={{
          border: `2px dashed ${isDragOver ? 'var(--gold)' : 'var(--divider, #E0D9CE)'}`,
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          backgroundColor: isDragOver ? 'var(--gold-glow)' : 'white',
          outline: 'none',
        }}
      >
        {/* Upload Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: isDragOver ? 'var(--gold-glow)' : 'var(--cream)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            transition: 'background-color 0.2s ease',
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke={isDragOver ? 'var(--gold)' : 'var(--ink-muted)'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="16 16 12 12 8 16" />
            <line x1="12" y1="12" x2="12" y2="21" />
            <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
          </svg>
        </div>

        <p
          style={{
            fontFamily: 'var(--font-playfair)',
            fontSize: '1rem',
            fontWeight: 600,
            color: isDragOver ? 'var(--gold)' : 'var(--ink)',
            marginBottom: '0.25rem',
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--ink-muted)', marginBottom: '0.5rem' }}>
          Drag &amp; drop here, or{' '}
          <span style={{ color: 'var(--gold)', textDecoration: 'underline' }}>browse</span>
        </p>
        {accept && (
          <p style={{ fontSize: '0.75rem', color: 'var(--ink-muted)' }}>
            Accepted: {accept}
          </p>
        )}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={onInputChange}
        />
      </div>

      {/* Instructions */}
      {instructions && (
        <div
          style={{
            marginTop: '1rem',
            padding: '1rem',
            borderRadius: '8px',
            backgroundColor: 'var(--cream)',
            border: '1px solid var(--divider, #E0D9CE)',
            fontSize: '0.82rem',
            color: 'var(--ink-muted)',
            lineHeight: 1.7,
          }}
        >
          {instructions}
        </div>
      )}

      {/* Dropped file list */}
      {droppedFiles.length > 0 && (
        <ul style={{ marginTop: '0.75rem', listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {droppedFiles.map((f, i) => (
            <li
              key={`${f.name}-${i}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.82rem',
                color: 'var(--ink)',
                padding: '0.4rem 0.75rem',
                backgroundColor: 'var(--green-light)',
                borderRadius: '6px',
                border: '1px solid rgba(74,124,89,0.2)',
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--green)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span style={{ fontWeight: 500 }}>{f.name}</span>
              <span style={{ color: 'var(--ink-muted)', marginLeft: 'auto' }}>
                {(f.size / 1024).toFixed(1)} KB
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
