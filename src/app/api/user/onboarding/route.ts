import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/database'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { ExamType } from '@prisma/client'

interface TestScoreInput {
  examType: ExamType
  overallScore: number
  subScores?: Record<string, number>
  dateTaken?: string
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({
        message: 'Unauthorized',
      }, { status: 401 })
    }

    const {
      degreeLevel,
      fieldOfStudy,
      currentEducation,
      targetCountry,
      intakeSeason,
      intakeYear,
      budgetRange,
      hasGivenTests,
      testScores,
    } = await request.json()

    const userId = session.user.id

    const updatedUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: userId },
        data: {
          degreeLevel: degreeLevel || null,
          fieldOfStudy: fieldOfStudy || null,
          currentEducation: currentEducation || null,
          targetCountry: targetCountry || 'US',
          intakeSeason: intakeSeason || null,
          intakeYear: intakeYear ? parseInt(intakeYear) : null,
          budgetRange: budgetRange || null,
          hasGivenTests: hasGivenTests ?? null,
          onboardingCompleted: true,
        },
      })

      if (hasGivenTests && Array.isArray(testScores) && testScores.length > 0) {
        await tx.testScore.createMany({
          data: testScores.map((ts: TestScoreInput) => ({
            userId,
            examType: ts.examType,
            overallScore: ts.overallScore,
            subScores: ts.subScores ?? undefined,
            dateTaken: ts.dateTaken ? new Date(ts.dateTaken) : null,
          })),
        })
      }

      return user
    })

    return NextResponse.json({
      message: 'Onboarding data saved successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        onboardingCompleted: updatedUser.onboardingCompleted,
      },
    })
  } catch (error) {
    console.error('Onboarding error:', error)
    return NextResponse.json({
      message: 'Failed to save onboarding data',
      error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
    }, { status: 500 })
  }
}
