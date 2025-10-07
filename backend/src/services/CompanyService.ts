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

  static async inviteSuperAdmin(companyId: number, superAdminEmail: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Entreprise non trouvée');

    // Check if super admin exists and has SUPER_ADMIN role
    const superAdmin = await prisma.user.findFirst({
      where: { email: superAdminEmail, role: 'SUPER_ADMIN' }
    });
    if (!superAdmin) throw new Error('Super admin non trouvé');

    // Add to invited list if not already there
    const invitedSuperAdmins = company.invitedSuperAdmins || [];
    if (!invitedSuperAdmins.includes(superAdminEmail)) {
      invitedSuperAdmins.push(superAdminEmail);
    }

    return prisma.company.update({
      where: { id: companyId },
      data: { invitedSuperAdmins }
    });
  }

  static async removeSuperAdminInvite(companyId: number, superAdminEmail: string) {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error('Entreprise non trouvée');

    // Remove from invited list
    const invitedSuperAdmins = company.invitedSuperAdmins || [];
    const updatedList = invitedSuperAdmins.filter(email => email !== superAdminEmail);

    return prisma.company.update({
      where: { id: companyId },
      data: { invitedSuperAdmins: updatedList }
    });
  }

  static async checkSuperAdminAccess(companyId: number, superAdminEmail: string): Promise<boolean> {
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) return false;

    const invitedSuperAdmins = company.invitedSuperAdmins || [];
    return invitedSuperAdmins.includes(superAdminEmail);
  }
}
