import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/Message';
import Listing from '@/models/Listing';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = session.user.email;
  const listingId = new URL(req.url).searchParams.get('listingId');

  await connectDB();

  // Rooms where user has sent messages
  const sentRooms = await Message.distinct('roomId', { 'sender.email': email });

  // Rooms where user is the seller (their listings have messages)
  const myListings = await Listing.find({ 'seller.email': email }).select('_id').lean();
  const myListingIds = myListings.map((l) => l._id);
  const sellerRooms = await Message.distinct('roomId', { listing: { $in: myListingIds } });

  // Union of all rooms
  const allRooms = [...new Set([...sentRooms, ...sellerRooms])];

  // If filtering by listingId, only keep rooms for that listing
  const filterQuery: Record<string, unknown> = { roomId: { $in: allRooms } };
  if (listingId) filterQuery.listing = listingId;

  // Get latest message per room
  const latestMessages = await Message.aggregate([
    { $match: filterQuery },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$roomId',
        roomId: { $first: '$roomId' },
        listing: { $first: '$listing' },
        latestContent: { $first: '$content' },
        latestAt: { $first: '$createdAt' },
        latestSenderName: { $first: '$sender.name' },
        latestSenderEmail: { $first: '$sender.email' },
        participants: { $addToSet: '$sender.email' },
      },
    },
    { $sort: { latestAt: -1 } },
    { $limit: 30 },
  ]);

  // Populate listing titles
  const listingIds = [...new Set(latestMessages.map((m) => m.listing?.toString()))].filter(Boolean);
  const listings = await Listing.find({ _id: { $in: listingIds } }).select('title images seller').lean();
  const listingMap = Object.fromEntries(listings.map((l) => [l._id.toString(), l]));

  const conversations = latestMessages.map((m) => {
    const listing = listingMap[m.listing?.toString()] ?? null;
    // Other party = first participant that isn't the current user
    const otherEmail = m.participants.find((e: string) => e !== email) ?? '';
    const otherName = m.latestSenderEmail === email
      ? listing?.seller?.name ?? 'Other'
      : m.latestSenderName;

    return {
      roomId: m.roomId,
      listingId: m.listing?.toString() ?? '',
      listingTitle: listing?.title ?? 'Listing',
      listingImage: listing?.images?.[0] ?? null,
      otherParty: { email: otherEmail, name: otherName },
      latestContent: m.latestContent,
      latestAt: m.latestAt,
      latestSenderEmail: m.latestSenderEmail,
    };
  });

  return NextResponse.json({ conversations });
}
