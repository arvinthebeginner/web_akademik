import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/assignments/[id] - Get single assignment with submissions
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: {
          include: { user: { select: { name: true, email: true } } },
        },
        submissions: {
          include: {
            student: { select: { id: true, name: true, nisn: true } },
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(errorResponse('Assignment not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(assignment, 'Assignment retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch assignment:', error);
    return NextResponse.json(errorResponse('Failed to fetch assignment'), { status: 500 });
  }
}

// PUT /api/assignments/[id] - Update assignment
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU')) {
      return NextResponse.json(errorResponse('Forbidden: Only Teachers or Admins can update assignments'), { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, description, dueDate } = body;

    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(errorResponse('Assignment not found'), { status: 404 });
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: {
        title: title || existing.title,
        description: description !== undefined ? description : existing.description,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
      },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json(successResponse(assignment, 'Assignment updated successfully'));
  } catch (error) {
    console.error('Failed to update assignment:', error);
    return NextResponse.json(errorResponse('Failed to update assignment'), { status: 500 });
  }
}

// DELETE /api/assignments/[id] - Delete assignment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU')) {
      return NextResponse.json(errorResponse('Forbidden: Only Teachers or Admins can delete assignments'), { status: 403 });
    }

    const { id } = await params;
    const existing = await prisma.assignment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(errorResponse('Assignment not found'), { status: 404 });
    }

    await prisma.assignment.delete({ where: { id } });

    return NextResponse.json(successResponse(null, 'Assignment deleted successfully'));
  } catch (error) {
    console.error('Failed to delete assignment:', error);
    return NextResponse.json(errorResponse('Failed to delete assignment'), { status: 500 });
  }
}
