import { DB_HOST, DB_PORT, DB_DATABASE } from '@config';
import { connect } from 'mongoose';

export const connectDB = async () => {
  try {
    await connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_DATABASE}`);
  } catch (err) {
    process.exit(1);
  }
};
