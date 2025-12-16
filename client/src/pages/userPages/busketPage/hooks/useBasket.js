import { useState, useEffect } from 'react';
import { fetchBusketByUserId, updateBusket } from '../../../../http/busketApi';

export const useBasket = () => {
    const [basket, setBasket] = useState([]);
    const [loading, setLoading] = useState(false);

    const getUserIdFromToken = () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.id; 
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    };

    useEffect(() => {
        loadBasket();
    }, []);

    const loadBasket = async () => {
        setLoading(true);
        try {
            const userId = getUserIdFromToken();
            const localBasket = localStorage.getItem('basket');

            if (userId) {
                if (!localBasket) {
                    const serverBasket = await fetchBusketByUserId(userId);
                    if (serverBasket && serverBasket.itemsJsonb) {
                        setBasket(serverBasket.itemsJsonb);
                        localStorage.setItem('basket', JSON.stringify(serverBasket.itemsJsonb));
                    } else {
                        setBasket([]);
                        localStorage.setItem('basket', JSON.stringify([]));
                    }
                } else {
                    setBasket(JSON.parse(localBasket));
                }
            } else {
                setBasket(localBasket ? JSON.parse(localBasket) : []);
            }
        } catch (error) {
            console.error('Error loading basket:', error);
            setBasket([]);
        } finally {
            setLoading(false);
        }
    };

    const syncBasketWithServer = async (newBasket) => {
        const userId = getUserIdFromToken();
        if (!userId) return;

        try {
            await updateBusket({ 
                itemsJsonb: newBasket 
            }, userId);
        } catch (error) {
            console.error('Error syncing basket with server:', error);
        }
    };

    // Добавление товара в корзину
    const addToBasket = async (itemId, count = 1) => {
        const newBasket = [...basket];
        const existingItemIndex = newBasket.findIndex(item => item.id == itemId);

        if (existingItemIndex > -1) {
            // Товар уже есть - обновляем количество
            newBasket[existingItemIndex].count += count;
        } else {
            // Новый товар
            newBasket.push({ id: itemId, count });
        }

        setBasket(newBasket);
        localStorage.setItem('basket', JSON.stringify(newBasket));
        await syncBasketWithServer(newBasket);
    };

    // Удаление товара из корзины
    const removeFromBasket = async (itemId) => {
        const newBasket = basket.filter(item => item.id != itemId);
        
        setBasket(newBasket);
        localStorage.setItem('basket', JSON.stringify(newBasket));
        await syncBasketWithServer(newBasket);
    };

    // Обновление количества товара
    const updateItemCount = async (itemId, newCount) => {
        if (newCount < 1) {
            removeFromBasket(itemId);
            return;
        }

        const newBasket = basket.map(item =>
            item.id == itemId ? { ...item, count: newCount } : item
        );

        setBasket(newBasket);
        localStorage.setItem('basket', JSON.stringify(newBasket));
        await syncBasketWithServer(newBasket);
    };

    // Очистка корзины (при заказе)
    const clearBasket = async () => {
        setBasket([]);
        localStorage.setItem('basket', JSON.stringify([]));
        
        const userId = getUserIdFromToken();
        if (userId) {
            await syncBasketWithServer([]);
        }
    };

    // Получение общего количества товаров
    const getTotalItems = () => {
        return basket.reduce((total, item) => total + item.count, 0);
    };

    // Получение общей суммы
    const getTotalPrice = (itemsWithPrices) => {
        return basket.reduce((total, basketItem) => {
            const item = itemsWithPrices.find(i => i.id == basketItem.id);
            return total + (item ? item.price * basketItem.count : 0);
        }, 0);
    };

    return {
        basket,
        loading,
        addToBasket,
        removeFromBasket,
        updateItemCount,
        clearBasket,
        getTotalItems,
        getTotalPrice,
        reloadBasket: loadBasket
    };
};