import { Code } from '@/interfaces/codes.interface';
import { model, Schema } from 'mongoose';

const codeSchema = new Schema<Code>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    code: { type: String, required: true, unique: true },
    type: { type: String, required: true, enum: ['ACCOUNT LOCK', 'RESET PASSWORD'] },
    // Automatically delete after 15mins
    expireAt: { type: Date, default: Date.now, index: { expires: '15m' } },
  },
  {
    timestamps: true,
  },
);

const codesModel = model<Code>('Code', codeSchema);

export default codesModel;
