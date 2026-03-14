import { NextRequest, NextResponse } from 'next/server'
import { parse } from 'csv-parse/sync'
import { prisma } from '@/lib/db'

interface CsvRecord {
  [key: string]: string
}

// ---- Hapana Core helpers ----

const STATUS_COLUMN_CANDIDATES = [
  'Package Status',
  'package status',
  'Status',
  'status',
  'Membership Status',
  'membership status',
]

function detectStatusColumn(headers: string[]): string | null {
  for (const candidate of STATUS_COLUMN_CANDIDATES) {
    if (headers.includes(candidate)) return candidate
  }
  return null
}

function parseHapanaCore(text: string): {
  rows: number
  statuses: string[]
} {
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as CsvRecord[]

  if (records.length === 0) return { rows: 0, statuses: [] }

  const headers = Object.keys(records[0])
  const statusCol = detectStatusColumn(headers)

  let statuses: string[] = []
  if (statusCol) {
    const statusSet = new Set<string>()
    for (const row of records) {
      const val = row[statusCol]?.trim()
      if (val) statusSet.add(val)
    }
    statuses = Array.from(statusSet).sort()
  }

  return { rows: records.length, statuses }
}

// ---- Meta Ads helpers ----

const SPEND_COLUMN_CANDIDATES = [
  'Amount spent (AUD)',
  'Amount spent (USD)',
  'Amount spent',
  'amount spent',
  'Spend',
  'spend',
  'Cost',
  'cost',
]

const DATE_COLUMN_CANDIDATES = [
  'Month',
  'month',
  'Day',
  'day',
  'Date',
  'date',
  'Reporting starts',
  'Reporting ends',
]

function findColumn(headers: string[], candidates: string[]): string | null {
  for (const c of candidates) {
    if (headers.includes(c)) return c
  }
  // Partial match fallback
  for (const c of candidates) {
    const found = headers.find((h) => h.toLowerCase().includes(c.toLowerCase()))
    if (found) return found
  }
  return null
}

function parseMetaAds(text: string): {
  rows: number
  totalSpend: number
  dateRange: string
} {
  const records = parse(text, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
    // Meta Ads CSV sometimes has a trailing summary row — we'll filter below
  }) as CsvRecord[]

  // Filter out totals/summary rows (often have "Total" in first column or no date)
  const dataRows = records.filter((r) => {
    const firstVal = Object.values(r)[0]?.trim() ?? ''
    return firstVal !== '' && !/^total/i.test(firstVal)
  })

  if (dataRows.length === 0) return { rows: 0, totalSpend: 0, dateRange: '' }

  const headers = Object.keys(dataRows[0])
  const spendCol = findColumn(headers, SPEND_COLUMN_CANDIDATES)
  const dateCol = findColumn(headers, DATE_COLUMN_CANDIDATES)

  let totalSpend = 0
  if (spendCol) {
    for (const row of dataRows) {
      const raw = row[spendCol]?.replace(/[,$]/g, '').trim()
      const val = parseFloat(raw)
      if (!isNaN(val)) totalSpend += val
    }
  }

  let dateRange = ''
  if (dateCol) {
    const dates = dataRows.map((r) => r[dateCol]?.trim()).filter(Boolean)
    if (dates.length > 0) {
      const sorted = [...dates].sort()
      dateRange =
        sorted[0] === sorted[sorted.length - 1]
          ? sorted[0]
          : `${sorted[0]} – ${sorted[sorted.length - 1]}`
    }
  }

  return { rows: dataRows.length, totalSpend, dateRange }
}

// ---- Route handler ----

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const file = form.get('file') as File | null
    const type = form.get('type') as string | null
    const prospectId = form.get('prospectId') as string | null

    if (!file || !type || !prospectId) {
      return NextResponse.json({ error: 'Missing file, type, or prospectId' }, { status: 400 })
    }

    if (!['hapana_core', 'meta_ads'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type. Must be hapana_core or meta_ads' }, { status: 400 })
    }

    // Verify prospect exists
    const prospect = await prisma.prospect.findUnique({ where: { id: prospectId } })
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    const text = await file.text()

    let summary: Record<string, unknown>

    if (type === 'hapana_core') {
      const parsed = parseHapanaCore(text)
      summary = { ...parsed, csvContent: text }
    } else {
      const parsed = parseMetaAds(text)
      summary = { ...parsed, csvContent: text }
    }

    const upload = await prisma.upload.create({
      data: {
        prospectId,
        type,
        filename: file.name,
        status: 'processed',
        rowCount: (summary.rows as number) ?? 0,
        metadata: JSON.stringify(summary),
      },
    })

    // Return summary without the full csvContent (to keep response small)
    const { csvContent: _ignored, ...responseSummary } = summary as Record<string, unknown>

    return NextResponse.json({ upload, summary: responseSummary }, { status: 201 })
  } catch (err) {
    console.error('[upload]', err)
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
