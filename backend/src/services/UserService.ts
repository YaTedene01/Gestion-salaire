import { PrismaClient, Role } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class UserService {
  static async create(data: { email: string; password: string; role: Role; companyId?: number }) {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
    if (existingUser) throw new Error('Email déjà utilisé');
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        role: data.role,
        companyId: data.companyId,
      },
    });
    return user;
  }

  static async getAllByCompany(companyId: number) {
    return prisma.user.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getAll(companyId?: number) {
    return prisma.user.findMany({
      where: companyId ? { companyId } : {},
      include: { company: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: number) {
    return prisma.user.findUnique({
      where: { id },
      include: { company: true }
    });
  }

  static async update(id: number, data: Partial<{ email: string; role: Role; companyId?: number }>) {
    return prisma.user.update({
      where: { id },
      data
    });
  }

  static async delete(id: number) {
    return prisma.user.delete({ where: { id } });
  }

  static async setActive(id: number, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive }
    });
  }
}