import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy'
  timestamp: string
  correlation_id: string
  services: {
    postgres: {
      status: 'up' | 'down'
      latency_ms?: number
      error?: string
    }
    trainer_service: {
      status: 'up' | 'down'
      latency_ms?: number
      error?: string
    }
    chat_service: {
      status: 'up' | 'down'
      latency_ms?: number
      error?: string
    }
  }
}

async function checkPostgres(): Promise<{ status: 'up' | 'down', latency_ms?: number, error?: string }> {
  const startTime = Date.now()
  try {
    await prisma.twin.count()

    return {
      status: 'up',
      latency_ms: Date.now() - startTime
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'down',
      latency_ms: Date.now() - startTime,
      error: message
    }
  }
}

async function checkAssistantService(url: string, name: string): Promise<{ status: 'up' | 'down', latency_ms?: number, error?: string }> {
  const startTime = Date.now()
  try {
    // Simple health check (assuming assistants have /health endpoint)
    const healthUrl = `${url}/health`
    const response = await fetch(healthUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.AI_SHARED_TOKEN}`,
        'X-Health-Check': 'true'
      },
      signal: AbortSignal.timeout(5000) // 5 second timeout for health checks
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    return {
      status: 'up',
      latency_ms: Date.now() - startTime
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return {
      status: 'down', 
      latency_ms: Date.now() - startTime,
      error: message
    }
  }
}

export async function GET(request: NextRequest): Promise<NextResponse<HealthStatus>> {
  const correlationId = randomUUID()
  const startTime = Date.now()

  console.log(`[${correlationId}] Health check started`)

  try {
    // Check all services in parallel
    const [postgresHealth, trainerHealth, chatHealth] = await Promise.all([
      checkPostgres(),
      checkAssistantService(process.env.TRAINER_SERVICE_URL || 'http://localhost:8123', 'trainer'),
      checkAssistantService(process.env.CHAT_SERVICE_URL || 'http://localhost:8124', 'chat')
    ])

    // Determine overall status
    const downServices = [postgresHealth, trainerHealth, chatHealth].filter(s => s.status === 'down')
    let overallStatus: 'healthy' | 'degraded' | 'unhealthy'

    if (downServices.length === 0) {
      overallStatus = 'healthy'
    } else if (postgresHealth.status === 'down') {
      overallStatus = 'unhealthy' // DB down is critical
    } else {
      overallStatus = 'degraded' // Some AI services down but DB works
    }

    const healthStatus: HealthStatus = {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      correlation_id: correlationId,
      services: {
        postgres: postgresHealth,
        trainer_service: trainerHealth,
        chat_service: chatHealth
      }
    }

    const totalLatency = Date.now() - startTime
    console.log(`[${correlationId}] Health check complete: ${overallStatus} (${totalLatency}ms)`)

    // Return appropriate HTTP status
    const httpStatus = overallStatus === 'healthy' ? 200 : 
                      overallStatus === 'degraded' ? 200 : 503

    return NextResponse.json(healthStatus, { status: httpStatus })

  } catch (error) {
    const totalLatency = Date.now() - startTime
    console.error(`[${correlationId}] Health check failed (${totalLatency}ms):`, error)

    const errorStatus: HealthStatus = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      correlation_id: correlationId,
      services: {
        postgres: { status: 'down', error: 'Health check failed' },
        trainer_service: { status: 'down', error: 'Health check failed' },
        chat_service: { status: 'down', error: 'Health check failed' }
      }
    }

    return NextResponse.json(errorStatus, { status: 503 })
  }
}
