import { PrismaClient, PayRunStatus, PeriodType } from '../generated/prisma';
import { PayRun } from '../models/PayRun';

const prisma = new PrismaClient();

export class PayRunService {
  static async create(data: {
    name: string;
    companyId: number;
    startDate: Date;
    endDate: Date;
    periodType: PeriodType;
  }) {
    const payRun = await prisma.payRun.create({
      data,
    });
    return new PayRun(payRun);
  }

  static async getAll(companyId?: number) {
    const payRuns = await prisma.payRun.findMany({
      where: companyId ? { companyId } : {},
      include: { paySlips: true },
      orderBy: { createdAt: 'desc' },
    });
    return payRuns.map(p => new PayRun(p));
  }

  static async getById(id: number) {
    const payRun = await prisma.payRun.findUnique({
      where: { id },
      include: { paySlips: { include: { employee: true } } },
    });
    return payRun ? new PayRun(payRun) : null;
  }

  static async updateStatus(id: number, status: PayRunStatus) {
    const payRun = await prisma.payRun.update({
      where: { id },
      data: { status },
    });
    return new PayRun(payRun);
  }

  static async generatePaySlips(payRunId: number) {
    const payRun = await prisma.payRun.findUnique({
      where: { id: payRunId },
    });

    if (!payRun) throw new Error('PayRun not found');

    // Get active employees for the company
    const employees = await prisma.employee.findMany({
      where: {
        companyId: payRun.companyId,
        isActive: true,
      },
    });

    console.log(`Found ${employees.length} active employees for company ${payRun.companyId}`);

    const paySlips = [];

    for (const employee of employees) {
      console.log(`Creating payslip for employee ${employee.id} - ${employee.fullName}`);
      let grossSalary = employee.salary;
      let daysWorked: number | undefined;

      if (employee.contractType === 'JOURNALIER') {
        // For daily contracts, we might need to input days worked
        // For now, assume 30 days
        daysWorked = 30;
        grossSalary = employee.salary * daysWorked;
      } else if (employee.contractType === 'HONORAIRE') {
        // For honorarium, might need custom amount
        // For now, use the stored salary
      }
      // For FIXE, use the monthly salary

      const deductions = 0; // Can be calculated later
      const netSalary = grossSalary - deductions;

      console.log(`Employee ${employee.fullName}: gross=${grossSalary}, net=${netSalary}`);

      const paySlip = await prisma.paySlip.create({
        data: {
          payRunId,
          employeeId: employee.id,
          grossSalary,
          deductions,
          netSalary,
          daysWorked,
        },
      });

      paySlips.push(paySlip);
    }

    console.log(`Created ${paySlips.length} payslips`);
    return paySlips;
  }

  static async delete(id: number) {
    // Delete associated payslips first
    await prisma.paySlip.deleteMany({
      where: { payRunId: id }
    });
    // Then delete the payrun
    return prisma.payRun.delete({ where: { id } });
  }
}