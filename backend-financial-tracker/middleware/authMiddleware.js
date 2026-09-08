const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = (req, res, next) => {
    // Mengambil token dari header Authorization
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Akses dditolak. Token tidak ditemukan.' });
    }

    try {
        const secretKey = process.env.JWT_SECRET || 'super_secret_jwt_key_123';
        const decoded = jwt.verify(token, secretKey);

        // Menyimpan payload token (id & email user) ke req.ser
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ message: 'Token tidak valid atau sudah kadaluarsa.' });
    }
};

module.exports = authenticateToken;