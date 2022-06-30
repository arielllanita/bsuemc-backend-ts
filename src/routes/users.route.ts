import { Router } from 'express';
import UsersController from '@controllers/users.controller';
import { UserDto } from '@dtos/users.dto';
import { Routes } from '@interfaces/routes.interface';
import validationMiddleware from '@middlewares/validation.middleware';
import authMiddleware from '@/middlewares/auth.middleware';
// import { uploadProfilePhoto } from '@/utils/uploadProfilePhoto';
import { upload } from '@/utils/upload';

class UsersRoute implements Routes {
  public readonly path = '/users';
  public router = Router();
  public usersController = new UsersController();
  public authAndValidateMiddleware: any[] = [
    authMiddleware,
    validationMiddleware(UserDto, 'body', true, false, false),
    // uploadProfilePhoto.single('profile_photo'),
  ];

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, authMiddleware, this.usersController.getUsers);
    this.router.get(`${this.path}/:id`, authMiddleware, this.usersController.getUserById);
    this.router.get(`${this.path}/:role/role`, authMiddleware, this.usersController.getUserByRole);
    // this.router.post(`${this.path}`, this.authAndValidateMiddleware, this.usersController.createUser);
    this.router.put(`${this.path}/:id`, authMiddleware, upload.fields([{ name: 'profile_photo', maxCount: 1 }]), this.usersController.updateUser);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.usersController.deleteUser);
    this.router.put(`${this.path}/activate/:id`, authMiddleware, this.usersController.re_activate_user);
  }
}

export default UsersRoute;
