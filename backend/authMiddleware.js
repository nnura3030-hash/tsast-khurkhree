const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
    // Header-ээс 'Authorization' мэдээллийг авах
    const authHeader = req.header('Authorization');

    // Хэрэв token байхгүй бол
    if (!authHeader) {
        return res.status(401).json({ message: 'Нэвтрэх шаардлагатай (token олдсонгүй).' });
    }

    try {
        // Token нь "Bearer <token>" гэсэн форматтай ирнэ, тиймээс "Bearer " гэсэн хэсгийг салгаж авна.
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Token-ий формат буруу байна.' });
        }

        // .env файлд JWT_SECRET байгаа эсэхийг шалгах
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            console.error("FATAL ERROR: JWT_SECRET is not defined in .env file!");
            return res.status(500).json({ message: 'Серверийн тохиргооны алдаа.' });
        }

        // Token-г баталгаажуулах
        const decoded = jwt.verify(token, secret);

        // Баталгаажсан хэрэглэгчийн мэдээллийг request object-д хадгалах
        req.user = decoded; // payload нь { id: user._id, role: user.role } гэсэн бүтэцтэй
        
        next(); // Дараагийн middleware эсвэл route handler-г дуудах
    } catch (err) {
        res.status(401).json({ message: 'Token хүчингүй байна.' });
    }
};

module.exports = authMiddleware;