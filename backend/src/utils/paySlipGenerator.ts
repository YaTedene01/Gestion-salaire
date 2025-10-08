
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface PaySlipData {
  company: {
    name: string;
    logo?: string;
    address?: string;
    currency: string;
  };
  employee: {
    fullName: string;
    position: string;
    contractType: string;
    id: number;
  };
  paySlip: {
    id: number;
    grossSalary: number;
    deductions: number;
    netSalary: number;
    daysWorked?: number;
    hoursWorked?: number;
    createdAt: Date;
  };
  payRun: {
    name: string;
    startDate: Date;
    endDate: Date;
    periodType: string;
  };
  payments: Array<{
    amount: number;
    mode: string;
    date: Date;
  }>;
}

export class PaySlipGenerator {
  static async generatePaySlipPDF(data: PaySlipData): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `payslip_${data.employee.id}_${data.paySlip.id}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header - Company Logo and Info
      if (data.company.logo) {
        try {
          // Add company logo at the top center
          const logoPath = path.join(__dirname, '../../uploads', data.company.logo);
          if (fs.existsSync(logoPath)) {
            doc.image(logoPath, (doc.page.width - 100) / 2, doc.y, { width: 100, height: 100 });
            doc.moveDown(1);
          }
        } catch (error) {
          console.error('Error adding logo to PDF:', error);
        }
      }

      doc.fontSize(24).font('Helvetica-Bold').text(data.company.name, { align: 'center' });
      doc.moveDown(0.5);

      if (data.company.address) {
        doc.fontSize(12).font('Helvetica').text(data.company.address, { align: 'center' });
        doc.moveDown();
      }

      doc.moveDown();

      // Title
      doc.fontSize(20).font('Helvetica-Bold').text('BULLETIN DE SALAIRE', { align: 'center' });
      doc.moveDown();

      // PaySlip Info
      doc.fontSize(12).text(`Numéro: ${data.paySlip.id}`, { align: 'right' });
      doc.text(`Période: ${this.formatPeriod(data.payRun)}`, { align: 'right' });
      doc.moveDown();

      // Employee Info Section
      doc.fontSize(14).font('Helvetica-Bold').text('INFORMATIONS DE L\'EMPLOYÉ');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');
      doc.text(`Nom complet: ${data.employee.fullName}`);
      doc.text(`Poste: ${data.employee.position}`);
      doc.text(`Matricule: ${data.employee.id}`);
      doc.text(`Type de contrat: ${this.formatContractType(data.employee.contractType)}`);
      doc.moveDown();

      // Salary Details Section
      doc.fontSize(14).font('Helvetica-Bold').text('DÉTAILS DE RÉMUNÉRATION');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica');

      // Create a table-like structure
      const tableTop = doc.y;
      const col1X = 50;
      const col2X = 300;
      const col3X = 450;

      // Headers
      doc.font('Helvetica-Bold');
      doc.text('Description', col1X, tableTop);
      doc.text('Montant', col2X, tableTop);
      doc.text('Devise', col3X, tableTop);
      doc.moveDown();

      // Salary rows
      doc.font('Helvetica');
      let yPos = doc.y + 10;

      // Gross Salary
      doc.text('Salaire brut', col1X, yPos);
      doc.text(this.formatCurrency(data.paySlip.grossSalary, data.company.currency), col2X, yPos);
      doc.text(data.company.currency, col3X, yPos);
      yPos += 20;

      // Deductions
      if (data.paySlip.deductions > 0) {
        doc.text('Déductions', col1X, yPos);
        doc.text(this.formatCurrency(data.paySlip.deductions, data.company.currency), col2X, yPos);
        doc.text(data.company.currency, col3X, yPos);
        yPos += 20;
      }

      // Net Salary
      doc.font('Helvetica-Bold');
      doc.text('Salaire net', col1X, yPos);
      doc.text(this.formatCurrency(data.paySlip.netSalary, data.company.currency), col2X, yPos);
      doc.text(data.company.currency, col3X, yPos);
      yPos += 30;

      // Days worked and attendance info
      doc.font('Helvetica');
      if (data.employee.contractType === 'JOURNALIER' && data.paySlip.daysWorked !== undefined && data.paySlip.daysWorked !== null) {
        const totalWorkingDays = PaySlipGenerator.getWorkingDaysInRange(data.payRun.startDate, data.payRun.endDate);
        const attendanceRate = totalWorkingDays > 0 ? ((data.paySlip.daysWorked / totalWorkingDays) * 100).toFixed(1) : '0.0';

        doc.text(`Jours travaillés: ${data.paySlip.daysWorked}/${totalWorkingDays} (${attendanceRate}%)`, col1X, yPos);
        yPos += 20;
      } else if (data.employee.contractType === 'FIXE') {
        doc.text(`22 jours travaillés`, col1X, yPos);
        yPos += 20;
      }

      // Hours worked for honorarium employees (if applicable)
      if (data.paySlip.hoursWorked !== undefined && data.paySlip.hoursWorked !== null && data.paySlip.hoursWorked > 0) {
        doc.font('Helvetica');
        doc.text(`Heures travaillées: ${data.paySlip.hoursWorked}h`, col1X, yPos);
        yPos += 20;
      }

      // Payment History
      if (data.payments.length > 0) {
        doc.moveDown();
        doc.fontSize(14).font('Helvetica-Bold').text('HISTORIQUE DES PAIEMENTS');
        doc.moveDown(0.5);
        doc.fontSize(12).font('Helvetica');

        data.payments.forEach((payment, index) => {
          const paymentDate = payment.date.toLocaleDateString('fr-FR');
          doc.text(`${index + 1}. ${paymentDate} - ${this.formatCurrency(payment.amount, data.company.currency)} (${this.formatPaymentMode(payment.mode)})`);
        });
      }

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica').text('Ce bulletin de salaire est généré automatiquement.', { align: 'center' });
      doc.text(`Date de génération: ${new Date().toLocaleDateString('fr-FR')}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/${fileName}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  private static formatCurrency(amount: number, currency: string): string {
    return new Intl.NumberFormat('fr-FR').format(amount);
  }

  private static formatPeriod(payRun: PaySlipData['payRun']): string {
    const start = payRun.startDate.toLocaleDateString('fr-FR');
    const end = payRun.endDate.toLocaleDateString('fr-FR');
    return `${start} - ${end}`;
  }

  private static formatContractType(contractType: string): string {
    const types: { [key: string]: string } = {
      'FIXE': 'Contrat fixe',
      'JOURNALIER': 'Contrat journalier',
      'HONORAIRE': 'Contrat honoraire'
    };
    return types[contractType] || contractType;
  }

  private static formatPaymentMode(mode: string): string {
    const modes: { [key: string]: string } = {
      'ESPECES': 'Espèces',
      'VIREMENT': 'Virement bancaire',
      'ORANGE_MONEY': 'Orange Money',
      'WAVE': 'Wave',
      'FREE_MONEY': 'Free Money'
    };
    return modes[mode] || mode;
  }

  private static getWorkingDaysInRange(startDate: Date, endDate: Date): number {
    let workingDays = 0;
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      // Monday = 1, Tuesday = 2, ..., Friday = 5
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return workingDays;
  }
}