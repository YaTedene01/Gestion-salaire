import { Request, Response } from 'express';
import path from 'path';
import { CompanyService } from '../services/CompanyService';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export class CompanyController {
  static async create(req: Request, res: Response) {
    try {
      console.log('BODY:', req.body);
      console.log('FILE:', req.file);
      const { name, address, currency, period, adminEmail, adminPassword, color } = req.body;
      let logo = req.body.logo;
      if (req.file) {
        // Stocke le chemin relatif du logo uploadé
        logo = `/uploads/${req.file.filename}`;
      }
      if (!adminEmail || !adminPassword) {
        return res.status(400).json({ error: 'Email et mot de passe admin obligatoires' });
      }
      const result = await CompanyService.createWithAdmin({
        name, logo, address, currency, period, adminEmail, adminPassword, color
      });
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      let companies: any[];
      if (req.user?.role === 'SUPER_ADMIN') {
        companies = await CompanyService.getAll();
      } else {
        // For admin and other roles, show only their company
        if (req.user?.companyId) {
          const company = await CompanyService.getById(req.user.companyId);
          companies = company ? [company] : [];
        } else {
          companies = [];
        }
      }
      res.json(companies);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const company = await CompanyService.getById(Number(req.params.id));
      if (!company) return res.status(404).json({ error: 'Entreprise non trouvée' });
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const company = await CompanyService.update(Number(req.params.id), req.body);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await CompanyService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async setActive(req: Request, res: Response) {
    try {
      const { isActive } = req.body;
      const company = await CompanyService.setActive(Number(req.params.id), isActive);
      res.json(company);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
