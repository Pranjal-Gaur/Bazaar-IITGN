import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';

type Params = { params: Promise<{ listingId: string }> };

// GET /api/messages/[listingId]?roomId=xxx — load chat history
export async function GET(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { listingId } = await params;
  const roomId = new URL(req.url).searchParams.get('roomId');
  if (!roomId) return NextResponse.json({ error: 'roomId is required' }, { status: 400 });

  await connectDB();
  const messages = await Message.find({ roomId, listing: listingId })
    .sort({ createdAt: 1 })
    .limit(100)
    .lean();

  return NextResponse.json({ messages });
}

// POST /api/messages/[listingId] — save a message (Socket.io handles real-time, this persists)
export async function POST(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { listingId } = await params;
  const { roomId, content } = await req.json();

  if (!roomId || !content?.trim()) {
    return NextResponse.json({ error: 'roomId and content are required' }, { status: 400 });
  }

  await connectDB();
  const msg = await Message.create({
    roomId,
    listing: listingId,
    sender: {
      id: session.user.id,
      name: session.user.name ?? '',
      email: session.user.email ?? '',
      image: session.user.image ?? '',
    },
    content: content.trim(),
    type: 'text',
  });

  return NextResponse.json(msg, { status: 201 });
}
