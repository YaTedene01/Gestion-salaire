import { Request, Response } from 'express';
import { PayRunService } from '../services/PayRunService';
import { PayRunStatus, PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export class PayRunController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const { name, startDate, endDate, periodType } = req.body;
      const payRun = await PayRunService.create({
        name,
        companyId: req.user?.companyId!,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        periodType,
      });
      res.status(201).json(payRun);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const payRuns = await PayRunService.getAll(req.user?.companyId);
      res.json(payRuns);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const payRun = await PayRunService.getById(Number(req.params.id));
      if (!payRun) return res.status(404).json({ error: 'Cycle de paie non trouvé' });
      res.json(payRun);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async generatePaySlips(req: Request, res: Response) {
    try {
      const paySlips = await PayRunService.generatePaySlips(Number(req.params.id));
      res.json({ message: `${paySlips.length} bulletins générés`, paySlips });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async approve(req: Request, res: Response) {
    try {
      console.log('Approving payrun', req.params.id);
      const payRun = await PayRunService.updateStatus(Number(req.params.id), PayRunStatus.APPROVED);
      console.log('Payrun updated, now updating payslips');
      // Also update all payslips to APPROVED status so they can be paid
      const updateResult = await prisma.paySlip.updateMany({
        where: { payRunId: Number(req.params.id) },
        data: { status: 'APPROVED' }
      });
      console.log('Updated payslips:', updateResult);
      res.json(payRun);
    } catch (error: any) {
      console.error('Approve error:', error);
      res.status(400).json({ error: error.message });
    }
  }

  static async close(req: Request, res: Response) {
    try {
      const payRun = await PayRunService.updateStatus(Number(req.params.id), PayRunStatus.CLOSED);
      res.json(payRun);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async updateStatus(req: Request, res: Response) {
    try {
      const { status } = req.body;
      if (status === 'APPROVED') {
        return PayRunController.approve(req, res);
      } else if (status === 'CLOSED') {
        return PayRunController.close(req, res);
      } else {
        return res.status(400).json({ error: 'Statut invalide' });
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getPaySlips(req: Request, res: Response) {
    try {
      const payrun = await PayRunService.getById(Number(req.params.id));
      if (!payrun) return res.status(404).json({ error: 'Cycle de paie non trouvé' });
      res.json(payrun.paySlips);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await PayRunService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}