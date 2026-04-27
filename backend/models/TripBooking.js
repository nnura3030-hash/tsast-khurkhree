const mongoose = require('mongoose');

const tripBookingSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  customerName: { type: String, required: true },
  phone: { type: String, required: true },
  peopleCount: { type: Number, required: true },
  travelDate: { type: Date, required: true },
  foodOption: { type: String, default: 'none' },
  extraService: { type: String, default: 'none' }, // mori, temee, none
  isWild: { type: Boolean, default: false }, // Догшин эсэх
  totalPrice: { type: Number, required: true },
  invoiceId: { type: String },
  paymentMethod: { 
    type: String, 
    enum: ['qpay', 'card', 'cash', 'byl'], 
    default: 'byl' 
  },
  status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.models.TripBooking || mongoose.model('TripBooking', tripBookingSchema);