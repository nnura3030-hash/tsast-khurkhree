const express = require('express');
const router = express.Router();
const Trip = require('../models/Trip'); // Модел чинь энэ байршилд байгаа гэж үзлээ
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Uploads хавтас байхгүй бол үүсгэх
if (!fs.existsSync('./uploads/')) {
    fs.mkdirSync('./uploads/', { recursive: true });
}

// Бүх аялалыг авах
router.get('/all', async (req, res) => {
  try {
    const trips = await Trip.find().sort({ createdAt: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: "Мэдээлэл татахад алдаа гарлаа" });
  }
});

// Нэг аялал авах
router.get('/:id', async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Аялал олдсонгүй" });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ message: "ID буруу байна" });
  }
});

// Шинэ аялал нэмэх
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { title, location, pricePerPerson, duration } = req.body;
    let filename = null;

    if (req.file) {
      filename = 'trip-' + Date.now() + '.jpg';
      await sharp(req.file.buffer)
        .resize(1200, null, { withoutEnlargement: true }) // Өргөнийг дээд тал нь 1200px болгоно
        .toFormat('jpeg')
        .jpeg({ quality: 80 }) // Чанарыг 80% болгож хэмжээг багасгана
        .toFile(path.join('./uploads/', filename));
    }

    const newTrip = new Trip({
      title, location, pricePerPerson, duration,
      image: filename
    });
    await newTrip.save();
    res.status(201).json(newTrip);
  } catch (err) {
    res.status(400).json({ message: "Аялал нэмэхэд алдаа гарлаа: " + err.message });
  }
});

// Аялал засах
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const filename = 'trip-' + Date.now() + '.jpg';
      await sharp(req.file.buffer)
        .resize(1200, null, { withoutEnlargement: true })
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(path.join('./uploads/', filename));
      updateData.image = filename;
    }

    const updated = await Trip.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Засахад алдаа гарлаа" });
  }
});

// Аялал устгах
router.delete('/:id', async (req, res) => {
  try {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: "Амжилттай устлаа" });
  } catch (err) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
});

module.exports = router;