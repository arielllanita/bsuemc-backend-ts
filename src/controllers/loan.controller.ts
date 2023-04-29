// import { Loan } from '@/interfaces/loan.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import loanModel from '@/models/loan.model';
import LoanService from '@/services/loan.service';
import { RequestHandler } from 'express';
import { isEmpty } from '@utils/util';
import paymentPostingModel from '@/models/payment-posting.model';
import { sendEmail } from '@/utils/mailer';
import { format } from 'date-fns';
import { HttpException } from '@/exceptions/HttpException';

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
      const { start, end } = req.query;
      // console.log('QUERY', req.query);

      const approvedLoans = await this.loanService.show_approved_loans(start, end);

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

  public postPayment: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const inCharge = req.user;
      const { month, loanId, applicant, loanInfo } = req.body;

      if (await paymentPostingModel.exists({ month, loanId })) {
        throw new HttpException(400, 'Payment posting for this month was already posted.');
      }

      await paymentPostingModel.create({ postedBy: inCharge._id, month, loanId });
      await sendEmail({
        recipientEmail: applicant?.email,
        subject: 'Payment Posting 📣',
        text: `Good day! We are happy to inform you that your payment for ${loanInfo?.loan_type} for the month of ${format(
          new Date(month),
          'MMMM, yyyy',
        )} was posted.\n\nOfficer in-charge: ${inCharge.firstname} ${inCharge.lastname}\n\n-- The Management`,
      });
      res.status(200).json({ message: 'Posted successfully!' });
    } catch (err) {
      next(err);
    }
  };

  public showPostedPayment: RequestHandler = async (req, res, next) => {
    try {
      const data = await paymentPostingModel.find({}).sort({ createdAt: -1 }).lean();
      res.status(200).json({ data, message: 'history' });
    } catch (error) {
      next(error);
    }
  };
}

export default LoanController;
