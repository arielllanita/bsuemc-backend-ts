import { HttpException } from '@/exceptions/HttpException';
import { Loan } from '@/interfaces/loan.interface';
import loanModel from '@/models/loan.model';
import userModel from '@/models/users.model';
import { firstDateOfWeek } from '@/utils/date';
import { sendEmail } from '@/utils/mailer';
import { endOfMonth, endOfWeek, startOfMonth, startOfWeek } from 'date-fns';
import { PipelineStage, FilterQuery } from 'mongoose';
// import { Loan } from '@interfaces/loan.interface';

class LoanService {
  public async show_rejected_loans() {
    const rejectedLoans = await loanModel.aggregate([
      { $match: { isPending: false, isApproved: false } },
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
        $group: {
          _id: '$type',
          total: { $count: {} },
          label: { $first: '$label' },
          applicant: { $push: '$$ROOT' },
        },
      },
    ]);

    return rejectedLoans;
  }

  public async show_approved_loans(weekFilter?: string | any, monthFilter?: string | any) {
    const pipeline: PipelineStage[] = [
      { $match: { isPending: false, isApproved: true } },
      {
        $lookup: {
          from: 'users',
          localField: 'applicant',
          foreignField: '_id',
          as: 'applicant',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'transactBy',
          foreignField: '_id',
          as: 'officer_in_charge',
        },
      },
      { $unwind: '$applicant' },
      { $unwind: '$officer_in_charge' },
      {
        $group: {
          _id: '$type',
          total: { $count: {} },
          label: { $first: '$label' },
          applicant: { $push: '$$ROOT' },
        },
      },
    ];

    if (weekFilter || monthFilter) {
      const filter = weekFilter?.split('W');
      const weekNum = weekFilter ? filter[1] : null;
      const year = weekFilter ? filter[0].slice(0, filter[0].length - 1) : null;
      pipeline.splice(5, 0, {
        $match: {
          createdAt: {
            $gte: weekFilter ? startOfWeek(firstDateOfWeek(+weekNum, +year)) : startOfMonth(new Date(monthFilter)),
            $lte: weekFilter ? endOfWeek(firstDateOfWeek(+weekNum, +year)) : endOfMonth(new Date(monthFilter)),
          },
        },
      });
    }

    const approvedLoans = await loanModel.aggregate(pipeline);

    return approvedLoans;
  }

  public async show_non_pending_loans(options = {}) {
    const loans = await loanModel
      .find({ isPending: false, ...options })
      .populate('transactBy')
      .lean();

    return loans;
  }

  public async apply_loan(files: Express.Multer.File[], texts: any) {
    const docs = [];
    files.forEach(element => {
      const file = {
        fileName: element.originalname,
        filePath: element.path,
        fileType: element.mimetype,
        fileSize: this.fileSizeFormatter(element.size, 2),
      };
      docs.push(file);
    });
    const doc = await loanModel.create({ ...texts, docs });

    return doc;
  }

  public async approve_loan(loanID: string, officerID: string | any, additionalInfo: any) {
    const doc = await loanModel.findByIdAndUpdate(
      loanID,
      {
        $set: {
          isApproved: true,
          isPending: false,
          transactBy: officerID,
          additioinalInfo: {
            effective_date: new Date(),
            installment_amount: +additionalInfo?.installment_amount,
            first_due_date: new Date(additionalInfo?.first_due_dat),
            last_due_date: new Date(additionalInfo?.last_due_date),
            message: additionalInfo?.message || '',
          },
        },
      },
      { new: true },
    );
    if (!doc) throw new HttpException(409, 'Invalid Loan ID');

    const inCharge = await userModel.findById(officerID).select('firstname lastname').lean();
    if (!inCharge) throw new HttpException(400, 'Invalid Officer ID');

    const user = await userModel.findById(doc.applicant).select('email');
    await sendEmail({
      recipientEmail: user.email,
      subject: 'Loan Approval 🎉',
      text: `Good day! We would like to inform you that your loan application for ${
        doc.label
      } was successfully approved. Below are the additional information of the transaction.\n\nOfficer in-charge: ${inCharge.firstname} ${
        inCharge.lastname
      }\nMessage: ${additionalInfo?.message || ''}\n\n\n-- The Management`,
    });

    return doc;
  }

  public async reject_loan(loanID: string, officerID: string | any, message: string | any) {
    const doc = await loanModel.findByIdAndUpdate(loanID, {
      $set: {
        isApproved: false,
        isPending: false,
        transactBy: officerID,
        status: 'rejected',
        additioinalInfo: { effective_date: new Date(), message },
      },
    });
    if (!doc) throw new HttpException(409, 'Invalid Loan ID');

    const inCharge = await userModel.findById(officerID).select('firstname lastname').lean();
    if (!inCharge) throw new HttpException(400, 'Invalid Officer ID');

    const user = await userModel.findById(doc.applicant).select('email');
    await sendEmail({
      recipientEmail: user.email,
      subject: 'Loan Status 📣',
      text: `Good day! We are sorry inform you that your loan application for ${doc.label} was declined. Below are the details of your request.\n\nOfficer in-charge: ${inCharge.firstname} ${inCharge.lastname}\nMessage: ${message}\n\n\n-- The Management`,
    });

    return doc;
  }

  public async show_loan_history(applicantID: string | any, month: any) {
    const query: FilterQuery<Loan> = { applicant: applicantID, isPending: false };
    if (month) {
      query.createdAt = { $gte: startOfMonth(new Date(month)), $lte: endOfMonth(new Date(month)) };
    }
    const transactions = await loanModel.find(query).populate('transactBy').sort({ createdAt: 'asc' });

    return transactions;
  }

  public fileSizeFormatter = (bytes: number, decimal: number) => {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const dm = decimal || 2;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'YB', 'ZB'];
    const index = Math.floor(Math.log(bytes) / Math.log(1000));
    return parseFloat((bytes / Math.pow(1000, index)).toFixed(dm)) + ' ' + sizes[index];
  };
}

export default LoanService;
