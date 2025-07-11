import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Project } from '@/types/project';

export type ExportFormat = 'pdf' | 'csv' | 'image';

export const exportToPDF = async (project: Project): Promise<void> => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const margin = 20;
  let yPosition = margin;

  // Title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text(project.name, margin, yPosition);
  yPosition += 15;

  // Export date
  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Exported on: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Helper function to add section
  const addSection = (title: string, cards: any[]) => {
    // Check if we need a new page
    if (yPosition > pdf.internal.pageSize.height - 60) {
      pdf.addPage();
      yPosition = margin;
    }

    // Section header
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += 10;

    // Cards
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    
    if (cards.length === 0) {
      pdf.text('No cards in this section', margin + 10, yPosition);
      yPosition += 10;
    } else {
      cards.forEach((card, index) => {
        // Check if we need a new page for each card
        if (yPosition > pdf.internal.pageSize.height - 40) {
          pdf.addPage();
          yPosition = margin;
        }

        // Card content
        const cardText = `${index + 1}. ${card.text}`;
        const splitText = pdf.splitTextToSize(cardText, pageWidth - 2 * margin - 20);
        pdf.text(splitText, margin + 10, yPosition);
        yPosition += splitText.length * 5;

        // Likes and dislikes (using text instead of emojis)
        pdf.text(`Likes: ${card.likes} | Dislikes: ${card.dislikes} | ${new Date(card.createdAt).toLocaleDateString()}`, margin + 10, yPosition);
        yPosition += 10;
      });
    }
    yPosition += 10;
  };

  // Add sections (without emojis)
  addSection('What Went Well', project.cards.whatWentWell);
  addSection('To Improve', project.cards.toImprove);
  addSection('Action Items', project.cards.actionItems);

  // Summary
  if (yPosition > pdf.internal.pageSize.height - 80) {
    pdf.addPage();
    yPosition = margin;
  }

  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  const totalCards = project.cards.whatWentWell.length + project.cards.toImprove.length + project.cards.actionItems.length;
  pdf.text(`Total cards: ${totalCards}`, margin, yPosition);
  yPosition += 8;
  pdf.text(`What Went Well: ${project.cards.whatWentWell.length} cards`, margin, yPosition);
  yPosition += 8;
  pdf.text(`To Improve: ${project.cards.toImprove.length} cards`, margin, yPosition);
  yPosition += 8;
  pdf.text(`Action Items: ${project.cards.actionItems.length} cards`, margin, yPosition);

  // Save the PDF
  pdf.save(`${project.name.replace(/[^a-z0-9]/gi, '_')}_retrospective.pdf`);
};

export const exportToCSV = (project: Project): void => {
  const csvData = [];
  
  // Header
  csvData.push(['Section', 'Card Text', 'Likes', 'Dislikes', 'Created Date']);

  // Add cards from each section
  project.cards.whatWentWell.forEach(card => {
    csvData.push(['What Went Well', card.text.replace(/[^\x20-\x7E]/g, ''), card.likes, card.dislikes, new Date(card.createdAt).toLocaleDateString()]);
  });

  project.cards.toImprove.forEach(card => {
    csvData.push(['To Improve', card.text.replace(/[^\x20-\x7E]/g, ''), card.likes, card.dislikes, new Date(card.createdAt).toLocaleDateString()]);
  });

  project.cards.actionItems.forEach(card => {
    csvData.push(['Action Items', card.text.replace(/[^\x20-\x7E]/g, ''), card.likes, card.dislikes, new Date(card.createdAt).toLocaleDateString()]);
  });

  // Convert to CSV string with proper encoding
  const csvContent = csvData.map(row => 
    row.map(field => `"${String(field).replace(/"/g, '""').replace(/[^\x20-\x7E]/g, '')}"`).join(',')
  ).join('\n');

  // Add BOM for UTF-8 to ensure proper encoding
  const csvWithBOM = '\uFEFF' + csvContent;

  // Download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${project.name.replace(/[^a-z0-9]/gi, '_')}_retrospective.csv`;
  link.click();
};

export const exportToImage = async (elementId: string, filename: string): Promise<void> => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for image export');
  }

  try {
    // Get the element's full scroll dimensions
    const originalHeight = element.style.height;
    const originalOverflow = element.style.overflow;
    
    // Temporarily expand the element to capture all content
    element.style.height = `${element.scrollHeight}px`;
    element.style.overflow = 'visible';

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 1,
      useCORS: true,
      logging: false,
      height: element.scrollHeight,
      width: element.scrollWidth,
      scrollX: 0,
      scrollY: 0,
    });

    // Restore original styles
    element.style.height = originalHeight;
    element.style.overflow = originalOverflow;

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.png`;
        link.click();
      }
    }, 'image/png');
  } catch (error) {
    console.error('Error capturing image:', error);
    throw error;
  }
};