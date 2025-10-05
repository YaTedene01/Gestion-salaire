import { Request, Response } from 'express';
import { EmployeeService } from '../services/EmployeeService';

export class EmployeeController {
  static async create(req: Request, res: Response) {
    try {
      const employee = await EmployeeService.create(req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const { isActive, position, contractType } = req.query;
      const employees = await EmployeeService.getAll({
        isActive: isActive !== undefined ? isActive === 'true' : undefined,
        position: position as string,
        contractType: contractType as any,
      });
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
}
