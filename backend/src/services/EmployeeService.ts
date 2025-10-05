import { PrismaClient, ContractType } from '../generated/prisma';

const prisma = new PrismaClient();

export class EmployeeService {
  static async create(data: {
    fullName: string;
    position: string;
    contractType: ContractType;
    salary: number;
    bankDetails?: string;
  }) {
    return prisma.employee.create({ data });
  }

  static async getAll(filters?: {
    isActive?: boolean;
    position?: string;
    contractType?: ContractType;
  }) {
    return prisma.employee.findMany({
      where: {
        ...(filters?.isActive !== undefined && { isActive: filters.isActive }),
        ...(filters?.position && { position: filters.position }),
        ...(filters?.contractType && { contractType: filters.contractType }),
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getById(id: number) {
    return prisma.employee.findUnique({ where: { id } });
  }

  static async update(id: number, data: Partial<{
    fullName: string;
    position: string;
    contractType: ContractType;
    salary: number;
    bankDetails?: string;
    isActive: boolean;
  }>) {
    return prisma.employee.update({ where: { id }, data });
  }

  static async delete(id: number) {
    return prisma.employee.delete({ where: { id } });
  }

  static async setActive(id: number, isActive: boolean) {
    return prisma.employee.update({ where: { id }, data: { isActive } });
  }
}
