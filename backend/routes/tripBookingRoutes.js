const express = require('express');
const router = express.Router();
const TripBooking = require('../models/TripBooking');

// Шинэ захиалга нэмэх
router.post('/add', async (req, res) => {
  try {
    const { tripId, customerName, phone, peopleCount, travelDate, extraService, foodOption, isWild, totalPrice } = req.body;

    const newBooking = new TripBooking({
      trip: tripId, // Моделийн 'trip' талбарт ID-г оноож өгнө
      customerName,
      phone,
      peopleCount,
      travelDate,
      extraService,
      foodOption, // Хоолны сонголт хадгалах
      isWild,
      totalPrice
    });

    await newBooking.save();
    res.status(201).json({ message: "Амжилттай захиалагдлаа" });
  } catch (err) {
    console.error("Booking Save Error:", err);
    res.status(500).json({ message: "Захиалга хадгалахад алдаа гарлаа: " + err.message });
  }
});     

// Бүх аяллын захиалгыг авах
router.get('/all', async (req, res) => {
  try {
    const bookings = await TripBooking.find().populate('trip');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: "Мэдээлэл татахад алдаа гарлаа: " + err.message });
  }
});

// Захиалгын төлөв шинэчлэх
router.patch('/:id', async (req, res) => {
  try {
    const patch = { status: req.body.status };
    if (req.body.cancellationReason) patch.cancellationReason = req.body.cancellationReason;
    if (req.body.refundNote) patch.refundNote = req.body.refundNote;
    const updated = await TripBooking.findByIdAndUpdate(req.params.id, patch, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: "Алдаа гарлаа" });
  }
});

// Захиалга устгах
router.delete('/:id', async (req, res) => {
  try {
    await TripBooking.findByIdAndDelete(req.params.id);
    res.json({ message: "Захиалга устгагдлаа" });
  } catch (err) {
    res.status(500).json({ message: "Устгахад алдаа гарлаа" });
  }
});

module.exports = router;