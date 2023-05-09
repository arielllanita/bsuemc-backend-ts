// import { Loan } from '@/interfaces/loan.interface';
import { RequestWithUser } from '@/interfaces/auth.interface';
import loanModel from '@/models/loan.model';
import LoanService from '@/services/loan.service';
import { RequestHandler } from 'express';
import { isEmpty } from '@utils/util';
import paymentPostingModel from '@/models/payment-posting.model';
import { sendEmail } from '@/utils/mailer';
import { differenceInMonths, format } from 'date-fns';
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
      const payedLoans = await paymentPostingModel.find({}).lean();

      res.status(200).json({ data: loans, payedLoans, message: 'Non pending loans' });
    } catch (error) {
      next(error);
    }
  };

  public showPendingLoans: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const loans = await loanModel
        .find({ isPending: true, ...req.query })
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
      const totalMonthsPayed = await paymentPostingModel.count({ loanId });
      const loan = await loanModel.findById(loanId).lean();
      const totalMonthsToPay = differenceInMonths(new Date(loan?.additioinalInfo?.last_due_date), new Date(loan?.additioinalInfo?.first_due_date));

      if (totalMonthsPayed >= totalMonthsToPay) {
        await loanModel.findByIdAndUpdate(loanId, { $set: { status: 'paid' } });
        throw new HttpException(400, 'This loan was already payed');
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
      res.status(200).json({ data: { totalMonthsPayed, totalMonthsToPay }, message: 'Posted successfully!' });
    } catch (err) {
      next(err);
    }
  };

  public showPostedPayment: RequestHandler = async (req, res, next) => {
    try {
      const data = await loanModel.aggregate([
        { $match: { isApproved: true } },
        {
          $lookup: {
            from: 'users',
            localField: 'transactBy',
            foreignField: '_id',
            as: 'transactBy',
          },
        },
        { $unwind: '$transactBy' },
        {
          $lookup: {
            from: 'users',
            localField: 'applicant',
            foreignField: '_id',
            as: 'applicant',
          },
        },
        { $unwind: '$applicant' },
        {
          $lookup: {
            from: 'payment_postings',
            let: { loanId: '$_id' },
            pipeline: [
              { $match: { $expr: { $eq: ['$loanId', '$$loanId'] } } },
              {
                $lookup: {
                  from: 'users',
                  localField: 'postedBy',
                  foreignField: '_id',
                  as: 'postedBy',
                },
              },
              { $unwind: '$postedBy' },
              { $sort: { createdAt: -1 } },
            ],
            as: 'payment_postings',
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      res.status(200).json({ data, message: 'history' });
    } catch (error) {
      next(error);
    }
  };
}

export default LoanController;
