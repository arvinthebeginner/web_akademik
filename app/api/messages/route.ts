import { prisma } from '@/lib/db';
import { errorResponse, successResponse } from '@/lib/utils';
import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { sendMessageNotification } from '@/lib/email';

// GET /api/messages - Retrieve threads or message history
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const myUserId = decoded.id;

    const { searchParams } = new URL(request.url);
    const recipientId = searchParams.get('recipientId');

    // 1. If recipientId is provided, get message history between me and recipient
    if (recipientId) {
      const messages = await prisma.message.findMany({
        where: {
          OR: [
            { senderId: myUserId, recipientId },
            { senderId: recipientId, recipientId: myUserId },
          ],
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      // Mark messages as read
      await prisma.message.updateMany({
        where: {
          senderId: recipientId,
          recipientId: myUserId,
          isRead: false,
        },
        data: {
          isRead: true,
        },
      });

      const formattedMessages = messages.map((m) => ({
        id: m.id,
        senderId: m.senderId === myUserId ? 'me' : 'other',
        text: m.message,
        timestamp: m.createdAt.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      }));

      return NextResponse.json(successResponse(formattedMessages, 'Conversation retrieved'));
    }

    // 2. Otherwise, get all other users with whom we can chat, including latest message if any
    const users = await prisma.user.findMany({
      where: {
        id: { not: myUserId },
      },
      select: {
        id: true,
        name: true,
        role: true,
        avatar: true,
      },
    });

    const threads = await Promise.all(
      users.map(async (u) => {
        // Find latest message between me and this user
        const latestMsg = await prisma.message.findFirst({
          where: {
            OR: [
              { senderId: myUserId, recipientId: u.id },
              { senderId: u.id, recipientId: myUserId },
            ],
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        // Count unread messages from this user to me
        const unreadCount = await prisma.message.count({
          where: {
            senderId: u.id,
            recipientId: myUserId,
            isRead: false,
          },
        });

        // Simple initials for avatar
        const initials = u.name
          .split(' ')
          .map((n) => n[0])
          .join('')
          .substring(0, 2)
          .toUpperCase();

        let timeStr = '-';
        if (latestMsg) {
          const diffMs = new Date().getTime() - latestMsg.createdAt.getTime();
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          if (diffDays === 0) {
            timeStr = latestMsg.createdAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
          } else if (diffDays === 1) {
            timeStr = 'Kemarin';
          } else {
            timeStr = latestMsg.createdAt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
          }
        }

        return {
          id: u.id,
          name: `${u.name} (${u.role === 'GURU' ? 'Guru' : u.role === 'ADMIN' ? 'Admin' : 'Siswa'})`,
          lastMessage: latestMsg ? latestMsg.message : 'Belum ada pesan',
          timestamp: timeStr,
          unread: unreadCount,
          avatar: initials,
        };
      })
    );

    // Sort threads by active messages first
    threads.sort((a, b) => {
      if (a.lastMessage === 'Belum ada pesan' && b.lastMessage !== 'Belum ada pesan') return 1;
      if (a.lastMessage !== 'Belum ada pesan' && b.lastMessage === 'Belum ada pesan') return -1;
      return 0;
    });

    return NextResponse.json(successResponse(threads, 'Message threads retrieved'));
  } catch (error) {
    console.error('Failed to retrieve messages:', error);
    return NextResponse.json(errorResponse('Failed to retrieve messages'), { status: 500 });
  }
}

// POST /api/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json(errorResponse('Unauthorized'), { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET || 'secret') as { id: string };
    const myUserId = decoded.id;

    const body = await request.json();
    const { recipientId, message } = body;

    if (!recipientId || !message) {
      return NextResponse.json(errorResponse('Recipient ID and message content are required'), { status: 400 });
    }

    const newMessage = await prisma.message.create({
      data: {
        senderId: myUserId,
        recipientId,
        message,
        isRead: false,
      },
    });

    // Send email notification (non-blocking, won't affect response)
    if (newMessage) {
      try {
        const [sender, recipient] = await Promise.all([
          prisma.user.findUnique({ where: { id: myUserId }, select: { name: true } }),
          prisma.user.findUnique({ where: { id: recipientId }, select: { name: true, email: true } }),
        ]);
        if (sender && recipient?.email) {
          sendMessageNotification(recipient.email, recipient.name, sender.name, message).catch(() => {});
        }
      } catch (e) { console.error('Email notification error:', e); }
    }

    const formattedMessage = {
      id: newMessage.id,
      senderId: 'me',
      text: newMessage.message,
      timestamp: newMessage.createdAt.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    return NextResponse.json(successResponse(formattedMessage, 'Message sent successfully'), { status: 201 });
  } catch (error) {
    console.error('Failed to send message:', error);
    return NextResponse.json(errorResponse('Failed to send message'), { status: 500 });
  }
}
