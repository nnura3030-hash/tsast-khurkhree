const mongoose = require('mongoose');

const gerSchema = new mongoose.Schema({
    gerNumber: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    location: { type: String, required: true },
    pricePerNight: { type: Number, required: true },
    capacity: { type: Number, default: 4 },
    status: {
        type: String,
        enum: ['available', 'booked', 'maintenance'],
        default: 'available'
    },
    description: { type: String },
    image: { type: String }
}, { timestamps: true });

// Энэ бол засвар:
// Модель үүсгэхээсээ өмнө аль хэдийн compile хийгдсэн эсэхийг шалгана.
// Энэ нь OverwriteModelError алдаанаас сэргийлдэг.
module.exports = mongoose.models.Ger || mongoose.model('Ger', gerSchema);