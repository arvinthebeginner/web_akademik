import { prisma } from '@/lib/db';
import { errorResponse, successResponse, getGradeFromScore } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/grades - Query or list grades
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const subjectId = searchParams.get('subjectId');
    const type = searchParams.get('type'); // UTS, UAS, FORMATIF, SUMATIF, SEMESTER

    // If we are filtering by class and subject for inputting/tracking grades
    if (classId && subjectId) {
      // Find the class-subject mapping
      const classSubject = await prisma.classSubject.findFirst({
        where: {
          classId,
          subjectId,
        },
      });

      if (!classSubject) {
        return NextResponse.json(
          successResponse([], 'Mata pelajaran tidak diajarkan di kelas ini')
        );
      }

      // Get active semester
      const activeSemester = await prisma.semester.findFirst({
        where: { academicYear: { isActive: true } },
      });

      if (!activeSemester) {
        return NextResponse.json(errorResponse('No active semester found'), { status: 400 });
      }

      // Get all students in the class
      const students = await prisma.student.findMany({
        where: { classId, status: 'AKTIF' },
        orderBy: { name: 'asc' },
      });

      // Get all existing grades for this class-subject, semester, and type
      const grades = await prisma.grade.findMany({
        where: {
          classSubjectId: classSubject.id,
          semesterId: activeSemester.id,
          type: type as any || undefined,
        },
      });

      // Combine students with their grade records
      const combined = students.map((student) => {
        const studentGrade = grades.find((g) => g.studentId === student.id);
        return {
          studentId: student.id,
          studentName: student.name,
          nisn: student.nisn,
          gradeId: studentGrade?.id || null,
          score: studentGrade?.score !== undefined ? studentGrade.score : null,
          letterGrade: studentGrade?.letterGrade || null,
          notes: studentGrade?.notes || '',
          classSubjectId: classSubject.id,
          semesterId: activeSemester.id,
        };
      });

      return NextResponse.json(successResponse(combined, 'Grade input list loaded'));
    }

    // Default list: return all grades
    const grades = await prisma.grade.findMany({
      include: {
        student: {
          select: {
            name: true,
            class: {
              select: {
                name: true,
              },
            },
          },
        },
        classSubject: {
          include: {
            subject: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedGrades = grades.map((g) => ({
      id: g.id,
      studentName: g.student.name,
      className: g.student.class.name,
      subject: g.classSubject.subject.name,
      subjectCode: g.classSubject.subject.code,
      score: g.score,
      grade: g.letterGrade || '',
      type: g.type,
      notes: g.notes || '',
    }));

    return NextResponse.json(successResponse(formattedGrades, 'Grades retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    return NextResponse.json(errorResponse('Failed to fetch grades'), { status: 500 });
  }
}

// POST /api/grades - Record or update a grade
export async function POST(request: NextRequest) {
  try {
    // Authenticate user to get recordedBy
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU')) {
      return NextResponse.json(errorResponse('Forbidden: Only Teachers or Admins can record grades'), { status: 403 });
    }

    const body = await request.json();
    const { studentId, classSubjectId, semesterId, score, type, notes } = body;

    if (!studentId || !classSubjectId || !semesterId || score === undefined || !type) {
      return NextResponse.json(
        errorResponse('Student ID, Class Subject ID, Semester ID, Score, and Type are required'),
        { status: 400 }
      );
    }

    const numericScore = parseFloat(score);
    const letterGrade = getGradeFromScore(numericScore) as any;

    // Upsert Grade
    const grade = await prisma.grade.upsert({
      where: {
        studentId_classSubjectId_semesterId_type: {
          studentId,
          classSubjectId,
          semesterId,
          type,
        },
      },
      update: {
        score: numericScore,
        letterGrade,
        notes: notes || null,
        recordedBy: user.id,
      },
      create: {
        studentId,
        classSubjectId,
        semesterId,
        score: numericScore,
        letterGrade,
        type,
        notes: notes || null,
        recordedBy: user.id,
      },
    });

    return NextResponse.json(successResponse(grade, 'Grade recorded successfully'));
  } catch (error) {
    console.error('Failed to record grade:', error);
    return NextResponse.json(errorResponse('Failed to record grade'), { status: 500 });
  }
}
