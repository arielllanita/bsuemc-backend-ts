import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos');
  },
  filename: (req, file, cb) => {
    const userID = req.params.id;
    const fileName = file.originalname;
    cb(null, `${userID}-${fileName}`);
  },
});

export const uploadProfilePhoto = multer({ storage: storage });
