import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@/middlewares/auth.middleware';
import RegisterController from '@/controllers/register.controller';
import { upload } from '@/utils/upload';

class RegisterRoute implements Routes {
  public readonly path = '/register';
  public router = Router();
  public registerController = new RegisterController();
  public uploadMiddleware = upload.fields([
    { name: 'profile_photo', maxCount: 1 },
    { name: 'docs', maxCount: 5 },
  ]);

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, this.uploadMiddleware, this.registerController.applyMembership);
    this.router.put(`${this.path}/approve/:memberShipID`, authMiddleware, this.registerController.approvedMembership);
    this.router.put(`${this.path}/decline/:memberShipID`, authMiddleware, this.registerController.declineMembership);
  }
}

export default RegisterRoute;
