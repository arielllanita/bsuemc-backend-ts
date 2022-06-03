import { DB_URI } from '@config';
import { connect } from 'mongoose';

export const connectDB = async () => {
  try {
    await connect(DB_URI);
  } catch (err) {
    process.exit(1);
  }
};
