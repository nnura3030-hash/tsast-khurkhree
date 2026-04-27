const express = require('express');
const router = express.Router();
const Sauna = require('../models/Sauna');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Бүх сауныг авах
router.get('/all', async (req, res) => {
    try {
        const saunas = await Sauna.find().sort({ createdAt: -1 });
        res.json(saunas);
    } catch (err) {
        res.status(500).json({ message: "Мэдээлэл авахад алдаа гарлаа" });
    }
});

// Нэг сауныг ID-аар авах
router.get('/:id', async (req, res) => {
    try {
        const sauna = await Sauna.findById(req.params.id);
        if (!sauna) return res.status(404).json({ message: "Саун олдсонгүй" });
        res.json(sauna);
    } catch (err) {
        res.status(400).json({ message: "ID буруу байна" });
    }
});

// Саун нэмэх (Админ)
router.post('/add', upload.single('image'), async (req, res) => {
    try {
        const { name, price, description } = req.body;
        let filename = null;

        if (req.file) {
            filename = 'sauna-' + Date.now() + '.jpg';
            await sharp(req.file.buffer)
                .resize(1200, null, { withoutEnlargement: true })
                .toFormat('jpeg')
                .toFile(path.join('./uploads/', filename));
        }

        const newSauna = new Sauna({ name, price, description, image: filename });
        await newSauna.save();
        res.status(201).json(newSauna);
    } catch (err) {
        res.status(400).json({ message: "Алдаа гарлаа", error: err.message });
    }
});

// Саун засах
router.patch('/:id', upload.single('image'), async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (req.file) {
            const filename = 'sauna-' + Date.now() + '.jpg';
            await sharp(req.file.buffer)
                .resize(1200, null, { withoutEnlargement: true })
                .toFormat('jpeg')
                .toFile(path.join('./uploads/', filename));
            updateData.image = filename;
        }
        const updated = await Sauna.findByIdAndUpdate(req.params.id, updateData, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Засахад алдаа гарлаа" });
    }
});

// Саун устгах
router.delete('/:id', async (req, res) => {
    try {
        await Sauna.findByIdAndDelete(req.params.id);
        res.json({ message: "Саун устгагдлаа" });
    } catch (err) {
        res.status(500).json({ message: "Устгахад алдаа гарлаа" });
    }
});

module.exports = router;