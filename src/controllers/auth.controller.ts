import { RequestHandler } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import { LoginDto } from '@/dtos/auth.dto';
import { loginLimit } from '@/middlewares/loginLimit.middleware';
import codesModel from '@/models/codes.model';
import { HttpException } from '@/exceptions/HttpException';
import userModel from '@/models/users.model';
import { isEmpty } from '@/utils/util';
import { add } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import { sendEmail } from '@/utils/mailer';
import { CORS_CONFIG } from '@/config';
import { hash } from 'bcrypt';

class AuthController {
  public readonly authService = new AuthService();

  public logIn: RequestHandler = async (req, res, next) => {
    try {
      const userData: LoginDto = req.body;
      const remainingLoginAttempts = req['rateLimit']?.remaining;
      const { user, token } = await this.authService.login(userData, remainingLoginAttempts);

      loginLimit.resetKey(req.ip);

      res.cookie('Authorization', token, { expires: add(new Date(), { days: 3 }), httpOnly: true, sameSite: 'none', secure: true });
      res.status(200).json({ data: user, token, message: 'Login successfully!' });
    } catch (error) {
      next(error);
    }
  };

  public logOut: RequestHandler = async (req, res, next) => {
    try {
      res.cookie('Authorization', '', { maxAge: 0, sameSite: 'none', secure: true, httpOnly: true });

      res.status(200).json({ message: 'Logout successfully' });
    } catch (error) {
      next(error);
    }
  };

  public verifyJwt: RequestHandler = (req: RequestWithUser, res, next) => {
    try {
      const userData: User = req.user;
      res.status(200).json({ data: userData, message: 'Verify jwt' });
    } catch (error) {
      next(error);
    }
  };

  public resetPassword: RequestHandler = async (req, res, next) => {
    try {
      const { password, userID } = req.body;
      if (isEmpty(password)) throw new HttpException(400, 'Please provide a password');
      if (isEmpty(userID)) throw new HttpException(400, 'Invalid Link');

      const encrypted = await hash(password, 10);
      await userModel.findByIdAndUpdate(userID, { $set: { password: encrypted } });

      res.sendStatus(200);
    } catch (error) {
      next(error);
    }
  };

  public verifyResetPwId: RequestHandler = async (req, res, next) => {
    try {
      const { code } = req.params;
      if (isEmpty(code)) throw new HttpException(400, 'Invalid Link');

      const validID = await codesModel.findOne({ code }).lean();
      if (!validID) throw new HttpException(409, 'Invalid Link');
      await codesModel.findByIdAndRemove(validID._id);

      res.status(200).json({ userID: validID.user, message: 'Reset password ID is valid' });
    } catch (error) {
      next(error);
    }
  };

  public createResetPwId: RequestHandler = async (req, res, next) => {
    let codeID = null;
    try {
      const email = req.body?.email;
      if (isEmpty(email)) throw new HttpException(400, 'Please provide an email');

      const user = await userModel.findOne({ email }).lean();
      if (!user) throw new HttpException(409, 'Invalid email');

      const code = uuidv4();
      codeID = await codesModel.create({ user: user._id, type: 'RESET PASSWORD', code });

      await sendEmail({
        recipientEmail: user.email,
        subject: 'Reset Password 🔓',
        text: `Good day! To reset your account's password please click the link to proceed. Please note that this link is only available for 15 mins and afterwards will be automatically invalidated.\n\n${CORS_CONFIG.origin[0]}/reset-password/${code}`,
      });

      res.status(201).json({ message: 'A link was sent to your email to reset your password.' });
    } catch (error) {
      codesModel
        .findByIdAndRemove(codeID?._id)
        .then(() => next(error))
        .catch(err => next(err || error));
    }
  };
}

export default AuthController;
