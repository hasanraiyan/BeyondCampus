import { NextRequest, NextResponse } from 'next/server'
import { database } from '@/lib/database'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 })
    }

    // Fetch user profile
    const profile = await database.getUser(session.user.id)
    
    if (!profile) {
      return NextResponse.json({ 
        success: false, 
        error: 'User profile not found' 
      }, { status: 404 })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        error: 'Authentication required',
      }, { status: 401 })
    }

    const updates = await request.json()

    // Update user profile
    const updatedProfile = await database.updateUser(session.user.id, updates)

    return NextResponse.json({ 
      success: true,
      user: updatedProfile
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update profile'
    }, { status: 500 })
  }
}