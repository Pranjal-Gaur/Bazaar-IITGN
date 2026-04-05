import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Offer from '@/models/Offer';
import Listing from '@/models/Listing';
import Message from '@/models/Message';
import User from '@/models/User';
import mongoose from 'mongoose';

// GET /api/offers?as=buyer|seller&listingId=...
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { searchParams } = new URL(req.url);
  const as = searchParams.get('as');
  const listingId = searchParams.get('listingId');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (as === 'buyer') filter['buyer.email'] = session.user?.email;
  else if (as === 'seller') filter['seller.email'] = session.user?.email;
  if (listingId) filter.listing = listingId;

  const offers = await Offer.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ offers });
}

// POST /api/offers — place a new offer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectDB();
    const { listingId, proposedPrice, message } = await req.json();

    if (!listingId || !proposedPrice) {
      return NextResponse.json({ error: 'listingId and proposedPrice are required' }, { status: 400 });
    }

    const listing = await Listing.findById(listingId);
    if (!listing) return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    if (listing.status !== 'Available') {
      return NextResponse.json({ error: 'Listing is no longer available' }, { status: 409 });
    }
    if (listing.seller.email === session.user.email) {
      return NextResponse.json({ error: 'You cannot make an offer on your own listing' }, { status: 400 });
    }

    // Room ID: sorted user IDs + listingId for uniqueness
    const ids = [session.user.id, listing.seller.email].sort().join('-');
    const roomId = `${listingId}-${ids}`;

    // Check for existing pending offer from this buyer on this listing
    const existing = await Offer.findOne({
      listing: listingId,
      'buyer.email': session.user.email,
      status: { $in: ['pending', 'countered'] },
    });
    if (existing) {
      return NextResponse.json({ error: 'You already have an active offer on this listing' }, { status: 409 });
    }

    // Resolve seller ObjectId from their email
    const sellerUser = await User.findOne({ email: listing.seller.email }).select('_id').lean();
    const sellerObjectId = sellerUser
      ? sellerUser._id
      : new mongoose.Types.ObjectId();

    const offer = await Offer.create({
      listing: listingId,
      buyer: {
        id: new mongoose.Types.ObjectId(session.user.id),
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        hostel: session.user.hostel ?? '',
      },
      seller: {
        id: sellerObjectId,
        name: listing.seller.name,
        email: listing.seller.email,
      },
      originalPrice: listing.price,
      proposedPrice: Number(proposedPrice),
      message,
      roomId,
      status: 'pending',
    });

    // Save system message to chat
    await Message.create({
      roomId,
      listing: listingId,
      sender: {
        id: session.user.id,
        name: session.user.name ?? '',
        email: session.user.email ?? '',
        image: session.user.image ?? '',
      },
      content: `💬 ${session.user.name} made an offer of ₹${Number(proposedPrice).toLocaleString()}${message ? `: "${message}"` : ''}`,
      type: 'offer',
      offerId: offer._id,
    });

    if (global.io) {
      global.io.to(roomId).emit('offer-state-changed', offer);
    }

    return NextResponse.json(offer, { status: 201 });
  } catch (err) {
    console.error('POST /api/offers error:', err);
    return NextResponse.json({ error: 'Failed to place offer' }, { status: 500 });
  }
}
