const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  refId: { type: mongoose.Schema.Types.ObjectId, required: true }, // gerId эсвэл tripId
  refType: { type: String, enum: ['Ger', 'Trip'], required: true },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  phone: { type: String, required: true },
  reply: { type: String }
}, { timestamps: true });

module.exports = mongoose.models.Review || mongoose.model('Review', reviewSchema);