import { RequestWithUser } from '@/interfaces/auth.interface';
import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos');
  },
  filename: (req: RequestWithUser, file, cb) => {
    const userID = req.user._id;
    const fileName = file.originalname;
    cb(null, `${userID}-${fileName}`);
  },
});

export const uploadProfilePhoto = multer({ storage: storage });
