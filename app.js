require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const socketIo = require('socket.io');
const admin = require('firebase-admin');
const Sequence = require('./server2/models/Sequence'); // Import Sequence model

// Routes
const eventRoutes = require('./server2/routes/Eventroute');
const authRoutes = require('./server2/routes/auth');
const athleteRoutes = require('./server2/routes/athleteRoute');
const eventRoutes2 = require('./server2/routes/Eventroute2');
const emailRoutes = require('./server2/routes/email');
const certificateRoutes = require('./server2/routes/certificateRoute');
const previewCertificateRoutes = require('./server2/routes/previewCertificateRoute');
const notificationRouter = require('./server2/routes/Notifications');
const superAdminRoutes = require('./server2/routes/superAdminRoute');

// Initialize Firebase Admin
admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const app = express();
const port = process.env.PORT || 5000; // Use environment variable or default to 5000

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files from the "uploads" directory

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(async () => {
     console.log('Connected to MongoDB');

    // Initialize the sequence for athleteCode
    await initializeAthleteCodeSequence(); // Call sequence initialization

}).catch((error) => {
    console.error('Error connecting to MongoDB:', error.message);
    process.exit(1); // Exit process with failure
});

// Initialize athleteCode sequence
const initializeAthleteCodeSequence = async () => {
    try {
        const existingSequence = await Sequence.findOne({ _id: 'athleteCode' });
        if (!existingSequence) {
            await new Sequence({ _id: 'athleteCode', sequenceValue: 0 }).save();
            console.log('Sequence for athleteCode initialized successfully.');
        } else {
            console.log('Sequence for athleteCode already initialized.');
        }
    } catch (error) {
        console.error('Error initializing sequence for athleteCode:', error);
    }
};

// Middleware and Routes
app.use('/', eventRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/athlete', athleteRoutes); // Add athlete routes
app.use('/api/competitionss', eventRoutes2);
app.use('/api', emailRoutes);
app.use('/api', certificateRoutes); // Add certificate routes
app.use('/api', previewCertificateRoutes)
app.use('/', notificationRouter);
app.use('/api/admin/superadmin', superAdminRoutes);

const server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

// WebSocket setup
const io = socketIo(server, {
    cors: {
        origin: 'http://localhost:3000', // Your frontend URL
        methods: ['GET', 'POST', 'PUT'],
        credentials: true,
    },
});

// Set io instance to be accessible in routes
app.set('io', io);

// Handle socket connections
io.on('connection', (socket) => {
    console.log('Client connected');

    socket.on('playerUpdate', () => {
        console.log('Player update received');
        io.emit('playerUpdated');
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});
