const mongoose = require('mongoose');

const foodBookingSchema = new mongoose.Schema({
  foodName: {
    type: String,
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  invoiceId: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String, 
    enum: ['qpay', 'card', 'cash', 'byl'], 
    default: 'byl' 
  }
}, { timestamps: true });

module.exports = mongoose.models.FoodBooking || mongoose.model('FoodBooking', foodBookingSchema);