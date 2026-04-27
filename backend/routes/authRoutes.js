const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authMiddleware = require('../authMiddleware'); // Замыг зөв болгож засав
const axios = require('axios');
const nodemailer = require('nodemailer');
const BYL_SMS_API_URL = process.env.BYL_SMS_API_URL || 'https://byl.mn/api/v1/send';

const emailConfigured = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS);
const transporter = emailConfigured
    ? nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: Number(process.env.EMAIL_PORT) === 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
    : null;

const sendEmail = async (to, subject, text) => {
    if (!transporter) {
        console.warn(`[EMAIL] Тохиргоо байхгүй тул имэйл илгээгдсэнгүй. Хүлээн авагч: ${to}`);
        return;
    }
    try {
        await transporter.sendMail({
            from: `"${process.env.EMAIL_FROM_NAME || 'Tsast Khurkhree'}" <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
            to, subject, text, html: `<b>${text}</b>`,
        });
        console.log(`[EMAIL] Verification code successfully sent to ${to}`);
    } catch (error) {
        console.error("Email илгээхэд алдаа гарлаа:", error.message);
    }
};
/**
 * Byl.mn рүү SMS илгээх туслах функц
 */
const sendSMS = async (phone, message) => {
    try {
        await axios.post(BYL_SMS_API_URL, {
            key: process.env.BYL_SMS_TOKEN, // Byl.mn-ээс авсан API Token
            from: process.env.BYL_SMS_SENDER || 'GerConnect',
            to: phone,
            text: message
        }, {
            timeout: 10000 // SMS илгээхэд 10 секунд хүлээнэ
        });
        console.log(`[SMS] OTP successfully sent to ${phone}`);
    } catch (error) {
        console.error("SMS илгээхэд алдаа гарлаа:", error.response?.data || error.message);
    }
};

router.post('/register', async (req, res) => {
    try {
        const { identifier, name } = req.body;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{8}$/.test(identifier);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: "Утасны дугаар эсвэл имэйл хаягаа зөв оруулна уу." });
        }

        const existingUser = await User.findOne(isPhone ? { phone: identifier } : { email: identifier.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: "Энэ хэрэглэгч бүртгэлтэй байна." });
        }

        const newUserPayload = { name };
        if (isPhone) {
            newUserPayload.phone = identifier;
        } else {
            newUserPayload.email = identifier.toLowerCase();
        }

        const newUser = new User(newUserPayload);
        await newUser.save();
        res.status(201).json({ message: "Амжилттай бүртгэгдлээ" });
    } catch (err) {
        if (err.code === 11000) { // Duplicate key error
            return res.status(400).json({ message: "Энэ хэрэглэгч бүртгэлтэй байна." });
        }
        res.status(500).json({ message: "Бүртгэлд алдаа гарлаа", error: err.message });
    }
});

// НЭВТРЭХ - OTP ИЛГЭЭХ
router.post('/login', async (req, res) => {
    try {
        const { identifier } = req.body;
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);
        const isPhone = /^\d{8}$/.test(identifier);

        if (!isEmail && !isPhone) {
            return res.status(400).json({ message: "Утасны дугаар эсвэл имэйл хаягаа зөв оруулна уу." });
        }

        let user;
        if (isPhone) {
            user = await User.findOne({ phone: identifier });
            if (!user) user = new User({ phone: identifier });
        } else { // isEmail
            user = await User.findOne({ email: identifier.toLowerCase() });
            if (!user) user = new User({ email: identifier.toLowerCase() });
        }

        // 6 оронтой санамсаргүй код үүсгэх
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 5 * 60 * 1000); // 5 минут хүчинтэй
        user.otp = otp;
        user.otpExpires = otpExpires;
        await user.save();

        const message = `Таны баталгаажуулах код: ${otp}`;

        if (isPhone) {
            await sendSMS(identifier, message);
        } else {
            await sendEmail(identifier, 'Баталгаажуулах код', message);
        }

        // VS Code Terminal дээрх харагдац
        console.log("\n" + "=".repeat(30));
        console.log("TSAST RESORT - OTP SERVICE");
        console.log("=".repeat(30));
        console.log(`👤 IDENTIFIER: ${identifier}`);
        console.log(`🔑 CODE      : ${otp}`);
        console.log(`⏱️ VALID     : 5 MINS`);
        console.log("=".repeat(30) + "\n");

        const isDev = process.env.NODE_ENV !== 'production';
        res.json({
            message: "Баталгаажуулах код илгээгдлээ.",
            ...(isDev && { devOtp: otp }),
        });
    } catch (err) {
        console.error('/login error:', err);
        res.status(500).json({ message: "Серверийн алдаа" });
    }
});

// OTP БАТАЛГААЖУУЛАХ
router.post('/verify-otp', async (req, res) => {
    try {
        const identifier = req.body.identifier?.toString().trim();
        const otp = req.body.otp?.toString().trim();

        if (!identifier || !otp) {
            return res.status(400).json({ message: "Хүсэлт бүрэн бус байна." });
        }

        const isEmail = identifier.includes('@');
        const query = isEmail ? { email: identifier.toLowerCase() } : { phone: identifier };
        const user = await User.findOne(query);

        if (!user) {
            return res.status(400).json({ message: "Хэрэглэгч олдсонгүй" });
        }

        if (user.otp !== otp) {
            console.log(`❌ OTP буруу: ${identifier} (Оруулсан: ${otp}, Хүлээгдэж буй: ${user.otp})`);
            return res.status(400).json({ message: "Код буруу байна" });
        }

        if (user.otpExpires < new Date()) {
            console.log(`⏰ OTP хугацаа дууссан: ${identifier}`);
            return res.status(400).json({ message: "Код буруу эсвэл хугацаа нь дууссан байна" });
        }

        // Код зөв бол нэг удаа ашиглаад устгах
        user.otp = null;
        user.otpExpires = null;
        await user.save();

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("FATAL ERROR: JWT_SECRET is not defined in .env file!");
        }
        const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '7d' });
        
        // Хэрэглэгчийн нууцлалтай мэдээллийг хасаад буцаах
        const userToReturn = user.toObject();
        delete userToReturn.otp;
        delete userToReturn.otpExpires;
        
        res.json({ token, user: userToReturn });
    } catch (err) {
        console.error('/verify-otp error:', err);
        res.status(500).json({ message: "Серверийн алдаа" });
    }
});

// Хэрэглэгчийн профайл засах
router.patch('/profile', authMiddleware, async (req, res) => {
    try {
        const { name } = req.body;
        if (!name || name.trim() === '') {
            return res.status(400).json({ message: 'Нэр хоосон байж болохгүй.' });
        }

        // req.user нь authMiddleware-аас дамжигдаж ирнэ
        const user = await User.findByIdAndUpdate(
            req.user.id, 
            { name: name.trim() }, 
            { new: true, select: '-otp -otpExpires' } // OTP болон нууц үгтэй холбоотой мэдээллийг буцаахгүй
        );

        if (!user) {
            return res.status(404).json({ message: 'Хэрэглэгч олдсонгүй.' });
        }

        res.json({ message: 'Профайл амжилттай шинэчлэгдлээ', user });
    } catch (error) {
        res.status(500).json({ message: 'Серверийн алдаа', error: error.message });
    }
});

module.exports = router;
