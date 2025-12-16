const { Review, Item } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { where } = require('sequelize');
const { mediaProcessor } = require('../middleware/MediaProcessor');

class reviewController {
    async addReview(req, res, next) {
        let processedImages = [];

        try {
            const { itemId, userId, mark, userName, label, description } = req.body;

            // ПРОВЕРКА СУЩЕСТВОВАНИЯ ТОВАРА ПРЕЖДЕ ОБРАБОТКИ ФАЙЛОВ
            const item = await Item.findOne({ where: { id: itemId } });
            if (!item) {
                return res.status(404).json({ error: 'Товар с таким id не найден' });
            }

            // ОБРАБОТКА ИЗОБРАЖЕНИЙ ПОСЛЕ ВСЕХ ПРОВЕРОК
            if (req.files && req.files.images) {
                try {
                    processedImages = await mediaProcessor.processMultipleImages(req.files.images, 'images');
                } catch (imageError) {
                    console.error('Image processing error in review:', imageError);
                    return res.status(400).json({ error: 'Ошибка обработки изображений' });
                }
            }

            // СОЗДАНИЕ ОТЗЫВА
            const review = await Review.create({
                userId: userId,
                itemId: itemId,
                mark: mark,
                userName: userName,
                label: label || null,
                description: description || null,
                isShowed: false,
                images: processedImages
            });

            return res.json(review);

        } catch (e) {
            console.error('Error in addReview:', e.message);

            // Удаляем загруженные файлы при ЛЮБОЙ ошибке
            if (processedImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(processedImages, 'images');
                    console.log('Uploaded review images deleted due to error:', processedImages);
                } catch (deleteError) {
                    console.error('Error deleting uploaded review images:', deleteError);
                }
            }

            // Определяем тип ошибки для ответа
            if (e.message.includes('validation error') || e.message.includes('notNull Violation')) {
                return res.status(400).json({ error: 'Не все обязательные поля заполнены' });
            } else if (e.name === 'SequelizeForeignKeyConstraintError') {
                return res.status(400).json({ error: 'Некорректные ссылки на товар или пользователя' });
            } else {
                next(ApiError.badRequest(e.message));
            }
        }
    }
    async getAllReview(req, res) {
        const review = await Review.findAll();
        return res.json(review);
    }
    async getReviewById(req, res) {
        const { id } = req.params
        const review = await Review.findAll(
            { where: { id } }
        );
        return res.json(review);
    }
    async getAllReviewByItemIdAndIsShowed(req, res) {
        const { itemId } = req.params;
        const review = await Review.findAll(
            { where: { itemId, isShowed: true } }
        );
        return res.json(review);
    }
    async getAllReviewByItemId(req, res) {
        const { itemId } = req.params;
        const review = await Review.findAll(
            { where: { itemId } }
        );
        return res.json(review);
    }
    async deleteReviewById(req, res) {
        try {
            const { id } = req.params;
            const review = await Review.findOne({ where: { id } });

            if (!review) {
                return res.status(404).json({ error: 'Отзыв не найден' });
            }

            await review.destroy();
            return res.json({ message: 'Отзыв удален' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateReviewById(req, res) {
    let newImages = [];
    let oldImages = [];

    try {
        const { id } = req.params;
        const { mark, userName, label, description, isShowed } = req.body;

        // ПРОВЕРКА СУЩЕСТВОВАНИЯ ОТЗЫВА
        const review = await Review.findOne({ where: { id } });
        if (!review) {
            return res.status(404).json({ message: 'Отзыв не найден' });
        }

        oldImages = review.images || [];


        // ОБРАБОТКА НОВЫХ ИЗОБРАЖЕНИЙ ПОСЛЕ ПРОВЕРОК
        if (req.files && req.files.images) {
            try {
                newImages = await mediaProcessor.processMultipleImages(req.files.images, 'images');
            } catch (imageError) {
                console.error('Image processing error in review update:', imageError);
                return res.status(400).json({ error: 'Ошибка обработки изображений' });
            }
        } else {
            newImages = oldImages;
        }

        // ОБНОВЛЕНИЕ ОТЗЫВА
        const [updatedRowsCount, updatedRows] = await Review.update(
            {
                mark: mark,
                userName: userName,
                label: label,
                images: newImages,
                description: description,
                isShowed: isShowed
            },
            {
                returning: true,
                where: { id }
            }
        );

        if (updatedRowsCount > 0) {
            // ПОСЛЕ УСПЕШНОГО ОБНОВЛЕНИЯ УДАЛЯЕМ СТАРЫЕ ИЗОБРАЖЕНИЯ
            if (req.files && req.files.images && oldImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(oldImages, 'images');
                    console.log('Old review images deleted after successful update:', oldImages);
                } catch (deleteError) {
                    console.error('Error deleting old review images:', deleteError);
                }
            }

            res.status(200).json({ 
                message: 'Данные успешно обновлены', 
                updatedRows 
            });
        } else {
            // ЕСЛИ ОБНОВЛЕНИЕ НЕ УДАЛОСЬ, УДАЛЯЕМ НОВЫЕ ИЗОБРАЖЕНИЯ
            if (req.files && req.files.images && newImages.length > 0) {
                await mediaProcessor.deleteOldFiles(newImages, 'images');
                console.log('New review images deleted because update failed:', newImages);
            }
            res.status(404).json({ message: 'Запись не найдена' });
        }

    } catch (error) {
        console.error('Ошибка при обновлении отзыва:', error);

        // ПРИ ОШИБКЕ УДАЛЯЕМ ЗАГРУЖЕННЫЕ НОВЫЕ ИЗОБРАЖЕНИЯ
        if (req.files && req.files.images && newImages.length > 0) {
            try {
                await mediaProcessor.deleteOldFiles(newImages, 'images');
                console.log('New review images deleted after update error:', newImages);
            } catch (deleteError) {
                console.error('Error deleting new review images:', deleteError);
            }
        }

        res.status(500).json({ message: 'Ошибка сервера' });
    }
}
}

module.exports = new reviewController();