import mongoose, { Document, Schema } from 'mongoose';

export interface IProject extends Document {
  id: string; // The frontend string ID (e.g. "algorithmic-storytelling")
  title: string;
  badge: string;
  domain: string;
  domainColor: string;
  description: string;
  featured: boolean;
  isFeatured: boolean;
  metrics: { label: string; value: string }[];
  highlights: string[];
  tech: string[];
  techStack: string[];
  github: string;
  githubUrl: string;
  liveDemo: string;
  liveUrl: string;
  figmaLink: string | null;
  figmaUrl: string | null;
  order: number;
}

const projectSchema = new Schema<IProject>({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  badge: { type: String },
  domain: { type: String },
  domainColor: { type: String },
  description: { type: String },
  featured: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  metrics: [{ label: String, value: String }],
  highlights: [{ type: String }],
  tech: [{ type: String }],
  techStack: [{ type: String }],
  github: { type: String },
  githubUrl: { type: String },
  liveDemo: { type: String },
  liveUrl: { type: String },
  figmaLink: { type: String, default: null },
  figmaUrl: { type: String, default: null },
  order: { type: Number, default: 0 },
}, { timestamps: true });

export default mongoose.model<IProject>('Project', projectSchema);
