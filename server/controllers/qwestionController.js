const { Qwestion } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class qwestionController {
    async addQwestion(req, res, next) {
        try {
            const { qwestion, description } = req.body
            const qwest = await Qwestion.create({
                qwestion: qwestion, description: description
            })
            return res.json(qwest);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getAllQwestion(req, res) {
        const qwest = await Qwestion.findAll();
        return res.json(qwest);
    }

    async deleteQwestionById(req, res) {
        try {
            const { id } = req.params;
            const qwest = await Qwestion.findOne({ where: { id } });

            if (!qwest) {
                return res.status(404).json({ error: 'Вопрос не найден' });
            }

            await qwest.destroy();
            return res.json({ message: 'Вопрос удален' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }

    async updateQwestionById(req, res) {
        try {
            const { id } = req.params;
            const { qwestion, description } = req.body

            const [updatedRowsCount, updatedRows] = await Qwestion.update(
                {
                    qwestion: qwestion,
                    description: description,
                },
                {
                    returning: true,
                    where: { id }
                }
            );

            if (updatedRowsCount > 0) {
                res.status(200).json({ message: 'Данные успешно обновлены', updatedRows });
            } else {
                res.status(404).json({ message: 'Запись не найдена' });
            }

        } catch (error) {
            console.error('Ошибка при обновлении данных:', error);
            res.status(500).json({ message: 'Ошибка сервера' });
        }
    }
}

module.exports = new qwestionController();