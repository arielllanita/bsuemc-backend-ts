import { NextFunction, Request, Response } from 'express';
import { CreateUserDto } from '@dtos/users.dto';
import { RequestWithUser } from '@interfaces/auth.interface';
import { User } from '@interfaces/users.interface';
import AuthService from '@services/auth.service';

class AuthController {
  public readonly authService = new AuthService();
  
    public async logIn (req: Request, res: Response, next: NextFunction) {
    try {
      const userData: CreateUserDto = req.body;
      const { cookie, findUser } = await this.authService.login(userData);

      res.setHeader('Set-Cookie', [cookie]);
      res.status(200).json({ data: findUser, message: 'Login successfully!' });
    } catch (error) {
      next(error);
    }
  };

    public async logOut (req: RequestWithUser, res: Response, next: NextFunction) {
    try {
      const userData: User = req.user;
      await this.authService.logout(userData);

      res.setHeader('Set-Cookie', ['Authorization=; Max-age=0']);
      res.status(200).json({ message: 'Logout successfully' });
    } catch (error) {
      next(error);
    }
  };
}

export default AuthController;
