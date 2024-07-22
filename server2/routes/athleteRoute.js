const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const Athlete = require('../models/Athlete');
const Sequence = require('../models/Sequence');

// Helper function to handle Mongoose validation errors
const getErrorMessage = (err) => {
    if (err.name === 'ValidationError') {
        for (let field in err.errors) {
            return err.errors[field].message;
        }
    } else if (err.code === 11000) { // Duplicate key error
        if (err.keyValue.email) {
            console.error("Email already registered");
            return 'Email already registered';
        } else if (err.keyValue.mobile) {
            console.error("Mobile number already registered");
            return 'Mobile number already registered';
        } else if (err.keyValue.athleteCode) {
            console.error("Athlete code conflict");
            return 'Athlete code conflict, please try again';
        } else if (err.keyValue.aadhaarNumber) {
            console.error("Aadhaar number already registered");
            return 'Aadhaar number already registered';
        }
    }
    return 'Server error';
};

// Helper function to generate the next athlete code using atomic increment
const generateAthleteCode = async () => {
    const sequenceDocument = await Sequence.findOneAndUpdate(
        { _id: "athleteCode" }, // We use a fixed ID for sequence tracking
        { $inc: { sequenceValue: 1 } }, // Increment the sequence value by 1
        { new: true, upsert: true } // Return the updated document or insert if not exists
    );

    return sequenceDocument.sequenceValue.toString().padStart(6, '0');
};

// Signup route
router.post('/signup', async (req, res) => {
    try {
        const { name, email, mobile, password, pincode, city, club, district, state, country, aadhaarNumber, gender, dob } = req.body;

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate athlete code
        const athleteCode = await generateAthleteCode();

        // Create new athlete
        const athlete = new Athlete({
            name,
            email,
            mobile,
            password: hashedPassword,
            pincode,
            city,
            club,
            district,
            state,
            country,
            aadhaarNumber,
            gender,
            dob,
            athleteCode
        });

        // Save athlete to database
        await athlete.save();

        res.json({ msg: 'Athlete registered successfully' });
    } catch (err) {
        console.error(err);
        const errorMsg = getErrorMessage(err);
        res.status(400).json({ msg: errorMsg });
    }
});

// Athlete Signin Route (reusing the user signin logic)
router.post('/signin', async (req, res) => {
    const { emailOrMobile, password } = req.body;

    try {
        // Check if the athlete exists with email
        let athlete = await Athlete.findOne({ email: emailOrMobile });

        // If athlete not found with email, check with mobile
        if (!athlete) {
            athlete = await Athlete.findOne({ mobile: emailOrMobile });
        }

        if (!athlete) {
            return res.status(400).json({ message: "Athlete not found" });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, athlete.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        // Return athlete data if signin successful
        res.json(athlete);
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Server Error");
    }
});

// Endpoint to fetch all athletes
router.get('/athletes/all', async (req, res) => {
    try {
        const athletes = await Athlete.find();
        res.json(athletes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Endpoint to check if a mobile number is already registered
router.post('/athletes/check-mobile', async (req, res) => {
    const { mobile } = req.body;

    // Logic to check if the mobile number is already registered
    const athlete = await Athlete.findOne({ mobile });
    if (athlete) {
        return res.status(200).json({ registered: true });
    } else {
        return res.status(200).json({ registered: false });
    }
});

// Endpoint to search athletes by name or athleteCode
router.get('/athletes', async (req, res) => {
    const searchQuery = req.query.search;

    if (!searchQuery) {
        return res.status(400).send('Search query is required');
    }

    try {
        const athletes = await findAthletes(searchQuery);
        res.json(athletes);
    } catch (error) {
        console.error('Error fetching athletes:', error);
        res.status(500).send('Server error');
    }
});

// Helper function to search athletes by name or athleteCode
const findAthletes = async (query) => {
    const athletes = await Athlete.find({
        $or: [
            { name: { $regex: query, $options: 'i' } },
            { athleteCode: { $regex: query, $options: 'i' } }
        ]
    });

    return athletes;
};

// Endpoint to fetch a single athlete by email
router.get('/athletes/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const user = await Athlete.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Endpoint to update athlete by email
router.put('/athletes/:email', async (req, res) => {
    try {
        const email = req.params.email;
        const { name, mobile, city, club, state, country, profileImage } = req.body;

        // Find the athlete by email and update their information
        const updatedAthlete = await Athlete.findOneAndUpdate(
            { email },
            {
                name,
                mobile,
                city,
                club,
                state,
                country,
                profileImage // Assuming you might want to update the profile image URL as well
            },
            { new: true, runValidators: true } // Return the updated document and run validators
        );

        if (!updatedAthlete) {
            return res.status(404).json({ message: 'Athlete not found' });
        }

        res.status(200).json(updatedAthlete);
    } catch (err) {
        console.error(err);
        const errorMsg = getErrorMessage(err);
        res.status(400).json({ message: errorMsg });
    }
});

module.exports = router;
