const express = require('express');
const Notification = require('../models/Notification');
const router = express.Router();

// Endpoint to add a new notification
router.post('/api/notifications', async (req, res) => {
  try {
    const newNotification = new Notification(req.body);
    const savedNotification = await newNotification.save();
    res.status(201).json(savedNotification);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to fetch all notifications
router.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await Notification.find();
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint to clear all notifications
router.delete('/api/notifications', async (req, res) => {
  try {
    await Notification.deleteMany();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
