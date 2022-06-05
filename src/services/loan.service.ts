import { HttpException } from '@/exceptions/HttpException';
import loanModel from '@/models/loan.model';
import userModel from '@/models/users.model';
import { sendEmail } from '@/utils/mailer';
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
          applicant: { $push: '$applicant' },
        },
      },
    ]);

    return rejectedLoans;
  }

  public async show_approved_loans() {
    const approvedLoans = await loanModel.aggregate([
      { $match: { isPending: false, isApproved: true } },
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
          applicant: { $push: '$applicant' },
        },
      },
    ]);

    return approvedLoans;
  }

  public async apply_loan(files: any, texts: any) {
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

  public async approve_loan(loanID: string, officerID: string | any) {
    const doc = await loanModel.findByIdAndUpdate(loanID, { $set: { isApproved: true, isPending: false, transactBy: officerID } });
    if (!doc) throw new HttpException(409, 'Invalid Loan ID');

    const user = await userModel.findById(doc.applicant).select('email');
    sendEmail({
      recipientEmail: user.email,
      subject: 'Loan Approval 🎉',
      text: `Good day we would like to inform you that your loan applicantion for ${doc.label} was successfully approved. \n\n- The Management`,
    })
      .then(() => {
        return doc;
      })
      .catch(err => {
        throw new HttpException(500, err?.message || 'Error occurred while sending email.');
      });
  }

  public async reject_loan(loanID: string, officerID: string | any) {
    const doc = await loanModel.findByIdAndUpdate(loanID, { $set: { isApproved: false, isPending: false, transactBy: officerID } });
    return doc;
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
