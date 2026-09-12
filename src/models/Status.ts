import mongoose, { Document, Schema } from 'mongoose';

export interface IStatus extends Document {
  mode: string;
  modes: {
    [key: string]: {
      label: string;
      color: string;
      borderColor: string;
      bgColor: string;
    };
  };
}

const statusSchema = new Schema<IStatus>({
  mode: { type: String, required: true },
  modes: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model<IStatus>('Status', statusSchema);
