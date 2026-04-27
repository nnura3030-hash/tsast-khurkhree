const express = require('express');
const router = express.Router();
const Food = require('../models/Food'); // Моделийн нэрийг шалгаарай
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

// Бүх хоолыг авах
router.get('/all', async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    res.status(500).json({ message: "Цэс татахад алдаа гарлаа" });
  }
});

// Хоол нэмэх
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, description } = req.body;
    let filename = null;

    if (req.file) {
      filename = 'food-' + Date.now() + '.jpg';
      await sharp(req.file.buffer)
        .resize(1000, null, { withoutEnlargement: true }) // Хоолны зураг арай жижиг байж болно
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(path.join('./uploads/', filename));
    }

    const newFood = new Food({
      name, category, price, description,
      image: filename
    });
    await newFood.save();
    res.status(201).json(newFood);
  } catch (err) {
    console.error("Хоол нэмэхэд алдаа:", err);
    res.status(400).json({ message: "Хоол нэмэхэд алдаа гарлаа", error: err.message });
  }
});

// Хоол засах
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      const filename = 'food-' + Date.now() + '.jpg';
      await sharp(req.file.buffer)
        .resize(1000, null, { withoutEnlargement: true })
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(path.join('./uploads/', filename));
      updateData.image = filename;
    }

    const updated = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Засахад алдаа гарлаа" });
  }
});

// Хоол устгах
router.delete('/:id', async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Хоол устлаа" });
  } catch (err) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
});

module.exports = router;