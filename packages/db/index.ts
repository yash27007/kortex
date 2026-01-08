import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from './generated/prisma/client'

// Use environment variable, fallback to hardcoded for local dev if needed
const databaseUrl = process.env.DATABASE_URL || "postgresql://kortex:kortex_dev_password@localhost:5432/kortex_dev"

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL is not set. Please add a valid PostgreSQL connection string to your .env file.',
  )
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
})

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: ['query','info','warn','error'],
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
