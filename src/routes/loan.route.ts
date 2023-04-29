import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import authMiddleware from '@middlewares/auth.middleware';
import { uploadDocs } from '@/utils/uploadDocs';
import LoanController from '@/controllers/loan.controller';
import { upload } from '@/utils/upload';

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
    this.router.get(`${this.path}/non-pending`, authMiddleware, this.loanController.showNonPendingLoans);
    this.router.get(`${this.path}/history/:applicantID`, authMiddleware, this.loanController.showLoanHistory);
    this.router.get(`${this.path}/pending`, authMiddleware, this.loanController.showPendingLoans);
    this.router.put(`${this.path}/approve/:id`, authMiddleware, this.loanController.approveLoan);
    this.router.put(`${this.path}/reject/:id`, authMiddleware, this.loanController.rejectLoan);
    this.router.post(`${this.path}/apply`, authMiddleware, upload.fields([{ name: 'docs' }]), this.loanController.applyLoan);
    this.router.post(`${this.path}/post-payment/:loanId`, authMiddleware, this.loanController.postPayment);
    this.router.get(`${this.path}/post-payment`, authMiddleware, this.loanController.showPostedPayment);
  }
}

export default LoanRoute;
