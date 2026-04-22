import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Downloads a DOM element as a PDF file.
 * @param {string} elementId - The ID of the DOM element to capture
 * @param {string} filename - The PDF filename (e.g. 'PO-123.pdf')
 */
export const downloadPDF = async (elementId, filename = 'document.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(`[pdfGenerator] Element with id "${elementId}" not found.`);
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pageWidth - 20; // 10mm margin each side
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    let yPosition = 10;
    let remainingHeight = imgHeight;

    // Handle multi-page content
    while (remainingHeight > 0) {
      pdf.addImage(imgData, 'PNG', 10, yPosition, imgWidth, imgHeight);
      remainingHeight -= (pageHeight - 20);
      if (remainingHeight > 0) {
        pdf.addPage();
        yPosition = -(imgHeight - remainingHeight) + 10;
      }
    }

    pdf.save(filename);
  } catch (err) {
    console.error('[pdfGenerator] Error generating PDF:', err);
    alert('Failed to generate PDF. Please try again.');
  }
};
