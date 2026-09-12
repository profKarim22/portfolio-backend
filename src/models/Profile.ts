import mongoose, { Document, Schema } from 'mongoose';

export interface IProfile extends Document {
  name: string;
  title: string;
  education: {
    institute: string;
    location: string;
    level: string;
    major: string;
  };
  primary_focus: string;
  technical_core: {
    backend: string[];
    databases: string[];
    systems_foundation: string[];
    exploratory: string[];
  };
  status: string;
}

const profileSchema = new Schema<IProfile>({
  name: { type: String, required: true },
  title: { type: String, required: true },
  education: {
    institute: String,
    location: String,
    level: String,
    major: String,
  },
  primary_focus: String,
  technical_core: {
    backend: [String],
    databases: [String],
    systems_foundation: [String],
    exploratory: [String],
  },
  status: String,
}, { timestamps: true });

export default mongoose.model<IProfile>('Profile', profileSchema);
