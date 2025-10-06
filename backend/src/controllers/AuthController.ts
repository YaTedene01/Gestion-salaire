import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';
import { PrismaClient } from '../generated/prisma';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: string;
    companyId?: number;
  };
}

export class AuthController {
	static async register(req: Request, res: Response) {
		try {
			const { email, password, role } = req.body;
			const user = await AuthService.register(email, password, role);
			res.status(201).json({ user });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	static async login(req: Request, res: Response) {
		try {
			const { email, password } = req.body;
			const { user, token } = await AuthService.login(email, password);
			res.status(200).json({ user, token });
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	}

	static async getAllUsers(req: AuthRequest, res: Response) {
	  try {
	    let users;
	    if (req.user?.role === 'SUPER_ADMIN') {
	      // Super admin sees all users
	      users = await prisma.user.findMany({
	        select: {
	          id: true,
	          email: true,
	          role: true,
	          companyId: true,
	          isActive: true,
	          createdAt: true,
	        },
	      });
	    } else if (req.user?.companyId) {
	      // Company admin sees users from their company
	      users = await prisma.user.findMany({
	        where: { companyId: req.user.companyId },
	        select: {
	          id: true,
	          email: true,
	          role: true,
	          companyId: true,
	          isActive: true,
	          createdAt: true,
	        },
	      });
	    } else {
	      return res.status(403).json({ error: 'Accès refusé' });
	    }
	    res.json(users);
	  } catch (error: any) {
	    res.status(400).json({ error: error.message });
	  }
	}

	static async setActive(req: AuthRequest, res: Response) {
	  try {
	    const { isActive } = req.body;
	    const user = await prisma.user.update({
	      where: { id: Number(req.params.id) },
	      data: { isActive }
	    });
	    res.json(user);
	  } catch (error: any) {
	    res.status(400).json({ error: error.message });
	  }
	}

	static async deleteUser(req: AuthRequest, res: Response) {
	  try {
	    await prisma.user.delete({
	      where: { id: Number(req.params.id) }
	    });
	    res.status(204).send();
	  } catch (error: any) {
	    res.status(400).json({ error: error.message });
	  }
	}

	static async createAdmin(req: AuthRequest, res: Response) {
		try {
			console.log('createAdmin called with:', req.body);
			console.log('req.user:', req.user);
			const { email, password, role = 'ADMIN' } = req.body;

			// Si c'est un super admin, il peut créer des utilisateurs sans companyId
			// Sinon, utiliser sa propre companyId
			const companyId = req.user?.role === 'SUPER_ADMIN' ? undefined : req.user?.companyId;

			if (req.user?.role !== 'SUPER_ADMIN' && !req.user?.companyId) {
				console.log('No companyId in req.user');
				return res.status(400).json({ error: 'Utilisateur non associé à une entreprise' });
			}

			const user = await AuthService.register(email, password, role);

			// Update to add companyId only if not super admin
			if (companyId) {
				await prisma.user.update({
					where: { id: user.id },
					data: { companyId },
				});
			}

			res.status(201).json({ message: `${role} créé`, user });
		} catch (error: any) {
			console.error('createAdmin error:', error);
			res.status(400).json({ error: error.message });
		}
	}
}
