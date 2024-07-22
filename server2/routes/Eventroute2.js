// routes/events.js
const express = require('express');
const Event = require('../models/Eventmodel2');
const router = express.Router();
// Assuming you have a method to get events by user
const { getUserEvents } = require('../controllers/EventController');
const socketIo = require('socket.io');
const io = socketIo();

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
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
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

router.put('/api/events/:id', async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json(updatedEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Endpoint to fetch approved players
router.get('/api/approved-players', async (req, res) => {
  try {
    const events = await Event.find();
    let approvedPlayers = [];

    events.forEach(event => {
      const players = event.players;
      approvedPlayers = approvedPlayers.concat(getApprovedPlayers(players));
    });

    res.json(approvedPlayers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


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
          sports: approvedPlayersBySport
        };
      }
    });

    res.json(approvedPlayersByEvent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to approve a player
router.put('/api/approve-player/:eventId/:sport/:playerId', async (req, res) => {
  const { eventId, sport, playerId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    const players = event.players[sport];
    const player = players.find(player => player._id.toString() === playerId);
    if (!player) {
      return res.status(404).json({ error: 'Player not found in this sport' });
    }

    // Update player approval status
    player.approve = true;

    // Save updated event
    await event.save();

    // Emit 'playerUpdated' event to notify clients
    io.emit('playerUpdated', { eventId, sport, playerId });

    res.json({ message: 'Player approved successfully', player });
  } catch (error) {
    console.error('Error approving player:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



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





module.exports = router;
