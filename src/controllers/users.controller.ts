import { RequestHandler } from 'express';
import { UserDto } from '@dtos/users.dto';
import { User } from '@interfaces/users.interface';
import UserService from '@services/users.service';

class UsersController {
  public readonly userService = new UserService();

  /**
   * @description Retrieves all users
   */
  public getUsers: RequestHandler = async (req, res, next) => {
    try {
      const findAllUsersData: User[] = await this.userService.findAllUser();

      res.status(200).json({ data: findAllUsersData, message: 'findAll' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @description Gets user by ID
   */
  public getUserById: RequestHandler = async (req, res, next) => {
    try {
      const userId: string = req.params.id;
      const findOneUserData: User = await this.userService.findUserById(userId);

      res.status(200).json({ data: findOneUserData, message: 'findOne' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @description Retrieve user by role
   */
  public getUserByRole: RequestHandler = async (req, res, next) => {
    try {
      const role: string = req.params.role;
      const users: User[] = await this.userService.findUserByRole(role);

      res.status(200).json({ data: users, message: 'user by role' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @description Create user
   */
  public createUser: RequestHandler = async (req, res, next) => {
    try {
      const userData: User = req.body;
      const profile_photo: any = req.file.path;
      const createUserData: User = await this.userService.createUser(userData, profile_photo);

      res.status(201).json({ data: createUserData, message: 'created' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @description Update user data
   */
  public updateUser: RequestHandler = async (req, res, next) => {
    try {
      const userId: string = req.params.id;
      const userData: UserDto = req.body;
      const profile_photo: string = req.file.path ? req.file.path : '';
      const updateUserData: User = await this.userService.updateUser(userId, { ...userData, profile_photo });

      res.status(200).json({ data: updateUserData, message: 'updated' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * @description Delete user
   */
  public deleteUser: RequestHandler = async (req, res, next) => {
    try {
      const userId: string = req.params.id;
      const deleteUserData: User = await this.userService.deleteUser(userId);

      res.status(200).json({ data: deleteUserData, message: 'deleted' });
    } catch (error) {
      next(error);
    }
  };

  public re_activate_user: RequestHandler = async (req, res, next) => {
    try {
      const userId: string = req.params.id;
      const userData: User = await this.userService.reActivateUser(userId);

      res.status(200).json({ data: userData, message: 're-activate user' });
    } catch (error) {
      next(error);
    }
  };
}

export default UsersController;
