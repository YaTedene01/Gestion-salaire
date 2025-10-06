import { PrismaClient, PaymentMode, PaySlipStatus } from '../generated/prisma';
import { ReceiptGenerator } from '../utils/receiptGenerator';

const prisma = new PrismaClient();

export class PaymentService {
  static async create(data: {
    paySlipId: number;
    amount: number;
    mode: PaymentMode;
    reference?: string;
    notes?: string;
    receiptUrl?: string;
  }) {
    // Generate receipt number
    const receiptNumber = `REC${Date.now()}`;

    // Create payment in transaction to update payslip status
    const result = await prisma.$transaction(async (tx) => {
      // Create the payment
      const payment = await tx.payment.create({
        data: { ...data, receiptNumber },
        include: { paySlip: true }
      });

      // Calculate total paid for this payslip
      const totalPaidResult = await tx.payment.aggregate({
        where: { paySlipId: data.paySlipId },
        _sum: { amount: true }
      });

      const totalPaid = totalPaidResult._sum.amount || 0;
      const payslip = await tx.paySlip.findUnique({
        where: { id: data.paySlipId }
      });

      if (payslip) {
        let newStatus: any = 'APPROVED'; // Default to APPROVED

        if (totalPaid >= payslip.netSalary) {
          newStatus = 'PAID'; // Fully paid
        } else if (totalPaid > 0) {
          newStatus = 'PARTIAL'; // Partially paid
        }

        // Update payslip status
        await tx.paySlip.update({
          where: { id: data.paySlipId },
          data: { status: newStatus }
        });
      }

      return payment;
    });

    // Return with full includes
    const payment = await prisma.payment.findUnique({
      where: { id: result.id },
      include: {
        paySlip: {
          include: {
            employee: {
              include: { company: true }
            },
            payRun: true
          }
        }
      }
    });

    // Generate PDF receipt
    if (payment && payment.paySlip.employee.company) {
      try {
        const receiptUrl = await ReceiptGenerator.generateReceipt({
          company: {
            name: payment.paySlip.employee.company.name,
            logo: payment.paySlip.employee.company.logo || undefined,
            address: payment.paySlip.employee.company.address || undefined,
            currency: payment.paySlip.employee.company.currency
          },
          employee: {
            fullName: payment.paySlip.employee.fullName,
            position: payment.paySlip.employee.position
          },
          payment: {
            amount: payment.amount,
            mode: payment.mode,
            receiptNumber: payment.receiptNumber!,
            date: payment.date
          }
        });

        // Update payment with receipt URL
        await prisma.payment.update({
          where: { id: payment.id },
          data: { receiptUrl }
        });

        payment.receiptUrl = receiptUrl;
      } catch (error) {
        console.error('Error generating receipt PDF:', error);
        // Don't fail the payment creation if PDF generation fails
      }
    }

    return payment;
  }

  static async getAll() {
    return prisma.payment.findMany({
      include: {
        paySlip: {
          include: {
            employee: {
              include: { company: true }
            },
            payRun: true
          }
        }
      },
      orderBy: { date: 'desc' }
    });
  }

  static async getById(id: number) {
    return prisma.payment.findUnique({
      where: { id },
      include: {
        paySlip: {
          include: {
            employee: {
              include: { company: true }
            },
            payRun: true
          }
        }
      }
    });
  }

  static async getByPaySlip(paySlipId: number) {
    return prisma.payment.findMany({
      where: { paySlipId },
      orderBy: { date: 'asc' }
    });
  }
}
