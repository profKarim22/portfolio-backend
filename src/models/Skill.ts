import mongoose, { Document, Schema } from 'mongoose';

export interface ISkill extends Document {
  primary_domain_backend: string[];
  backend_tools_and_data: string[];
  foundations_and_algorithms: string[];
  applied_and_exploratory: string[];
}

const skillSchema = new Schema<ISkill>({
  primary_domain_backend: [String],
  backend_tools_and_data: [String],
  foundations_and_algorithms: [String],
  applied_and_exploratory: [String],
}, { timestamps: true });

export default mongoose.model<ISkill>('Skill', skillSchema);
