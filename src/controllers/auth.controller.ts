import { RequestHandler } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import { LoginDto } from '@/dtos/auth.dto';
import { loginLimit } from '@/middlewares/loginLimit.middleware';
import codesModel from '@/models/codes.model';
import { CORS_CONFIG } from '@/config';

class AuthController {
  public readonly authService = new AuthService();

  public logIn: RequestHandler = async (req, res, next) => {
    try {
      const userData: LoginDto = req.body;
      const remainingLoginAttempts = req['rateLimit']?.remaining;
      const { findUser, token, cookie } = await this.authService.login(userData, remainingLoginAttempts);

      loginLimit.resetKey(req.ip);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, token, message: 'Login successfully!' });
    } catch (error) {
      next(error);
    }
  };

  public logOut: RequestHandler = async (req, res, next) => {
    try {
      // const frontendUrl = new URL(CORS_CONFIG.origin as string);
      // const domainName = frontendUrl.hostname.replace(/^[^.]+\./g, '');
      res.setHeader('Set-Cookie', [`Authorization=; Max-age=0; Domain=.herokuapp.com; SameSite=None; Secure; Path=/;`]);

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

  public unlockAccount: RequestHandler = async (req, res, next) => {
    try {
      const { code } = req.params;
      await codesModel.findOneAndRemove({ code });

      res.status(200).json({ message: 'Unlock account' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
