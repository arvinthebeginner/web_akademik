import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        errorResponse('Not authenticated'),
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET || 'secret'
    ) as { id: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        errorResponse('User not found'),
        { status: 404 }
      );
    }

    return NextResponse.json(
      successResponse(user, 'User data retrieved'),
      { status: 200 }
    );
  } catch (error) {
    console.error('Me error:', error);
    return NextResponse.json(
      errorResponse('Failed to get user data'),
      { status: 500 }
    );
  }
}
