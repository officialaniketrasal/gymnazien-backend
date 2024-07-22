const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  message: { type: String, required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  eventName: { type: String, required: true },
  game: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
