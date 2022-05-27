import loanModel from '@/models/loan.model';
// import { Loan } from '@interfaces/loan.interface';

class LoanService {
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
    return doc;
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
