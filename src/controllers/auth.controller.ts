import { RequestHandler } from 'express';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';
import { LoginDto } from '@/dtos/auth.dto';

class AuthController {
  public readonly authService = new AuthService();

  public logIn: RequestHandler = async (req, res, next) => {
    try {
      const userData: LoginDto = req.body;
      const { cookie, findUser } = await this.authService.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, message: 'Login successfully!' });
    } catch (error) {
      next(error);
    }
  };

  public logOut: RequestHandler = async (req, res, next) => {
    try {
      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
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
}

export default AuthController;
