import { NextRequest, NextResponse } from 'next/server'
import { ProgramService } from '@/services/programService'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()
    const program = await ProgramService.createProgram(id, data)
    
    return NextResponse.json(program, { status: 201 })
  } catch (error) {
    console.error('Error creating program:', error)
    return NextResponse.json({ message: 'Error creating program' }, { status: 500 })
  }
}
