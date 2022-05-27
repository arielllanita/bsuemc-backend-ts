import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { uploadDocs } from '@/utils/upload';
import LoanController from '@/controllers/loan.controller';

class LoanRoute implements Routes {
  public path = '/loan';
  public router = Router();
  public loanController = new LoanController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.all(`${this.path}`, authMiddleware).post('/apply', uploadDocs.array('docs'), this.loanController.applyLoan);
    this.router.post(`${this.path}/apply`, authMiddleware, uploadDocs.array('docs'), this.loanController.applyLoan);
  }
}

export default LoanRoute;
