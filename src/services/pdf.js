import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// Generate Entry Pass PDF
export const generateEntryPassPDF = async ({
  eventTitle,
  eventDate,
  eventTime,
  eventVenue,
  participantName,
  registrationId,
  qrCodeDataUrl,
}) => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  // Colors
  const primaryColor = '#1E3A5F';
  const accentColor = '#E91E63';

  // Header Background
  pdf.setFillColor(30, 58, 95);
  pdf.rect(0, 0, 210, 60, 'F');

  // Logo/Brand
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text('VENTIXE', 20, 25);

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Event Management System', 20, 35);

  // Entry Pass Title
  pdf.setFontSize(18);
  pdf.setFont('helvetica', 'bold');
  pdf.text('ENTRY PASS', 20, 50);

  // Event Details Section
  pdf.setTextColor(30, 58, 95);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Event Details', 20, 80);

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(100, 100, 100);

  const details = [
    { label: 'Event Name:', value: eventTitle },
    { label: 'Date:', value: eventDate },
    { label: 'Time:', value: eventTime },
    { label: 'Venue:', value: eventVenue },
  ];

  let yPos = 90;
  details.forEach(item => {
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(30, 58, 95);
    pdf.text(item.label, 20, yPos);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(80, 80, 80);
    pdf.text(item.value, 60, yPos);
    yPos += 10;
  });

  // Participant Details
  pdf.setTextColor(30, 58, 95);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Participant Details', 20, yPos + 15);

  yPos += 25;
  pdf.setFontSize(11);

  pdf.setFont('helvetica', 'bold');
  pdf.text('Name:', 20, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text(participantName, 60, yPos);

  yPos += 10;
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(30, 58, 95);
  pdf.text('Registration ID:', 20, yPos);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text(registrationId, 60, yPos);

  // QR Code
  if (qrCodeDataUrl) {
    pdf.addImage(qrCodeDataUrl, 'PNG', 130, 80, 60, 60);
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Scan for Check-in', 145, 145);
  }

  // Instructions
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, yPos + 20, 190, yPos + 20);

  pdf.setTextColor(30, 58, 95);
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Instructions', 20, yPos + 35);

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);

  const instructions = [
    '1. Please carry this entry pass (printed or digital) to the venue.',
    '2. Show the QR code at the registration desk for check-in.',
    '3. Arrive at least 15 minutes before the event start time.',
    '4. This pass is non-transferable and valid for one person only.',
  ];

  let instructionY = yPos + 45;
  instructions.forEach(instruction => {
    pdf.text(instruction, 20, instructionY);
    instructionY += 8;
  });

  // Footer
  pdf.setFillColor(245, 247, 250);
  pdf.rect(0, 270, 210, 27, 'F');

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.text('This is a computer-generated pass and does not require a signature.', 105, 280, { align: 'center' });
  pdf.text('For support, contact: support@ventixe.com', 105, 287, { align: 'center' });

  return pdf;
};

// Download Entry Pass
export const downloadEntryPass = async (passData) => {
  const pdf = await generateEntryPassPDF(passData);
  pdf.save(`entry-pass-${passData.registrationId}.pdf`);
};

// Generate Receipt PDF
export const generateReceiptPDF = async ({
  receiptNumber,
  paymentDate,
  participantName,
  participantEmail,
  eventTitle,
  eventDate,
  amount,
  paymentId,
  paymentMethod,
}) => {
  const pdf = new jsPDF('p', 'mm', 'a4');

  // Header
  pdf.setFillColor(30, 58, 95);
  pdf.rect(0, 0, 210, 40, 'F');

  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });

  // Receipt Info
  pdf.setTextColor(30, 58, 95);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');

  pdf.text(`Receipt No: ${receiptNumber}`, 20, 55);
  pdf.text(`Date: ${paymentDate}`, 140, 55);

  // Participant Info
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Billed To:', 20, 75);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(11);
  pdf.text(participantName, 20, 85);
  pdf.text(participantEmail, 20, 92);

  // Event Details
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.text('Event Details:', 20, 110);

  // Table Header
  pdf.setFillColor(245, 247, 250);
  pdf.rect(20, 118, 170, 10, 'F');

  pdf.setTextColor(30, 58, 95);
  pdf.setFontSize(10);
  pdf.text('Description', 25, 125);
  pdf.text('Amount', 165, 125);

  // Table Content
  pdf.setFont('helvetica', 'normal');
  pdf.setTextColor(80, 80, 80);
  pdf.text(eventTitle, 25, 140);
  pdf.text(`Event Date: ${eventDate}`, 25, 148);
  pdf.setTextColor(30, 58, 95);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`Rs. ${amount}`, 165, 140);

  // Total
  pdf.setDrawColor(200, 200, 200);
  pdf.line(20, 160, 190, 160);

  pdf.setFontSize(12);
  pdf.text('Total Amount:', 120, 172);
  pdf.setFontSize(14);
  pdf.setTextColor(233, 30, 99);
  pdf.text(`Rs. ${amount}`, 165, 172);

  // Payment Info
  pdf.setTextColor(30, 58, 95);
  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Payment ID: ${paymentId}`, 20, 195);
  pdf.text(`Payment Method: ${paymentMethod || 'Online Payment'}`, 20, 203);
  pdf.text('Payment Status: Completed', 20, 211);

  // Footer
  pdf.setFillColor(245, 247, 250);
  pdf.rect(0, 270, 210, 27, 'F');

  pdf.setTextColor(100, 100, 100);
  pdf.setFontSize(9);
  pdf.text('Thank you for your registration!', 105, 280, { align: 'center' });
  pdf.text('This is a computer-generated receipt and does not require a signature.', 105, 287, { align: 'center' });

  return pdf;
};

// Download Receipt
export const downloadReceipt = async (receiptData) => {
  const pdf = await generateReceiptPDF(receiptData);
  pdf.save(`receipt-${receiptData.receiptNumber}.pdf`);
};

// Convert HTML element to PDF
export const htmlToPDF = async (element, filename = 'document.pdf') => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = canvas.width;
  const imgHeight = canvas.height;
  const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
  const imgX = (pdfWidth - imgWidth * ratio) / 2;
  const imgY = 0;

  pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
  pdf.save(filename);
};

export default {
  generateEntryPassPDF,
  downloadEntryPass,
  generateReceiptPDF,
  downloadReceipt,
  htmlToPDF,
};
