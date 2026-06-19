import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';

// PUT /api/classes/[id] - Update class details
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, gradeLevel, capacity, homeRoomTeacherId } = body;

    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return NextResponse.json(errorResponse('Class not found'), { status: 404 });
    }

    const updatedClass = await prisma.class.update({
      where: { id },
      data: {
        name: name || undefined,
        gradeLevel: gradeLevel || undefined,
        capacity: capacity ? parseInt(capacity, 10) : undefined,
        homeRoomTeacherId: homeRoomTeacherId !== undefined ? homeRoomTeacherId : undefined,
      },
    });

    return NextResponse.json(successResponse(updatedClass, 'Class updated successfully'));
  } catch (error) {
    console.error('Failed to update class:', error);
    return NextResponse.json(errorResponse('Failed to update class'), { status: 500 });
  }
}

// DELETE /api/classes/[id] - Delete class
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const existingClass = await prisma.class.findUnique({
      where: { id },
    });

    if (!existingClass) {
      return NextResponse.json(errorResponse('Class not found'), { status: 404 });
    }

    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json(successResponse(null, 'Class deleted successfully'));
  } catch (error) {
    console.error('Failed to delete class:', error);
    return NextResponse.json(errorResponse('Failed to delete class'), { status: 500 });
  }
}
