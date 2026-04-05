import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Listing from '@/models/Listing';
import Review from '@/models/Review';

type Params = { params: Promise<{ id: string }> };

// GET /api/users/[id] — public profile (id can be ObjectId or email)
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  if (!id || id === 'undefined') return NextResponse.json({ error: 'User not found' }, { status: 404 });

  await connectDB();

  const decoded = decodeURIComponent(id);
  const isEmail = decoded.includes('@');

  let user: Record<string, unknown> | null = null;
  if (isEmail) {
    user = await User.findOne({ email: decoded }).select('-watchlist').lean() as Record<string, unknown> | null;
  } else {
    try {
      user = await User.findById(decoded).select('-watchlist').lean() as Record<string, unknown> | null;
    } catch {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
  }
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
  if (!session?.user?.email) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  // Allow match by ObjectId OR by email (for sessions missing id)
  const sessionUser = await User.findOne({ email: session.user.email }).select('_id').lean() as { _id: { toString(): string } } | null;
  if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (sessionUser._id.toString() !== id && session.user.id !== id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { name, hostel, wing, phone, bio, program, branch, graduationYear, contactPreferences } = await req.json();

  const update: Record<string, unknown> = {};
  if (name !== undefined) update.name = name;
  if (hostel !== undefined) update.hostel = hostel;
  if (wing !== undefined) update.wing = wing;
  if (phone !== undefined) update.phone = phone;
  if (bio !== undefined) update.bio = bio;
  if (program !== undefined) update.program = program;
  if (branch !== undefined) update.branch = branch;
  if (graduationYear !== undefined) update.graduationYear = graduationYear;
  if (contactPreferences !== undefined) update.contactPreferences = contactPreferences;

  const user = await User.findByIdAndUpdate(id, { $set: update }, { new: true }).lean();
  return NextResponse.json(user);
}
