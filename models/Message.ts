import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage extends Document {
  roomId: string;
  listing: mongoose.Types.ObjectId;
  sender: {
    id: mongoose.Types.ObjectId;
    name: string;
    email: string;
    image?: string;
  };
  content: string;
  type: 'text' | 'offer' | 'system';
  offerId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    roomId: { type: String, required: true, index: true },
    listing: { type: Schema.Types.ObjectId, ref: 'Listing', required: true },
    sender: {
      id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      name: { type: String, required: true },
      email: { type: String, required: true },
      image: { type: String },
    },
    content: { type: String, required: true, maxlength: 2000 },
    type: { type: String, enum: ['text', 'offer', 'system'], default: 'text' },
    offerId: { type: Schema.Types.ObjectId, ref: 'Offer' },
  },
  { timestamps: true }
);

MessageSchema.index({ roomId: 1, createdAt: 1 });

const Message: Model<IMessage> =
  mongoose.models.Message ?? mongoose.model<IMessage>('Message', MessageSchema);

export default Message;
