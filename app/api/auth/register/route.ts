import { hashPassword, isValidEmail } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json();

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        errorResponse('Email, password, and name are required'),
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        errorResponse('Invalid email format'),
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        errorResponse('Password must be at least 6 characters'),
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        errorResponse('User already exists'),
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: role || 'SISWA',
      },
    });

    return NextResponse.json(
      successResponse(
        {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        },
        'User created successfully'
      ),
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      errorResponse('Registration failed'),
      { status: 500 }
    );
  }
}
