import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/students - Get list of students
export async function GET(request: NextRequest) {
  try {
    const students = await prisma.student.findMany({
      include: {
        class: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(successResponse(students, 'Students retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch students:', error);
    return NextResponse.json(errorResponse('Failed to fetch students'), { status: 500 });
  }
}

// POST /api/students - Create a student & login account
export async function POST(request: NextRequest) {
  try {
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

    // Basic Validation
    if (!nisn || !name || !gender || !dateOfBirth || !classId) {
      return NextResponse.json(
        errorResponse('NISN, Name, Gender, Date of Birth, and Class are required'),
        { status: 400 }
      );
    }

    // Check if NISN or NIS exists
    const existingNisn = await prisma.student.findUnique({ where: { nisn } });
    if (existingNisn) {
      return NextResponse.json(errorResponse('Student with this NISN already exists'), { status: 400 });
    }

    if (nis) {
      const existingNis = await prisma.student.findUnique({ where: { nis } });
      if (existingNis) {
        return NextResponse.json(errorResponse('Student with this NIS already exists'), { status: 400 });
      }
    }

    // Create user account if email is provided
    let userId = null;
    if (email) {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return NextResponse.json(errorResponse('User with this email already exists'), { status: 400 });
      }

      // Hash default password
      const hashedPassword = await hashPassword('password123');
      const newUser = await prisma.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'SISWA',
          phone: phone || null,
        },
      });
      userId = newUser.id;
    }

    // Create student record
    const student = await prisma.student.create({
      data: {
        nisn,
        nis: nis || null,
        name,
        email: email || null,
        gender,
        dateOfBirth: new Date(dateOfBirth),
        address: address || null,
        phone: phone || null,
        classId,
        parentId: null, // can be set later
        status: status || 'AKTIF',
        userId,
      },
      include: {
        class: true,
      },
    });

    return NextResponse.json(successResponse(student, 'Student created successfully'), { status: 201 });
  } catch (error) {
    console.error('Failed to create student:', error);
    return NextResponse.json(errorResponse('Failed to create student'), { status: 500 });
  }
}
