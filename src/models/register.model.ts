import { Register } from '@/interfaces/register.interface';
import { model, Schema } from 'mongoose';

const registerSchema = new Schema<Register>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    docs: [],

    status: { type: String, default: 'Pending' },
    transact_by: { type: Schema.Types.ObjectId, ref: 'User', default: null },

    school_id: { type: String, required: [true, 'School id is required'], unique: true },

    birthday: { type: Date, required: [true, 'Birthday is required'] },
    cellNumber: { type: String, required: [true, 'Password is required'] },
    profile_photo: { type: String, required: [true, 'Profile pic is required'] },

    province: { type: String, required: true },
    city: { type: String, required: true },
    barangay: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const registerModel = model<Register>('Register', registerSchema);

export default registerModel;
