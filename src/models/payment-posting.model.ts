import { model, Schema } from 'mongoose';

const paymentPostingSchema = new Schema(
  {
    postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    month: { type: String, required: true },
    loanId: { type: Schema.Types.ObjectId, ref: 'Loan', required: true },
    proof_of_payment: [],
  },
  {
    timestamps: true,
  },
);

const paymentPostingModel = model('payment_postings', paymentPostingSchema);

export default paymentPostingModel;
