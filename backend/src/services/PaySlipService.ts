import { PrismaClient, PaySlipStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export class PaySlipService {
  static async getAll(filters: { status?: string; payRunId?: number; user?: any } = {}) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.payRunId) where.payRunId = filters.payRunId;

    // Filtrage par entreprise selon le rôle
    if (filters.user?.role !== 'CASHIER' && filters.user?.companyId) {
      where.payRun = { companyId: filters.user.companyId };
    }
    // Le caissier voit tous les bulletins (pas de filtrage par entreprise)

    return prisma.paySlip.findMany({
      where,
      include: {
        employee: true,
        payRun: true,
        payments: { orderBy: { date: 'asc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  static async getById(id: number) {
    const payslip = await prisma.paySlip.findUnique({
      where: { id },
      include: {
        employee: true,
        payRun: true,
        payments: { orderBy: { date: 'asc' } }
      }
    });
    if (payslip) {
      // Calculate payment status
      const totalPaid = payslip.payments.reduce((sum, p) => sum + p.amount, 0);
      let status = 'PENDING';
      if (totalPaid === 0) status = 'PENDING';
      else if (totalPaid < payslip.netSalary) status = 'PARTIAL';
      else if (totalPaid >= payslip.netSalary) status = 'PAID';

      // Update status if changed
      if (payslip.status !== status) {
        await prisma.paySlip.update({
          where: { id },
          data: { status: status as PaySlipStatus }
        });
        payslip.status = status as PaySlipStatus;
      }
    }
    return payslip;
  }

  static async update(id: number, data: Partial<{
    grossSalary: number;
    deductions: number;
    netSalary: number;
    daysWorked: number;
  }>) {
    return prisma.paySlip.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.paySlip.delete({ where: { id } });
  }
}