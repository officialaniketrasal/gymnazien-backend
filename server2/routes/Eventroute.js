// routes/events.js
const express = require('express');
const Event = require('../models/Eventmodel');
const router = express.Router();
const fs = require('fs')
// Assuming you have a method to get events by user
const { getUserEvents } = require('../controllers/EventController');
const socketIo = require('socket.io');
const io = socketIo();
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');
const PDFDocument = require('pdfkit');
const path = require('path');
const QRCode = require('qrcode');
const multer = require('multer');
const crypto = require('crypto');


// Endpoint to create a new event
// router.post('/api/events', async (req, res) => {
//   try {
//     const newEvent = new Event(req.body);
//     const savedEvent = await newEvent.save();
//     res.status(201).json(savedEvent);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// Function to get approved players
// Function to get approved players

// Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/');
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   },
// });

// const upload = multer({ storage });

// Configure multer for file uploads
// const upload = multer({ dest: 'uploads/' });

// Configure multer for file uploads
const upload = multer({ dest: 'uploads/' });

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Ensure uploads directory exists
// const uploadsDir = path.join(__dirname, '../uploads');
// if (!fs.existsSync(uploadsDir)) {
//   fs.mkdirSync(uploadsDir);
// }


// Helper function to generate PDF
// const generateCertificatePDF = async (certificate, filePath, eventId) => {
//   const doc = new PDFDocument();
//   doc.pipe(fs.createWriteStream(filePath));
//   // Generate the QR code
//   const qrCodeDataUrl = await QRCode.toDataURL(`http://localhost:3000/${eventId}/verify-certificate/${certificate.certificateNumber}`);

//   doc.fontSize(25).text(`Certificate of Achievement`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(20).text(`This certificate is awarded to`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(30).text(certificate.playerName, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(20).text(`for outstanding performance.`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(15).text(`Athlete Code: ${certificate.athleteCode}`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(15).text(`Certificate Number: ${certificate.certificateNumber}`, { align: 'center' });

//   // Draw the QR code
//   doc.moveDown();
//   doc.image(qrCodeDataUrl, {
//     fit: [100, 100],
//     align: 'center',
//     valign: 'center'
//   });

//   doc.end();
// };

// Helper function to generate PDF with template
// const generateCertificatePDF = async (certificate, filePath, templatePath, namePosition, athleteCodePosition, eventId) => {
//   const doc = new PDFDocument({
//     size: 'A4',
//     layout: 'landscape',
//   });

//   doc.pipe(fs.createWriteStream(filePath));
//   // Generate the QR code
//   const qrCodeDataUrl = await QRCode.toDataURL(`http://localhost:3000/${eventId}/verify-certificate/${certificate.certificateNumber}`);


//   doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });
//   doc.fontSize(25).text(`Certificate of Achievement`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(20).text(`This certificate is awarded to`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(30).text(certificate.playerName, namePosition);
//   doc.moveDown();
//   doc.fontSize(20).text(`for outstanding performance.`, { align: 'center' });
//   doc.moveDown();
//   doc.fontSize(15).text(`Athlete Code: ${certificate.athleteCode}`, athleteCodePosition);
//   doc.moveDown();
//   doc.fontSize(15).text(`Certificate Number: ${certificate.certificateNumber}`, { align: 'center' });

//   // Draw the QR code
//   doc.moveDown();
//   doc.image(qrCodeDataUrl, {
//     fit: [100, 100],
//     align: 'center',
//     valign: 'center'
//   });
//   doc.end();
// };


const getApprovedPlayers = (players) => {
  const approvedPlayers = [];

  for (const sport in players) {
    if (players.hasOwnProperty(sport)) {
      players[sport].forEach(player => {
        if (player.approve) {
          approvedPlayers.push({
            sport,
            name: player.name,
            mobile: player.mobile,
            scores: player.scores,
            total: player.total,
          });
        }
      });
    }
  }

  return approvedPlayers;
};

// Function to get approved players for each sport
const getApprovedPlayersBySport = (players) => {
  const approvedPlayersBySport = {};

  for (const sport in players) {
    if (players.hasOwnProperty(sport)) {
      const approvedPlayers = players[sport].filter(player => player.approve);
      if (approvedPlayers.length > 0) {
        approvedPlayersBySport[sport] = approvedPlayers;
      }
    }
  }

  return approvedPlayersBySport;
};

// Helper function to get the list of supervisors for a sport
const getSupervisorsBySport = (supervisors, sport) => {
  return supervisors[sport] || null;
};

