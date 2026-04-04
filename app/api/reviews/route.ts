import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Review from '@/models/Review';
import Offer from '@/models/Offer';
import User from '@/models/User';

// GET /api/reviews?userId=xxx
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const userEmail = searchParams.get('email');

  await connectDB();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filter: any = {};
  if (userId) filter['reviewee.id'] = userId;
  if (userEmail) filter['reviewee.email'] = userEmail;

  const reviews = await Review.find(filter).sort({ createdAt: -1 }).lean();
  return NextResponse.json({ reviews });
}

// POST /api/reviews — submit a review after completed trade
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  await connectDB();
  const { offerId, rating, comment } = await req.json();

  if (!offerId || !rating) {
    return NextResponse.json({ error: 'offerId and rating are required' }, { status: 400 });
  }

  const offer = await Offer.findById(offerId);
  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });
  if (offer.status !== 'completed') {
    return NextResponse.json({ error: 'Can only review completed trades' }, { status: 400 });
  }

  const isBuyer = offer.buyer.email === session.user.email;
  const isSeller = offer.seller.email === session.user.email;
  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const reviewer = isBuyer ? offer.buyer : offer.seller;
  const reviewee = isBuyer ? offer.seller : offer.buyer;

  const review = await Review.create({
    offer: offerId,
    listing: offer.listing,
    reviewer: { id: reviewer.id, name: reviewer.name, email: reviewer.email },
    reviewee: { id: reviewee.id, name: reviewee.name, email: reviewee.email },
    rating,
    comment,
    role: isBuyer ? 'buyer' : 'seller',
  });

  // Update reviewee's average rating
  const allReviews = await Review.find({ 'reviewee.email': reviewee.email });
  const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
  await User.findOneAndUpdate(
    { email: reviewee.email },
    { rating: Math.round(avg * 10) / 10, ratingCount: allReviews.length }
  );

  return NextResponse.json(review, { status: 201 });
}
