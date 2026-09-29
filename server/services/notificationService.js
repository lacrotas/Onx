const nodemailer = require('nodemailer');
const { Item, Category } = require('../models/models');
const { Op } = require('sequelize');

class NotificationService {
    constructor() {
        this.telegramToken = process.env.TELEGRAM_BOT_TOKEN || '8268778878:AAGJFFLFOjoyFtsAcKw1LRI7FM6ZcCi6NFs';
        this.telegramChatId = process.env.TELEGRAM_CHAT_ID || '-1003547882787';
    }

    async resolveItemsWithUrls(items) {
        if (!Array.isArray(items) || items.length === 0) {
            return items;
        }

        try {
            const itemIds = items.map(i => i.id || i.itemId).filter(Boolean);
            const itemAliases = items.map(i => i.alias).filter(Boolean);

            const conditions = [];
            if (itemIds.length > 0) conditions.push({ id: itemIds });
            if (itemAliases.length > 0) conditions.push({ alias: itemAliases });

            const dbItems = conditions.length > 0 ? await Item.findAll({
                where: { [Op.or]: conditions },
                attributes: ['id', 'alias', 'categoryId', 'name']
            }) : [];

            const catIds = dbItems.map(i => i.categoryId).filter(Boolean);
            const categories = catIds.length > 0 ? await Category.findAll({
                where: { id: catIds },
                attributes: ['id', 'alias', 'parentId']
            }) : [];

            const parentIds = categories.map(c => c.parentId).filter(p => p && p > 0);
            const parentCategories = parentIds.length > 0 ? await Category.findAll({
                where: { id: parentIds },
                attributes: ['id', 'alias']
            }) : [];

            const itemMapById = new Map(dbItems.map(i => [String(i.id), i]));
            const itemMapByAlias = new Map(dbItems.map(i => [i.alias, i]));
            const catMap = new Map(categories.map(c => [String(c.id), c]));
            const parentCatMap = new Map(parentCategories.map(p => [String(p.id), p]));

            const clientUrl = (process.env.CLIENT_URL || 'https://onx.by').replace(/\/+$/, '');

            return items.map(item => {
                const idKey = String(item.id || item.itemId || '');
                const aliasKey = item.alias || '';
                const dbItem = itemMapById.get(idKey) || itemMapByAlias.get(aliasKey);

                const itemAlias = dbItem ? dbItem.alias : (item.alias || item.id || item.itemId);
                const cat = dbItem ? catMap.get(String(dbItem.categoryId)) : null;
                const catAlias = cat ? cat.alias : item.categoryAlias;
                const parentCat = cat && cat.parentId ? parentCatMap.get(String(cat.parentId)) : null;
                const parentAlias = parentCat ? parentCat.alias : item.mainCategoryAlias;

                let path = '';
                if (parentAlias && catAlias && itemAlias) {
                    path = `/${parentAlias}/${catAlias}/${itemAlias}`;
                } else if (catAlias && itemAlias) {
                    path = `/${catAlias}/${itemAlias}`;
                } else if (itemAlias) {
                    path = `/itemPreview/${itemAlias}`;
                }

                return {
                    ...item,
                    alias: itemAlias,
                    fullPath: path,
                    productUrl: path ? `${clientUrl}${path}` : ''
                };
            });
        } catch (err) {
            console.error('Error resolving product URLs:', err);
            return items;
        }
    }

    createTransporter() {
        const user = process.env.EMAIL_USER;
        const pass = process.env.EMAIL_PASSWORD;
        if (!user || !pass) {
            return null;
        }

        const service = (process.env.EMAIL_SERVICE || '').toLowerCase();
        const host = process.env.EMAIL_HOST;

        if (host) {
            return nodemailer.createTransport({
                host,
                port: Number(process.env.EMAIL_PORT) || 465,
                secure: Number(process.env.EMAIL_PORT) !== 587,
                auth: { user, pass }
            });
        }

        if (
            service === 'mailru' || 
            service === 'mail.ru' || 
            user.toLowerCase().endsWith('@mail.ru') || 
            user.toLowerCase().endsWith('@inbox.ru') || 
            user.toLowerCase().endsWith('@bk.ru') || 
            user.toLowerCase().endsWith('@list.ru')
        ) {
            return nodemailer.createTransport({
                host: 'smtp.mail.ru',
                port: 465,
                secure: true,
                auth: { user, pass }
            });
        }

        if (
            service === 'yandex' || 
            user.toLowerCase().endsWith('@yandex.ru') || 
            user.toLowerCase().endsWith('@ya.ru')
        ) {
            return nodemailer.createTransport({
                host: 'smtp.yandex.ru',
                port: 465,
                secure: true,
                auth: { user, pass }
            });
        }

        return nodemailer.createTransport({
            service: service || 'gmail',
            auth: { user, pass }
        });
    }

