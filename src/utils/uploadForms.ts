import multer from 'multer';

const storage = multer.diskStorage({
  destination: 'uploads/forms',
  filename: (req, file, cb) => {
    const formType = req.body.type;
    const fileName = file.originalname.replace(/ /g, '-');
    cb(null, `${formType}-${fileName}`);
  },
});

export const uploadForms = multer({ storage: storage });
