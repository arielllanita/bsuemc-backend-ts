import { Types } from 'mongoose';

export interface User {
  _id: Types.ObjectId | string;
  firstname: string;
  lastname: string;
  email: string;
  password: string;
  isDeactivated: boolean;
  transact_by: Types.ObjectId | string;
  docs: any[];
  role: 'member' | 'admin' | 'staff';
  school_id?: string; // Include if role is member or staff
  birthday: Date;
  cellNumber: string;
  province: string;
  city: string;
  barangay: string;
  profile_photo: string;
}
