const { MainKategory } = require('../models/models');
const ApiError = require('../error/ApiError');
const { mediaProcessor } = require('../middleware/MediaProcessor');

class MainKategoryController {
    async addMainKategory(req, res, next) {
        let fileName = null;

        try {
            const { name } = req.body;

            fileName = req.processedImage || null;

            const mainKategory = await MainKategory.create({
                name,
                image: fileName
            });

            return res.json(mainKategory);

        } catch (e) {
            // Если произошла ошибка при создании категории - удаляем загруженное изображение
            if (fileName) {
                try {
                    await mediaProcessor.deleteOldFiles(fileName, 'images');
                } catch (deleteError) {
                    console.error('Error deleting uploaded image after failure:', deleteError);
                }
            }
            next(ApiError.badRequest(e.message));
        }
    }

    async getAllMainKategory(req, res) {
        const mainKategory = await MainKategory.findAll();
        return res.json(mainKategory);
    }

    async getMainKategoryById(req, res) {
        const { id } = req.params;
        const mainKategory = await MainKategory.findOne({ where: { id } });
        return res.json(mainKategory);
    }

    async deleteMainKategoryById(req, res) {
        try {
            const { id } = req.params;
            const kategory = await MainKategory.findOne({ where: { id } });

            if (!kategory) {
                return res.status(404).json({ error: 'Категория не найдена' });
            }

            // Удаляем файл изображения
            if (kategory.image) {
                await mediaProcessor.deleteOldFiles(kategory.image, 'images');
            }

            await kategory.destroy();
            return res.json({ message: 'Категория удалена' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateMainKategoryById(req, res) {
        let newFileName = null;
        let oldFileName = null;

        try {
            const { id } = req.params;
            const { name, gridSpace, gridItemIndex } = req.body;

            const mainKategory = await MainKategory.findOne({ where: { id } });
            if (!mainKategory) {
                return res.status(404).json({ message: 'Категория не найдена' });
            }

            oldFileName = mainKategory.image;
            newFileName = req.processedImage || oldFileName;

            // Обновляем категорию БЕЗ предварительного удаления старого изображения
            const [updatedRowsCount, updatedRows] = await MainKategory.update(
                {
                    name: name,
                    image: newFileName,
                    gridItemIndex: gridItemIndex,
                    gridSpace: gridSpace
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                // Только после успешного обновления удаляем старое изображение
                if (req.processedImage && oldFileName && oldFileName !== newFileName) {
                    try {
                        await mediaProcessor.deleteOldFiles(oldFileName, 'images');
                        console.log('Old image deleted after successful update:', oldFileName);
                    } catch (deleteError) {
                        console.error('Error deleting old image after update:', deleteError);
                        // Не прерываем ответ, т.к. основное обновление прошло успешно
                    }
                }

                res.status(200).json({
                    message: 'Данные успешно обновлены',
                    updatedRows
                });

            } else {
                // Если обновление не удалось, удаляем ЗАГРУЖЕННОЕ НОВОЕ изображение
                if (req.processedImage && req.processedImage !== oldFileName) {
                    await mediaProcessor.deleteOldFiles(req.processedImage, 'images');
                    console.log('New image deleted because update failed:', req.processedImage);
                }
                res.status(404).json({ message: 'Запись не найдена' });
            }

        } catch (error) {
            // Если произошла ошибка - удаляем ЗАГРУЖЕННОЕ НОВОЕ изображение
            if (newFileName && req.processedImage && newFileName !== oldFileName) {
                try {
                    await mediaProcessor.deleteOldFiles(newFileName, 'images');
                    console.log('New image deleted after update error:', newFileName);
                } catch (deleteError) {
                    console.error('Error deleting new image after update failure:', deleteError);
                }
            }
            console.error('Ошибка при обновлении данных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new MainKategoryController();