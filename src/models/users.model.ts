import { model, Schema } from 'mongoose';
import { User } from '@interfaces/users.interface';
import { capitalCase } from 'change-case';

const userSchema = new Schema<User>(
  {
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    email: { type: String, required: [true, 'Email is required'], unique: true },
    password: { type: String, required: [true, 'Password is required'] },
    isDeactivated: { type: Boolean, default: false },

    transact_by: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    docs: [],

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

userSchema.pre('save', function (next) {
  this.firstname = capitalCase(this.firstname);
  this.lastname = capitalCase(this.lastname);
  this.province = capitalCase(this.province);
  this.city = capitalCase(this.city);
  this.barangay = capitalCase(this.barangay);

  next();
});

const userModel = model<User>('User', userSchema);

export default userModel;
