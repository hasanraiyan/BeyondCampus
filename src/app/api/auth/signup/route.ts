import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    // 0. Check if any user exists. If not, block regular signup and direct to setup
    const userCount = await prisma.user.count();
    if (userCount === 0) {
      return NextResponse.json(
        { message: 'System onboarding required. Please visit /admin/setup to create the first admin account.' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: 'User already exists',
        },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 12);

    // Create user - Enforce STUDENT role for regular signups
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        role: 'STUDENT', // Hardcoded security guard
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error:
          process.env.NODE_ENV === 'development'
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}
