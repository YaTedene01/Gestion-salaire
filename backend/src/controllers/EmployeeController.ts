import { Request, Response } from 'express';
import { EmployeeService } from '../services/EmployeeService';
import csv from 'csv-parser';
import fs from 'fs';
import path from 'path';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export class EmployeeController {
  static async create(req: AuthRequest, res: Response) {
    try {
      // Check if user has company access
      if (!req.user?.companyId) {
        return res.status(403).json({ error: 'Accès entreprise requis pour créer un employé' });
      }

      const employeeData = { ...req.body, companyId: req.user.companyId };
      const employee = await EmployeeService.create(employeeData);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const { isActive, position, contractType } = req.query;

      // For super admins, don't filter by companyId to allow them to see employees
      // when they have company access
      const filters: any = {
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        position: position as string,
        contractType: contractType as any,
      };

      if (req.user?.role !== 'SUPER_ADMIN') {
        filters.companyId = req.user?.companyId;
      }

      const employees = await EmployeeService.getAll(filters);
      res.json(employees);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.getById(Number(req.params.id));
      if (!employee) return res.status(404).json({ error: 'Employé non trouvé' });
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.update(Number(req.params.id), req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await EmployeeService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async setActive(req: Request, res: Response) {
    try {
      const { isActive } = req.body;
      const employee = await EmployeeService.setActive(Number(req.params.id), isActive);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Generate QR code for a specific employee
   */
  static async generateQRCode(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.id);
      const qrCodeDataURL = await EmployeeService.generateEmployeeQRCode(employeeId);
      res.json({ qrCode: qrCodeDataURL });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Get QR code for an employee
   */
  static async getQRCode(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.id);
      const qrCodeDataURL = await EmployeeService.getEmployeeQRCode(employeeId);

      if (!qrCodeDataURL) {
        return res.status(404).json({ error: 'QR code non trouvé pour cet employé' });
      }

      res.json({ qrCode: qrCodeDataURL });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  /**
   * Generate QR codes for all employees in the company
   */
  static async generateAllQRCodes(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.companyId) {
        return res.status(400).json({ error: 'Utilisateur non associé à une entreprise' });
      }

      const result = await EmployeeService.generateAllEmployeeQRCodes(req.user.companyId);
      res.json({
        message: `${result.generated} QR codes générés avec succès`,
        generated: result.generated,
        failed: result.failed
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async import(req: AuthRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Fichier CSV requis' });
      }

      const results: any[] = [];
      const errors: string[] = [];

      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
          const imported = [];
          for (let i = 0; i < results.length; i++) {
            const row = results[i];
            try {
              const employeeData = {
                fullName: row.fullName?.trim(),
                position: row.position?.trim(),
                contractType: row.contractType?.trim() || 'FIXE',
                salary: parseFloat(row.salary),
                bankDetails: row.bankDetails?.trim() || '',
                companyId: req.user?.companyId!,
                isActive: true
              };

              // Basic validation
              if (!employeeData.fullName || !employeeData.position || isNaN(employeeData.salary)) {
                errors.push(`Ligne ${i + 1}: Données invalides`);
                continue;
              }

              const employee = await EmployeeService.create(employeeData);
              imported.push(employee);
            } catch (err: any) {
              errors.push(`Ligne ${i + 1}: ${err.message}`);
            }
          }

          // Delete the uploaded file
          fs.unlinkSync(req.file!.path);

          res.json({
            message: `${imported.length} employés importés avec succès`,
            imported: imported.length,
            errors
          });
        })
        .on('error', (error) => {
          res.status(400).json({ error: 'Erreur lors de la lecture du fichier CSV' });
        });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
