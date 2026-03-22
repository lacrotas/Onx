const { Item, MainKategory, Kategory } = require('../models/models');
const ApiError = require('../error/ApiError');
const { Op } = require('sequelize');
const { mediaProcessor } = require('../middleware/MediaProcessor');

async function filterAndUpdateImages(currentImagesFromDB, imageStringsFromFrontend, newProcessedImages) {
    try {
        // 1. Нормализация входных данных
        const currentImages = Array.isArray(currentImagesFromDB) ? currentImagesFromDB : [];
        
        let frontendOrderMap = [];
        if (Array.isArray(imageStringsFromFrontend)) {
            frontendOrderMap = imageStringsFromFrontend;
        } else if (imageStringsFromFrontend) {
            frontendOrderMap = [imageStringsFromFrontend];
        }

        // Копия массива новых картинок, чтобы мы могли "вынимать" их по одной
        // Важно: newProcessedImages идут в том же порядке, в котором файлы приходили в req.files.images
        // Фронтенд отправляет файлы в том же порядке, что и blob-строки в imageStrings
        let availableNewImages = [...newProcessedImages];

        // 2. Собираем итоговый массив в том порядке, который прислал фронтенд
        const finalImages = [];
        const imagesToKeep = []; // Для отслеживания, что не удалять

        for (const itemString of frontendOrderMap) {
            if (itemString.startsWith('blob:')) {
                // Это новая картинка. Берем следующую из обработанных
                const newImageName = availableNewImages.shift();
                if (newImageName) {
                    finalImages.push(newImageName);
                }
            } else {
                // Это старая картинка (URL или имя файла)
                // Находим её имя в currentImages
                const foundOldImage = currentImages.find(dbImg => itemString.includes(dbImg));
                
                if (foundOldImage) {
                    finalImages.push(foundOldImage);
                    imagesToKeep.push(foundOldImage);
                }
            }
        }

        // Если вдруг остались "бесхозные" новые картинки (чего быть не должно при правильном фронте), добавим их в конец
        if (availableNewImages.length > 0) {
            finalImages.push(...availableNewImages);
        }

        // 3. Определяем, какие файлы нужно удалить (те, что были в БД, но не попали в imagesToKeep)
        // Используем Set для уникальности, хотя filter тоже сработает
        const imagesToDelete = currentImages.filter(dbImageName => !imagesToKeep.includes(dbImageName));

        // 4. Удаляем лишние файлы
        if (imagesToDelete.length > 0) {
            console.log('Deleting old images from server:', imagesToDelete);
            await mediaProcessor.deleteOldFiles(imagesToDelete, 'images');
        }

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
        let currentItem = null;

        try {
            const { id } = req.params;
            console.log('=== updateItemById START ===');

            currentItem = await Item.findOne({ where: { id } });
            if (!currentItem) {
                // Если запись не найдена, удаляем мусор
                if (req.processedImages) await mediaProcessor.deleteOldFiles(req.processedImages, 'images');
                if (req.processedVideo) await mediaProcessor.deleteOldFiles(req.processedVideo, 'video');
                return res.status(404).json({ message: 'Запись не найдена' });
            }

            // Создаем объект только с теми полями, которые реально пришли с фронтенда
            const updateData = {};

            if (req.body.itemGroupId !== undefined) updateData.itemGroupId = req.body.itemGroupId;
            if (req.body.name !== undefined) updateData.name = req.body.name;
            if (req.body.price !== undefined) updateData.price = req.body.price;
            if (req.body.isExist !== undefined) updateData.isExist = req.body.isExist;
            if (req.body.isShowed !== undefined) updateData.isShowed = req.body.isShowed;
            if (req.body.rating !== undefined) updateData.rating = req.body.rating;
            if (req.body.reviewNumber !== undefined) updateData.reviewNumber = req.body.reviewNumber;

            // Безопасная обработка описания (только если оно пришло)
            if (req.body.description !== undefined) {
                updateData.description = String(req.body.description).replace(/<p><br><\/p>/g, '');
            }

            // Безопасная обработка характеристик (только если они пришли)
            if (req.body.specificationsJSONB !== undefined) {
                let specifications = req.body.specificationsJSONB;
                if (typeof specifications === 'string' && specifications) {
                    try {
                        specifications = JSON.parse(specifications);
                    } catch (parseError) {
                        console.log('JSON parse error:', parseError);
                        specifications = {};
                    }
                }
                updateData.specificationsJSONB = specifications;
            }

            // Обработка картинок (ТОЛЬКО если фронтенд прислал imageStrings - значит было полное редактирование формы)
            if (req.body.imageStrings !== undefined) {
                newProcessedImages = req.processedImages || [];
                const oldImages = currentItem.images || [];
                
                updateData.images = await filterAndUpdateImages(
                    oldImages,
                    req.body.imageStrings,
                    newProcessedImages
                );
            }

            // Обработка видео (только если загружено новое или явно пришел пустой URL/null для удаления)
            if (req.processedVideo !== undefined) {
                updateData.video = req.processedVideo;
            } else if (req.body.video === 'null' || req.body.video === '') {
                updateData.video = null;
            }

            // Применяем сформированный объект с изменениями в БД
            const [updatedRowsCount, updatedRows] = await Item.update(
                updateData,
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                console.log('Item updated successfully');
                res.status(200).json({ message: 'Данные успешно обновлены', updatedRows });
            } else {
                // Если обновление не прошло, удаляем новые файлы
                if (newProcessedImages.length > 0) {
                    await mediaProcessor.deleteOldFiles(newProcessedImages, 'images');
                }
                res.status(400).json({ message: 'Не удалось обновить данные или нет изменений' });
            }
        } catch (error) {
            console.error('Error in updateItemById:', error);
            // Очистка при ошибке
            if (newProcessedImages.length > 0) {
                try {
                    await mediaProcessor.deleteOldFiles(newProcessedImages, 'images');
                } catch (e) { console.error(e); }
            }
            res.status(500).json({ message: 'Ошибка сервера', error: error.message });
        }
    }
}

module.exports = new itemController();