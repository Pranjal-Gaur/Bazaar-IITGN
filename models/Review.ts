import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IReview extends Document {
  offer: mongoose.Types.ObjectId;
  listing: mongoose.Types.ObjectId;
  reviewer: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  reviewee: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
  };
  rating: 1 | 2 | 3 | 4 | 5;
  comment?: string;
  role: 'buyer' | 'seller'; // role of reviewer in the transaction
  createdAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    offer: { type: Schema.Types.ObjectId, ref: 'Offer', required: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    reviewer: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    reviewee: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
    },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, maxlength: 500 },
    role: { type: String, enum: ['buyer', 'seller'], required: true },
  },
  { timestamps: true }
);

// Prevent duplicate reviews per offer per reviewer
ReviewSchema.index({ offer: 1, 'reviewer.id': 1 }, { unique: true });
ReviewSchema.index({ 'reviewee.id': 1 });

const Review: Model<IReview> =
  mongoose.models.Review ?? mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
