import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import mongoose from 'mongoose';

type Params = { params: Promise<{ id: string }> };

// GET /api/listings/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    await connectDB();

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $inc: { views: 1 } },
      { new: true }
    ).lean();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (err) {
    console.error('GET /api/listings/[id] error:', err);
    return NextResponse.json({ error: 'Failed to fetch listing' }, { status: 500 });
  }
}

// PATCH /api/listings/[id]
export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    await connectDB();

    const body = await req.json();

    // Whitelist updatable fields
    const allowed = [
      'title', 'description', 'price', 'originalPrice',
      'condition', 'images', 'hostel', 'wing', 'preferredPickup',
      'status', 'isUrgent', 'tags',
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (key in body) updates[key] = body[key];
    }

    const listing = await Listing.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    ).lean();

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json(listing);
  } catch (err) {
    console.error('PATCH /api/listings/[id] error:', err);
    return NextResponse.json({ error: 'Failed to update listing' }, { status: 500 });
  }
}

// DELETE /api/listings/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid listing ID' }, { status: 400 });
    }

    await connectDB();

    const listing = await Listing.findByIdAndDelete(id);
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Listing deleted successfully' });
  } catch (err) {
    console.error('DELETE /api/listings/[id] error:', err);
    return NextResponse.json({ error: 'Failed to delete listing' }, { status: 500 });
  }
}
