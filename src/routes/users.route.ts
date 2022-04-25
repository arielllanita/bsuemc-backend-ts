import { RequestHandler, Router } from 'express';
import UsersController from '@controllers/users.controller';
import { UserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';

class UsersRoute implements Routes {
  public readonly path = '/users';
  public router = Router();
  public usersController = new UsersController();
  public authAndValidateMiddleware: RequestHandler[] = [authMiddleware, validationMiddleware(UserDto, 'body')];

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, this.usersController.getUsers);
    this.router.get(`${this.path}/:id`, this.usersController.getUserById);
    this.router.get(`${this.path}/:role/role`, this.usersController.getUserByRole);
    this.router.post(`${this.path}`, this.authAndValidateMiddleware, this.usersController.createUser);
    // this.router.post(`${this.path}`, validationMiddleware(UserDto, 'body'), this.usersController.createUser);
    this.router.put(`${this.path}/:id`, validationMiddleware(UserDto, 'body', true), this.usersController.updateUser);
    this.router.delete(`${this.path}/:id`, this.usersController.deleteUser);
  }
}

export default UsersRoute;
