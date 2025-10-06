import { PayRun as PrismaPayRun, PayRunStatus, PeriodType } from '../generated/prisma';

export class PayRun {
  id: number;
  name: string;
  companyId: number;
  startDate: Date;
  endDate: Date;
  periodType: PeriodType;
  status: PayRunStatus;
  createdAt: Date;
  updatedAt: Date;
  paySlips: any[];

  constructor(data: PrismaPayRun & { paySlips?: any[] }) {
    this.id = data.id;
    this.name = data.name;
    this.companyId = data.companyId;
    this.startDate = data.startDate;
    this.endDate = data.endDate;
    this.periodType = data.periodType;
    this.status = data.status;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
    this.paySlips = data.paySlips || [];
  }
}