import { compare } from 'bcrypt';
import { sign } from 'jsonwebtoken';
import { CORS_CONFIG, isProduction, SECRET_KEY } from '@config';
import { HttpException } from '@exceptions/HttpException';
import { DataStoredInToken } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import userModel from '@models/users.model';
import { isEmpty } from '@utils/util';
import { LeanDocument } from 'mongoose';
import { LoginDto } from '@/dtos/auth.dto';
import codesModel from '@/models/codes.model';

class AuthService {
  public async login(userData: any, remainingAttempts: any): Promise<{ cookie: string; findUser: User; token: string }> {
    if (isEmpty(userData)) throw new HttpException(400, 'Please provide the correct data.');

    const validEmail: LeanDocument<User> = await userModel.findOne({ email: userData.email }).lean();
    if (!validEmail) throw new HttpException(409, 'Invalid email');

    // determine if account is locked
    const isLocked = await codesModel.exists({ user: validEmail._id });
    // if locked ask for the code and verify
    if (isLocked) {
      if (isEmpty(userData?.code)) throw new HttpException(429, 'Please provide a code');
      
      const validCode = await codesModel.exists({ user: validEmail._id, code: userData?.code });
      if (!validCode) throw new HttpException(409, 'Invalid code.');

      // remove code after verification
      await codesModel.findByIdAndRemove(isLocked);
    }

    const validPassword: boolean = await compare(userData.password, validEmail.password);
    if (!validPassword) {
      throw new HttpException(409, `Invalid password, ${+remainingAttempts + 1} remaining attempt(s)`);
    }

    const tokenData = this.createToken(validEmail);
    const cookie = this.createCookie(tokenData);

    return { cookie, findUser: validEmail, token: tokenData };
  }

  protected createToken(user: User): string {
    const dataStoredInToken: DataStoredInToken = { _id: user._id };
    const secretKey: string = SECRET_KEY;
    // const expiresIn: number = 60 * 60;

    // return { expiresIn, token: sign(dataStoredInToken, secretKey, { expiresIn }) };
    return sign(dataStoredInToken, secretKey);
  }

  protected createCookie(tokenData: string): string {
    const frontendUrl = new URL(CORS_CONFIG.origin as string);
    const domainName = frontendUrl.hostname.replace(/^[^.]+\./g, '');

    return `Authorization=${tokenData}; HttpOnly; Domain=${domainName}; SameSite=None; Secure; Path=/;`;
  }
}

export default AuthService;
