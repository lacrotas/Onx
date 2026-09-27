require('dotenv').config();
const express = require("express");
const sequelize = require('./db');
const models = require('./models/models');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandleMiddleware');
const path = require('path');
const ImageDeletionService = require('./services/ImageDeletionService');
const PORT = process.env.PORT || 5000;
const app = express();

const corsOptions = {
    origin: [
        'http://localhost',
        'http://localhost:3000',
        'http://localhost:80',
        'http://localhost:5000',
        'http://45.128.205.97',
        'http://45.128.205.97:5000',
        'http://onx.by',
        'https://onx.by',
        'http://www.onx.by',
        'https://www.onx.by'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
    optionsSuccessStatus: 204
};
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-src 'self';frame-ancestors 'none'");
    next();
});

new ImageDeletionService();

app.use(express.json());
app.use('/api/static', express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 },
    abortOnLimit: true
}));

// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ПАРСИНГА КАРТИНОК ИЗ POSTGRESQL ---
const getFirstImageFilename = (images) => {
    if (!images) return '';
    if (Array.isArray(images)) return images[0] || '';
    if (typeof images === 'string') {
        const clean = images.replace(/^\{|\}$/g, '').split(',');
        return clean[0] ? clean[0].trim() : '';
    }
    return '';
};

// --- УНИВЕРСАЛЬНЫЙ ОБРАБОТЧИК ДЛЯ БОТОВ (TELEGRAM, WHATSAPP, VK) ---
app.use(async (req, res, next) => {
    // Пропускаем служебные запросы к API и статике
    if (req.path.startsWith('/api') || req.path.startsWith('/static')) {
        return next();
    }

    const userAgent = req.headers['user-agent'] || '';
    const isBot = /TelegramBot|Twitterbot|facebookexternalhit|WhatsApp|vkShare|LinkedInBot|Slackbot/i.test(userAgent);

    if (!isBot) {
        return next();
    }

    console.log(`[Bot Request] User-Agent: ${userAgent} | Path: ${req.path}`);

    try {
        // Достаем последний сегмент URL (это alias товара)
        const pathSegments = req.path.split('/').filter(Boolean);
        const itemAlias = pathSegments[pathSegments.length - 1];

        let item = null;
        if (itemAlias && models.Item) {
            // Ищем товар по alias
            item = await models.Item.findOne({ where: { alias: itemAlias } });
        }

        let title = "Интернет-магазин Onx.by";
        let description = "Качественные товары с доставкой по Минску и Беларуси.";
        let imageUrl = "https://onx.by/logo192.png";
        let price = "";

        if (item) {
            const firstImage = getFirstImageFilename(item.images);
            imageUrl = firstImage 
                ? `https://onx.by/static/images/${firstImage}`
                : "https://onx.by/logo192.png";

            title = `Купить ${item.name} по цене ${item.price} BYN | Onx.by`;
            
            const rawDesc = item.description || '';
            const cleanDesc = rawDesc.replace(/<[^>]*>?/gm, '').trim();
            description = cleanDesc.length > 0 
                ? cleanDesc.slice(0, 160) + '...'
                : `Закажите ${item.name} по выгодной цене ${item.price} BYN с доставкой.`;
            
            price = item.price;
            console.log(`[Bot Success] Товар найден: ${item.name}`);
        } else {
            console.log(`[Bot Notice] Товар по alias "${itemAlias}" не найден, отдаем базовые мета-теги.`);
        }

        const currentUrl = `https://onx.by${req.originalUrl}`;

        // Отдаем полный HTML с Open Graph и Twitter Cards
        return res.status(200).send(`<!doctype html>
<html lang="ru" prefix="og: http://ogp.me/ns#">
<head>
    <meta charset="utf-8">
    <title>${title}</title>
    <meta name="description" content="${description}">
    
    <!-- Open Graph Basic -->
    <meta property="og:type" content="product">
    <meta property="og:site_name" content="Onx.by">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${currentUrl}">
    
    <!-- Open Graph Image -->
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:secure_url" content="${imageUrl}">
    <meta property="og:image:type" content="image/jpeg">

    <!-- Product Price -->
    ${price ? `<meta property="product:price:amount" content="${price}">` : ''}
    ${price ? `<meta property="product:price:currency" content="BYN">` : ''}

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
</head>
<body></body>
</html>`);
    } catch (e) {
        console.error('[Bot Error]:', e);
        // При критической ошибке сервера отдаем безопасную заглушку
        return res.status(200).send(`<!doctype html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Интернет-магазин Onx.by</title>
    <meta property="og:site_name" content="Onx.by">
    <meta property="og:title" content="Интернет-магазин Onx.by">
    <meta property="og:image" content="https://onx.by/logo192.png">
</head>
<body></body>
</html>`);
    }
});

app.use('/api', router);

// Error handling middleware
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        app.listen(PORT, () => console.log(`server start on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();