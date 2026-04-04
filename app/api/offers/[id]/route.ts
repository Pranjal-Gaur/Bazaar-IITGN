import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Offer from '@/models/Offer';
import Listing from '@/models/Listing';
import User from '@/models/User';
import Message from '@/models/Message';

type Params = { params: Promise<{ id: string }> };

// PATCH /api/offers/[id] — accept | reject | counter | confirm-handshake
export async function PATCH(req: NextRequest, { params }: Params) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  await connectDB();

  const offer = await Offer.findById(id);
  if (!offer) return NextResponse.json({ error: 'Offer not found' }, { status: 404 });

  const { action, counterPrice, counterMessage } = await req.json();
  const isBuyer = offer.buyer.email === session.user.email;
  const isSeller = offer.seller.email === session.user.email;

  if (!isBuyer && !isSeller) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let systemMsg = '';

  switch (action) {
    case 'accept':
      if (!isSeller) return NextResponse.json({ error: 'Only seller can accept' }, { status: 403 });
      if (!['pending', 'countered'].includes(offer.status)) {
        return NextResponse.json({ error: 'Cannot accept in current state' }, { status: 400 });
      }
      offer.status = 'accepted';
      offer.finalPrice = offer.counterPrice ?? offer.proposedPrice;
      // Reserve the listing
      await Listing.findByIdAndUpdate(offer.listing, { status: 'Reserved' });
      // Reject all other pending offers on same listing (concurrency safe)
      await Offer.updateMany(
        { listing: offer.listing, _id: { $ne: offer._id }, status: { $in: ['pending', 'countered'] } },
        { status: 'rejected' }
      );
      systemMsg = `✅ Offer accepted! Deal at ₹${offer.finalPrice?.toLocaleString()}. Arrange a meetup to complete the trade.`;
      break;

    case 'reject':
      if (!isSeller && !isBuyer) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      offer.status = 'rejected';
      systemMsg = `❌ Offer declined.`;
      break;

    case 'counter':
      if (!isSeller) return NextResponse.json({ error: 'Only seller can counter' }, { status: 403 });
      if (offer.status !== 'pending') {
        return NextResponse.json({ error: 'Can only counter a pending offer' }, { status: 400 });
      }
      if (!counterPrice) return NextResponse.json({ error: 'counterPrice is required' }, { status: 400 });
      offer.status = 'countered';
      offer.counterPrice = Number(counterPrice);
      offer.counterMessage = counterMessage;
      systemMsg = `🔄 Counter-offer: ₹${Number(counterPrice).toLocaleString()}${counterMessage ? ` — "${counterMessage}"` : ''}`;
      break;

    case 'confirm-handshake':
      if (offer.status !== 'accepted') {
        return NextResponse.json({ error: 'Offer must be accepted first' }, { status: 400 });
      }
      if (isBuyer) offer.buyerConfirmed = true;
      if (isSeller) offer.sellerConfirmed = true;

      // Both confirmed → complete
      if (offer.buyerConfirmed && offer.sellerConfirmed) {
        offer.status = 'completed';
        await Listing.findByIdAndUpdate(offer.listing, { status: 'Sold' });
        // Bump karma for both
        await Promise.all([
          User.findOneAndUpdate({ email: offer.buyer.email }, { $inc: { karmaScore: 5, totalPurchases: 1 } }),
          User.findOneAndUpdate({ email: offer.seller.email }, { $inc: { karmaScore: 5, totalSales: 1 } }),
        ]);
        systemMsg = `🤝 Trade verified! Both parties confirmed. Rate each other now.`;
      } else {
        systemMsg = isBuyer
          ? `🙋 Buyer confirmed receipt. Waiting for seller confirmation.`
          : `🙋 Seller confirmed handoff. Waiting for buyer confirmation.`;
      }
      break;

    default:
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  }

  await offer.save();

  // Save system message
  if (systemMsg) {
    await Message.create({
      roomId: offer.roomId,
      listing: offer.listing,
      sender: { id: session.user.id, name: 'System', email: 'system@bazaar', image: '' },
      content: systemMsg,
      type: 'system',
      offerId: offer._id,
    });
  }

  // Broadcast to room
  if (global.io) {
    global.io.to(offer.roomId).emit('offer-state-changed', offer.toObject());
  }

  return NextResponse.json(offer);
}
