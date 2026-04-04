import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';

// GET /api/listings — query listings with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const hostel = searchParams.get('hostel');
    const status = searchParams.get('status') ?? 'Available';
    const search = searchParams.get('q');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const condition = searchParams.get('condition');
    const urgent = searchParams.get('urgent');
    const page = parseInt(searchParams.get('page') ?? '1');
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '20'), 50);
    const sort = searchParams.get('sort') ?? 'newest';

    // Build filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};

    if (status !== 'all') filter.status = status;
    if (category) filter.category = category;
    if (hostel) filter.hostel = hostel;
    if (condition) filter.condition = condition;
    if (urgent === 'true') filter.isUrgent = true;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseInt(minPrice);
      if (maxPrice) filter.price.$lte = parseInt(maxPrice);
    }
    if (search) {
      filter.$text = { $search: search };
    }

    // Sort
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sortMap: Record<string, any> = {
      newest: { isUrgent: -1, createdAt: -1 },
      oldest: { createdAt: 1 },
      'price-asc': { price: 1 },
      'price-desc': { price: -1 },
    };

    const skip = (page - 1) * limit;
    const [listings, total] = await Promise.all([
      Listing.find(filter).sort(sortMap[sort] ?? sortMap.newest).skip(skip).limit(limit).lean(),
      Listing.countDocuments(filter),
    ]);

    return NextResponse.json({
      listings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('GET /api/listings error:', err);
    return NextResponse.json({ error: 'Failed to fetch listings' }, { status: 500 });
  }
}

// POST /api/listings — create a new listing
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();

    const {
      title, description, price, originalPrice,
      category, condition, images, seller,
      hostel, wing, preferredPickup,
      isUrgent, tags,
    } = body;

    // Basic validation
    if (!title || !description || price == null || !category || !condition || !seller || !hostel) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const listing = await Listing.create({
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      originalPrice: originalPrice ? Number(originalPrice) : undefined,
      category,
      condition,
      images: images ?? [],
      seller,
      hostel,
      wing,
      preferredPickup,
      isUrgent: Boolean(isUrgent),
      tags: Array.isArray(tags) ? tags : [],
      status: 'Available',
    });

    return NextResponse.json(listing, { status: 201 });
  } catch (err) {
    console.error('POST /api/listings error:', err);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}
