import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/assignments - List all assignments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');

    const where: Record<string, unknown> = {};
    if (subjectId) where.subjectId = subjectId;
    if (teacherId) where.createdBy = teacherId;

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: { select: { id: true, name: true, code: true } },
        teacher: {
          include: { user: { select: { name: true, email: true } } },
        },
        _count: { select: { submissions: true } },
      },
      orderBy: { dueDate: 'desc' },
    });

    const formatted = assignments.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description || '',
      subjectId: a.subjectId,
      subjectName: a.subject.name,
      subjectCode: a.subject.code,
      teacherName: a.teacher.user.name,
      dueDate: a.dueDate.toISOString(),
      totalSubmissions: a._count.submissions,
      createdAt: a.createdAt.toISOString(),
    }));

    return NextResponse.json(successResponse(formatted, 'Assignments retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json(errorResponse('Failed to fetch assignments'), { status: 500 });
  }
}

// POST /api/assignments - Create a new assignment
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU')) {
      return NextResponse.json(errorResponse('Forbidden: Only Teachers or Admins can create assignments'), { status: 403 });
    }

    const body = await request.json();
    const { subjectId, title, description, dueDate } = body;

    if (!subjectId || !title || !dueDate) {
      return NextResponse.json(errorResponse('Subject, title, and due date are required'), { status: 400 });
    }

    // Find teacher profile for the user
    let teacherId = user.id;
    if (user.role === 'GURU') {
      const teacher = await prisma.teacher.findUnique({ where: { userId: user.id } });
      if (teacher) teacherId = teacher.id;
    } else {
      // Admin creating - use first teacher or require teacherId
      const teacher = await prisma.teacher.findFirst();
      if (teacher) teacherId = teacher.id;
    }

    const assignment = await prisma.assignment.create({
      data: {
        subjectId,
        title,
        description: description || null,
        dueDate: new Date(dueDate),
        createdBy: teacherId,
      },
      include: {
        subject: { select: { name: true, code: true } },
        teacher: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json(successResponse(assignment, 'Assignment created successfully'), { status: 201 });
  } catch (error) {
    console.error('Failed to create assignment:', error);
    return NextResponse.json(errorResponse('Failed to create assignment'), { status: 500 });
  }
}
