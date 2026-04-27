const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
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

// Get settings
router.get('/', async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) {
            settings = new Setting();
            await settings.save();
        }
        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update settings with multiple images
const uploadFields = [
    { name: 'image', maxCount: 1 },
    { name: 'heroImage', maxCount: 1 },
    { name: 'destinationImage', maxCount: 1 },
    { name: 'advantageImg1', maxCount: 1 },
    { name: 'advantageImg2', maxCount: 1 },
    { name: 'advantageImg3', maxCount: 1 },
    { name: 'serviceImg1', maxCount: 1 },
    { name: 'serviceImg2', maxCount: 1 },
    { name: 'serviceImg3', maxCount: 1 },
    { name: 'serviceImg4', maxCount: 1 },
    { name: 'serviceImg5', maxCount: 1 },
    { name: 'serviceImg6', maxCount: 1 },
    { name: 'stepImg1', maxCount: 1 },
    { name: 'stepImg2', maxCount: 1 },
    { name: 'stepImg3', maxCount: 1 },
    { name: 'featureImg1', maxCount: 1 },
    { name: 'featureImg2', maxCount: 1 },
    { name: 'featureImg3', maxCount: 1 },
    { name: 'featureImg4', maxCount: 1 },
    { name: 'locationCard1Img', maxCount: 1 },
    { name: 'locationCard2Img', maxCount: 1 },
    { name: 'locationCard3Img', maxCount: 1 },
    { name: 'locationCard4Img', maxCount: 1 },
    { name: 'locationCard5Img', maxCount: 1 },
    { name: 'locationCard6Img', maxCount: 1 },
];

router.post('/update', upload.fields(uploadFields), async (req, res) => {
    try {
        let settings = await Setting.findOne();
        if (!settings) settings = new Setting();

        // Update all text fields dynamically so admin can manage all homepage sections
        Object.entries(req.body || {}).forEach(([field, value]) => {
            settings[field] = value;
        });

        // Handle file uploads
        if (req.files) {
            for (const fieldName of Object.keys(req.files)) {
                const file = req.files[fieldName][0];
                const filename = `${fieldName}-${Date.now()}.jpg`;
                
                // Check if uploads folder exists, if not sharp might fail or you need to ensure it's there
                await sharp(file.buffer)
                    .resize(1200, null, { withoutEnlargement: true })
                    .toFormat('jpeg')
                    .jpeg({ quality: 80 })
                    .toFile(path.join('./uploads/', filename));
                
                settings[fieldName] = filename;
            }
        }

        await settings.save();
        res.json(settings);
    } catch (err) {
        console.error("Settings update error:", err);
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
