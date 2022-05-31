import { model, Schema } from 'mongoose';
import { User } from '@interfaces/users.interface';

const userSchema = new Schema<User>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'] },
    isDeactivated: { type: Boolean, default: false },

    role: { type: String, required: [true, 'Role is required'], enum: ['member', 'admin', 'staff'] },
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

const userModel = model<User>('User', userSchema);

export default userModel;
