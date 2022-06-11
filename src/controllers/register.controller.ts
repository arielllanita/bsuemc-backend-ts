import { RequestWithUser } from '@/interfaces/auth.interface';
import RegisterService from '@/services/register.service';
import { RequestHandler } from 'express';

class RegisterController {
  public readonly registerService = new RegisterService();

  public approvedMembership: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const officerInCharge = req.user._id;
      const memberShipID = req.params.memberShipID;
      const userCredentials = await this.registerService.approve_membership(memberShipID, officerInCharge);

      res.status(201).json({ data: userCredentials, message: 'Membership approved succesfull!' });
    } catch (error) {
      next(error);
    }
  };

  public declineMembership: RequestHandler = async (req: RequestWithUser, res, next) => {
    try {
      const officerInCharge = req.user._id;
      const memberShipID = req.params.memberShipID;
      const message = req.body.message;
      const status = await this.registerService.decline_membership(memberShipID, message, officerInCharge);

      res.status(200).json({ data: status, message: 'Membership succesfully declined!' });
    } catch (error) {
      next(error);
    }
  };

  public applyMembership: RequestHandler = async (req, res, next) => {
    try {
      const files = req?.files['docs'];
      const data = req.body;
      const profile_photo = req.files['profile_photo'][0]?.path;
      const doc = await this.registerService.apply_membership({ ...data, profile_photo }, files);

      res.status(201).json({ data: doc, message: 'Membership application sent succesfully!' });
    } catch (error) {
      next(error);
    }
  };
}

export default RegisterController;
