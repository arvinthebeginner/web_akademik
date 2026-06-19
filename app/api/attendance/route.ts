import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/attendance - List attendance records
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const dateStr = searchParams.get('date'); // YYYY-MM-DD

    // If querying daily attendance for a specific class and date (for inputting/viewing)
    if (classId && dateStr) {
      const targetDate = new Date(dateStr);
      // Normalize date to start of day for exact match
      const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

      // Get all students in the class
      const students = await prisma.student.findMany({
        where: { classId, status: 'AKTIF' },
        orderBy: { name: 'asc' },
      });

      // Get existing attendance records for the class on that date
      const attendance = await prisma.attendance.findMany({
        where: {
          classId,
          date: startOfDay,
        },
      });

      // Map students to their attendance status
      const combined = students.map((student) => {
        const record = attendance.find((a) => a.studentId === student.id);
        return {
          studentId: student.id,
          studentName: student.name,
          nisn: student.nisn,
          attendanceId: record?.id || null,
          status: record?.status || 'HADIR', // Default to present
          notes: record?.notes || '',
          date: startOfDay,
        };
      });

      return NextResponse.json(successResponse(combined, 'Attendance sheet loaded'));
    }

    // If querying student attendance history (for riwayat absensi)
    const studentId = searchParams.get('studentId');
    const monthStr = searchParams.get('month');
    const yearStr = searchParams.get('year');

    if (studentId) {
      const now = new Date();
      const month = monthStr ? parseInt(monthStr) : now.getMonth();
      const year = yearStr ? parseInt(yearStr) : now.getFullYear();
      const startDate = new Date(year, month, 1);
      const endDate = new Date(year, month + 1, 0, 23, 59, 59);

      const records = await prisma.attendance.findMany({
        where: {
          studentId,
          date: { gte: startDate, lte: endDate },
        },
        orderBy: { date: 'asc' },
      });

      const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { name: true },
      });

      const formatted = records.map((r) => ({
        id: r.id,
        date: r.date.toISOString().split('T')[0],
        day: r.date.getDate(),
        status: r.status,
        notes: r.notes || '',
        studentName: student?.name || '',
      }));

      return NextResponse.json(successResponse(formatted, 'Student attendance history retrieved'));
    }

    // Default: list all attendance records (general log)
    const attendanceLogs = await prisma.attendance.findMany({
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
      },
      orderBy: {
        date: 'desc',
      },
    });

    const formatted = attendanceLogs.map((log) => ({
      id: log.id,
      studentName: log.student.name,
      className: log.student.class.name,
      date: log.date.toISOString().split('T')[0],
      status: log.status,
      notes: log.notes || '',
    }));

    return NextResponse.json(successResponse(formatted, 'Attendance logs retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch attendance:', error);
    return NextResponse.json(errorResponse('Failed to fetch attendance'), { status: 500 });
  }
}

// POST /api/attendance - Record batch attendance for a class
export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });

    if (!user || (user.role !== 'ADMIN' && user.role !== 'GURU')) {
      return NextResponse.json(errorResponse('Forbidden: Only Teachers or Admins can record attendance'), { status: 403 });
    }

    const body = await request.json();
    const { classId, date, records } = body; // records: Array of { studentId, status, notes }

    if (!classId || !date || !records || !Array.isArray(records)) {
      return NextResponse.json(
        errorResponse('Class ID, Date, and Records array are required'),
        { status: 400 }
      );
    }

    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate());

    // Upsert all attendance records in a transaction
    const savedRecords = await prisma.$transaction(
      records.map((rec) =>
        prisma.attendance.upsert({
          where: {
            studentId_date: {
              studentId: rec.studentId,
              date: startOfDay,
            },
          },
          update: {
            status: rec.status,
            notes: rec.notes || null,
            recordedBy: user.id,
          },
          create: {
            studentId: rec.studentId,
            classId,
            date: startOfDay,
            status: rec.status,
            notes: rec.notes || null,
            recordedBy: user.id,
          },
        })
      )
    );

    return NextResponse.json(successResponse(savedRecords, 'Attendance recorded successfully'));
  } catch (error) {
    console.error('Failed to record attendance:', error);
    return NextResponse.json(errorResponse('Failed to record attendance'), { status: 500 });
  }
}
