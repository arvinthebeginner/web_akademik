import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

// GET /api/notifications - Get notification summary + recent items
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };

    const [unreadMessages, announcements] = await Promise.all([
      prisma.message.findMany({
        where: { recipientId: decoded.id, isRead: false },
        include: {
          sender: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
      prisma.announcement.findMany({
        include: {
          author: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    const unreadCount = await prisma.message.count({
      where: { recipientId: decoded.id, isRead: false },
    });

    const items = [
      ...unreadMessages.map((m) => ({
        id: m.id,
        type: 'message' as const,
        title: `Pesan dari ${m.sender.name}`,
        preview: m.message.length > 60 ? m.message.slice(0, 60) + '...' : m.message,
        time: m.createdAt.toISOString(),
        read: false,
      })),
      ...announcements.map((a) => ({
        id: a.id,
        type: 'announcement' as const,
        title: a.title,
        preview: a.content.length > 60 ? a.content.slice(0, 60) + '...' : a.content,
        time: a.createdAt.toISOString(),
        read: true,
      })),
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

    return NextResponse.json(successResponse({
      unreadCount,
      items,
    }, 'Notifications retrieved'));
  } catch (error) {
    console.error('Failed to fetch notifications:', error);
    return NextResponse.json(errorResponse('Failed to fetch notifications'), { status: 500 });
  }
}
