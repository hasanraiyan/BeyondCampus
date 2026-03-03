import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { database } from '@/lib/database'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const profile = await database.getUser(session.user.id)

    if (!profile) {
      return NextResponse.json({ success: false, error: 'User profile not found' }, { status: 404 })
    }

    const { password: _, ...safeProfile } = profile
    return NextResponse.json(safeProfile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const userId = session.user.id

    const allowedUserFields = [
      'firstName', 'lastName', 'location', 'degreeLevel', 'fieldOfStudy',
      'currentEducation', 'targetCountry', 'intakeSeason',
      'intakeYear', 'budgetRange', 'hasGivenTests',
    ] as const

    const userUpdates: Record<string, any> = {}
    for (const field of allowedUserFields) {
      if (body[field] !== undefined) {
        userUpdates[field] = body[field]
      }
    }

    if (body.intakeYear !== undefined) {
      userUpdates.intakeYear = body.intakeYear ? parseInt(body.intakeYear) : null
    }

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = Object.keys(userUpdates).length > 0
        ? await tx.user.update({ where: { id: userId }, data: userUpdates })
        : await tx.user.findUniqueOrThrow({ where: { id: userId } })

      if (Array.isArray(body.testScores)) {
        await tx.testScore.deleteMany({ where: { userId } })
        if (body.testScores.length > 0) {
          await tx.testScore.createMany({
            data: body.testScores.map((ts: any) => ({
              userId,
              examType: ts.examType,
              overallScore: parseFloat(ts.overallScore),
              subScores: ts.subScores ?? undefined,
              dateTaken: ts.dateTaken ? new Date(ts.dateTaken) : null,
            })),
          })
        }
      }

      return tx.user.findUniqueOrThrow({
        where: { id: userId },
        include: {
          testScores: { orderBy: { createdAt: 'desc' } },
          profileFields: { orderBy: { createdAt: 'desc' } },
        },
      })
    })

    const { password: _, ...safeProfile } = updatedUser
    return NextResponse.json({ success: true, user: safeProfile })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
  }
}
