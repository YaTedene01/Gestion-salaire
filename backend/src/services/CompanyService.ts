import { PrismaClient, PeriodType, Role } from '../generated/prisma';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export class CompanyService {
  static async createWithAdmin(data: {
    name: string;
    logo?: string;
    address?: string;
    currency?: string;
    period?: PeriodType;
    color?: string;
    adminEmail: string;
    adminPassword: string;
  }) {
    return prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: data.name,
          logo: data.logo,
          address: data.address,
          currency: data.currency,
          period: data.period,
          color: data.color,
        },
      });
      const hashedPassword = await bcrypt.hash(data.adminPassword, 10);
      const admin = await tx.user.create({
        data: {
          email: data.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });
      return { company, admin };
    });
  }

  static async getAll() {
    return prisma.company.findMany({ orderBy: { createdAt: 'desc' } });
  }

  static async getById(id: number) {
    return prisma.company.findUnique({ where: { id } });
  }

  static async update(id: number, data: Partial<{
    name: string;
    logo?: string;
    address?: string;
    currency?: string;
    period?: PeriodType;
  }>) {
    return prisma.company.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.company.delete({ where: { id } });
  }

  static async setActive(id: number, isActive: boolean) {
    return prisma.company.update({ where: { id }, data: { isActive } });
  }
}
