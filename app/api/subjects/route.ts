import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/subjects - Get all subjects
export async function GET(_request: NextRequest) {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(successResponse(subjects, 'Subjects retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch subjects:', error);
    return NextResponse.json(errorResponse('Failed to fetch subjects'), { status: 500 });
  }
}
