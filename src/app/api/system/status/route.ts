import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Add revalidation config to cache this endpoint heavily, but let it be invalidated on first user creation
// Or keep it dynamic and fast since User.count() is extremely fast.
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const count = await prisma.user.count();
    return NextResponse.json({ needsSetup: count === 0 });
  } catch (error) {
    console.error('Error checking system status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
