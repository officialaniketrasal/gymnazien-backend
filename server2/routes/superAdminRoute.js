const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Admin = require('../models/SuperAdminmodel');
const nodemailer = require('nodemailer');
// const User = require('../models/User');
const multer = require('multer');
const path = require('path');

// Helper function to handle Mongoose validation errors
const getErrorMessage = (err) => {
  if (err.name === 'ValidationError') {
    for (let field in err.errors) {
      return err.errors[field].message;
    }
  } else if (err.code === 11000) { // Duplicate key error
    if (err.keyValue.email) {
      console.error("Email already registered")
      return 'Email already registered';
    } else if (err.keyValue.mobile) {
      console.error("Mobile number already registered")
      return 'Mobile number already registered';
    }
  }
  return 'Server error';
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'hindispancartoons3@gmail.com', // Replace with your email
    pass: 'Aniket@123', // Replace with your email password
  },
});



// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });


// Signup route
router.post('/signup', async (req, res) => {
  try {
    const { name, email, mobile, password } = req.body;

    // Check the number of existing admins
    const adminCount = await Admin.countDocuments();
    if (adminCount >= 3) {
      return res.status(400).json({ msg: 'Admin limit reached. No more signups allowed.' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new Admin({
      name,
      email,
      mobile,
      password: hashedPassword
    });

    // Save user to database
    await user.save();

    res.json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    const errorMsg = getErrorMessage(err);
    res.status(400).json({ msg: errorMsg });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req, res) => {
    const { emailOrMobile, password } = req.body;
  
    try {
      // Check if the user exists with email
      let user = await Admin.findOne({ email: emailOrMobile });
  
      // If user not found with email, check with mobile
      if (!user) {
        user = await Admin.findOne({ mobile: emailOrMobile });
      }
  
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
  
      // Check password
      const isMatch = await bcrypt.compare(password, user.password);
  
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }
  
      // Return user data if signin successful
      res.json(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Server Error");
    }
  });

  // GET /api/auth/users
router.get('/admins', async (req, res) => {
    try {
      const users = await Admin.find();
      res.json(users);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });

  // Get single user by email route
router.get('/admins/:email', async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});


  router.post('/upload-profile-image', upload.single('profileImage'), async (req, res) => {
    try {
      const { email } = req.body;
      const profileImage = req.file.path;
  
      // Update user's profile image
      const user = await Admin.findOneAndUpdate({ email }, { profileImage }, { new: true });
  
      res.json(user);
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });


  // Route to get the current count of admins
router.get('/admin-count', async (req, res) => {
    try {
      const adminCount = await Admin.countDocuments();
      res.json({ count: adminCount });
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: 'Server error' });
    }
  });

  

module.exports = router;
