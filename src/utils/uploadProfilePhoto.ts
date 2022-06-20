import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/profile_photos',
  filename: (req, file, cb) => {
    const user = req.params.id || req.body.email;
    const fileName = file.originalname.replace(/ /g, '-');
    cb(null, `${user}-${fileName}`);
  },
});

export const uploadProfilePhoto = multer({ storage: storage });
