import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const prospects = await prisma.prospect.findMany({
    include: { data: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(prospects)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { locationName, city, country, address, ghlLocationId, ghlPit, openingDate, slug } = body

  if (!locationName || !city || !country || !slug) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.prospect.findUnique({ where: { slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
  }

  const prospect = await prisma.prospect.create({
    data: {
      locationName,
      city,
      country,
      address: address || '',
      ghlLocationId: ghlLocationId || '',
      ghlPit: ghlPit || '',
      openingDate: openingDate ? new Date(openingDate) : null,
      slug,
      status: 'draft',
    },
  })

  return NextResponse.json(prospect, { status: 201 })
}
