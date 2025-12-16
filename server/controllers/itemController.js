const { Item, MainKategory, Kategory } = require('../models/models');
const ApiError = require('../error/ApiError');
const { Op } = require('sequelize');
const { mediaProcessor } = require('../middleware/MediaProcessor');

async function filterAndUpdateImages(currentImages, allImagesFromFrontend, newProcessedImages) {
    try {
        const allImages = Array.isArray(allImagesFromFrontend) ? allImagesFromFrontend : currentImages;

        const imagesToKeep = currentImages.filter(oldImage => {
            return allImages.some(frontendImage => {
                if (typeof frontendImage === 'string') {
                    return frontendImage === oldImage;
                }
                return frontendImage.filename === oldImage.filename || frontendImage === oldImage;
            });
        });

        const imagesToDelete = currentImages.filter(oldImage => {
            return !allImages.some(frontendImage => {
                if (typeof frontendImage === 'string') {
                    return frontendImage === oldImage;
                }
                return frontendImage.filename === oldImage.filename || frontendImage === oldImage;
            });
        });

        if (imagesToDelete.length > 0) {
            console.log('Deleting old images from server:', imagesToDelete);
            await mediaProcessor.deleteOldFiles(
                imagesToDelete.map(img => typeof img === 'string' ? img : img.filename),
                'images'
            );
        }

        const finalImages = [...imagesToKeep, ...newProcessedImages];

        return finalImages;
    } catch (error) {
        console.error('Error filtering images:', error);
        throw error;
    }
}


class itemController {

