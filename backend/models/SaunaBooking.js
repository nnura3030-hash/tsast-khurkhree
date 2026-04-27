const mongoose = require('mongoose');

const saunaBookingSchema = new mongoose.Schema({
  sauna: { type: mongoose.Schema.Types.ObjectId, ref: 'Sauna', required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, required: true },
  invoiceId: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['qpay', 'card', 'cash', 'byl'], 
    default: 'byl' 
  },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.models.SaunaBooking || mongoose.model('SaunaBooking', saunaBookingSchema);