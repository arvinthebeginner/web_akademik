import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/submissions - Get submissions by assignment or student
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const assignmentId = searchParams.get('assignmentId');
    const studentId = searchParams.get('studentId');

    if (!assignmentId && !studentId) {
      return NextResponse.json(errorResponse('assignmentId or studentId is required'), { status: 400 });
    }

    const where: Record<string, unknown> = {};
    if (assignmentId) where.assignmentId = assignmentId;
    if (studentId) where.studentId = studentId;

    const submissions = await prisma.submission.findMany({
      where,
      include: {
        student: { select: { id: true, name: true, nisn: true } },
        assignment: {
          select: {
            id: true,
            title: true,
            dueDate: true,
            subject: { select: { name: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });

    const formatted = submissions.map((s) => ({
      id: s.id,
      assignmentId: s.assignmentId,
      assignmentTitle: s.assignment.title,
      subjectName: s.assignment.subject.name,
      studentId: s.studentId,
      studentName: s.student.name,
      nisn: s.student.nisn,
      filePath: s.filePath || '',
      notes: s.notes || '',
      grade: s.grade,
      feedback: s.feedback || '',
      submittedAt: s.submittedAt.toISOString(),
      dueDate: s.assignment.dueDate.toISOString(),
    }));

    return NextResponse.json(successResponse(formatted, 'Submissions retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json(errorResponse('Failed to fetch submissions'), { status: 500 });
  }
}

// POST /api/submissions - Create or update a submission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { assignmentId, studentId, notes, grade, feedback } = body;

    if (!assignmentId || !studentId) {
      return NextResponse.json(errorResponse('Assignment ID and Student ID are required'), { status: 400 });
    }

    // Check if submission already exists
    const existing = await prisma.submission.findUnique({
      where: { assignmentId_studentId: { assignmentId, studentId } },
    });

    let submission;
    if (existing) {
      // Update existing submission (teacher grading or student re-submitting)
      submission = await prisma.submission.update({
        where: { id: existing.id },
        data: {
          notes: notes !== undefined ? notes : existing.notes,
          grade: grade !== undefined ? parseFloat(grade) : existing.grade,
          feedback: feedback !== undefined ? feedback : existing.feedback,
        },
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId,
          notes: notes || null,
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json(successResponse(submission, 'Submission saved successfully'));
  } catch (error) {
    console.error('Failed to save submission:', error);
    return NextResponse.json(errorResponse('Failed to save submission'), { status: 500 });
  }
}
