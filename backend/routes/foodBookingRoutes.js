const express = require('express');
const router = express.Router();
const FoodBooking = require('../models/FoodBooking');

// Бүх захиалгыг авах
router.get('/all', async (req, res) => {
  try {
    const bookings = await FoodBooking.find().sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Захиалга татахад алдаа гарлаа" });
  }
});

// Захиалга нэмэх
router.post('/add', async (req, res) => {
  try {
    const newBooking = new FoodBooking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: "Захиалга хадгалахад алдаа гарлаа" });
  }
});

// Төлөв шинэчлэх
router.patch('/:id', async (req, res) => {
  try {
    const patch = { status: req.body.status };
    if (req.body.cancellationReason) patch.cancellationReason = req.body.cancellationReason;
    if (req.body.refundNote) patch.refundNote = req.body.refundNote;
    const updated = await FoodBooking.findByIdAndUpdate(req.params.id, patch, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Шинэчлэхэд алдаа гарлаа" });
  }
});

module.exports = router;