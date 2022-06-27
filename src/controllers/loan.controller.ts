// import { Loan } from '@/interfaces/loan.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import loanModel from '@/models/loan.model';
import LoanService from '@/services/loan.service';
import { RequestHandler } from 'express';
import { isEmpty } from '@utils/util';

class LoanController {
  public readonly loanService = new LoanService();

  public showRejectedLoans: RequestHandler = async (req, res, next) => {
    try {
      const rejectedLoans = await this.loanService.show_rejected_loans();
      res.status(200).json({ data: rejectedLoans, message: 'List of rejected loans' });
    } catch (error) {
      next(error);
    }
  };

  public showApprovedLoans: RequestHandler = async (req, res, next) => {
    try {
      const { weekFilter, monthFilter } = req.query;
      const approvedLoans = await this.loanService.show_approved_loans(weekFilter, monthFilter);

      res.status(200).json({ data: approvedLoans, message: 'List of approved loans' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Can be use to retrieve non-pending loans (for all members) and active loans for a specific member
   */
  public showNonPendingLoans: RequestHandler = async (req, res, next) => {
    try {
      const options = req.query || {};
      const loans = await this.loanService.show_non_pending_loans(options);

      res.status(200).json({ data: loans, message: 'Non pending loans' });
    } catch (error) {
      next(error);
    }
  };

  public showPendingLoans: RequestHandler = async (req, res, next) => {
    try {
      const options = isEmpty(req.query) || {};
      const loans = await loanModel
        .find({ isPending: true, ...options })
        .populate('applicant')
        .lean();
      res.status(200).json({ data: loans, message: 'List of all pending loans' });
    } catch (error) {
      next(error);
    }
  };

  public applyLoan: RequestHandler = async (req, res, next) => {
    try {
      // const files: any = req.files;
      const files = req.files['docs'];
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
      const additionalInfo = req.body;
      await this.loanService.approve_loan(loanID, officerID, additionalInfo);

      res.status(200).json({ message: 'Loan application successfully approved.' });
    } catch (error) {
      next(error);
    }
  };

  public rejectLoan: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const loanID = req.params.id;
      const officerID = req.user._id;
      const message = req.query?.message;
      await this.loanService.reject_loan(loanID, officerID, message);

      res.status(200).json({ message: 'Loan application successfully rejected.' });
    } catch (error) {
      next(error);
    }
  };

  public showLoanHistory: RequestHandler = async (req, res, next) => {
    try {
      const applicantID = req.params?.applicantID;
      const month = req.query?.month;
      const history = await this.loanService.show_loan_history(applicantID, month);

      res.status(200).json({ data: history, message: 'Loan history' });
    } catch (error) {
      next(error);
    }
  };
}

export default LoanController;
