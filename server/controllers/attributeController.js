const { Attribute, Category } = require('../models/models');
const ApiError = require('../error/ApiError');

class attributeController {

    async getAllAttributeByKategoryId(req, res) {
        const categoryId = req.params.categoryId || req.params.kategoryId;
        const attribute = await Attribute.findAll({
            where: { categoryId },
            include: [{ model: Category, attributes: ['id', 'name'] }],
            order: [['filterIndex', 'ASC'], ['id', 'ASC']]
        });
        return res.json(attribute);
    }

    async getAllAttribute(req, res) {
        const attribute = await Attribute.findAll({
            include: [{ model: Category, attributes: ['id', 'name'] }],
            order: [['filterIndex', 'ASC'], ['id', 'ASC']]
        });
        return res.json(attribute);
    }

    async getAttributeById(req, res) {
        const { id } = req.params;
        const attribute = await Attribute.findOne({
            where: { id },
            include: [{ model: Category, attributes: ['id', 'name'] }]
        });
        return res.json(attribute);
    }

    async addAttribute(req, res, next) {
        try {
            const { name, buttonType, categoryId, kategoryId, addition, attributeValues, filterIndex } = req.body;
            const targetCategoryId = categoryId !== undefined && categoryId !== null && categoryId !== ''
                ? Number(categoryId)
                : (kategoryId !== undefined && kategoryId !== null && kategoryId !== '' ? Number(kategoryId) : null);

            let parsedAttributeValues = attributeValues;
            if (typeof attributeValues === 'string') {
                try {
                    parsedAttributeValues = JSON.parse(attributeValues);
                } catch (e) {
                    parsedAttributeValues = [];
                }
            }

            const attribute = await Attribute.create({
                name: name,
                buttonType: buttonType,
                categoryId: targetCategoryId,
                addition: addition,
                attributeValues: parsedAttributeValues || [],
                filterIndex: filterIndex !== undefined && filterIndex !== '' ? Number(filterIndex) : 0
            });
            return res.json(attribute);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async deleteAttributeById(req, res) {
        try {
            const { id } = req.params;
            const attribute = await Attribute.findOne(
                { where: { id } }
            );
            if (!attribute) {
                return res.status(404).json({ error: 'Атрибут не найден' });
            }
            await attribute.destroy();
            return res.json('Атрибут удален');

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateAttributeById(req, res) {
        const { id } = req.params;

        let updateData;
        if (req.is('multipart/form-data')) {
            const { name, buttonType, categoryId, kategoryId, addition, specificationsJSONB, attributeValues, filterIndex } = req.body;
            let parsedAttributeValues = attributeValues;
            if (typeof attributeValues === 'string') {
                try {
                    parsedAttributeValues = JSON.parse(attributeValues);
                } catch (e) {
                    parsedAttributeValues = [];
                }
            }
            updateData = {
                name: name,
                buttonType: buttonType,
                addition: addition,
                specificationsJSONB: specificationsJSONB,
                attributeValues: parsedAttributeValues,
                filterIndex: filterIndex !== undefined && filterIndex !== '' ? Number(filterIndex) : undefined
            };
            const targetCat = categoryId !== undefined ? categoryId : kategoryId;
            if (targetCat !== undefined && targetCat !== null && targetCat !== '') {
                updateData.categoryId = Number(targetCat);
            }
        } else {
            updateData = { ...req.body };
            const targetCat = updateData.categoryId !== undefined ? updateData.categoryId : updateData.kategoryId;
            if (targetCat !== undefined && targetCat !== null && targetCat !== '') {
                updateData.categoryId = Number(targetCat);
            }
            if (updateData.filterIndex !== undefined && updateData.filterIndex !== '') {
                updateData.filterIndex = Number(updateData.filterIndex);
            }
            if (updateData.attributeValues && typeof updateData.attributeValues === 'string') {
                try {
                    updateData.attributeValues = JSON.parse(updateData.attributeValues);
                } catch (e) {
                    updateData.attributeValues = [];
                }
            }
        }

        try {
            const [updatedRowsCount, updatedRows] = await Attribute.update(
                updateData,
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                res.status(200).json({ message: 'Данные успешно обновлены', updatedRows: updatedRows[0] });
            } else {
                res.status(404).json({ message: 'Запись не найдена' });
            }
        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new attributeController();