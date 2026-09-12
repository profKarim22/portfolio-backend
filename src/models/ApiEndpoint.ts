import mongoose, { Document, Schema } from 'mongoose';

export interface IApiEndpoint extends Document {
  key: string;
  data: any;
}

const apiEndpointSchema = new Schema<IApiEndpoint>({
  key: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
}, { timestamps: true });

export default mongoose.model<IApiEndpoint>('ApiEndpoint', apiEndpointSchema);
