import multer from 'multer';
import * as fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { HttpException } from '@/exceptions/HttpException';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir =
      file.fieldname === 'profile_photo' // For uploading profile photo
        ? 'uploads/profile_photos'
        : file.fieldname === 'forms' || file.fieldname === 'form' // For form uploading
        ? 'uploads/forms'
        : file.fieldname === 'docs' // For uploading loan documents (loan application)
        ? path.join('uploads/docs/', req.body.type)
        : cb(new HttpException(400, 'Invalid field name'), '');

    if (dir && !fs.existsSync(dir)) {
      fs.mkdir(dir, { recursive: true }, err => cb(err, dir));
    } else {
      cb(null, dir || '');
    }
  },
  filename: (req, file, cb) => {
    if (file.fieldname === 'forms' || file.fieldname === 'form') {
      // For form uploading
      const formType = req.body.type;
      const fileName = file.originalname.replace(/ /g, '-');
      cb(null, `${formType}-${uuidv4()}-${fileName}`);
    }
    if (file.fieldname === 'profile_photo') {
      // For uploading profile photos
      const fileName = file.originalname.replace(/ /g, '-');
      cb(null, `${uuidv4()}-${fileName}`);
    } 
    if (file.fieldname === 'docs') {
      // For uploading loan documents (loan application)
      const fileName = file.originalname.replace(/ /g, '-');
      cb(null, `${uuidv4()}-${fileName}`);
    }
  },
});

export const upload = multer({ storage: storage });
