import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';
import Review from '@/models/Review';

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] — public profile
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  await connectDB();

  const user = await User.findById(id).select('-watchlist -contactPreferences').lean() as Record<string, unknown> | null;
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const email = user.email as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [listings, reviews] = await Promise.all([
    (Listing as any).find({ 'seller.email': email, status: { $ne: 'Sold' } }).limit(12).lean(),
    (Review as any).find({ 'reviewee.email': email }).sort({ createdAt: -1 }).limit(10).lean(),
  ]);

  return NextResponse.json({ user, listings, reviews });
}

// PATCH /api/users/[id] — update own profile
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  if (session.user.id !== id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await connectDB();
  const { hostel, wing, phone, bio, contactPreferences } = await req.json();

  const update: Record<string, unknown> = {};
  if (hostel !== undefined) update.hostel = hostel;
  if (wing !== undefined) update.wing = wing;
  if (phone !== undefined) update.phone = phone;
  if (bio !== undefined) update.bio = bio;
  if (contactPreferences !== undefined) update.contactPreferences = contactPreferences;

  const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  return NextResponse.json(user);
}
