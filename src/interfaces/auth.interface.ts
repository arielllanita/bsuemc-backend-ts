import { Request } from 'express';
import { User } from '@interfaces/users.interface';
import { Types } from 'mongoose';

export interface DataStoredInToken {
  _id: string | Types.ObjectId;
}

export interface TokenData {
  token: string;
  expiresIn: number;
}

export interface RequestWithUser extends Request {
  user: User;
}
