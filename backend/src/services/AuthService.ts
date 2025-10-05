import { PrismaClient, Role } from '../generated/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export class AuthService {
  static async register(email: string, password: string, role: Role = Role.USER) {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new Error('Email déjà utilisé');
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, role },
    });
    return user;
  }

  static async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error('Utilisateur non trouvé');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Mot de passe incorrect');
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || '',
      { expiresIn: process.env.JWT_EXPIRE || '7d' } as jwt.SignOptions
    );
    return { user, token };
  }
}
