const mongoose = require('mongoose');

const athleteSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  mobile: {
    type: String,
    required: false,
    unique: true
  },
  dob: {
    type: Date,
    required: true 
  },
  gender: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  pincode: {
    type: Number,
    required: true,
  },
  club: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true,
  },  
  state: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  isCompetitionVerified: {
    type: Boolean,
    default: false
  },
  athleteCode: {
    type: String,
    unique: true,
    required: true
  },
  aadhaarNumber: {
    type: String,
    required: false,
    unique: true
  }
});

const Athlete = mongoose.model('Athlete', athleteSchema);

module.exports = Athlete;
