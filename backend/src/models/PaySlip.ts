import { PaySlip as PrismaPaySlip, PaySlipStatus } from '../generated/prisma';

export class PaySlip {
  id: number;
  payRunId: number;
  employeeId: number;
  grossSalary: number;
  deductions: number;
  netSalary: number;
  daysWorked?: number;
  hoursWorked?: number;
  status: PaySlipStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(data: PrismaPaySlip) {
    this.id = data.id;
    this.payRunId = data.payRunId;
    this.employeeId = data.employeeId;
    this.grossSalary = data.grossSalary;
    this.deductions = data.deductions;
    this.netSalary = data.netSalary;
    this.daysWorked = data.daysWorked || undefined;
    this.hoursWorked = data.hoursWorked || undefined;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}