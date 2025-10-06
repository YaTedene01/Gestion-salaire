import { Request, Response } from 'express';
import { AttendanceService } from '../services/AttendanceService';

export class AttendanceController {
  /**
   * Record attendance by scanning QR code
   */
  static async scanQRCode(req: Request, res: Response) {
    try {
      const { qrData } = req.body;

      if (!qrData) {
        return res.status(400).json({ error: 'QR code data is required' });
      }

      // Get user ID from token (assuming it's set by auth middleware)
      const userId = (req as any).user?.id;

      const result = await AttendanceService.recordAttendance(qrData, userId);

      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get attendance records for a specific employee
   */
  static async getEmployeeAttendance(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.employeeId);
      const { startDate, endDate } = req.query;

      const start = startDate ? new Date(startDate as string) : undefined;
      const end = endDate ? new Date(endDate as string) : undefined;

      const attendances = await AttendanceService.getEmployeeAttendance(employeeId, start, end);
      res.json(attendances);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get attendance records for all employees in user's company
   */
  static async getCompanyAttendance(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { date } = req.query;

      if (!user?.companyId) {
        return res.status(400).json({ error: 'User not associated with a company' });
      }

      const attendanceDate = date ? new Date(date as string) : undefined;
      const attendances = await AttendanceService.getCompanyAttendance(user.companyId, attendanceDate);
      res.json(attendances);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get attendance summary for a date range
   */
  static async getAttendanceSummary(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { startDate, endDate } = req.query;

      if (!user?.companyId) {
        return res.status(400).json({ error: 'User not associated with a company' });
      }

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Start date and end date are required' });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      const summary = await AttendanceService.getAttendanceSummary(user.companyId, start, end);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Generate QR code for an employee
   */
  static async generateEmployeeQRCode(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.employeeId);

      const qrCodeDataURL = await AttendanceService.generateEmployeeQRCode(employeeId);
      res.json({ qrCode: qrCodeDataURL });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get QR code for an employee
   */
  static async getEmployeeQRCode(req: Request, res: Response) {
    try {
      const employeeId = Number(req.params.employeeId);

      const qrCodeDataURL = await AttendanceService.getEmployeeQRCode(employeeId);

      if (!qrCodeDataURL) {
        return res.status(404).json({ error: 'QR code not found for this employee' });
      }

      res.json({ qrCode: qrCodeDataURL });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  /**
   * Manually mark attendance (for admins)
   */
  static async markAttendance(req: Request, res: Response) {
    try {
      const { employeeId, date, status, notes } = req.body;
      const userId = (req as any).user?.id;

      if (!employeeId || !date) {
        return res.status(400).json({ error: 'Employee ID and date are required' });
      }

      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      // Check if attendance already exists
      const existingAttendance = await AttendanceService.getEmployeeAttendance(employeeId, attendanceDate, attendanceDate);

      if (existingAttendance.length > 0) {
        return res.status(400).json({ error: 'Attendance already recorded for this date' });
      }

      // Create manual attendance record
      const { PrismaClient, AttendanceStatus } = await import('../generated/prisma');
      const prisma = new PrismaClient();

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: Number(employeeId),
          date: attendanceDate,
          checkInTime: new Date(),
          status: status || AttendanceStatus.PRESENT,
          notes: notes || `Manually marked by user ${userId}`
        },
        include: {
          employee: {
            include: { company: true }
          }
        }
      });

      res.status(201).json(attendance);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}