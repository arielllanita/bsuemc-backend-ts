// import { Loan } from '@/interfaces/loan.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import loanModel from '@/models/loan.model';
import LoanService from '@/services/loan.service';
import { RequestHandler } from 'express';

class LoanController {
  public readonly loanService = new LoanService();

  public showPendingLoans: RequestHandler = async (req, res, next) => {
    try {
      const loans = await loanModel.find({ isPending: true }).lean();
      res.status(200).json({ data: loans, message: 'List of all pending loans' });
    } catch (error) {
      next(error);
    }
  };

  public applyLoan: RequestHandler = async (req, res, next) => {
    try {
      const files: any = req.files;
      const texts: string = req.body;
      await this.loanService.apply_loan(files, texts);

      res.status(201).json({ message: 'Application has been processed' });
    } catch (error) {
      next(error);
    }
  };

  public approveLoan: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const loanID = req.params.id;
      const officerID = req.user._id;
      await this.loanService.approve_loan(loanID, officerID);

      res.status(200).json({ message: 'Loan application successfully approved.' });
    } catch (error) {
      next(error);
    }
  };

  public rejectLoan: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const loanID = req.params.id;
      const officerID = req.user._id;
      await this.loanService.reject_loan(loanID, officerID);

      res.status(200).json({ message: 'Loan application successfully rejected.' });
    } catch (error) {
      next(error);
    }
  };
}

export default LoanController;