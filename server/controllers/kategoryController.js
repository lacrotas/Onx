const { Kategory, MainKategory } = require('../models/models');
const ApiError = require('../error/ApiError');
const { mediaProcessor } = require('../middleware/MediaProcessor');

class kategoryController {

    async getAllKategoryByMainKategoryId(req, res) {
        const { mainKategoryId } = req.params
        const kategory = await Kategory.findAll(
            { where: { mainKategoryId } }
        );
        return res.json(kategory);
    }
    async getAllKategory(req, res) {
        const kategory = await Kategory.findAll();
        return res.json(kategory);
    }
    async getKategoryById(req, res) {
        const { id } = req.params
        const kategory = await Kategory.findOne(
            { where: { id } }
        )
        return res.json(kategory);
    }
    async addKategory(req, res, next) {
        let fileName = null;
        try {
            const { name, mainKategoryId, kategoryIndex } = req.body
            fileName = req.processedImage || null;
            const parentCategory = await MainKategory.findOne({ where: { id: mainKategoryId } });
            if (!parentCategory) {
                if (fileName) {
                    try {
                        await mediaProcessor.deleteOldFiles(fileName, 'images');
                    } catch (deleteError) {
                        console.error('Error deleting uploaded image after failure:', deleteError);
                    }
                }
                return res.status(404).json({ error: 'Главная категория с таким id не найдена' });
            }
            const kategory = await Kategory.create({
                name: name,
                mainKategoryId: mainKategoryId,
                image: fileName,
                kategoryIndex: kategoryIndex
            })
            return res.json(kategory);
        } catch (e) {
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
    async deleteKategoryById(req, res) {
        try {
            const { id } = req.params;
            const kategory = await Kategory.findOne({ where: { id } });

            if (!kategory) {
                return res.status(404).json({ error: 'Категория не найдена' });
            }

            await kategory.destroy();
            return res.json({ message: 'Категория удалена' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    async updateKategoryById(req, res) {
        let newFileName = null;
        let oldFileName = null;
        try {
            const { id } = req.params;
            const { name, kategoryIndex } = req.body;

            const kategory = await Kategory.findOne(
                { where: { id } }
            )
            if (!kategory) {
                return res.status(404).json({ message: 'Категория не найдена' });
            }
            oldFileName = kategory.image;
            newFileName = req.processedImage || oldFileName;

            const [updatedRowsCount, updatedRows] = await Kategory.update(
                {
                    name: name,
                    image: newFileName,
                    kategoryIndex: kategoryIndex
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                if (req.processedImage && oldFileName && oldFileName !== newFileName) {
                    try {
                        await mediaProcessor.deleteOldFiles(oldFileName, 'images');
                        console.log('Old image deleted after successful update:', oldFileName);
                    } catch (deleteError) {
                        console.error('Error deleting old image after update:', deleteError);
                    }
                }

                res.status(200).json({
                    message: 'Данные успешно обновлены',
                    updatedRows
                });

            } else {
                if (req.processedImage && req.processedImage !== oldFileName) {
                    await mediaProcessor.deleteOldFiles(req.processedImage, 'images');
                    console.log('New image deleted because update failed:', req.processedImage);
                }
                res.status(404).json({ message: 'Запись не найдена' });
            }
        } catch (error) {
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

module.exports = new kategoryController();