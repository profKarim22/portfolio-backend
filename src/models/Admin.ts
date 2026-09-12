import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IAdmin extends Document {
  email: string;
  passwordHash: string;
  matchPassword(enteredPassword: string): Promise<boolean>;
}

const adminSchema = new Schema<IAdmin>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  }
}, { timestamps: true });

adminSchema.methods.matchPassword = async function (enteredPassword: string) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

export default mongoose.model<IAdmin>('Admin', adminSchema);
