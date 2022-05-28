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
    this.router.get(`${this.path}/rejected`, authMiddleware, this.loanController.showRejectedLoans);
    this.router.get(`${this.path}/approved`, authMiddleware, this.loanController.showApprovedLoans);
    this.router.get(`${this.path}/pending`, authMiddleware, this.loanController.showPendingLoans);
    this.router.post(`${this.path}/apply`, authMiddleware, uploadDocs.array('docs'), this.loanController.applyLoan);
    this.router.put(`${this.path}/approve/:id`, authMiddleware, this.loanController.approveLoan);
    this.router.put(`${this.path}/reject/:id`, authMiddleware, this.loanController.rejectLoan);
  }
}

export default LoanRoute;
