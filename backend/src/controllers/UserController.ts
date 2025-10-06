import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import { Role } from '../generated/prisma';

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;
    companyId?: number;
  };
}

export class UserController {
  static async create(req: Request, res: Response) {
    try {
      const { email, password, role, companyId } = req.body;
      const user = await UserService.create({
        email,
        password,
        role: role as Role,
        companyId: companyId ? Number(companyId) : undefined
      });
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getAll(req: AuthRequest, res: Response) {
    try {
      const companyId = req.user?.role === 'SUPER_ADMIN' ? undefined : req.user?.companyId;
      const users = await UserService.getAll(companyId);
      res.json(users);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const user = await UserService.getById(Number(req.params.id));
      if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const user = await UserService.update(Number(req.params.id), req.body);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      await UserService.delete(Number(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}