// Emit the updated player list whenever a player is approved
const emitUpdatedPlayers = async (io) => {
  try {
      const events = await Event.find();
      const approvedPlayersByEvent = {};

      events.forEach(event => {
          const approvedPlayersBySport = getApprovedPlayersBySport(event.players);
          if (Object.keys(approvedPlayersBySport).length > 0) {
              approvedPlayersByEvent[event._id] = {
                  eventName: event.eventName,
                  eventId: event._id,
                  sports: approvedPlayersBySport
              };
          }
      });

      io.emit('playerUpdated', approvedPlayersByEvent);
  } catch (error) {
      console.error('Error emitting updated players:', error);
  }
};


// Endpoint to fetch all events
router.get('/api/events', async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/api/events', async (req, res) => {
  try {
    // Ensure d1 is present in req.body and initialize it to 0 if not present
    const bodyWithDefaultD1 = { ...req.body, d1: req.body.d1 || 0 };
    const newEvent = new Event(bodyWithDefaultD1);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Endpoint to fetch a specific event
router.get('/api/events/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to update a specific event
router.put('/api/events/:id', async (req, res) => {
  const io = req.app.get('io');
  try {
      const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!updatedEvent) {
          return res.status(404).json({ error: 'Event not found' });
      }
      // Emit updated player list
      emitUpdatedPlayers(io);
      res.json(updatedEvent);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
});

// Endpoint to delete a specific event
router.delete('/api/events/:id', async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(deletedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get event by ID
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update event by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEvent);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Endpoint to get events for a specific user
router.get('/user-events', async (req, res) => {
  const { email, mobile } = req.query;

  try {
    const events = await getUserEvents(email, mobile);
    res.json(events);
  } catch (error) {
    console.error('Error fetching user events:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



// router.put('/api/events/:id', async (req, res) => {
//   const { id } = req.params;
//   const io = req.app.get('io');
//   try {
//     const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
//     if (!updatedEvent) {
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     // Emit updated player list
//     emitUpdatedPlayers(io);
//     res.json(updatedEvent);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// Endpoint to fetch approved players
// router.get('/api/approved-players', async (req, res) => {
//   try {
//     const events = await Event.find();
//     let approvedPlayers = [];

//     events.forEach(event => {
//       const players = event.players;
//       approvedPlayers = approvedPlayers.concat(getApprovedPlayers(players));
//     });

//     res.json(approvedPlayers);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });


// Endpoint to fetch approved players grouped by events and sports
router.get('/api/approved-players-spot', async (req, res) => {
  try {
    const events = await Event.find();
    const approvedPlayersByEvent = {};

    events.forEach(event => {
      const approvedPlayersBySport = getApprovedPlayersBySport(event.players);
      if (Object.keys(approvedPlayersBySport).length > 0) {
        // Use eventId as the key instead of eventName
        approvedPlayersByEvent[event._id] = {
          eventName: event.eventName,
          eventId: event._id,
          sports: approvedPlayersBySport,
          eventStatus: event.eventStatus,
          competitionLevel: event.competitionLevel,
          dateTime: event.dateTime,
          category: event.category,
          teams: event.teams,
        };
      }
    });

    res.json(approvedPlayersByEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to approve a player
// router.put('/api/approve-player/:eventId/:sport/:playerId', async (req, res) => {
//   const { eventId, sport, playerId } = req.params;

//   try {
//     const event = await Event.findById(eventId);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     const players = event.players[sport];
//     const player = players.find(player => player._id.toString() === playerId);
//     if (!player) {
//       return res.status(404).json({ error: 'Player not found in this sport' });
//     }

//     // Update player approval status
//     player.approve = true;

//     // Save updated event
//     await event.save();

//     // Emit 'playerUpdated' event to notify clients
//     io.emit('playerUpdated', { eventId, sport, playerId });

//     res.json({ message: 'Player approved successfully', player });
//   } catch (error) {
//     console.error('Error approving player:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });



// Endpoint to fetch supervisor panel data for a specific event and sport
router.get('/api/supervisor-panel/:eventId/:sport', async (req, res) => {
  const { eventId, sport } = req.params;
  
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const supervisors = event.supervisors;
    const players = event.players[sport] || [];

    const supervisorDetails = getSupervisorsBySport(supervisors, sport);

    if (!supervisorDetails) {
      return res.status(404).json({ error: `No supervisors found for the sport: ${sport}` });
    }

    res.json({ sport, supervisors: supervisorDetails, players });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all supervisors for a specific event
router.get('/api/supervisors/:eventId', async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ eventName: event.eventName, supervisors: event.supervisors });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to add a team to an event
router.post('/api/events/:eventId/teams', async (req, res) => {
  const { eventId } = req.params;
  const { teamName, players } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const newTeam = { teamName, players };
    event.teams.push(newTeam);
    await event.save();

    res.status(201).json(event);
  } catch (error) {
    console.error('Error adding team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to update a team in an event
router.put('/api/events/:eventId/teams/:teamId', async (req, res) => {
  const { eventId, teamId } = req.params;
  const { teamName, players } = req.body;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const teamToUpdate = event.teams.id(teamId);
    if (!teamToUpdate) {
      return res.status(404).json({ error: 'Team not found in this event' });
    }

    teamToUpdate.teamName = teamName;
    teamToUpdate.players = players;
    await event.save();

    res.json(event);
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to delete a team from an event
router.delete('/api/events/:eventId/teams/:teamId', async (req, res) => {
  const { eventId, teamId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    event.teams.pull(teamId); // Remove team by its _id
    await event.save();

    res.json(event);
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Endpoint to fetch all teams for an event
router.get('/api/events/:eventId/teams', async (req, res) => {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const teams = event.teams;
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});




// certiicate Routes

// Endpoint to upload certificate template
// router.post('/api/events/:id/upload-certificate', upload.single('certificate'), async (req, res) => {
//   const { id } = req.params; // Destructure `id` from `req.params`
//   try{
//     const event =  await Event.findById(id);
//     if(!event){
//       return res.status(404).json({ error: 'Event not found' });
//     }
//     if (!req.file) {
//       return res.status(400).json({ success: false, message: 'No file uploaded' });
//     }
//     return res.status(200).json({ success: true, filePath: req.file.path });
//   } catch (error) {
//     res.status(500).json({ error: 'Server error' });
//   }
  
// });

router.get('/api/events/:id/verify-certificate/:certificateNumber', async (req, res) => {
  const { id, certificateNumber } = req.params; // Destructure `id` from `req.params`
  
  try {
    const event = await Event.findById(id); // Use `id` to find the event
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Use the `find` method to search through the certificates array
    const certificate = event.certificates.find(cert => cert.certificateNumber === certificateNumber);
    
    if (certificate) {
      res.json({ name: certificate.playerName });
    } else {
      res.status(404).json({ error: 'Certificate not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});


// // Endpoint to store certificates and send emails
// router.post('/api/events/:id/certificates', async (req, res) => {
//   try {
//     const { eventId, certificates } = req.body;
//     const event = await Event.findById(eventId);

//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     // Generate unique certificate numbers
//     const updatedCertificates = certificates.map(certificate => ({
//       ...certificate,
//       certificateNumber: uuidv4().replace(/-/g, '').slice(0, 12), // Generate 12 digit unique code
//     }));

//     event.certificates.push(...updatedCertificates);
//     await event.save();

//     // Send emails
//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: 'rasalaniket00@gmail.com', // replace with your email
//         pass: 'mheb bwxe uafw qisi', // replace with your email password
//       },
//     });

//     for (const certificate of updatedCertificates) {
//       const filePath = path.join(__dirname, `../uploads/${certificate.certificateNumber}.pdf`);
//       generateCertificatePDF(certificate, filePath, eventId,);

//       const mailOptions = {
//         from: 'rasalaniket00@gmail.com',
//         to: certificate.email,
//         subject: 'Your Certificate',
//         text: `Congratulations ${certificate.playerName}, here is your certificate!`,
//         attachments: [
//           {
//             filename: 'certificate.pdf',
//             path: filePath,
//           },
//         ],
//       };

//       await transporter.sendMail(mailOptions);
//     }

//     res.status(200).json({ message: 'Certificates stored and emails sent', certificates: updatedCertificates });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// });



function generateUniqueNumericCode() {
  let code = '';
  while (code.length < 12) {
      code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

const generatedCodes = new Set();


// Endpoint to upload certificate template
router.post('/api/events/:id/upload-certificate', upload.single('certificate'), async (req, res) => {
  const { id } = req.params;
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    return res.status(200).json({ success: true, filePath: req.file.path });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper function to generate certificates with the uploaded template
const generateCertificateWithTemplate = async (certificate, templatePath, filePath, eventId, namePosition) => {
  const doc = new PDFDocument();
  doc.pipe(fs.createWriteStream(filePath));
  const qrCodeDataUrl = await QRCode.toDataURL(`http://localhost:3000/${eventId}/verify-certificate/${certificate.certificateNumber}`);

  doc.image(templatePath, 0, 0, { width: doc.page.width, height: doc.page.height });

  // doc.fontSize(25).text('Certificate of Achievement', 50, 50, { align: 'center' });
  // doc.moveDown();
  // doc.fontSize(20).text('This certificate is awarded to', { align: 'center' });
  // doc.moveDown();
  doc.fontSize(30).text(certificate.playerName, { align: 'center' }, namePosition.top);
  doc.moveDown();
  // doc.fontSize(20).text('for outstanding performance.', { align: 'center' });
  // doc.moveDown();
  // doc.fontSize(15).text(`Athlete Code: ${certificate.athleteCode}`, { align: 'center' });
  // doc.moveDown();
  

  doc.moveDown();
  doc.image(qrCodeDataUrl, doc.page.width / 2 - 50, doc.page.height - 168, { fit: [100, 100] });
  doc.moveDown();
  doc.fontSize(12).text(`Certificate Number: ${certificate.certificateNumber}`, doc.page.width / 2 - 270, doc.page.height - 86, { fit: [100, 100] });

  doc.end();
};

// Endpoint to send certificates
router.post('/api/events/:id/certificates', upload.single('file'), async (req, res) => {
  const { id } = req.params;
  const { certificates } = req.body;
  const namePosition = JSON.parse(req.body.namePosition);
  try {
    const event = await Event.findById(id);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    if (!namePosition) {
      return res.status(400).json({ error: 'Name position is required' });
    }

    // Generate unique certificate numbers
    
    const uploadedFilePath = req.file.path;

    const certificateList = JSON.parse(certificates).map(async (certificate) => {
      // const certificateNumber = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
      let certificateNumber;
    do {
        certificateNumber = generateUniqueNumericCode();
    } while (generatedCodes.has(certificateNumber));

    generatedCodes.add(certificateNumber);
      const filePath = path.join(__dirname, '../certificates', `${certificateNumber}.pdf`);
      await generateCertificateWithTemplate({ ...certificate, certificateNumber }, uploadedFilePath, filePath, id, namePosition);

      // Send email with the certificate as attachment
      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          user: 'rasalaniket00@gmail.com', // replace with your email
    pass: 'mheb bwxe uafw qisi', // replace with your email password
        },
      });

      const mailOptions = {
        from: 'rasalaniket00@gmail.com',
        to: certificate.email,
        subject: 'Your Certificate',
        text: 'Congratulations! Please find your certificate attached.',
        attachments: [
          {
            filename: 'certificate.pdf',
            path: filePath,
          },
        ],
      };

      await transporter.sendMail(mailOptions);

      return {
        ...certificate,
        certificateNumber,
      };
    });

    const updatedCertificates = await Promise.all(certificateList);

    event.certificates.push(...updatedCertificates);
    await event.save();

    res.status(200).json({ certificates: updatedCertificates });
  } catch (error) {
    console.error('Error sending certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// router.post('/api/events/:id/certificates/send-to-one', upload.single('file'), async (req, res) => {
//   const { id } = req.params;
//   const { namePosition, recipientEmail } = req.body;

//   try {
//     const event = await Event.findById(id);
//     if (!event) {
//       return res.status(404).json({ error: 'Event not found' });
//     }

//     const players = event.players[req.params.game];
//     if (!players || players.length === 0) {
//       return res.status(404).json({ error: 'No players found for this event' });
//     }

//     const uploadedFilePath = req.file.path;

//     const doc = new PDFDocument();

//     players.forEach((player, index) => {
//       if (index > 0) {
//         doc.addPage();
//       }

//       const certificateNumber = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
//       const qrCodeDataUrl = QRCode.toDataURL(`http://localhost:3000/${id}/verify-certificate/${certificateNumber}`);

//       doc.image(uploadedFilePath, 0, 0, { width: doc.page.width, height: doc.page.height });

//       if (namePosition && typeof namePosition.left === 'number' && typeof namePosition.top === 'number') {
//         doc.fontSize(30).text(player.name, namePosition.left, namePosition.top);
//       } else {
//         throw new Error('Invalid name position');
//       }

//       doc.moveDown();
//       doc.fontSize(15).text(`Athlete Code: ${player.athleteCode}`, { align: 'center' });
//       doc.moveDown();
//       doc.fontSize(15).text(`Certificate Number: ${certificateNumber}`, { align: 'center' });

//       doc.moveDown();
//       doc.image(qrCodeDataUrl, doc.page.width / 2 - 50, doc.page.height / 2, { width: 100, height: 100 });
//     });

//     const filePath = path.join(__dirname, '../certificates', `${uuidv4()}.pdf`);
//     doc.pipe(fs.createWriteStream(filePath));
//     doc.end();

//     const transporter = nodemailer.createTransport({
//       service: 'Gmail',
//       auth: {
//         user: 'rasalaniket00@gmail.com', // replace with your email
//         pass: 'mheb bwxe uafw qisi', // replace with your email password
//       },
//     });

//     const mailOptions = {
//       from: 'rasalaniket00@gmail.com',
//       to: recipientEmail,
//       subject: 'All Event Certificates',
//       text: 'Please find all event certificates attached.',
//       attachments: [
//         {
//           filename: 'all_certificates.pdf',
//           path: filePath,
//         },
//       ],
//     };

//     await transporter.sendMail(mailOptions);

//     res.status(200).json({ message: 'All certificates sent to one person successfully!' });
//   } catch (error) {
//     console.error('Error sending all certificates to one person:', error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

router.post('/api/events/:id/:game/certificates/send-to-one', upload.single('file'), async (req, res) => {
  const { id, game } = req.params;
  const { recipientEmail } = req.body;
  const namePosition = JSON.parse(req.body.namePosition);

  try {
      const event = await Event.findById(id);
      if (!event) {
          return res.status(404).json({ error: 'Event not found' });
      }

      const players = event.players[game];
      if (!players || players.length === 0) {
          return res.status(404).json({ error: 'No players found for this event' });
      }

      const uploadedFilePath = req.file.path;
      const doc = new PDFDocument();

      const filePath = path.join(__dirname, '../certificates', `${uuidv4()}.pdf`);
      doc.pipe(fs.createWriteStream(filePath));
      const updatedCertificates = [];

      for (const player of players) {
          doc.addPage();

          // const certificateNumber = uuidv4().replace(/-/g, '').slice(0, 12).toUpperCase();
          let certificateNumber;
    do {
        certificateNumber = generateUniqueNumericCode();
    } while (generatedCodes.has(certificateNumber));

    generatedCodes.add(certificateNumber);
          const qrCodeDataUrl = await QRCode.toDataURL(`http://localhost:3000/${id}/verify-certificate/${certificateNumber}`);

          doc.image(uploadedFilePath, 0, 0, { width: doc.page.width, height: doc.page.height });

          if (namePosition  && typeof namePosition.top === 'number') {
              doc.fontSize(30).text(player.name, { align: 'center' }, namePosition.top);
          } else {
              throw new Error('Invalid name position');
          }

          // doc.moveDown();
          // doc.fontSize(15).text(`Athlete Code: ${player.athleteCode}`, { align: 'center' });
          // doc.moveDown();
          // doc.fontSize(15).text(`Certificate Number: ${certificateNumber}`, { align: 'center' });

          // doc.moveDown();
          // doc.image(qrCodeDataUrl, doc.page.width / 2 - 50, doc.page.height - 150, { width: 100, height: 100 });
          

          doc.moveDown();
  doc.image(qrCodeDataUrl, doc.page.width / 2 - 50, doc.page.height - 168, { fit: [100, 100] });
  doc.moveDown();
  doc.fontSize(12).text(`Certificate Number: ${certificateNumber}`, doc.page.width / 2 - 270, doc.page.height - 86, { fit: [100, 100] });


           // Prepare certificate data for saving
           updatedCertificates.push({
            name: player.name,
            email: player.email,
            athleteCode: player.athleteCode,
            certificateNumber: certificateNumber,
        });
      }


      doc.end();

      const transporter = nodemailer.createTransport({
          service: 'Gmail',
          auth: {
            user: 'rasalaniket00@gmail.com', // replace with your email
            pass: 'mheb bwxe uafw qisi', // replace with your email password
          },
      });

      const mailOptions = {
          from: 'rasalaniket00@gmail.com',
          to: recipientEmail,
          subject: 'All Event Certificates',
          text: 'Please find all event certificates attached.',
          attachments: [
              {
                  filename: 'all_certificates.pdf',
                  path: filePath,
              },
          ],
      };

      await transporter.sendMail(mailOptions);

       // Save certificates in the backend
       event.certificates.push(...updatedCertificates);
       await event.save();

      res.status(200).json({ message: 'All certificates sent to one person successfully!' });
  } catch (error) {
      console.error('Error sending all certificates to one person:', error);
      res.status(500).json({ error: 'Internal server error' });
  }
});



module.exports = router;
