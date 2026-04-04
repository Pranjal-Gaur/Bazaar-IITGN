import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';
import mongoose from 'mongoose';

// GET /api/watchlist — get my watchlist
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const user = await User.findById(session.user.id).lean() as { watchlist?: mongoose.Types.ObjectId[] } | null;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const listings = await Listing.find({ _id: { $in: user.watchlist ?? [] } }).lean();
  return NextResponse.json({ listings });
}

// POST /api/watchlist — toggle (add/remove) a listing
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { listingId } = await req.json();
  if (!listingId) return NextResponse.json({ error: 'listingId is required' }, { status: 400 });

  const user = await User.findById(session.user.id);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const id = new mongoose.Types.ObjectId(listingId);
  const isWatchlisted = user.watchlist.some((w) => w.equals(id));

  if (isWatchlisted) {
    await User.findByIdAndUpdate(session.user.id, { $pull: { watchlist: id } });
  } else {
    await User.findByIdAndUpdate(session.user.id, { $addToSet: { watchlist: id } });
  }

  return NextResponse.json({ watchlisted: !isWatchlisted });
}
