// AddToCartButton.js
import React, { useState, useEffect, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { updateBusketByUserId } from '../../http/busketApi';
import { BUSKET_ROUTE } from '../../pages/appRouter/Const';

const AddToCartButton = ({ item, children }) => {
    const history = useHistory();
    const [isInCart, setIsInCart] = useState(false);

    // Мгновенная проверка в localStorage (без тяжелых сетевых запросов)
    const checkItemInCart = useCallback(() => {
        if (!item?.id) {
            setIsInCart(false);
            return;
        }

        try {
            const savedBasket = localStorage.getItem('basket');
            if (savedBasket) {
                const parsed = JSON.parse(savedBasket);
                if (Array.isArray(parsed)) {
                    const isFound = parsed.some(i => String(i.itemId || i.id) === String(item.id));
                    setIsInCart(isFound);
                    return;
                }
            }
        } catch (e) {
            console.error("Ошибка чтения корзины из localStorage:", e);
        }
        setIsInCart(false);
    }, [item?.id]);

    useEffect(() => {
        checkItemInCart();

        const handleCartUpdate = () => checkItemInCart();
        window.addEventListener('cartUpdated', handleCartUpdate);
        window.addEventListener('storage', handleCartUpdate);
        return () => {
            window.removeEventListener('cartUpdated', handleCartUpdate);
            window.removeEventListener('storage', handleCartUpdate);
        };
    }, [checkItemInCart]);

    const addToCart = async (count = 1) => {
        if (!item?.id) return false;

        try {
            // 1. Мгновенно обновляем локальную корзину (Local First)
            let localBasket = [];
            try {
                const raw = localStorage.getItem('basket');
                localBasket = raw ? JSON.parse(raw) : [];
                if (!Array.isArray(localBasket)) localBasket = [];
            } catch (e) {
                localBasket = [];
            }

            const existingIndex = localBasket.findIndex(i => String(i.itemId || i.id) === String(item.id));
            if (existingIndex > -1) {
                localBasket[existingIndex].count = (localBasket[existingIndex].count || 1) + count;
            } else {
                localBasket.push({
                    itemId: item.id,
                    id: item.id,
                    count: count || 1
                });
            }

            localStorage.setItem('basket', JSON.stringify(localBasket));
            setIsInCart(true);
            window.dispatchEvent(new Event('cartUpdated'));

            // 2. Если пользователь авторизован, фоново синхронизируем с сервером
            const token = localStorage.getItem('token');
            if (token && token !== 'undefined' && token !== 'null') {
                try {
                    const userId = jwt_decode(token)?.id;
                    if (userId) {
                        const serverItems = localBasket.map(i => ({
                            itemId: i.itemId || i.id,
                            count: i.count || 1
                        }));
                        await updateBusketByUserId(userId, { itemsJsonb: serverItems });
                    }
                } catch (syncErr) {
                    console.warn("Фоновая синхронизация с сервером:", syncErr);
                }
            }

            return true;
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            return false;
        }
    };

    const handleAddToCart = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isInCart) {
            history.push(BUSKET_ROUTE);
        } else {
            addToCart(1);
        }
    };

    const handleBuyNow = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!isInCart) {
            await addToCart(1);
        }
        history.push(BUSKET_ROUTE);
    };

    return children({
        isInCart,
        handleAddToCart,
        handleBuyNow
    });
};

export default AddToCartButton;