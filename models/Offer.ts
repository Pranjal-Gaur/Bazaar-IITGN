import mongoose, { Schema, Document, Model } from 'mongoose';

export type OfferStatus =
  | 'pending'
  | 'countered'
  | 'accepted'
  | 'rejected'
  | 'completed'
  | 'expired';

export interface IOffer extends Document {
  listing: mongoose.Types.ObjectId;
  buyer: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    hostel: string;
  };
  seller: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  originalPrice: number;
  proposedPrice: number;
  counterPrice?: number;
  finalPrice?: number;
  status: OfferStatus;
  message?: string;
  counterMessage?: string;
  // Verified handshake
  buyerConfirmed: boolean;
  sellerConfirmed: boolean;
  roomId: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const OfferSchema = new Schema<IOffer>(
  {
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    buyer: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      hostel: { type: String, default: '' },
    },
    seller: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    originalPrice: { type: Number, required: true },
    proposedPrice: { type: Number, required: true },
    counterPrice: { type: Number },
    finalPrice: { type: Number },
    status: {
      type: String,
      enum: ['pending', 'countered', 'accepted', 'rejected', 'completed', 'expired'],
      default: 'pending',
    },
    message: { type: String, maxlength: 500 },
    counterMessage: { type: String, maxlength: 500 },
    buyerConfirmed: { type: Boolean, default: false },
    sellerConfirmed: { type: Boolean, default: false },
    roomId: { type: String, required: true },
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 48 * 60 * 60 * 1000), // 48h
    },
  },
  { timestamps: true }
);

OfferSchema.index({ listing: 1, status: 1 });
OfferSchema.index({ 'buyer.id': 1 });
OfferSchema.index({ 'seller.id': 1 });
OfferSchema.index({ expiresAt: 1 });

const Offer: Model<IOffer> =
  mongoose.models.Offer ?? mongoose.model<IOffer>('Offer', OfferSchema);

export default Offer;
