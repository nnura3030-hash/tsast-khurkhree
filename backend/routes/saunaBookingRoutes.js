const express = require('express');
const router = express.Router();
const SaunaBooking = require('../models/SaunaBooking');

router.get('/all', async (req, res) => {
    try {
        const bookings = await SaunaBooking.find().populate('sauna');
        res.json(bookings);
    } catch (err) {
        res.status(500).json(err);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const updated = await SaunaBooking.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: "Алдаа гарлаа" });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        await SaunaBooking.findByIdAndDelete(req.params.id);
        res.json({ message: "Устгагдлаа" });
    } catch (err) {
        res.status(500).json({ message: "Устгахад алдаа гарлаа" });
    }
});

module.exports = router;