    async getItemsByNameSubstring(req, res) {
        const { substring } = req.params;
        try {
            const items = await Item.findAll({
                where: {
                    name: {
                        [Op.iLike]: `%${substring}%`
                    }
                }
            });
            return res.json(items);
        } catch (error) {
            return res.status(500).json({ message: "Error fetching items", error });
        }
    }
    async addItem(req, res, next) {
        let processedImages = [];
        let processedVideo = null;

        try {
            const { mainKategoryId, kategoryId, name, price, description, specificationsJSONB } = req.body;

            processedImages = req.processedImages || [];
            processedVideo = req.processedVideo || null;

            const mainCategory = await MainKategory.findOne({ where: { id: mainKategoryId } });
            if (!mainCategory) {
                throw new Error('Главная категория с указанным ID не найдена');
            }

            const category = await Kategory.findOne({
                where: {
                    id: kategoryId,
                    mainKategoryId: mainKategoryId
                }
            });
            if (!category) {
                throw new Error('Категория с указанным ID не найдена или не принадлежит главной категории');
            }

            let specifications = specificationsJSONB;
            if (typeof specificationsJSONB === 'string' && specificationsJSONB) {
                try {
                    specifications = JSON.parse(specificationsJSONB);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = {};
                }
            }

            const item = await Item.create({
                mainKategoryId: mainKategoryId,
                kategoryId: kategoryId,
                images: processedImages,
                price: price,
                name: name,
                video: processedVideo,
                description: description,
                specificationsJSONB: specifications,
                isExist: true,
                isShowed: true,
                rating: "0",
                reviewNumber: "0"
            });

            return res.json(item);
        } catch (e) {
            // Удаляем загруженные файлы при ошибке
            if (processedImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(processedImages, 'images');
                    console.log('Uploaded images deleted due to error:', processedImages);
                } catch (deleteError) {
                    console.error('Error deleting uploaded images after failure:', deleteError);
                }
            }
            if (processedVideo) {
                try {
                    await mediaProcessor.deleteOldFiles(processedVideo, 'video');
                    console.log('Uploaded video deleted due to error:', processedVideo);
                } catch (deleteError) {
                    console.error('Error deleting uploaded video after failure:', deleteError);
                }
            }

            // Отправляем соответствующую ошибку
            if (e.message.includes('не найдена')) {
                return res.status(404).json({ error: e.message });
            } else {
                next(ApiError.badRequest(e.message));
            }
        }
    }
    async getAllItems(req, res) {
        const items = await Item.findAll();
        return res.json(items);
    }
    async getItemById(req, res) {
        const { id } = req.params
        const item = await Item.findOne(
            { where: { id } }
        );
        return res.json(item);
    }
    async getAllItemsByMainKategoryId(req, res) {
        const { mainKategoryId } = req.params
        const items = await Item.findAll(
            { where: { mainKategoryId } }
        );
        return res.json(items);
    }
    async getAllItemsByItemGroupIdId(req, res) {
        const { itemGroupId } = req.params
        const items = await Item.findAll(
            { where: { itemGroupId } }
        );
        return res.json(items);
    }
    async getAllItemsByKategoryId(req, res) {
        const { kategoryId } = req.params
        const items = await Item.findAll(
            { where: { kategoryId } }
        );
        return res.json(items);
    }
    async getAttributeValuesForCategory(req, res) {
        try {
            // Правильно извлекаем kategoryId из params
            const { kategoryId } = req.params;

            // Преобразуем в число и проверяем
            const categoryIdNum = parseInt(kategoryId, 10);
            if (isNaN(categoryIdNum)) {
                return res.status(400).json({
                    error: 'Некорректный ID категории'
                });
            }

            const items = await Item.findAll({
                where: {
                    kategoryId: categoryIdNum, // Используем число
                    isShowed: true // Добавляем фильтр для показанных товаров
                },
                attributes: ['id', 'specificationsJSONB']
            });

            const attributesMap = {};

            items.forEach(item => {
                const specs = item.specificationsJSONB;
                if (specs && typeof specs === 'object') {
                    Object.keys(specs).forEach(attributeName => {
                        const value = specs[attributeName];
                        if (value !== null && value !== undefined && value !== '') {
                            if (!attributesMap[attributeName]) {
                                attributesMap[attributeName] = new Set();
                            }
                            attributesMap[attributeName].add(String(value));
                        }
                    });
                }
            });

            // Преобразуем Set в массив и сортируем
            const result = {};
            Object.keys(attributesMap).forEach(attrName => {
                result[attrName] = Array.from(attributesMap[attrName])
                    .sort((a, b) => a.localeCompare(b));
            });

            return res.json({
                success: true,
                categoryId: categoryIdNum,
                attributes: result
            });

        } catch (error) {
            console.error('Error getting attribute values:', error);
            return res.status(500).json({
                error: 'Ошибка при получении значений атрибутов'
            });
        }
    }
    async deleteItemById(req, res) {
        try {
            const { id } = req.params;
            const item = await Item.findOne({ where: { id } });

            if (!item) {
                return res.status(404).json({ error: 'Категория не найдена' });
            }

            await item.destroy();
            return res.json({ message: 'Категория удалена' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateItemById(req, res) {
        let newProcessedImages = [];
        let newVideo = null;
        let currentItem = null;

        try {
            const { id } = req.params;
            const {
                itemGroupId,
                name,
                price,
                description,
                rating,
                reviewNumber,
                specificationsJSONB,
                isExist,
                isShowed,
                imageStrings // ВСЕ изображения (старые + новые blob URLs)
            } = req.body;

            console.log('=== updateItemById START ===');
            console.log('imageStrings from frontend:', imageStrings);

            currentItem = await Item.findOne({ where: { id } });
            if (!currentItem) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            const oldImages = currentItem.images || [];
            const oldVideo = currentItem.video;

            console.log('Old images from DB:', oldImages);

            // Обрабатываем только НОВЫЕ изображения из FormData
            newProcessedImages = req.processedImages || [];
            newVideo = req.processedVideo || oldVideo;

            console.log('New processed images:', newProcessedImages);

            // Вызываем функцию (теперь она определена)
            const finalImages = await filterAndUpdateImages(
                oldImages,
                imageStrings, // все изображения из фронтенда
                newProcessedImages // только новые обработанные
            );

            let specifications = specificationsJSONB;
            if (typeof specificationsJSONB === 'string' && specificationsJSONB) {
                try {
                    specifications = JSON.parse(specificationsJSONB);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = {};
                }
            }

            const [updatedRowsCount, updatedRows] = await Item.update(
                {
                    itemGroupId: itemGroupId,
                    name: name,
                    price: price,
                    isExist: isExist,
                    isShowed: isShowed,
                    description: description,
                    specificationsJSONB: specifications,
                    video: newVideo,
                    rating: rating,
                    reviewNumber: reviewNumber,
                    images: finalImages,
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                console.log('Item updated successfully');
                res.status(200).json({ message: 'Данные успешно обновлены', updatedRows });
            } else {
                console.log('Item update failed - no rows affected');
                if (newProcessedImages.length > 0) {
                    await mediaProcessor.deleteOldFiles(newProcessedImages, 'images');
                    console.log('New images deleted because update failed:', newProcessedImages);
                }
                if (req.processedVideo) {
                    await mediaProcessor.deleteOldFiles(req.processedVideo, 'video');
                    console.log('New video deleted because update failed:', req.processedVideo);
                }
                res.status(404).json({ message: 'Запись не найдена' });
            }
        } catch (error) {
            console.error('Error in updateItemById:', error);
            if (newProcessedImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(newProcessedImages, 'images');
                    console.log('New images deleted after update error:', newProcessedImages);
                } catch (deleteError) {
                    console.error('Error deleting new images after update failure:', deleteError);
                }
            }
            if (req.processedVideo) {
                try {
                    await mediaProcessor.deleteOldFiles(req.processedVideo, 'video');
                    console.log('New video deleted after update error:', req.processedVideo);
                } catch (deleteError) {
                    console.error('Error deleting new video after update failure:', deleteError);
                }
            }
            res.status(500).json({ message: 'Ошибка сервера', error: error.message });
        }
    }
}

module.exports = new itemController();