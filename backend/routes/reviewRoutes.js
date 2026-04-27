const express = require('express');
const router = express.Router();
const Review = require('../models/Review');

// Бүх сэтгэгдлийг авах (Админд)
router.get('/all', async (req, res) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Тухайн үйлчилгээний үнэлгээнүүдийг авах
router.get('/:refId', async (req, res) => {
  try {
    const reviews = await Review.find({ refId: req.params.refId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Шинэ үнэлгээ нэмэх
router.post('/add', async (req, res) => {
  try {
    const { refId, refType, userName, rating, comment, phone } = req.body;
    const newReview = new Review({ refId, refType, userName, rating, comment, phone });
    await newReview.save();
    res.status(201).json(newReview);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Сэтгэгдэлд хариу бичих (Админд)
router.patch('/:id/reply', async (req, res) => {
  try {
    const updated = await Review.findByIdAndUpdate(
      req.params.id, 
      { reply: req.body.reply }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Хариу хадгалахад алдаа гарлаа" });
  }
});

// Сэтгэгдэл устгах (Админд)
router.delete('/:id', async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Сэтгэгдэл устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
});

module.exports = router;