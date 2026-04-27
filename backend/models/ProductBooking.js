const mongoose = require('mongoose');

const ProductBookingSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  quantity: { type: Number, default: 1 },
  invoiceId: { type: String },
  totalPrice: { type: Number, required: true },
  paymentMethod: { type: String, enum: ['qpay', 'card', 'cash', 'byl'], default: 'byl' },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled'], 
    default: 'pending' 
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.models.ProductBooking || mongoose.model('ProductBooking', ProductBookingSchema);