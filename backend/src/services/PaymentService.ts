import { PrismaClient, PaymentMode } from '../generated/prisma';

const prisma = new PrismaClient();

export class PaymentService {
  static async create(data: {
    employeeId: number;
    amount: number;
    mode: PaymentMode;
    receiptUrl?: string;
  }) {
    return prisma.payment.create({ data });
  }

  static async getAll() {
    return prisma.payment.findMany({ include: { employee: true }, orderBy: { date: 'desc' } });
  }

  static async getById(id: number) {
    return prisma.payment.findUnique({ where: { id }, include: { employee: true } });
  }
}
