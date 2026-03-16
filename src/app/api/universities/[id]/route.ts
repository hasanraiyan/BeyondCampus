import { NextRequest, NextResponse } from 'next/server';
import { UniversityService } from '@/services/universityService';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const university = await UniversityService.getUniversityById(id);

    if (!university) {
      return NextResponse.json(
        { message: 'University not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(university);
  } catch (error) {
    console.error('Error fetching university:', error);
    return NextResponse.json(
      { message: 'Error fetching university' },
      { status: 500 }
    );
  }
}
