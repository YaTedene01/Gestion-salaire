import { Request, Response } from 'express';
import { PaySlipService } from '../services/PaySlipService';
import { PaySlipGenerator } from '../utils/paySlipGenerator';

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

  static async generatePDF(req: Request, res: Response) {
    try {
      const payslip = await PaySlipService.getById(Number(req.params.id));
      if (!payslip) {
        return res.status(404).json({ error: 'Bulletin de salaire non trouvé' });
      }

      const pdfUrl = await PaySlipGenerator.generatePaySlipPDF({
        company: {
          name: payslip.employee.company.name,
          logo: payslip.employee.company.logo || undefined,
          address: payslip.employee.company.address || undefined,
          currency: payslip.employee.company.currency
        },
        employee: {
          fullName: payslip.employee.fullName,
          position: payslip.employee.position,
          id: payslip.employee.id
        },
        paySlip: {
          id: payslip.id,
          grossSalary: payslip.grossSalary,
          deductions: payslip.deductions,
          netSalary: payslip.netSalary,
          daysWorked: payslip.daysWorked || undefined,
          createdAt: payslip.createdAt
        },
        payRun: {
          name: payslip.payRun.name,
          startDate: payslip.payRun.startDate,
          endDate: payslip.payRun.endDate,
          periodType: payslip.payRun.periodType
        },
        payments: payslip.payments
      });

      res.json({ pdfUrl });
    } catch (error: any) {
      console.error('PDF generation error:', error);
      res.status(500).json({ error: 'Erreur lors de la génération du PDF' });
    }
  }
}