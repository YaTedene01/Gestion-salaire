import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

interface ReceiptData {
  company: {
    name: string;
    logo?: string;
    address?: string;
    currency: string;
  };
  employee: {
    fullName: string;
    position: string;
  };
  payment: {
    amount: number;
    mode: string;
    receiptNumber: string;
    date: Date;
  };
}

export class ReceiptGenerator {
  static async generateReceipt(data: ReceiptData): Promise<string> {
    return new Promise((resolve, reject) => {
      const uploadsDir = path.join(__dirname, '../../uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const fileName = `receipt_${data.payment.receiptNumber}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      const doc = new PDFDocument({
        size: 'A4',
        margin: 50
      });

      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Header - Company Info
      doc.fontSize(20).font('Helvetica-Bold').text(data.company.name, { align: 'center' });
      doc.moveDown();

      if (data.company.address) {
        doc.fontSize(12).font('Helvetica').text(data.company.address, { align: 'center' });
        doc.moveDown();
      }

      doc.moveDown(2);

      // Title
      doc.fontSize(18).font('Helvetica-Bold').text('REÇU DE PAIEMENT', { align: 'center' });
      doc.moveDown(2);

      // Receipt Number
      doc.fontSize(12).font('Helvetica-Bold').text(`Numéro de reçu: ${data.payment.receiptNumber}`, { align: 'right' });
      doc.moveDown();

      // Date and Time
      const formattedDate = data.payment.date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      doc.fontSize(12).text(`Date et heure: ${formattedDate}`, { align: 'right' });
      doc.moveDown(2);

      // Employee Info
      doc.fontSize(14).font('Helvetica-Bold').text('Informations de l\'employé:');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`Nom complet: ${data.employee.fullName}`);
      doc.text(`Poste: ${data.employee.position}`);
      doc.moveDown(2);

      // Payment Info
      doc.fontSize(14).font('Helvetica-Bold').text('Détails du paiement:');
      doc.moveDown(0.5);
      doc.fontSize(12).font('Helvetica').text(`Montant payé: ${data.payment.amount.toLocaleString('fr-FR')} ${data.company.currency}`);
      doc.text(`Mode de paiement: ${this.formatPaymentMode(data.payment.mode)}`);
      doc.moveDown(2);

      // Signature section
      doc.moveDown(3);
      doc.fontSize(12).text('Signature:', { align: 'right' });
      doc.moveDown(2);
      doc.text('_______________________________', { align: 'right' });

      // Footer
      doc.moveDown(2);
      doc.fontSize(10).font('Helvetica').text('Ce reçu est généré automatiquement et constitue une preuve de paiement.', { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(`/uploads/${fileName}`);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
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
}