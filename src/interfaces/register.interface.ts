import { Types } from 'mongoose';

export interface Register {
  _id: string | Types.ObjectId;

  firstname: string;
  lastname: string;
  email: string;
  docs: any[];

  status: string; // has default
  transact_by: string | Types.ObjectId;

  school_id?: string;

  birthday: Date;
  cellNumber: string;
  profile_photo: string;

  province: string;
  city: string;
  barangay: string;
}
