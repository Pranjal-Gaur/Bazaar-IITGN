import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Offer from '@/models/Offer';
import Message from '@/models/Message';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;
  await connectDB();

  // Recent offers on my listings (I am the seller)
  const offerNotifs = await Offer.find({ 'seller.email': email })
    .sort({ updatedAt: -1 })
    .limit(15)
    .populate('listing', 'title images price')
    .lean();

  // Find rooms where I have participated (sent at least one message)
  const myRooms = await Message.distinct('roomId', { 'sender.email': email });

  // Recent messages from others in those rooms
  const messageNotifs = await Message.find({
    roomId: { $in: myRooms },
    'sender.email': { $ne: email },
    type: 'text',
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  // Deduplicate: only latest message per room
  const seenRooms = new Set<string>();
  const deduped = messageNotifs.filter((m) => {
    if (seenRooms.has(m.roomId)) return false;
    seenRooms.add(m.roomId);
    return true;
  });

  return NextResponse.json({
    offers: offerNotifs,
    messages: deduped,
  });
}
