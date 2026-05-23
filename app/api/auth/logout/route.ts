import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const response = NextResponse.json(
      successResponse(null, 'Logged out successfully'),
      { status: 200 }
    );

    // Clear token cookie
    response.cookies.set('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      errorResponse('Logout failed'),
      { status: 500 }
    );
  }
}
