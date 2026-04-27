const express = require('express');
const router = express.Router();
const ProductBooking = require('../models/ProductBooking');

// Захиалга нэмэх
router.post('/add', async (req, res) => {
  try {
    const newBooking = new ProductBooking(req.body);
    await newBooking.save();
    res.status(201).json({ message: "Захиалга амжилттай" });
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа: " + err.message });
  }
});

// Бүх захиалгыг авах
router.get('/all', async (req, res) => {
  try {
    const bookings = await ProductBooking.find().populate('productId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Алдаа гарлаа: " + err.message });
  }
});

// Төлөв шинэчлэх
router.patch('/:id', async (req, res) => {
  try {
    const patch = { status: req.body.status };
    if (req.body.cancellationReason) patch.cancellationReason = req.body.cancellationReason;
    if (req.body.refundNote) patch.refundNote = req.body.refundNote;
    const updated = await ProductBooking.findByIdAndUpdate(req.params.id, patch, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Алдаа гарлаа" });
  }
});

// Захиалга устгах
router.delete('/:id', async (req, res) => {
  try {
    await ProductBooking.findByIdAndDelete(req.params.id);
    res.json({ message: "Захиалга устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
});

module.exports = router;