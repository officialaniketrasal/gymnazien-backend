const express = require('express');
const multer = require('multer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

router.post('/preview-certificate', upload.single('template'), async (req, res) => {
  const { name } = req.body;
  const templatePath = req.file.path;

  try {
    // Check if template file exists
    if (!fs.existsSync(templatePath)) {
      throw new Error('Template file not found');
    }

    // Load the PDF template
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    // Embed a standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Draw the example name on the first page for preview
    firstPage.drawText(name, {
      x: 50, // Adjust as per your template design
      y: 750, // Adjust as per your template design
      size: 30,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Save the modified PDF as a blob
    const pdfBytes = await pdfDoc.save();
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });

    // Send the blob as response
    res.setHeader('Content-Disposition', 'inline; filename="preview.pdf"');
    res.setHeader('Content-Type', 'application/pdf');
    res.send(pdfBlob);
  } catch (error) {
    console.error('Error generating preview:', error);
    res.status(500).json({ message: 'Error generating preview' });
  } finally {
    // Cleanup: remove the uploaded template
    try {
      fs.unlinkSync(templatePath);
    } catch (cleanupError) {
      console.error('Error cleaning up template file:', cleanupError);
    }
  }
});

module.exports = router;
