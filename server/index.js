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
        'http://localhost:80',
        'http://91.197.98.31:80',
        'http://91.197.98.31:5000',
        'http://localhost:5000'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    credentials: true,
    optionsSuccessStatus: 204
};
// app.use(cors(corsOptions));
app.use(cors({
    origin: "*",  // разрешить все домены (только для теста!)
    credentials: true,
}));
app.options('*', cors(corsOptions));  // ← обрабатывает ВСЕ OPTIONS-запросы

app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; font-src 'self'; object-src 'none'; frame-src 'self';frame-ancestors 'none'");
    next();
});

new ImageDeletionService();

app.use(express.json());
app.use('/static', express.static(path.resolve(__dirname, 'static')));
app.use(fileUpload({}));
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