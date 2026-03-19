import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    return NextResponse.json({ needsSetup: userCount === 0 });
  } catch (error) {
    console.error('System status error:', error);
    return NextResponse.json({ needsSetup: false, error: 'Failed to verify system status' }, { status: 500 });
  }
}
