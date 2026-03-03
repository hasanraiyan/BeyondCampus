import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'
import { randomUUID } from 'crypto'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { cuidToUuid } from '@/lib/uuid-utils'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ twin_id: string }> }
) {
  try {
    const { twin_id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Authentication required',
      }, { status: 401 })
    }
    const userId = cuidToUuid(session.user.id)

    // Verify twin ownership
    const twin = await database.findTwin(twin_id, userId)
    if (!twin) {
      return NextResponse.json({
        error: 'Twin not found or access denied'
      }, { status: 404 })
    }

    // Parse request body
    const body = await request.json()
    const { type, notebook_id, chapter_id, thread_id } = body

    if (!type || !['trainer', 'chat'].includes(type)) {
      return NextResponse.json({
        error: 'Valid session type required (trainer or chat)'
      }, { status: 400 })
    }

    // Generate IDs if not provided
    const sessionData = {
      twin_id,
      user_id: userId,
      type: type as 'trainer' | 'chat',
      notebook_id: notebook_id || `notebook_${randomUUID().slice(0, 8)}`,
      chapter_id: chapter_id || `chapter_${randomUUID().slice(0, 8)}`,
      thread_id: thread_id || `thread_${randomUUID().slice(0, 8)}`,
      metadata: {
        created_via: 'api',
        user_agent: request.headers.get('user-agent')
      }
    }

    // Create session record
    const createdSession = await database.createSession(sessionData)

    console.log(`Session created for twin ${twin_id}:`, {
      session_id: createdSession.id,
      type: createdSession.type,
      notebook_id: createdSession.notebook_id,
      chapter_id: createdSession.chapter_id,
      thread_id: createdSession.thread_id
    })

    return NextResponse.json({
      session_id: createdSession.id,
      twin_id: createdSession.twin_id,
      type: createdSession.type,
      notebook_id: createdSession.notebook_id,
      chapter_id: createdSession.chapter_id,
      thread_id: createdSession.thread_id,
      created_at: createdSession.created_at
    })

  } catch (error) {
    console.error('Session creation error:', error)
    return NextResponse.json({
      error: 'Failed to create session'
    }, { status: 500 })
  }
}

// Get sessions for a twin
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ twin_id: string }> }
) {
  try {
    const { twin_id } = await params

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        error: 'Authentication required',
      }, { status: 401 })
    }
    const userId = cuidToUuid(session.user.id)

    // Verify twin ownership
    const twin = await database.findTwin(twin_id, userId)
    if (!twin) {
      return NextResponse.json({
        error: 'Twin not found or access denied'
      }, { status: 404 })
    }

    // Get sessions for this twin
    const sessions = await database.getTwinSessions(twin_id)

    return NextResponse.json({
      twin_id,
      sessions
    })

  } catch (error) {
    console.error('Sessions fetch error:', error)
    return NextResponse.json({
      error: 'Failed to fetch sessions'
    }, { status: 500 })
  }
}

// Ensure Node.js runtime for consistent server behavior
export const runtime = 'nodejs'
