import { Form } from '@/interfaces/form.interface';
import formModel from '@/models/form.model';
import JSZip from 'jszip';
import path from 'path';
import * as fsAsync from 'fs/promises';
import { HttpException } from '@/exceptions/HttpException';

class FormService {
  public readonly zip = new JSZip();

  public async add_form(formPath: Express.Multer.File[], type: string): Promise<Form> {
    const docs = [];
    formPath.forEach(v => {
      const path = { fileName: v.originalname, filePath: v.path, fileType: v.mimetype };
      docs.push(path);
    });

    const form = await formModel.create({ type, docs });

    return form;
  }

  public async update_form(formID: string, updateObj: any): Promise<Form> {
    const docs = [];
    updateObj.forEach(v => {
      const path = { fileName: v.originalname, filePath: v.path, fileType: v.mimetype };
      docs.push(path);
    });

    const form = await formModel.findByIdAndUpdate(formID, { $set: { docs } }, { new: true });

    return form;
  }

  public async remove_form(formID: string): Promise<Form> {
    const form = await formModel.findByIdAndRemove(formID);

    return form;
  }

  public async show_all_form(): Promise<Form[]> {
    const forms = await formModel.find({});

    return forms;
  }

  public async show_form_by_type(formType: string) {
    const forms = await formModel.findOne({ type: formType }).lean();
    if (!forms) throw new HttpException(400, 'Invalid form type.');

    await Promise.all(
      forms.docs.map(async doc => {
        const dir = path.join(__dirname, '../../', doc['filePath']);
        const content = await fsAsync.readFile(dir);
        this.zip.file(doc['fileName'], content);
      }),
    );

    const base64 = await this.zip.generateAsync({ type: 'base64' });

    return 'data:application/zip;base64,' + base64;
  }
}

export default FormService;
