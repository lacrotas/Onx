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
// app.use(cors({
//     origin: "*",  // разрешить все домены (только для теста!)
//     credentials: true,
// }));
app.options('*', cors(corsOptions));  // ← обрабатывает ВСЕ OPTIONS-запросы

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-src 'self';frame-ancestors 'none'");
    next();
});

new ImageDeletionService();

app.use(express.json());
app.use('/static', express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({
    limits: { fileSize: 50 * 1024 * 1024 }, // Ограничение 50 МБ
    abortOnLimit: true // Если файл больше, сразу вернуть ошибку
}));
app.use('/api', router);

//error boundry
app.use(errorHandler);

const start = async () => {
    try {
        await sequelize.authenticate();//connect to db
        await sequelize.sync() //check bd and state
        app.listen(PORT, () => console.log(`server start on port ${PORT}`));
    } catch (e) {
        console.log(e);
    }
}

start();