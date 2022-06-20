import { Form } from '@/interfaces/form.interface';
import { model, Schema } from 'mongoose';

const formSchema = new Schema<Form>(
  {
    docs: [],
    type: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  },
);

const formModel = model<Form>('Form', formSchema);

export default formModel;
