import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '../generated/prisma';

const prisma = new PrismaClient();

interface AuthRequest extends Request {
  user?: {
    id: number;
    role: Role;
    companyId?: number;
  };
}

export class AuthMiddleware {
  static authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return res.status(401).json({ error: 'Token d\'authentification requis' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as any;
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé' });
      }

      req.user = {
        id: user.id,
        role: user.role,
        companyId: user.companyId || undefined
      };

      next();
    } catch (error) {
      return res.status(401).json({ error: 'Token invalide' });
    }
  };

  static authorize = (...roles: Role[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Authentification requise' });
      }

      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Accès non autorisé' });
      }

      next();
    };
  };

  static requireCompanyAccess = async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentification requise' });
    }

    // Super admin has access to all companies
    if (req.user.role === Role.SUPER_ADMIN) {
      return next();
    }

    // Other roles need to be associated with a company
    if (!req.user.companyId) {
      return res.status(403).json({ error: 'Accès entreprise requis' });
    }

    next();
  };
}