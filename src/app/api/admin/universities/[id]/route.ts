import { NextRequest, NextResponse } from 'next/server';
import { UniversityService } from '@/services/universityService';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const data = await request.json();

    const university = await UniversityService.upsertUniversity({
      ...data,
      id,
    });
    return NextResponse.json(university);
  } catch (error) {
    console.error('Error updating university:', error);
    return NextResponse.json(
      { message: 'Error updating university' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await UniversityService.deleteUniversity(id);

    return NextResponse.json({ message: 'University deleted successfully' });
  } catch (error) {
    console.error('Error deleting university:', error);
    return NextResponse.json(
      { message: 'Error deleting university' },
      { status: 500 }
    );
  }
}
