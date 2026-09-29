const jwt = require('jsonwebtoken')
const { User } = require('../models/models');

const authenticateToken = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer asfasnfkajsfnjk

        if (!token) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.user = decoded;
        next();
    } catch (e) {
        return res.status(401).json({ message: "Не авторизован" });
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        if (user.role !== 'admin') {
            return res.status(403).json({ message: "Доступ запрещен. Требуются права администратора" });
        }

        next();
    } catch (e) {
        return res.status(403).json({ message: "Доступ запрещен" });
    }
};

const requireUserOrAdmin = async (req, res, next) => {
    try {
        const user = await User.findOne({ where: { id: req.user.id } });

        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }

        if (user.role !== 'user' && user.role !== 'admin') {
            return res.status(403).json({ message: "Доступ запрещен" });
        }

        next();
    } catch (e) {
        return res.status(403).json({ message: "Доступ запрещен" });
    }
};

// Middleware для проверки, что пользователь редактирует свой профиль или это админ
const requireOwnerOrAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Не авторизован" });
        }

        const targetUserId = req.params.id || req.params.userId || req.body.userId || req.query.userId;
        
        if (!targetUserId) {
            return res.status(400).json({ message: "ID пользователя не указан" });
        }

        const user = await User.findOne({ where: { id: req.user.id } });
        
        if (!user) {
            return res.status(404).json({ message: "Пользователь не найден" });
        }
        
        if (user.role === 'admin' || user.id.toString() === targetUserId.toString()) {
            return next();
        }
        
        return res.status(403).json({ message: "Доступ запрещен" });
    } catch (e) {
        console.error('Ошибка в middleware requireOwnerOrAdmin:', e);
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
};

const optionalAuth = (req, res, next) => {
    if (req.method === "OPTIONS") {
        return next();
    }
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (token && token !== 'undefined' && token !== 'null') {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            req.user = decoded;
        } else {
            req.user = null;
        }
        next();
    } catch (e) {
        req.user = null;
        next();
    }
};

const requireBusketOwnerOrAdmin = async (req, res, next) => {
    try {
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Не авторизован" });
        }
        if (req.user.role === 'admin') {
            return next();
        }
        const busketId = req.params.id;
        if (busketId) {
            const { Busket } = require('../models/models');
            const busket = await Busket.findOne({ where: { id: busketId } });
            if (busket && busket.userId && busket.userId.toString() === req.user.id.toString()) {
                return next();
            }
        }
        const userIdParam = req.params.userId || req.body.userId;
        if (userIdParam && userIdParam.toString() === req.user.id.toString()) {
            return next();
        }
        return res.status(403).json({ message: "Доступ запрещен к корзине" });
    } catch (e) {
        console.error('Ошибка в middleware requireBusketOwnerOrAdmin:', e);
        return res.status(500).json({ message: "Внутренняя ошибка сервера" });
    }
};

module.exports = {
    authenticateToken,
    optionalAuth,
    requireAdmin,
    requireUserOrAdmin,
    requireOwnerOrAdmin,
    requireBusketOwnerOrAdmin
};