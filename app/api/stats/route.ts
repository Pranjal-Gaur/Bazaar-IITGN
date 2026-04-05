import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Listing from '@/models/Listing';
import User from '@/models/User';
import Offer from '@/models/Offer';

export async function GET() {
  try {
    await connectDB();

    const [activeListings, communityMembers, successfulTrades, savingsData] = await Promise.all([
      Listing.countDocuments({ status: 'Available' }),
      User.countDocuments(),
      Offer.countDocuments({ status: 'completed' }),
      Offer.aggregate([
        { $match: { status: 'completed', originalPrice: { $gt: 0 } } },
        {
          $project: {
            savingsPct: {
              $multiply: [
                { $divide: [{ $subtract: ['$originalPrice', { $ifNull: ['$finalPrice', '$proposedPrice'] }] }, '$originalPrice'] },
                100,
              ],
            },
          },
        },
        { $group: { _id: null, avgSavings: { $avg: '$savingsPct' } } },
      ]),
    ]);

    const avgSavings = savingsData[0]?.avgSavings ?? 0;

    return NextResponse.json({
      activeListings,
      communityMembers,
      successfulTrades,
      avgSavings: Math.round(Math.max(0, avgSavings)),
    });
  } catch (err) {
    console.error('GET /api/stats error:', err);
    return NextResponse.json({ activeListings: 0, communityMembers: 0, successfulTrades: 0, avgSavings: 0 });
  }
}
