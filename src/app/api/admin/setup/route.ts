import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // 1. Check if setup is already complete (server-side security guard)
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { message: 'Setup is already complete. To create more admins, use the existing admin account.' },
        { status: 403 }
      );
    }

    const { firstName, lastName, email, password } = await request.json();

    // 2. Simple validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json({ message: 'All fields are required' }, { status: 400 });
    }

    // 3. Hash password
    const hashedPassword = bcrypt.hashSync(password, 12);

    // 4. Create the FIRST user as an ADMIN
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'ADMIN',
        onboardingCompleted: true, // System setup implies onboarding is done for the admin
      },
    });

    console.log(`✅ System Admin Setup Complete: ${user.email}`);

    return NextResponse.json({
      message: 'System setup complete. Admin user created successfully.',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error during setup',
        error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined,
      },
      { status: 500 }
    );
  }
}
