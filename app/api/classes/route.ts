import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// GET /api/classes - List all classes
export async function GET(_request: NextRequest) {
  try {
    const classes = await prisma.class.findMany({
      include: {
        homeRoomTeacher: {
          include: {
            user: {
              select: {
                name: true,
              },
            },
          },
        },
        students: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const formattedClasses = classes.map((cls) => ({
      id: cls.id,
      name: cls.name,
      gradeLevel: cls.gradeLevel,
      capacity: cls.capacity,
      totalStudents: cls.students.length,
      homeRoomTeacher: cls.homeRoomTeacher?.user.name || 'Belum Ditentukan',
      homeRoomTeacherId: cls.homeRoomTeacherId || '',
    }));

    return NextResponse.json(successResponse(formattedClasses, 'Classes retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch classes:', error);
    return NextResponse.json(errorResponse('Failed to fetch classes'), { status: 500 });
  }
}

// POST /api/classes - Create new class
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, gradeLevel, capacity, homeRoomTeacherId } = body;

    if (!name || !gradeLevel || !capacity) {
      return NextResponse.json(
        errorResponse('Name, Grade Level, and Capacity are required'),
        { status: 400 }
      );
    }

    // Get active academic year & school from seeding if possible, or link dynamically
    const school = await prisma.school.findFirst();
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    });

    const newClass = await prisma.class.create({
      data: {
        name,
        gradeLevel,
        capacity: parseInt(capacity, 10),
        homeRoomTeacherId: homeRoomTeacherId || null,
        schoolId: school?.id || null,
        academicYearId: academicYear?.id || null,
      },
    });

    return NextResponse.json(successResponse(newClass, 'Class created successfully'), { status: 201 });
  } catch (error) {
    console.error('Failed to create class:', error);
    return NextResponse.json(errorResponse('Failed to create class'), { status: 500 });
  }
}
