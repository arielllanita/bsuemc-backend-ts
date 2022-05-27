import { RequestWithUser } from '@/interfaces/auth.interface';
import multer from 'multer';
import path from 'path';
import format from 'date-fns/format';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const directory = path.join('uploads/docs/', req.body.type);
    cb(null, directory);
  },
  filename: (req: RequestWithUser, file, cb) => {
    const dateTime = format(new Date(), 'MMM-dd-yyyy-hh-mm-aa');
    const userID = req.user._id;
    const fileName = file.originalname;
    cb(null, `${dateTime}-${userID}-${fileName}`);
  },
});

export const uploadDocs = multer({ storage: storage });
