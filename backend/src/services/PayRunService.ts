import { PrismaClient, PayRunStatus, PeriodType } from '../generated/prisma';
import { PayRun } from '../models/PayRun';
import { AttendanceService } from './AttendanceService';

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

  /**
   * Calculate attendance data for an employee within a date range
   */
  static async calculateAttendanceForEmployee(employeeId: number, startDate: Date, endDate: Date) {
    // Get all attendance records for the employee in the date range
    const attendances = await prisma.attendance.findMany({
      where: {
        employeeId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    // Calculate working days (assuming Monday to Friday)
    const workingDays = this.getWorkingDaysInRange(startDate, endDate);

    // Count present and late days
    const presentDays = attendances.filter(a => a.status === 'PRESENT').length;
    const lateDays = attendances.filter(a => a.status === 'LATE').length;
    const daysPresent = presentDays + lateDays; // Late days still count as present but might have deductions

    return {
      daysPresent,
      totalWorkingDays: workingDays,
      attendances
    };
  }

  /**
   * Get number of working days (Monday-Friday) in a date range
   */
  static getWorkingDaysInRange(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Monday = 1, Tuesday = 2, ..., Friday = 5
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
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
      // Check if payslip already exists for this employee in this payrun
      const existingPaySlip = await prisma.paySlip.findFirst({
        where: {
          payRunId,
          employeeId: employee.id
        }
      });

      if (existingPaySlip) {
        console.log(`Skipping employee ${employee.id} - ${employee.fullName}: payslip already exists`);
        continue;
      }

      console.log(`Creating payslip for employee ${employee.id} - ${employee.fullName}`);
      console.log(`Employee salary from database: ${employee.salary} (type: ${typeof employee.salary})`);

      let grossSalary = employee.salary;
      let daysWorked: number | undefined;
      let attendanceRate = 1; // Default 100% for fixed contracts

      if (employee.contractType === 'JOURNALIER') {
        // Calculate salary based on attendance for daily employees
        const attendanceData = await this.calculateAttendanceForEmployee(
          employee.id,
          payRun.startDate,
          payRun.endDate
        );

        daysWorked = attendanceData.daysPresent;
        const totalWorkingDays = attendanceData.totalWorkingDays;
        attendanceRate = totalWorkingDays > 0 ? daysWorked / totalWorkingDays : 0;

        // Salary = daily rate × days present
        grossSalary = employee.salary * (daysWorked || 0);

        console.log(`Daily employee ${employee.fullName}: daily_rate=${employee.salary}, days_present=${daysWorked}/${totalWorkingDays}, attendance_rate=${(attendanceRate * 100).toFixed(1)}%`);

      } else if (employee.contractType === 'HONORAIRE') {
        // Honorarium employees keep their fixed amount
        console.log(`Honorarium employee ${employee.fullName}: fixed_amount=${employee.salary}`);
      } else if (employee.contractType === 'FIXE') {
        // Fixed monthly salary - no attendance calculation needed
        console.log(`Fixed employee ${employee.fullName}: monthly_salary=${employee.salary}`);
      }

      const deductions = 0; // Can be calculated later based on attendance or other factors
      const netSalary = grossSalary - deductions;

      console.log(`Employee ${employee.fullName}: gross=${grossSalary}, net=${netSalary}, attendance_rate=${(attendanceRate * 100).toFixed(1)}%`);

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