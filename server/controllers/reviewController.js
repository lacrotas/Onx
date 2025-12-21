const { Review, Item } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const { where } = require('sequelize');
const { mediaProcessor } = require('../middleware/MediaProcessor');

// --- ДОБАВЛЕНА ФУНКЦИЯ ФИЛЬТРАЦИИ (КАК В ITEM CONTROLLER) ---
async function filterAndUpdateImages(currentImagesFromDB, imageStringsFromFrontend, newProcessedImages) {
    try {
        // 1. Нормализация входных данных
        const currentImages = Array.isArray(currentImagesFromDB) ? currentImagesFromDB : [];

        let frontendImages = [];
        if (Array.isArray(imageStringsFromFrontend)) {
            frontendImages = imageStringsFromFrontend;
        } else if (imageStringsFromFrontend) {
            frontendImages = [imageStringsFromFrontend];
        }

        // 2. Определяем, какие старые файлы нужно оставить
        const imagesToKeep = currentImages.filter(dbImageName => {
            return frontendImages.some(frontendUrl => {
                if (frontendUrl.startsWith('blob:')) return false;
                return frontendUrl.includes(dbImageName);
            });
        });

        // 3. Определяем, какие файлы нужно удалить
        const imagesToDelete = currentImages.filter(dbImageName => !imagesToKeep.includes(dbImageName));

        // 4. Удаляем лишние файлы с диска
        if (imagesToDelete.length > 0) {
            console.log('Deleting old images from server:', imagesToDelete);
            await mediaProcessor.deleteOldFiles(imagesToDelete, 'images');
        }

        // 5. Формируем итоговый массив
        const finalImages = [...imagesToKeep, ...newProcessedImages];

        return finalImages;
    } catch (error) {
        console.error('Error filtering images:', error);
        throw error;
    }
}
// -----------------------------------------------------------

class reviewController {
    async addReview(req, res, next) {
        let processedImages = [];

        try {
            const { itemId, userId, mark, userName, label, description } = req.body;

            const item = await Item.findOne({ where: { id: itemId } });
            if (!item) {
                return res.status(404).json({ error: 'Товар с таким id не найден' });
            }

            if (req.files && req.files.images) {
                try {
                    processedImages = await mediaProcessor.processMultipleImages(req.files.images, 'images');
                } catch (imageError) {
                    console.error('Image processing error in review:', imageError);
                    return res.status(400).json({ error: 'Ошибка обработки изображений' });
                }
            }

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
            if (processedImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(processedImages, 'images');
                } catch (deleteError) {
                    console.error('Error deleting uploaded review images:', deleteError);
                }
            }
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
        const review = await Review.findAll({ where: { id } });
        return res.json(review);
    }
    async getAllReviewByItemIdAndIsShowed(req, res) {
        const { itemId } = req.params;
        const review = await Review.findAll({ where: { itemId, isShowed: true } });
        return res.json(review);
    }
    async getAllReviewByItemId(req, res) {
        const { itemId } = req.params;
        const review = await Review.findAll({ where: { itemId } });
        return res.json(review);
    }
    async deleteReviewById(req, res) {
        try {
            const { id } = req.params;
            const review = await Review.findOne({ where: { id } });

            if (!review) {
                return res.status(404).json({ error: 'Отзыв не найден' });
            }
            
            // При удалении отзыва нужно удалить и картинки
            if (review.images && review.images.length > 0) {
                 await mediaProcessor.deleteOldFiles(review.images, 'images');
            }

            await review.destroy();
            return res.json({ message: 'Отзыв удален' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    // --- ПОЛНОСТЬЮ ОБНОВЛЕННЫЙ МЕТОД UPDATE ---
    async updateReviewById(req, res) {
        let newProcessedImages = [];
        
        try {
            const { id } = req.params;
            // Получаем imageStrings из body (это список старых картинок, которые нужно оставить)
            let { mark, userName, label, description, isShowed, imageStrings } = req.body;

            // Если imageStrings не пришел (все удалили), делаем пустым массивом
            if (!imageStrings) {
                imageStrings = [];
            }

            const review = await Review.findOne({ where: { id } });
            if (!review) {
                return res.status(404).json({ message: 'Отзыв не найден' });
            }

            const oldImages = review.images || [];

            // 1. Обрабатываем НОВЫЕ файлы, если они есть
            if (req.files && req.files.images) {
                try {
                    newProcessedImages = await mediaProcessor.processMultipleImages(req.files.images, 'images');
                } catch (imageError) {
                    console.error('Image processing error in review update:', imageError);
                    return res.status(400).json({ error: 'Ошибка обработки изображений' });
                }
            }

            // 2. Используем функцию фильтрации для объединения (Старые из imageStrings + Новые файлы)
            // Эта функция сама удалит те старые файлы, которых нет в imageStrings
            const finalImages = await filterAndUpdateImages(
                oldImages,
                imageStrings,
                newProcessedImages
            );

            // 3. Обновляем запись в БД
            const [updatedRowsCount, updatedRows] = await Review.update(
                {
                    mark: mark,
                    userName: userName,
                    label: label,
                    images: finalImages, // Записываем итоговый массив
                    description: description,
                    isShowed: isShowed
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                res.status(200).json({ 
                    message: 'Данные успешно обновлены', 
                    updatedRows 
                });
            } else {
                // Если обновление не удалось, удаляем загруженные новые файлы
                if (newProcessedImages.length > 0) {
                    await mediaProcessor.deleteOldFiles(newProcessedImages, 'images');
                }
                res.status(404).json({ message: 'Запись не найдена или данные не изменились' });
            }

        } catch (error) {
            console.error('Ошибка при обновлении отзыва:', error);

            // При ошибке удаляем новые загруженные файлы
            if (newProcessedImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(newProcessedImages, 'images');
                } catch (deleteError) {
                    console.error('Error deleting new review images:', deleteError);
                }
            }

            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new reviewController();