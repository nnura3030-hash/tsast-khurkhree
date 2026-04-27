const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');

const storage = multer.memoryStorage();
const upload = multer({ storage });

if (!fs.existsSync('./uploads/')) {
    fs.mkdirSync('./uploads/', { recursive: true });
}

// Бүх барааг авах
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: "Бараа татахад алдаа гарлаа" });
  }
});

// Нэг барааг ID-аар авах
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: "Бараа олдсонгүй" });
    res.json(product);
  } catch (err) {
    res.status(400).json({ message: "ID буруу байна" });
  }
});

// Бараа нэмэх
router.post('/add', upload.single('image'), async (req, res) => {
  try {
    const { name, category, price, description, stock } = req.body;
    let filename = null;

    if (req.file) {
      filename = 'product-' + Date.now() + '.jpg';
      await sharp(req.file.buffer)
        .resize(1000, null, { withoutEnlargement: true })
        .toFormat('jpeg')
        .jpeg({ quality: 80 })
        .toFile(path.join('./uploads/', filename));
    }

    const newProduct = new Product({
      name, category, price, description, stock,
      image: filename
    });
    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (err) {
    res.status(400).json({ message: "Бараа нэмэхэд алдаа гарлаа", error: err.message });
  }
});

// Бараа засах
router.patch('/:id', upload.single('image'), async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) {
      const filename = 'product-' + Date.now() + '.jpg';
      await sharp(req.file.buffer).resize(1000).toFile(path.join('./uploads/', filename));
      updateData.image = filename;
    }
    const updated = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Засахад алдаа гарлаа" });
  }
});

// Бараа устгах
router.delete('/:id', async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Бараа устлаа" });
  } catch (err) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
});

module.exports = router;