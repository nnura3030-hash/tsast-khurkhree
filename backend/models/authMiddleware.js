const jwt = require('jsonwebtoken');

// Энэ функц нь хэрэглэгч нэвтэрсэн эсэхийг JWT токеноор шалгана
module.exports = function(req, res, next) {
    // Хүсэлтийн header-ээс 'Authorization' утгыг авах
    const authHeader = req.header('Authorization');

    // Хэрэв 'Authorization' байхгүй бол нэвтрээгүй гэж үзнэ
    if (!authHeader) {
        return res.status(401).json({ message: 'Нэвтрэх шаардлагатай (token олдсонгүй).' });
    }

    try {
        // "Bearer <token>" форматаас зөвхөн токенийг салгаж авах
        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Token буруу форматтай байна.' });
        }

        // Токенийг .env файлд заасан нууц үгээр тайлж унших
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Тайлагдсан мэдээллийг (хэрэглэгчийн ID) req.user-д хадгалах
        req.user = decoded;

        // Дараагийн функц рүү шилжүүлэх
        next();
    } catch (e) {
        // Хэрэв токен буруу, хугацаа нь дууссан бол алдаа буцаах
        res.status(401).json({ message: 'Token хүчингүй байна.' });
    }
};