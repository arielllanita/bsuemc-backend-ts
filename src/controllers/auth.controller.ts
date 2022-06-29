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
      res.cookie('Authorization', '', { maxAge: 0, sameSite: 'none', secure: true, httpOnly: true })
      
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
      await userModel.findByIdAndUpdate(userID, { $set: { password } });

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
    try {
      await this.authService.create_reset_pw_id(req.body?.email);

      res.status(201).json({ message: 'Reset password ID created successfully!' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
