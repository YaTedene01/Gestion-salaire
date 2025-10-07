import { PrismaClient, PaySlipStatus } from '../generated/prisma';

const prisma = new PrismaClient();

export class PaySlipService {
  static async getAll(filters: { status?: string; payRunId?: number; user?: any } = {}) {
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.payRunId) where.payRunId = filters.payRunId;

    // Filtrage par entreprise selon le rôle
    if (filters.user?.role !== 'SUPER_ADMIN' && filters.user?.companyId) {
      where.payRun = { companyId: filters.user.companyId };
    }
    // Seuls les super admins voient tous les bulletins

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
        employee: {
          include: { company: true }
        },
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
    // First delete associated payments
    await prisma.payment.deleteMany({
      where: { paySlipId: id }
    });

    // Then delete the payslip
    return prisma.paySlip.delete({ where: { id } });
  }
}