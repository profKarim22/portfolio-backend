import mongoose, { Document, Schema } from 'mongoose';

export interface IRefreshToken extends Document {
  token: string;
  admin: mongoose.Types.ObjectId;
  expiresAt: Date;
  revoked: boolean;
  revokedAt?: Date;
  ip?: string;
  userAgent?: string;
}

const refreshTokenSchema = new Schema<IRefreshToken>({
  token: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  admin: {
    type: Schema.Types.ObjectId,
    ref: 'Admin',
    required: true,
    index: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: '0s' }, // MongoDB automatic TTL cleanup
  },
  revoked: {
    type: Boolean,
    default: false,
    index: true,
  },
  revokedAt: {
    type: Date,
  },
  ip: {
    type: String,
  },
  userAgent: {
    type: String,
  },
}, { timestamps: true });

export default mongoose.model<IRefreshToken>('RefreshToken', refreshTokenSchema);
