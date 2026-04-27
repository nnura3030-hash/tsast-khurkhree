const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String },
    phone: {
        type: String,
        unique: true,
        sparse: true, // Allow multiple documents to have a null value for this field
    },
    email: {
        type: String,
        lowercase: true,
        unique: true,
        sparse: true,
    },
    role: {
        type: String,
        default: 'user'
    },
    otp: { type: String, default: null },
    otpExpires: { type: Date, default: null }
}, { timestamps: true });

// Ensure at least one of phone or email is present
userSchema.pre('save', function() {
    if (!this.phone && !this.email) {
        throw new Error('Хэрэглэгч утасны дугаар эсвэл имэйлтэй байх ёстой.');
    }
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);