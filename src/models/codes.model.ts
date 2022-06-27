import { Code } from '@/interfaces/codes.interface';
import { model, Schema } from 'mongoose';

const codeSchema = new Schema<Code>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    code: { type: String, trim: true, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

const codesModel = model<Code>('Code', codeSchema);

export default codesModel;
