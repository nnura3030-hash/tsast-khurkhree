const express = require('express');
const router = express.Router();
const Ger = require('../models/ger');
const Booking = require('../models/Booking');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const MAX_GERS = 15;

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Uploads хавтас байхгүй бол үүсгэх
if (!fs.existsSync('./uploads/')) {
    fs.mkdirSync('./uploads/', { recursive: true });
}

// Бүх гэрийг авах
router.get('/all', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Өнөөдөр идэвхтэй байгаа захиалгын тоог гаргах (Цуцлагдаагүй)
        const activeBookingsCount = await Booking.countDocuments({
            status: { $ne: 'cancelled' },
            checkIn: { $lte: today },
            checkOut: { $gt: today }
        });

        const gers = await Ger.find().sort({ createdAt: -1 });
        
        const gersWithStatus = gers.map(ger => ({
            ...ger.toObject(),
            isFull: activeBookingsCount >= MAX_GERS
        }));

        res.json(gersWithStatus);
    } catch (err) {
        res.status(500).json({ message: "Мэдээлэл авахад алдаа гарлаа" });
    }
});

// Нэг гэрийг ID-аар нь авах (Энэ хэсэг маш чухал)
router.get('/:id', async (req, res) => {
    try {
        const ger = await Ger.findById(req.params.id);
        if (!ger) return res.status(404).json({ message: "Гэр олдсонгүй" });
        res.json(ger);
    } catch (err) {
        res.status(400).json({ message: "ID буруу байна" });
    }
});

// Гэр нэмэх
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        console.log("Frontend-ээс ирсэн өгөгдөл:", req.body); // Debug хийхэд тусална
        const { gerNumber, title, location, pricePerNight, description, capacity, status } = req.body;
        let filename = null;

        if (req.file) {
            filename = 'ger-' + Date.now() + '.jpg';
            await sharp(req.file.buffer)
                .resize(1200, null, { withoutEnlargement: true })
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(path.join('./uploads/', filename));
        }

        const newGer = new Ger({
            gerNumber, title, location, pricePerNight, description, capacity, status,
            image: filename
        });
        await newGer.save();
        res.status(201).json(newGer);
    } catch (err) {
        console.error("Гэр нэмэхэд алдаа:", err);
        res.status(400).json({ message: "Алдаа гарлаа", error: err.message });
    }
});

// Гэр засах
router.patch('/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };

        if (req.file) {
            const filename = 'ger-' + Date.now() + '.jpg';
            await sharp(req.file.buffer)
                .resize(1200, null, { withoutEnlargement: true })
                .toFormat('jpeg')
                .jpeg({ quality: 80 })
                .toFile(path.join('./uploads/', filename));
            updateData.image = filename;
        }

        const updated = await Ger.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        console.error("Гэр засахад алдаа:", err);
        res.status(400).json({ message: "Засахад алдаа гарлаа", error: err.message });
    }
});

// Гэр устгах
router.delete('/:id', async (req, res) => {
    try {
        await Ger.findByIdAndDelete(req.params.id);
        res.json({ message: "Устлаа" });
    } catch (err) {
        res.status(500).json({ message: "Устгахад алдаа гарлаа" });
    }
});

module.exports = router;