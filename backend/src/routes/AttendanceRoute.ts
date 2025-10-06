import { Router } from 'express';
import { AttendanceController } from '../controllers/AttendanceController';
import { AuthMiddleware } from '../middlewares/AuthMiddleware';

const router = Router();

// Apply auth middleware to all routes
router.use(AuthMiddleware.authenticate);

// Scan QR code to record attendance
router.post('/scan', AttendanceController.scanQRCode);

// Get attendance records for a specific employee
router.get('/employee/:employeeId', AttendanceController.getEmployeeAttendance);

// Get attendance records for all employees in user's company
router.get('/company', AttendanceController.getCompanyAttendance);

// Get attendance summary for a date range
router.get('/summary', AttendanceController.getAttendanceSummary);

// Generate QR code for an employee
router.post('/employee/:employeeId/qr-code', AttendanceController.generateEmployeeQRCode);

// Get QR code for an employee
router.get('/employee/:employeeId/qr-code', AttendanceController.getEmployeeQRCode);

// Manually mark attendance (admin only)
router.post('/mark', AuthMiddleware.authorize('ADMIN', 'SUPER_ADMIN'), AttendanceController.markAttendance);

export default router;