const mongoose = require('mongoose');

const sequenceSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // This will be 'athleteCode'
    sequenceValue: { type: Number, required: true }
});

const Sequence = mongoose.model('Sequence', sequenceSchema);

module.exports = Sequence;
