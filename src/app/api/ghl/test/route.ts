import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { locationId, pit } = body

    if (!locationId || !pit) {
      return NextResponse.json(
        { connected: false, error: 'Missing locationId or pit' },
        { status: 400 }
      )
    }

    const url = `https://services.leadconnectorhq.com/contacts/?locationId=${locationId}&limit=1`
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${pit}`,
        Version: '2021-07-28',
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return NextResponse.json({
        connected: false,
        error: `GHL API returned ${response.status} ${response.statusText}`,
      })
    }

    const data = await response.json()
    const locationName: string | undefined = data.location?.name

    return NextResponse.json({
      connected: true,
      ...(locationName ? { locationName } : {}),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ connected: false, error: message })
  }
}
