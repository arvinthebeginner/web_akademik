import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/teachers - Get list of teachers
export async function GET(_request: NextRequest) {
  try {
    const teachers = await prisma.teacher.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
          },
        },
        classesAsTeacher: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        user: {
          name: 'asc',
        },
      },
    });

    // Format output to match UI needs
    const formattedTeachers = teachers.map((teacher) => ({
      id: teacher.id,
      nip: teacher.nip || '',
      name: teacher.user.name,
      email: teacher.user.email,
      specialization: teacher.specialization || '',
      qualification: teacher.qualification || '',
      address: teacher.address || '',
      phone: teacher.user.phone || '',
      classes: teacher.classesAsTeacher.map((c) => c.name).join(', ') || '-',
    }));

    return NextResponse.json(successResponse(formattedTeachers, 'Teachers retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch teachers:', error);
    return NextResponse.json(errorResponse('Failed to fetch teachers'), { status: 500 });
  }
}

// POST /api/teachers - Create a teacher & user account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      nip,
      name,
      email,
      specialization,
      qualification,
      address,
      phone,
    } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        errorResponse('Name and email are required'),
        { status: 400 }
      );
    }

    // Check if email already used
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(errorResponse('User with this email already exists'), { status: 400 });
    }

    // Check NIP if provided
    if (nip) {
      const existingTeacher = await prisma.teacher.findUnique({ where: { nip } });
      if (existingTeacher) {
        return NextResponse.json(errorResponse('Teacher with this NIP already exists'), { status: 400 });
      }
    }

    // Hash default password
    const hashedPassword = await hashPassword('password123');

    // Create User & Teacher inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
          role: 'GURU',
          phone: phone || null,
        },
      });

      const teacher = await tx.teacher.create({
        data: {
          userId: user.id,
          nip: nip || null,
          specialization: specialization || null,
          qualification: qualification || null,
          address: address || null,
        },
        include: {
          user: true,
        },
      });

      return teacher;
    });

    return NextResponse.json(successResponse(result, 'Teacher created successfully'), { status: 201 });
  } catch (error) {
    console.error('Failed to create teacher:', error);
    return NextResponse.json(errorResponse('Failed to create teacher'), { status: 500 });
  }
}
