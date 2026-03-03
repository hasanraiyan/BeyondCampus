import { NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { randomUUID } from 'crypto'

interface HealthStatus {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  correlation_id: string
  services: {
    postgres: {
      status: 'up' | 'down'
      latency_ms?: number
      error?: string
    }
  }
}

async function checkPostgres(): Promise<{ status: 'up' | 'down', latency_ms?: number, error?: string }> {
  const startTime = Date.now()
  try {
    await prisma.$queryRaw`SELECT 1`
    return { status: 'up', latency_ms: Date.now() - startTime }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return { status: 'down', latency_ms: Date.now() - startTime, error: message }
  }
}

export async function GET(): Promise<NextResponse<HealthStatus>> {
  const correlationId = randomUUID()

  try {
    const postgresHealth = await checkPostgres()

    const healthStatus: HealthStatus = {
      status: postgresHealth.status === 'up' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      correlation_id: correlationId,
      services: { postgres: postgresHealth },
    }

    return NextResponse.json(healthStatus, {
      status: postgresHealth.status === 'up' ? 200 : 503,
    })
  } catch {
    return NextResponse.json(
      {
        status: 'unhealthy' as const,
        timestamp: new Date().toISOString(),
        correlation_id: correlationId,
        services: { postgres: { status: 'down' as const, error: 'Health check failed' } },
      },
      { status: 503 }
    )
  }
}
