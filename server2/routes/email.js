const express = require('express');
const nodemailer = require('nodemailer');
const multer = require('multer');
const User = require('../models/User'); // Ensure this path is correct based on your directory structure

const router = express.Router();
const upload = multer();

const transporter = nodemailer.createTransport({
  service: 'gmail', // you can use another email service
  auth: {
    user: 'rasalaniket00@gmail.com', // replace with your email
    pass: 'mheb bwxe uafw qisi', // replace with your email password
  },
});

// Route to send an email with the PDF attachment
router.post('/send-email', upload.single('certificate'), async (req, res) => {
  try {
    const playerData = req.body.player;
    const player = JSON.parse(playerData);
    const pdf = req.file;

    if (!player || !player.email) {
      console.error('Invalid player data:', player);
      return res.status(400).json({ message: 'Invalid player data' });
    }

    // Find the user by their email
    const user = await User.findOne({ email: player.email });
  
    if (!user) {
      console.error('User not found:', player);
      return res.status(404).json({ message: 'User not found' });
    }
  
    // Email options
    const mailOptions = {
      from: 'rasalaniket00@gmail.com',
      to: user.email,
      subject: 'Your Certificate of Achievement',
      text: `Dear ${user.name},\n\nCongratulations on your achievement! Please find your certificate attached.\n\nBest regards,\nGymnazien Team`,
      attachments: [
        {
          filename: 'certificate.pdf',
          content: pdf.buffer,
          contentType: 'application/pdf'
        }
      ]
    };
  
    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      } else {
        console.log('Email sent:', info.response);
        return res.status(200).json({ message: 'Email sent successfully' });
      }
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
