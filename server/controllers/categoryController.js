const { Category } = require('../models/models');
const ApiError = require('../error/ApiError');
const { mediaProcessor } = require('../middleware/MediaProcessor');

class CategoryController {

    async getAllCategory(req, res) {
        const categories = await Category.findAll();
        return res.json(categories);
    }
    // get by params 
    async getAllCategoryByParentId(req, res) {
        const { id } = req.params;
        const curentCategory = await Category.findAll({ where: { parentId:  id  } });
        if (!Category) {
            return res.status(404).json({ message: "Категория не найдена" });
        }
        return res.json(curentCategory);
    }
    async getCategoryById(req, res) {
        const { param } = req.params;
        let curentCategory;
        if (!isNaN(param)) {
            curentCategory = await Category.findOne({ where: { id: param } });
        } else {
            curentCategory = await Category.findOne({ where: { alias: param } });
        }
        if (!curentCategory) {
            return res.status(404).json({ message: "Категория не найдена" });
        }
        return res.json(curentCategory);
    }
    async getAllMainCategory(req, res) {
        const curentCategory = await Category.findAll({ where: { parentId:  0  } });
        if (!Category) {
            return res.status(404).json({ message: "Категория не найдена" });
        }
        return res.json(curentCategory);
    }

    // methots
    async addCategory(req, res, next) {
        let fileName = null;

        try {
            const { name, seo_title, alias, parentId, mainKategoryId, seo_desc, categoryIndex } = req.body;

            fileName = req.processedImage || null;

            // Безопасный парсинг parentId с поддержкой parentId и mainKategoryId
            const rawParent = parentId !== undefined && parentId !== 'undefined' ? parentId : mainKategoryId;
            let parsedParentId = 0;
            if (rawParent !== undefined && rawParent !== null && rawParent !== '' && rawParent !== 'null' && rawParent !== 'undefined') {
                const parsed = parseInt(rawParent, 10);
                if (!isNaN(parsed)) {
                    parsedParentId = parsed;
                }
            }

            let parsedCategoryIndex = 0;
            if (categoryIndex !== undefined && categoryIndex !== null && categoryIndex !== '' && categoryIndex !== 'null' && categoryIndex !== 'undefined') {
                const parsed = parseInt(categoryIndex, 10);
                if (!isNaN(parsed)) {
                    parsedCategoryIndex = parsed;
                }
            }

            const curentCategory = await Category.create({
                name,
                image: fileName,
                gridItemIndex: 1,
                gridSpace: 1,
                seo_title: seo_title || '',
                seo_desc: seo_desc || '',
                alias: alias || '',
                parentId: parsedParentId,
                categoryIndex: parsedCategoryIndex
            });

            return res.json(curentCategory);

        } catch (e) {
            console.error('Ошибка в addCategory:', e);
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
    async deleteCategoryById(req, res) {
        try {
            const { id } = req.params;
            const curentCategory = await Category.findOne({ where: { id } });

            if (!curentCategory) {
                return res.status(404).json({ error: 'Категория не найдена' });
            }

            // Удаляем файл изображения
            if (curentCategory.image) {
                await mediaProcessor.deleteOldFiles(curentCategory.image, 'images');
            }

            await curentCategory.destroy();
            return res.json({ message: 'Категория удалена' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    async updateCategoryById(req, res) {
        let newFileName = null;
        let oldFileName = null;

        try {
            const { id } = req.params;
            const { name, gridSpace, gridItemIndex, seo_title, alias, parentId, mainKategoryId, seo_desc, categoryIndex } = req.body;

            const curentCategory = await Category.findOne({ where: { id } });
            if (!curentCategory) {
                return res.status(404).json({ message: 'Категория не найдена' });
            }

            oldFileName = curentCategory.image;
            newFileName = req.processedImage || oldFileName;

            const updateData = {
                image: newFileName
            };

            if (name !== undefined) updateData.name = name;
            if (gridItemIndex !== undefined) updateData.gridItemIndex = gridItemIndex;
            if (gridSpace !== undefined) updateData.gridSpace = gridSpace;
            if (seo_title !== undefined) updateData.seo_title = seo_title;
            if (seo_desc !== undefined) updateData.seo_desc = seo_desc;
            if (alias !== undefined) updateData.alias = alias;

            const rawParent = parentId !== undefined && parentId !== 'undefined' ? parentId : mainKategoryId;
            if (rawParent !== undefined && rawParent !== null && rawParent !== '' && rawParent !== 'null' && rawParent !== 'undefined') {
                const parsed = parseInt(rawParent, 10);
                if (!isNaN(parsed)) {
                    updateData.parentId = parsed;
                }
            }

            if (categoryIndex !== undefined && categoryIndex !== null && categoryIndex !== '' && categoryIndex !== 'null' && categoryIndex !== 'undefined') {
                const parsed = parseInt(categoryIndex, 10);
                if (!isNaN(parsed)) {
                    updateData.categoryIndex = parsed;
                }
            }

            // Обновляем категорию БЕЗ предварительного удаления старого изображения
            const [updatedRowsCount, updatedRows] = await Category.update(
                updateData,
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

module.exports = new CategoryController();