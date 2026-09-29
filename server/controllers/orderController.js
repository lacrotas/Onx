const { Order } = require('../models/models');
const ApiError = require('../error/ApiError');
const uuid = require('uuid');
const path = require('path');
const fs = require('fs');
const notificationService = require('../services/notificationService');

class OrderController {

    async addOrder(req, res, next) {
        try {
            const { userId, itemsJsonb, name, adress, comment, phone, payment, price } = req.body

            // Если пользователь авторизован, берем его ID из токена, иначе переданный или null
            const resolvedUserId = req.user ? req.user.id : (userId && !isNaN(userId) ? parseInt(userId, 10) : null);

            let specifications = itemsJsonb;
            if (typeof itemsJsonb === 'string') {
                try {
                    specifications = JSON.parse(itemsJsonb);
                } catch (parseError) {
                    console.log('JSON parse error:', parseError);
                    specifications = [];
                }
            }

            // Обогащаем товары полными ссылками на сайте (ЧПУ: /mainCategory/category/item)
            const enrichedItems = await notificationService.resolveItemsWithUrls(specifications);

            const order = await Order.create({
                userId: resolvedUserId,
                name: name,
                adress: adress,
                comment: comment,
                phone: phone,
                payment: payment,
                itemsJsonb: enrichedItems,
                price: price,
                orderStage: "start"
            });

            // Отправка уведомлений в Telegram и на Email
            notificationService.sendOrderNotifications(order, enrichedItems).catch(err => {
                console.error('Error in sendOrderNotifications:', err);
            });

            return res.json(order);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async getMyOrders(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Не авторизован" });
            }
            const orders = await Order.findAll({
                where: { userId: req.user.id },
                order: [['createdAt', 'DESC']]
            });
            return res.json(orders);
        } catch (e) {
            next(ApiError.badRequest(e.message));
        }
    }

    async linkGuestOrders(req, res, next) {
        try {
            if (!req.user || !req.user.id) {
                return res.status(401).json({ message: "Не авторизован" });
            }
            const { guestOrderIds } = req.body;
            if (!Array.isArray(guestOrderIds) || guestOrderIds.length === 0) {
                return res.json({ updated: 0, message: "Нет гостевых заказов для привязки" });
            }
            const { Op } = require('sequelize');
            const validIds = guestOrderIds.map(id => parseInt(id, 10)).filter(id => !isNaN(id) && id > 0);
            if (validIds.length === 0) {
                return res.json({ updated: 0 });
            }
            const [updated] = await Order.update(
                { userId: req.user.id },
                {
                    where: {
                        id: { [Op.in]: validIds },
                        userId: null
                    }
                }
            );
            return res.json({ updated, message: `Привязано заказов: ${updated}` });
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
            const { name, adress, comment, phone, payment, orderStage, price, itemsJsonb } = req.body || {};
            const updateFields = {};
            if (name !== undefined) updateFields.name = name;
            if (adress !== undefined) updateFields.adress = adress;
            if (comment !== undefined) updateFields.comment = comment;
            if (phone !== undefined) updateFields.phone = phone;
            if (payment !== undefined) updateFields.payment = payment;
            if (orderStage !== undefined) updateFields.orderStage = orderStage;
            if (price !== undefined) updateFields.price = price;

            if (itemsJsonb !== undefined) {
                let specifications = itemsJsonb;
                if (typeof itemsJsonb === 'string' && itemsJsonb) {
                    try {
                        specifications = JSON.parse(itemsJsonb);
                    } catch (parseError) {
                        console.log('JSON parse error:', parseError);
                        specifications = {};
                    }
                }
                updateFields.itemsJsonb = specifications;
            }

            const [updatedRowsCount, updatedRows] = await Order.update(
                updateFields,
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