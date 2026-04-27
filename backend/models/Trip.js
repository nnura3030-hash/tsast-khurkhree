const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  location: { type: String, required: true },
  pricePerPerson: { type: Number, required: true },
  image: { type: String },
  duration: { type: String, default: "1 өдөр" }
}, { 
  timestamps: true 
});

module.exports = mongoose.models.Trip || mongoose.model('Trip', tripSchema);