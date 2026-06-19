import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/teachers/[id] - Get teacher details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
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
        classesAsTeacher: true,
      },
    });

    if (!teacher) {
      return NextResponse.json(errorResponse('Teacher not found'), { status: 404 });
    }

    return NextResponse.json(successResponse(teacher, 'Teacher retrieved successfully'));
  } catch (error) {
    console.error('Failed to fetch teacher:', error);
    return NextResponse.json(errorResponse('Failed to fetch teacher'), { status: 500 });
  }
}

// PUT /api/teachers/[id] - Update teacher details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Role guard
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_SEKOLAH')) {
      return NextResponse.json(errorResponse('Forbidden: Only Admin or Principal can update teachers'), { status: 403 });
    }

    const { id } = await params;
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

    // Check if teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return NextResponse.json(errorResponse('Teacher not found'), { status: 404 });
    }

    // Check unique constraint for NIP
    if (nip && nip !== teacher.nip) {
      const existingTeacher = await prisma.teacher.findUnique({ where: { nip } });
      if (existingTeacher) {
        return NextResponse.json(errorResponse('Teacher with this NIP already exists'), { status: 400 });
      }
    }

    // Update User & Teacher details in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update User account
      const _user = await tx.user.update({
        where: { id: teacher.userId },
        data: {
          name: name || undefined,
          email: email || undefined,
          phone: phone !== undefined ? phone : undefined,
        },
      });

      // Update Teacher record
      const updatedTeacher = await tx.teacher.update({
        where: { id },
        data: {
          nip: nip !== undefined ? nip : undefined,
          specialization: specialization !== undefined ? specialization : undefined,
          qualification: qualification !== undefined ? qualification : undefined,
          address: address !== undefined ? address : undefined,
        },
        include: {
          user: true,
        },
      });

      return updatedTeacher;
    });

    return NextResponse.json(successResponse(result, 'Teacher updated successfully'));
  } catch (error) {
    console.error('Failed to update teacher:', error);
    return NextResponse.json(errorResponse('Failed to update teacher'), { status: 500 });
  }
}

// DELETE /api/teachers/[id] - Delete teacher & user account
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Role guard
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const user = await prisma.user.findUnique({ where: { id: decoded.id } });
    if (!user || (user.role !== 'ADMIN' && user.role !== 'KEPALA_SEKOLAH')) {
      return NextResponse.json(errorResponse('Forbidden: Only Admin or Principal can delete teachers'), { status: 403 });
    }

    const { id } = await params;
    const teacher = await prisma.teacher.findUnique({
      where: { id },
    });

    if (!teacher) {
      return NextResponse.json(errorResponse('Teacher not found'), { status: 404 });
    }

    // Delete teacher and linked user account in transaction
    await prisma.$transaction(async (tx) => {
      await tx.teacher.delete({
        where: { id },
      });

      await tx.user.delete({
        where: { id: teacher.userId },
      });
    });

    return NextResponse.json(successResponse(null, 'Teacher and associated user account deleted successfully'));
  } catch (error) {
    console.error('Failed to delete teacher:', error);
    return NextResponse.json(errorResponse('Failed to delete teacher'), { status: 500 });
  }
}
