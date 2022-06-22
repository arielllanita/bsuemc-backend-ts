import { Types } from 'mongoose';

export interface Loan {
  _id: string | Types.ObjectId;
  type: string;
  label: string;
  applicant: string | Types.ObjectId;
  docs: Types.Array<any>;
  createdAt?: string;
  isApproved: boolean;
  isPending: boolean;
  additioinalInfo: any;
  transactBy: string | Types.ObjectId;
  status: string;
}
