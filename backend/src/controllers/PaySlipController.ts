import { Request, Response } from 'express';
import { PaySlipService } from '../services/PaySlipService';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export class PaySlipController {
  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { status } = req.query;
      const payslips = await PaySlipService.getAll({
        status: status as string,
        user: req.user // Passer l'utilisateur pour filtrer selon le rôle
      });
      res.json(payslips);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const payslip = await PaySlipService.getById(Number(req.params.id));
      if (!payslip) return res.status(404).json({ error: 'Bulletin non trouvé' });
      res.json(payslip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const payslip = await PaySlipService.update(Number(req.params.id), req.body);
      res.json(payslip);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await PaySlipService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}