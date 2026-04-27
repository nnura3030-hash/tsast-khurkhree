const mongoose = require('mongoose');

const saunaSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String },
  image: { type: String },
}, { 
  timestamps: true 
});

module.exports = mongoose.models.Sauna || mongoose.model('Sauna', saunaSchema);