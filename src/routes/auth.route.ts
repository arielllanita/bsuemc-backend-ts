import { Router } from 'express';
import AuthController from '@controllers/auth.controller';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import validationMiddleware from '@middlewares/validation.middleware';
import { LoginDto } from '@/dtos/auth.dto';
import { loginLimit } from '@/middlewares/loginLimit.middleware';

class AuthRoute implements Routes {
  public path = '/auth';
  public router = Router();
  public authController = new AuthController();
  public loginMiddlewares = [loginLimit, validationMiddleware(LoginDto, 'body', true, false, false)];

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/login`, this.loginMiddlewares, this.authController.logIn);
    this.router.post(`${this.path}/logout`, this.authController.logOut);
    this.router.get(`${this.path}/verify-jwt`, authMiddleware, this.authController.verifyJwt);
    this.router.delete(`${this.path}/unlock/:code`, this.authController.unlockAccount)
  }
}

export default AuthRoute;
