const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    ger: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Ger', 
        required: true 
    },
    customerName: { type: String, required: true },
    phone: { type: String, required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    totalPrice: { type: Number, required: true },
    invoiceId: { type: String },
    paymentMethod: { 
        type: String, 
        enum: ['qpay', 'card', 'cash', 'byl'], 
        default: 'qpay' 
    },
    status: { type: String, default: 'pending' }
}, { timestamps: true });

module.exports = mongoose.models.Booking || mongoose.model('Booking', bookingSchema);