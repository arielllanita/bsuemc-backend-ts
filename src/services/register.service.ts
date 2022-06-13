/* eslint-disable @typescript-eslint/no-unused-vars */
import { randomBytes } from 'crypto';
import { hash } from 'bcrypt';
import { HttpException } from '@/exceptions/HttpException';
import { Register } from '@/interfaces/register.interface';
import { User } from '@/interfaces/users.interface';
import registerModel from '@/models/register.model';
import userModel from '@/models/users.model';
import { sendEmail } from '@/utils/mailer';

class RegisterService {
  public async approve_membership(memberShipID: string, officer: any): Promise<User> {
    const user = await registerModel.findById(memberShipID).lean();
    if (!user) throw new HttpException(400, 'Invalid Membership ID.');

    await registerModel.findByIdAndUpdate(memberShipID, { $set: { status: 'Approved', transact_by: officer } });

    const currentData = (({ _id, docs, status, transact_by, ...rest }) => rest)(user);
    const plainPassword = randomBytes(6).toString('hex');
    const hashedPassword = await hash(plainPassword, 9);
    const userCredentials = await userModel.create({ ...currentData, role: 'member', password: hashedPassword });

    // await sendEmail({
    //   recipientEmail: user.email,
    //   subject: 'Membership status 📣',
    //   text: `Good day! We would like to inform you that your membership application at BSU EMC was approved and you can avail our loan offers by using your account. Below are your account credentials, please do not share them with anyone.\n\nUsername: ${user.email}\nPassword: ${plainPassword}\n\n\n-- The Management.`,
    // });

    return userCredentials;
  }

  public async decline_membership(memberShipID: string, message: string | any, officer: any) {
    const user = await registerModel.findById(memberShipID).lean();
    if (!user) throw new HttpException(400, 'Invalid Membership ID.');

    const inCharge = await userModel.findById(officer).select('firstname lastname').lean();
    if (!inCharge) throw new HttpException(400, 'Invalid Officer ID');

    const status = await registerModel.findByIdAndUpdate(memberShipID, { $set: { status: 'Declined', transact_by: officer } });

    // await sendEmail({
    //   recipientEmail: user.email,
    //   subject: 'Membership status 📣',
    //   text: `Good day! We are sorry to inform you that your membership application at BSU EMC was declined. Below are the additional information about your request.\n\nOfficer in charge: ${inCharge.firstname} ${inCharge.lastname}\nMessage: ${message}\n\n\n-- The Management.`,
    // });

    return status;
  }

  public async apply_membership(data: Register, files: Express.Multer.File[]) {
    const docs = [];
    files.forEach(element => {
      const file = {
        fileName: element.originalname,
        filePath: element.path,
        fileType: element.mimetype,
      };
      docs.push(file);
    });

    const doc = await registerModel.create({ ...data, docs });

    return doc;
  }

  public async show_applicants_by_status(status = 'Pending') {
    const applicants = await registerModel.find({ status }).lean();

    return applicants;
  }
}

export default RegisterService;
