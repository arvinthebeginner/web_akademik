import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/students/[id] - Get student details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        class: true,
        parent: true,
      },
    });

    if (!student) {
      return NextResponse.json(errorResponse('Student not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(student, 'Student retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch student:', error);
    return NextResponse.json(errorResponse('Failed to fetch student'), { status: 500 });
  }
}

// PUT /api/students/[id] - Update student details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const {
      nisn,
      nis,
      name,
      email,
      gender,
      dateOfBirth,
      address,
      phone,
      classId,
      status,
    } = body;

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(errorResponse('Student not found'), { status: 404 });
    }

    // Check unique constraints (if NISN changed)
    if (nisn && nisn !== student.nisn) {
      const existingNisn = await prisma.student.findUnique({ where: { nisn } });
      if (existingNisn) {
        return NextResponse.json(errorResponse('Student with this NISN already exists'), { status: 400 });
      }
    }

    if (nis && nis !== student.nis) {
      const existingNis = await prisma.student.findUnique({ where: { nis } });
      if (existingNis) {
        return NextResponse.json(errorResponse('Student with this NIS already exists'), { status: 400 });
      }
    }

    // Update user account if linked
    if (student.userId && email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: student.userId } },
      });
      if (existingUser) {
        return NextResponse.json(errorResponse('Email already used by another user'), { status: 400 });
      }

      await prisma.user.update({
        where: { id: student.userId },
        data: {
          email,
          name,
          phone: phone || null,
        },
      });
    }

    // Update student record
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        nisn: nisn || student.nisn,
        nis: nis !== undefined ? nis : student.nis,
        name: name || student.name,
        email: email !== undefined ? email : student.email,
        gender: gender || student.gender,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : student.dateOfBirth,
        address: address !== undefined ? address : student.address,
        phone: phone !== undefined ? phone : student.phone,
        classId: classId || student.classId,
        status: status || student.status,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(successResponse(updatedStudent, 'Student updated successfully'));
  } catch (error) {
    console.error('Failed to update student:', error);
    return NextResponse.json(errorResponse('Failed to update student'), { status: 500 });
  }
}

// DELETE /api/students/[id] - Delete student & user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const student = await prisma.student.findUnique({
      where: { id },
    });

    if (!student) {
      return NextResponse.json(errorResponse('Student not found'), { status: 404 });
    }

    // Delete student record
    await prisma.student.delete({
      where: { id },
    });

    // Clean up linked User record
    if (student.userId) {
      await prisma.user.delete({
        where: { id: student.userId },
      });
    }

    return NextResponse.json(successResponse(null, 'Student and associated user account deleted successfully'));
  } catch (error) {
    console.error('Failed to delete student:', error);
    return NextResponse.json(errorResponse('Failed to delete student'), { status: 500 });
  }
}