    getItemUrl(item) {
        if (item.productUrl) return item.productUrl;
        const clientUrl = (process.env.CLIENT_URL || 'https://onx.by').replace(/\/+$/, '');
        if (item.fullPath) return `${clientUrl}${item.fullPath.startsWith('/') ? '' : '/'}${item.fullPath}`;
        const slug = item.alias || item.id || item.itemId;
        if (!slug) return null;
        return `${clientUrl}/itemPreview/${encodeURIComponent(slug)}`;
    }

    formatTelegramMessage(order, items) {
        const itemsList = Array.isArray(items) ? items : [];
        const itemsText = itemsList.map((item, index) => {
            const count = item.count || item.quantity || 1;
            const price = Number(item.price) || 0;
            const totalItem = price * count;
            const itemUrl = this.getItemUrl(item);
            const itemNameHtml = itemUrl 
                ? `<a href="${itemUrl}"><b>${escapeHtml(item.name || 'Товар')}</b></a>`
                : `<b>${escapeHtml(item.name || 'Товар')}</b>`;
            return `${index + 1}. ${itemNameHtml}\n   └ ${count} шт. × ${price} руб. = <b>${totalItem} руб.</b>`;
        }).join('\n');

        const orderIdText = order.id ? ` №${order.id}` : '';
        const dateText = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });

        return `🛒 <b>Новый заказ${orderIdText}!</b>
📅 <i>${dateText}</i>

👤 <b>Клиент:</b> ${escapeHtml(order.name || 'Не указано')}
📞 <b>Телефон:</b> <code>${escapeHtml(order.phone || 'Не указан')}</code>
📍 <b>Адрес / Доставка:</b> ${escapeHtml(order.adress || 'Самовывоз')}
💳 <b>Оплата:</b> ${escapeHtml(order.payment || 'Не указана')}
💬 <b>Комментарий:</b> ${escapeHtml(order.comment || 'Нет комментария')}

📦 <b>Состав заказа:</b>
${itemsText || '— (список товаров пуст)'}

💰 <b>ИТОГО К ОПЛАТЕ: ${order.price || 0} руб.</b>`;
    }

    formatEmailHtml(order, items) {
        const itemsList = Array.isArray(items) ? items : [];
        const rows = itemsList.map((item, i) => {
            const count = item.count || item.quantity || 1;
            const price = Number(item.price) || 0;
            const total = price * count;
            const itemUrl = this.getItemUrl(item);
            const itemNameHtml = itemUrl 
                ? `<a href="${itemUrl}" target="_blank" style="color: #0071e3; text-decoration: none; font-weight: 600;">${escapeHtml(item.name || 'Товар')} ↗</a>`
                : `<strong>${escapeHtml(item.name || 'Товар')}</strong>`;
            return `
                <tr style="background-color: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
                    <td style="padding: 12px 14px; border: 1px solid #e5e7eb; font-size: 14px; color: #1f2937;">
                        ${itemNameHtml}
                    </td>
                    <td style="padding: 12px 14px; border: 1px solid #e5e7eb; text-align: center; font-size: 14px; color: #374151;">
                        ${count} шт.
                    </td>
                    <td style="padding: 12px 14px; border: 1px solid #e5e7eb; text-align: right; font-size: 14px; color: #374151;">
                        ${price} руб.
                    </td>
                    <td style="padding: 12px 14px; border: 1px solid #e5e7eb; text-align: right; font-size: 14px; font-weight: bold; color: #111827;">
                        ${total} руб.
                    </td>
                </tr>
            `;
        }).join('');

        const orderIdText = order.id ? ` №${order.id}` : '';
        const dateText = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Minsk' });

        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Новый заказ${orderIdText}</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f3f4f6; margin: 0; padding: 24px; color: #1f2937;">
            <div style="max-width: 650px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06); border: 1px solid #e5e7eb;">
                <div style="background: linear-gradient(135deg, #0071e3 0%, #0056b3 100%); color: #ffffff; padding: 28px 24px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 700;">📦 Новый заказ${orderIdText}</h1>
                    <p style="margin: 6px 0 0; opacity: 0.9; font-size: 14px;">${dateText}</p>
                </div>
                
                <div style="padding: 24px;">
                    <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 18px; margin-bottom: 24px;">
                        <h3 style="margin: 0 0 14px; font-size: 16px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px;">Данные покупателя</h3>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>👤 Имя:</strong> ${escapeHtml(order.name || 'Не указано')}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>📞 Телефон:</strong> <a href="tel:${escapeHtml(order.phone || '')}" style="color: #0071e3; text-decoration: none;">${escapeHtml(order.phone || 'Не указан')}</a></p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>📍 Адрес / Доставка:</strong> ${escapeHtml(order.adress || 'Самовывоз')}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>💳 Оплата:</strong> ${escapeHtml(order.payment || 'Не указана')}</p>
                        <p style="margin: 6px 0; font-size: 14px;"><strong>💬 Комментарий:</strong> ${escapeHtml(order.comment || 'Нет комментария')}</p>
                    </div>

                    <h3 style="margin: 0 0 12px; font-size: 16px; color: #0f172a;">Состав заказа</h3>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px; border: 1px solid #e5e7eb;">
                        <thead>
                            <tr style="background: #f1f5f9;">
                                <th style="padding: 10px 14px; border: 1px solid #e5e7eb; text-align: left; font-size: 13px; color: #475569; text-transform: uppercase;">Товар</th>
                                <th style="padding: 10px 14px; border: 1px solid #e5e7eb; text-align: center; font-size: 13px; color: #475569; text-transform: uppercase;">Кол-во</th>
                                <th style="padding: 10px 14px; border: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #475569; text-transform: uppercase;">Цена</th>
                                <th style="padding: 10px 14px; border: 1px solid #e5e7eb; text-align: right; font-size: 13px; color: #475569; text-transform: uppercase;">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${rows}
                        </tbody>
                    </table>

                    <div style="background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 8px; padding: 16px 20px; text-align: right;">
                        <span style="font-size: 16px; color: #3730a3; margin-right: 12px;">Итого к оплате:</span>
                        <strong style="font-size: 22px; color: #1e1b4b;">${order.price || 0} руб.</strong>
                    </div>
                </div>

                <div style="background: #f9fafb; border-top: 1px solid #e5e7eb; padding: 14px 24px; text-align: center; font-size: 12px; color: #6b7280;">
                    Магазин Onx • Автоматическое уведомление
                </div>
            </div>
        </body>
        </html>
        `;
    }

    async sendTelegram(order, items) {
        const token = process.env.TELEGRAM_BOT_TOKEN || this.telegramToken;
        const chatId = process.env.TELEGRAM_CHAT_ID || this.telegramChatId;

        if (!token || !chatId) {
            console.log('Telegram not configured: missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID');
            return false;
        }

        try {
            const message = this.formatTelegramMessage(order, items);
            const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML'
                })
            });

            const result = await response.json();
            if (!result.ok) {
                console.error('Telegram API error:', result);
                return false;
            }
            console.log('Telegram notification sent successfully for order', order.id);
            return true;
        } catch (err) {
            console.error('Error sending Telegram notification:', err.message);
            return false;
        }
    }

    async sendEmail(order, items) {
        const receiver = process.env.ORDER_RECEIVER_EMAIL || process.env.EMAIL_USER;
        if (!receiver) {
            console.log('Email notification skipped: no ORDER_RECEIVER_EMAIL configured');
            return false;
        }

        const transporter = this.createTransporter();
        if (!transporter) {
            console.log('Email notification skipped: missing EMAIL_USER or EMAIL_PASSWORD');
            return false;
        }

        try {
            const subject = `Новый заказ${order.id ? ' №' + order.id : ''} от ${order.name || 'Покупателя'} на ${order.price || 0} руб.`;
            const html = this.formatEmailHtml(order, items);

            await transporter.sendMail({
                from: `"Onx Store" <${process.env.EMAIL_USER}>`,
                to: receiver,
                subject,
                html
            });

            console.log('Email notification sent successfully to', receiver);
            return true;
        } catch (err) {
            console.error('Error sending email notification:', err.message);
            return false;
        }
    }

    async sendOrderNotifications(order, items) {
        try {
            const resolvedItems = await this.resolveItemsWithUrls(items);
            const results = await Promise.allSettled([
                this.sendTelegram(order, resolvedItems),
                this.sendEmail(order, resolvedItems)
            ]);
            return results;
        } catch (err) {
            console.error('Notification error:', err);
        }
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

module.exports = new NotificationService();
