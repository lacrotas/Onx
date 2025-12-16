const { Busket } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class BusketController {

    async addBusket(req, res, next) {
        try {
            const { userId, itemsJsonb } = req.body

            let specifications = itemsJsonb;
            if (typeof itemsJsonb === 'string') {
                try {
                    specifications = JSON.parse(itemsJsonb);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = {};
                }
            }

            const order = await Busket.create({
                userId: userId,
                itemsJsonb: specifications
            })
            return res.json(order);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async getAllBusket(req, res) {
        const orders = await Busket.findAll();
        return res.json(orders);
    }
    async getBusketByUserId(req, res) {
        const { userId } = req.params
        const order = await Busket.findOne(
            { where: { userId } }
        );
        return res.json(order);
    }
    async getBusketById(req, res) {
        const { id } = req.params
        const busket = await Item.findOne(
            { where: { id } }
        );
        return res.json(busket);
    }
    async deleteBusketById(req, res) {
        try {
            const { id } = req.params;
            const busket = await Busket.findOne({ where: { id } });

            if (!busket) {
                return res.status(404).json({ error: 'Корзина не найден' });
            }

            await busket.destroy();
            return res.json({ message: 'Корзине удален' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    async updateBusketById(req, res) {
        const { id } = req.params;
        const { itemsJsonb } = req.body;

        try {
            const currentItem = await Busket.findOne({ where: { id } });
            if (!currentItem) {
                return res.status(404).json({ message: 'Запись не найдена' });
            }
            let specifications = itemsJsonb;
            if (typeof itemsJsonb === 'string' && itemsJsonb) {
                try {
                    specifications = JSON.parse(itemsJsonb);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = {};
                }
            }

            const [updatedRowsCount, updatedRows] = await Busket.update(
                {
                    itemsJsonb: specifications,
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

module.exports = new BusketController();