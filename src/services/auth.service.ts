import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CORS_CONFIG, FRONTEND, SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
import { LeanDocument } from 'mongoose';
import codesModel from '@/models/codes.model';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/utils/mailer';

class AuthService {
  public async login(userData: any, remainingAttempts: any): Promise<{ user: User; token: string }> {
    if (isEmpty(userData)) throw new HttpException(400, 'Please provide the correct data.');

    const validEmail: LeanDocument<User> = await userModel.findOne({ email: userData.email }).lean();
    const validPassword: boolean = await compare(userData.password, validEmail.password);
    if (!validEmail) throw new HttpException(409, 'Invalid email');

    const isLockedAccount = await codesModel.exists({ user: validEmail._id, type: 'ACCOUNT LOCK' });

    if (isLockedAccount) {
      if (isEmpty(userData?.code)) throw new HttpException(429, 'Please provide a code');

      const validCode = await codesModel.exists({ user: validEmail._id, code: userData?.code });
      if (!validCode) throw new HttpException(409, 'Invalid code.');

      // remove code after verification
      await codesModel.findByIdAndRemove(isLockedAccount);
    } else if (!validPassword) {
      throw new HttpException(409, `Invalid password, ${+remainingAttempts + 1} remaining attempt(s)`);
    }

    const tokenData = this.createToken(validEmail);
    delete validEmail.password;

    return { user: validEmail, token: tokenData };
  }

  public async create_reset_pw_id(email: string) {
    if (isEmpty(email)) throw new HttpException(400, 'Please provide an email');

    const user = await userModel.findOne({ email }).lean();
    if (!user) throw new HttpException(409, 'Invalid email');

    const code = uuidv4();
    const passwordID = await codesModel.create({ user: user._id, type: 'RESET PASSWORD', code });

    await sendEmail({
      recipientEmail: user.email,
      subject: 'Reset Password 🔓',
      text: `Good day! To reset your account's password please click the link to proceed. Please note that this link is only available for 15 mins and afterwards will be automatically invalidated.\n\n${FRONTEND}/reset-password/${code}`,
    });

    return passwordID;
  }

  protected createToken(user: User): string {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;

    return sign(dataStoredInToken, secretKey, { expiresIn: '3 days' });
  }

  protected createCookie(tokenData: string): string {
    return `Authorization=${tokenData}; Max-age=; HttpOnly; SameSite=None; Secure; Path=/;`;
  }
}

export default AuthService;
