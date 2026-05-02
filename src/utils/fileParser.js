import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker using CDN to avoid Vite bundler issues
pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export async function parseFile(file) {
  if (!file) return '';

  const fileType = file.type;

  if (fileType === 'application/pdf') {
    return await parsePDF(file);
  } else if (fileType.startsWith('image/')) {
    return await parseImage(file);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or an Image.');
  }
}

async function parseImage(file) {
  try {
    const result = await Tesseract.recognize(file, 'eng');
    return result.data.text;
  } catch (error) {
    console.error('Error parsing image:', error);
    throw new Error('Failed to extract text from the image.');
  }
}

async function parsePDF(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

    let extractedText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map(item => item.str).join(' ');
      extractedText += pageText + '\n\n';
    }

    return extractedText;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to extract text from the PDF.');
  }
}
