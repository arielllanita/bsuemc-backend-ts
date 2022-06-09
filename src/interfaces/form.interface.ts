import { Types } from 'mongoose';

export interface Form {
  _id: string | Types.ObjectId;
  type: string;
  docs: string[];
}
