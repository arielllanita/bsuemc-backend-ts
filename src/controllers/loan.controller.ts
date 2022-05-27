import { Loan } from '@/interfaces/loan.interface';
import LoanService from '@/services/loan.service';
import { RequestHandler } from 'express';

class LoanController {
  public readonly loanService = new LoanService();

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
}

export default LoanController;
