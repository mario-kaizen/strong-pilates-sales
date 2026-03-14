import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateProposalData } from '@/lib/generators/proposal'

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const prospect = await prisma.prospect.findUnique({ where: { id } })
  if (!prospect) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await prisma.prospect.update({ where: { id }, data: { status: 'processing' } })

  try {
    await generateProposalData(id)
    const updated = await prisma.prospect.findUnique({
      where: { id },
      include: { data: true, diagnosis: true },
    })
    return NextResponse.json(updated)
  } catch (error) {
    await prisma.prospect.update({ where: { id }, data: { status: 'draft' } })
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
