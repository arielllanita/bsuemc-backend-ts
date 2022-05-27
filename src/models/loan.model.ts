import { Loan } from '@/interfaces/loan.interface';
import { model, Schema } from 'mongoose';

const loanSchema = new Schema<Loan>(
  {
    isPending: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: false },
    applicant: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    docs: [],
    type: { type: String, required: true },
    transactBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
  },
);

const loanModel = model<Loan>('Loan', loanSchema);

export default loanModel;
