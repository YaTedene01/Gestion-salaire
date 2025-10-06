import { PrismaClient, ContractType } from '../generated/prisma';
import { QRCodeGenerator } from '../utils/qrCodeGenerator';

const prisma = new PrismaClient();

export class EmployeeService {
  static async create(data: {
    fullName: string;
    position: string;
    contractType: ContractType;
    salary: number;
    bankDetails?: string;
    companyId: number;
  }) {
    const employee = await prisma.employee.create({
      data,
    });
    return employee;
  }

  static async getAll(filters?: {
    companyId?: number;
    isActive?: boolean;
    position?: string;
    contractType?: ContractType;
  }) {
    return prisma.employee.findMany({
      where: {
        ...(filters?.companyId && { companyId: filters.companyId }),
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

  /**
   * Generate QR code for a specific employee
   */
  static async generateEmployeeQRCode(employeeId: number): Promise<string> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true }
    });

    if (!employee) {
      throw new Error('Employé non trouvé');
    }

    const qrData = QRCodeGenerator.generateEmployeeData(
      employee.id,
      employee.fullName,
      employee.companyId
    );

    const qrCodeDataURL = await QRCodeGenerator.generateQRCodeDataURL(qrData);

    // Update employee with unique QR code identifier
    const uniqueQRCode = QRCodeGenerator.generateUniqueQRCode(employee.id);
    await prisma.employee.update({
      where: { id: employeeId },
      data: { qrCode: uniqueQRCode }
    });

    return qrCodeDataURL;
  }

  /**
   * Generate QR codes for all active employees in a company
   */
  static async generateAllEmployeeQRCodes(companyId: number): Promise<{ generated: number; failed: number }> {
    const employees = await prisma.employee.findMany({
      where: {
        companyId: companyId,
        isActive: true,
        qrCode: null // Only generate for employees without QR codes
      }
    });

    let generated = 0;
    let failed = 0;

    for (const employee of employees) {
      try {
        await this.generateEmployeeQRCode(employee.id);
        generated++;
      } catch (error) {
        console.error(`Failed to generate QR code for employee ${employee.id}:`, error);
        failed++;
      }
    }

    return { generated, failed };
  }

  /**
   * Get QR code for an employee
   */
  static async getEmployeeQRCode(employeeId: number): Promise<string | null> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId },
      include: { company: true }
    });

    if (!employee) {
      return null;
    }

    const qrData = QRCodeGenerator.generateEmployeeData(
      employee.id,
      employee.fullName,
      employee.companyId
    );

    return QRCodeGenerator.generateQRCodeDataURL(qrData);
  }
}
