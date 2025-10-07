import { Request, Response } from 'express';
import { PaymentService } from '../services/PaymentService';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export class PaymentController {
  static async create(req: Request, res: Response) {
    try {
      const payment = await PaymentService.create(req.body);
      res.status(201).json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const user = req.user;
      const payments = await PaymentService.getAll(user);
      res.json(payments);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const payment = await PaymentService.getById(Number(req.params.id));
      if (!payment) return res.status(404).json({ error: 'Paiement non trouvé' });
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
