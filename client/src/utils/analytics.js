/**
 * Утилиты для работы с Google Analytics 4 (GA4) E-commerce
 */

export const parsePrice = (price) => {
    if (!price && price !== 0) return 0;
    const clean = String(price).replace(/\s+/g, '').replace(',', '.').replace(/[^0-9.]/g, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Number(num.toFixed(2));
};

export const formatGA4Items = (items = []) => {
    if (!Array.isArray(items)) return [];
    return items.map((it, idx) => ({
        item_id: String(it.id || it.itemId || idx + 1),
        item_name: it.name || 'Товар',
        price: parsePrice(it.price),
        quantity: Number(it.count) || 1,
        ...(it.categoryName ? { item_category: it.categoryName } : {})
    }));
};

export const sendGtagEvent = (eventName, params = {}) => {
    try {
        console.log(`[GA4 Event] ${eventName}:`, params);
        if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
            window.gtag('event', eventName, params);
        }
    } catch (err) {
        console.warn(`[Analytics] Error sending ${eventName}:`, err);
    }
};

/**
 * 1. Просмотр карточки товара (view_item)
 */
export const logViewItem = (item, categoryName) => {
    if (!item) return;
    const price = parsePrice(item.price);
    sendGtagEvent('view_item', {
        currency: 'BYN',
        value: price,
        items: [
            {
                item_id: String(item.id),
                item_name: item.name || '',
                price: price,
                quantity: 1,
                ...(categoryName ? { item_category: categoryName } : {})
            }
        ]
    });
};

/**
 * 2. Добавление товара в корзину (add_to_cart)
 */
export const logAddToCart = (item, count = 1, categoryName) => {
    if (!item) return;
    const price = parsePrice(item.price);
    const quantity = Number(count) || 1;
    sendGtagEvent('add_to_cart', {
        currency: 'BYN',
        value: Number((price * quantity).toFixed(2)),
        items: [
            {
                item_id: String(item.id),
                item_name: item.name || '',
                price: price,
                quantity: quantity,
                ...(categoryName ? { item_category: categoryName } : {})
            }
        ]
    });
};

/**
 * 3. Просмотр корзины (view_cart)
 */
export const logViewCart = (items = [], totalValue = 0) => {
    const value = parsePrice(totalValue);
    sendGtagEvent('view_cart', {
        currency: 'BYN',
        value: value,
        items: formatGA4Items(items)
    });
};

/**
 * 4. Начало оформления заказа (begin_checkout)
 */
export const logBeginCheckout = (items = [], totalValue = 0) => {
    const value = parsePrice(totalValue);
    sendGtagEvent('begin_checkout', {
        currency: 'BYN',
        value: value,
        items: formatGA4Items(items)
    });
};

/**
 * 5. Успешная покупка / заказ (purchase)
 */
export const logPurchase = (orderId, items = [], totalValue = 0) => {
    const value = parsePrice(totalValue);
    sendGtagEvent('purchase', {
        transaction_id: String(orderId),
        value: value,
        currency: 'BYN',
        items: formatGA4Items(items)
    });
};

