const express = require('express');
const multer = require('multer');
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');
const QRCode = require('qrcode');


const router = express.Router();

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'rasalaniket00@gmail.com', // replace with your email
    pass: 'mheb bwxe uafw qisi', // replace with your email password
  },
});

const sendCertificateEmail = (email, name, certificatePath) => {
  const mailOptions = {
    from: 'rasalaniket00@gmail.com', // Replace with your email
    to: email,
    subject: 'Participant Certificate',
    text: `Dear ${name},\n\nPlease find attached your participant certificate.\n\nBest regards,\nYour Team`,
    attachments: [
      {
        filename: 'certificate.pdf',
        path: certificatePath,
      },
    ],
  };

  return transporter.sendMail(mailOptions);
};

// Function to generate QR code
const generateQRCode = async (data) => {
  try {
    const canvas = createCanvas(200, 200);
    await QRCode.toCanvas(canvas, data);
    return canvas.toBuffer();
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

router.post('/send-certificate', upload.single('template'), async (req, res) => {
  const { name, email, code } = req.body;
  const templatePath = req.file.path;

  try {
    // Generate QR code
    const qrCodeBuffer = await generateQRCode(`Code: ${code}`);

    // Load the PDF template
    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);

    // Embed a standard font
    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Get the first page of the document
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Draw the name and code on the first page
    firstPage.drawText(name, {
      x: 200,
      y: 360,
      size: 30,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    firstPage.drawText(`certificate number: ${code}`, {
      x: 400,
      y: 80,
      size: 10,
      font: helveticaFont,
      color: rgb(0, 0, 0),
    });

    // Embed QR code image
    const qrImage = await pdfDoc.embedPng(qrCodeBuffer);
    firstPage.drawImage(qrImage, {
      x: 400,
      y: 100,
      width: 100,
      height: 100,
    });

    // Save the modified PDF
    const modifiedPdfBytes = await pdfDoc.save();
    const modifiedPdfPath = path.join(__dirname, '..', 'uploads', `certificate_${Date.now()}.pdf`);
    fs.writeFileSync(modifiedPdfPath, modifiedPdfBytes);

    // Send the certificate via email
    await sendCertificateEmail(email, name, modifiedPdfPath);

    // Cleanup: remove the uploaded template and the generated certificate
    fs.unlinkSync(templatePath);
    fs.unlinkSync(modifiedPdfPath);

    res.status(200).json({ message: 'Certificate sent successfully' });
  } catch (error) {
    console.error('Error generating certificate:', error);
    res.status(500).json({ message: 'Error generating certificate' });
  }
});

module.exports = router;
