import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  hostel?: string;
  wing?: string;
  phone?: string;
  bio?: string;
  karmaScore: number;
  role: 'buyer' | 'seller' | 'admin';
  totalSales: number;
  totalPurchases: number;
  rating: number;
  ratingCount: number;
  isVerified: boolean;
  contactPreferences: {
    showPhone: boolean;
    showEmail: boolean;
    preferChat: boolean;
  };
  watchlist: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: (v: string) => v.endsWith('@iitgn.ac.in'),
        message: 'Only @iitgn.ac.in email addresses are allowed',
      },
    },
    image: { type: String },
    hostel: { type: String },
    wing: { type: String },
    phone: { type: String },
    bio: { type: String, maxlength: 300 },
    karmaScore: { type: Number, default: 10 },
    role: { type: String, enum: ['buyer', 'seller', 'admin'], default: 'buyer' },
    totalSales: { type: Number, default: 0 },
    totalPurchases: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
    isVerified: { type: Boolean, default: false },
    contactPreferences: {
      showPhone: { type: Boolean, default: false },
      showEmail: { type: Boolean, default: true },
      preferChat: { type: Boolean, default: true },
    },
    watchlist: [{ type: Schema.Types.ObjectId, ref: 'Listing' }],
  },
  { timestamps: true }
);

UserSchema.index({ email: 1 });
UserSchema.index({ karmaScore: -1 });

const User: Model<IUser> =
  mongoose.models.User ?? mongoose.model<IUser>('User', UserSchema);

export default User;
