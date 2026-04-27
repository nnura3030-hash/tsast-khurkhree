const express = require('express');
const router = express.Router();
const Ger = require('../models/ger');
const Trip = require('../models/Trip');
const Product = require('../models/Product');
const Food = require('../models/Food');
const Sauna = require('../models/Sauna');

// /api/search?q=...
router.get('/', async (req, res) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ message: 'Хайх утга оруулна уу.' });
    }

    try {
        // Use a regular expression for case-insensitive search
        const regex = new RegExp(q, 'i');

        // Create search promises for all relevant models
        const gerPromise = Ger.find({
            $or: [{ title: regex }, { description: regex }, { location: regex }]
        }).limit(10).lean();

        const tripPromise = Trip.find({
            $or: [{ title: regex }, { description: regex }, { location: regex }]
        }).limit(10).lean();

        const productPromise = Product.find({
            $or: [{ name: regex }, { description: regex }, { category: regex }]
        }).limit(10).lean();

        const foodPromise = Food.find({
            $or: [{ name: regex }, { description: regex }, { category: regex }]
        }).limit(10).lean();
        
        const saunaPromise = Sauna.find({
            $or: [{ name: regex }, { description: regex }]
        }).limit(10).lean();

        // Execute all promises in parallel
        const [gers, trips, products, foods, saunas] = await Promise.all([
            gerPromise,
            tripPromise,
            productPromise,
            foodPromise,
            saunaPromise
        ]);

        // Add a 'type' field to each result object to identify it on the frontend
        const results = [
            ...gers.map(item => ({ ...item, type: 'ger' })),
            ...trips.map(item => ({ ...item, type: 'trip' })),
            ...products.map(item => ({ ...item, type: 'product' })),
            ...foods.map(item => ({ ...item, type: 'food' })),
            ...saunas.map(item => ({ ...item, type: 'sauna' }))
        ];

        res.json(results);

    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Хайлт хийхэд серверийн алдаа гарлаа.' });
    }
});

module.exports = router;