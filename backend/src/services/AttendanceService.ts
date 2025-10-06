import { PrismaClient, AttendanceStatus } from '../generated/prisma';
import { QRCodeGenerator, EmployeeQRData } from '../utils/qrCodeGenerator';

const prisma = new PrismaClient();

export class AttendanceService {
  /**
   * Record attendance by scanning QR code
   */
  static async recordAttendance(qrData: string, scannedByUserId?: number): Promise<any> {
    try {
      // Parse QR code data
      const employeeData = QRCodeGenerator.parseQRCodeData(qrData);
      if (!employeeData) {
        throw new Error('Invalid QR code data');
      }

      // Validate QR code (check if not too old)
      if (!QRCodeGenerator.isQRCodeValid(employeeData)) {
        throw new Error('QR code has expired');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Check if employee exists and is active
      const employee = await prisma.employee.findUnique({
        where: { id: employeeData.employeeId },
        include: { company: true }
      });

      if (!employee || !employee.isActive) {
        throw new Error('Employee not found or inactive');
      }

      // Check if attendance already recorded for today
      const existingAttendance = await prisma.attendance.findUnique({
        where: {
          employeeId_date: {
            employeeId: employeeData.employeeId,
            date: today
          }
        }
      });

      if (existingAttendance) {
        throw new Error('Attendance already recorded for today');
      }

      // Determine if employee is late (after 9 AM)
      const now = new Date();
      const nineAM = new Date(now);
      nineAM.setHours(9, 0, 0, 0);

      const status = now > nineAM ? AttendanceStatus.LATE : AttendanceStatus.PRESENT;

      // Create attendance record
      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employeeData.employeeId,
          date: today,
          checkInTime: now,
          status: status,
          notes: scannedByUserId ? `Scanned by user ${scannedByUserId}` : 'Self check-in'
        },
        include: {
          employee: {
            include: { company: true }
          }
        }
      });

      return {
        success: true,
        attendance,
        message: status === AttendanceStatus.LATE ? 'Attendance recorded - Late arrival' : 'Attendance recorded successfully'
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get attendance records for a specific employee
   */
  static async getEmployeeAttendance(employeeId: number, startDate?: Date, endDate?: Date) {
    const where: any = { employeeId };

    if (startDate && endDate) {
      where.date = {
        gte: startDate,
        lte: endDate
      };
    }

    return prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: { company: true }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  /**
   * Get attendance records for all employees in a company
   */
  static async getCompanyAttendance(companyId: number, date?: Date) {
    const where: any = {
      employee: {
        companyId: companyId
      }
    };

    if (date) {
      where.date = date;
    }

    return prisma.attendance.findMany({
      where,
      include: {
        employee: {
          include: { company: true }
        }
      },
      orderBy: [
        { date: 'desc' },
        { employee: { fullName: 'asc' } }
      ]
    });
  }

  /**
   * Get attendance summary for a date range
   */
  static async getAttendanceSummary(companyId: number, startDate: Date, endDate: Date) {
    const attendances = await prisma.attendance.findMany({
      where: {
        employee: {
          companyId: companyId
        },
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      include: {
        employee: true
      }
    });

    // Group by employee and calculate statistics
    const summary = new Map();

    attendances.forEach(attendance => {
      const empId = attendance.employeeId;
      if (!summary.has(empId)) {
        summary.set(empId, {
          employee: attendance.employee,
          totalDays: 0,
          presentDays: 0,
          lateDays: 0,
          absentDays: 0,
          excusedDays: 0
        });
      }

      const empSummary = summary.get(empId);
      empSummary.totalDays++;

      switch (attendance.status) {
        case AttendanceStatus.PRESENT:
          empSummary.presentDays++;
          break;
        case AttendanceStatus.LATE:
          empSummary.lateDays++;
          break;
        case AttendanceStatus.ABSENT:
          empSummary.absentDays++;
          break;
        case AttendanceStatus.EXCUSED:
          empSummary.excusedDays++;
          break;
      }
    });

    return Array.from(summary.values());
  }

  /**
   * Generate QR code for an employee
   */
  static async generateEmployeeQRCode(employeeId: number): Promise<string> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    const qrData = QRCodeGenerator.generateEmployeeData(
      employee.id,
      employee.fullName,
      employee.companyId
    );

    const qrCodeDataURL = await QRCodeGenerator.generateQRCodeDataURL(qrData);

    // Update employee with QR code
    const uniqueQRCode = QRCodeGenerator.generateUniqueQRCode(employee.id);
    await prisma.employee.update({
      where: { id: employeeId },
      data: { qrCode: uniqueQRCode }
    });

    return qrCodeDataURL;
  }

  /**
   * Get QR code for an employee
   */
  static async getEmployeeQRCode(employeeId: number): Promise<string | null> {
    const employee = await prisma.employee.findUnique({
      where: { id: employeeId }
    });

    if (!employee || !employee.qrCode) {
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