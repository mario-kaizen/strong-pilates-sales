import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import path from 'path'

function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL ?? `file:${path.join(process.cwd(), 'data', 'strong-pilates-sales.db')}`

  // @prisma/adapter-libsql takes the libsql config object (with url) directly
  const adapter = new PrismaLibSql({ url: dbUrl })
  return new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
