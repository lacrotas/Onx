const { Order } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');

class OrderController {

    async addOrder(req, res, next) {
        try {
            const { userId, itemsJsonb, name, adress, comment, phone, payment, price } = req.body

            let specifications = itemsJsonb;
            if (typeof itemsJsonb === 'string') {
                try {
                    specifications = JSON.parse(itemsJsonb);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = {};
                }
            }

            const order = await Order.create({
                userId: userId,
                name: name,
                adress: adress,
                comment: comment,
                phone: phone,
                payment: payment,
                itemsJsonb: specifications,
                price: price,
                orderStage: "start"
            })
            return res.json(order);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }
    async getAllOrders(req, res) {
        const orders = await Order.findAll();
        return res.json(orders);
    }
    async getOrderById(req, res) {
        const { id } = req.params
        const order = await Order.findOne(
            { where: { id } }
        );
        return res.json(order);
    }
    async getAllOrdersByUserId(req, res) {
        const { userId } = req.params
        const orders = await Order.findAll(
            { where: { userId } }
        );
        return res.json(orders);
    }
    async deleteOrderById(req, res) {
        try {
            const { id } = req.params;
            const order = await Order.findOne({ where: { id } });

            if (!order) {
                return res.status(404).json({ error: 'Заказ не найден' });
            }

            await order.destroy();
            return res.json({ message: 'Заказ удален' });

        } catch (error) {
            console.error('Delete error:', error);
            return res.status(500).json({ error: 'Ошибка сервера' });
        }
    }
    async updateOrderById(req, res) {
        try {
            const { id } = req.params;
            const { itemsJsonb, name, adress, comment, phone, payment, orderStage, price } = req.body

            let specifications = itemsJsonb;
            if (typeof itemsJsonb === 'string' && itemsJsonb) {
                try {
                    specifications = JSON.parse(itemsJsonb);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = {};
                }
            }

            const [updatedRowsCount, updatedRows] = await Order.update(
                {
                    name: name,
                    adress: adress,
                    comment: comment,
                    phone: phone,
                    payment: payment,
                    itemsJsonb: specifications,
                    orderStage: orderStage,
                    price: price
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


module.exports = new OrderController();