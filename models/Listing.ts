import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IListing extends Document {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: string;
  images: string[];
  seller: {
    name: string;
    email: string;
    hostel: string;
    karmaScore: number;
  };
  hostel: string;
  wing?: string;
  preferredPickup?: string;
  status: 'Available' | 'Reserved' | 'Sold';
  isUrgent: boolean;
  tags: string[];
  views: number;
  createdAt: Date;
  updatedAt: Date;
}

const ListingSchema = new Schema<IListing>(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0 },
    originalPrice: { type: Number, min: 0 },
    category: {
      type: String,
      required: true,
      enum: ['Electronics', 'Books', 'Cycles', 'Hostel Gear', 'Sports', 'Clothing', 'Others'],
    },
    condition: {
      type: String,
      required: true,
      enum: ['New', 'Like New', 'Good', 'Fair', 'Poor'],
    },
    images: [{ type: String }],
    seller: {
      name: { type: String, required: true },
      email: { type: String, required: true },
      hostel: { type: String, required: true },
      karmaScore: { type: Number, default: 0 },
    },
    hostel: { type: String, required: true },
    wing: { type: String },
    preferredPickup: { type: String },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },
    isUrgent: { type: Boolean, default: false },
    tags: [{ type: String, lowercase: true, trim: true }],
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes for fast queries
ListingSchema.index({ category: 1, status: 1 });
ListingSchema.index({ hostel: 1, status: 1 });
ListingSchema.index({ price: 1 });
ListingSchema.index({ createdAt: -1 });
ListingSchema.index({ isUrgent: -1, createdAt: -1 });
ListingSchema.index({ title: 'text', description: 'text', tags: 'text' });

const Listing: Model<IListing> =
  mongoose.models.Listing ?? mongoose.model<IListing>('Listing', ListingSchema);

export default Listing;
