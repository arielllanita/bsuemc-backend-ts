import { RequestHandler } from 'express';
import FormService from '@/services/form.service';
// import { Form } from '@/interfaces/form.interface';

class FormController {
  public readonly formService = new FormService();

  public addForm: RequestHandler = async (req, res, next) => {
    try {
      const formType = req.body.type;
      const formPath: any = req.files;
      const form = await this.formService.add_form(formPath, formType);

      res.status(201).json({ data: form, message: 'Form added successfully!' });
    } catch (error) {
      next(error);
      // TODO: Remove uploaded form if error occur
    }
  };

  public updateForm: RequestHandler = async (req, res, next) => {
    try {
      const updateObj = req.files;
      const formID = req.params.id;
      const form = await this.formService.update_form(formID, updateObj);

      res.status(200).json({ data: form, message: 'Form updated successfully!' });
    } catch (error) {
      next(error);
    }
  };

  public removeForm: RequestHandler = async (req, res, next) => {
    try {
      const formID = req.params.id;
      await this.formService.remove_form(formID);

      res.status(200).json({ message: 'Form removed successfully!' });
    } catch (error) {
      next(error);
    }
  };

  public showAllForm: RequestHandler = async (req, res, next) => {
    try {
      const forms = await this.formService.show_all_form();

      res.status(200).json({ data: forms, message: 'Form list' });
    } catch (error) {
      next(error);
    }
  };

  public showFormByType: RequestHandler = async (req, res, next) => {
    try {
      const formType = req.params.type;
      const forms = await this.formService.show_form_by_type(formType);

      res.status(200).json(forms);
    } catch (error) {
      next(error);
    }
  };
}

export default FormController;
