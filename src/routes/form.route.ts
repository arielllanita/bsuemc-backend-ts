import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import FormController from '@/controllers/form.controller';
import { uploadForms } from '@/utils/uploadForms';

class FormRoute implements Routes {
  public path = '/form';
  public router = Router();
  public formController = new FormController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}`, authMiddleware, uploadForms.array('form'), this.formController.addForm);
    this.router.put(`${this.path}/:id`, authMiddleware, uploadForms.array('form'), this.formController.updateForm);
    this.router.delete(`${this.path}/:id`, authMiddleware, this.formController.removeForm);
    this.router.get(`${this.path}/show`, authMiddleware, this.formController.showAllForm);
    this.router.get(`${this.path}/type/:type`, this.formController.showFormByType);
  }
}

export default FormRoute;
