import QRCode from 'qrcode';
import crypto from 'crypto';

export interface EmployeeQRData {
  employeeId: number;
  fullName: string;
  companyId: number;
  timestamp: number;
}

export class QRCodeGenerator {
  /**
   * Generate QR code data for an employee
   */
  static generateEmployeeData(employeeId: number, fullName: string, companyId: number): EmployeeQRData {
    return {
      employeeId,
      fullName,
      companyId,
      timestamp: Date.now()
    };
  }

  /**
   * Generate QR code as data URL (base64 image)
   */
  static async generateQRCodeDataURL(data: EmployeeQRData): Promise<string> {
    const qrData = JSON.stringify(data);
    try {
      const dataURL = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        margin: 1,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return dataURL;
    } catch (error) {
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Generate a unique QR code string for an employee
   */
  static generateUniqueQRCode(employeeId: number): string {
    const timestamp = Date.now();
    const random = crypto.randomBytes(4).toString('hex');
    return `EMP${employeeId}_${timestamp}_${random}`;
  }

  /**
   * Parse QR code data back to employee information
   */
  static parseQRCodeData(qrData: string): EmployeeQRData | null {
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.employeeId && parsed.fullName && parsed.companyId && parsed.timestamp) {
        return parsed as EmployeeQRData;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Validate QR code data (check if it's not too old)
   */
  static isQRCodeValid(data: EmployeeQRData, maxAgeMinutes: number = 24 * 60): boolean {
    const now = Date.now();
    const age = now - data.timestamp;
    const maxAge = maxAgeMinutes * 60 * 1000; // Convert to milliseconds
    return age <= maxAge;
  }
}