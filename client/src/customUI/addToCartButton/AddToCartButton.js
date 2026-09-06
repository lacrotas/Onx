// AddToCart.js
import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { fetchBusketByUserId, updateBusket } from '../../http/busketApi';
import { BUSKET_ROUTE } from '../../pages/appRouter/Const';

const AddToCartButton = ({ item, children }) => {
 const history = useHistory();
    const [isInCart, setIsInCart] = useState(false);

    const checkItemInCart = async () => {
        if (!item?.id) return;
        
        setIsInCart(false);
        try {
            const token = localStorage.getItem('token');
            let isFound = false;

            if (token && token !== 'undefined' && token !== 'null') {
                try {
                    const userId = jwt_decode(token)?.id;
                    if (userId) {
                        const busket = await fetchBusketByUserId(userId);
                        // Используем опциональную цепочку ?. на случай, если busket === null
                        const currentItems = busket?.itemsJsonb || [];
                        
                        const itemsForLocalStorage = currentItems.map(i => ({
                            id: i.itemId || i.id,
                            count: i.count || 1
                        }));
                        localStorage.setItem('basket', JSON.stringify(itemsForLocalStorage));
                        isFound = currentItems.some(i => String(i.itemId || i.id) === String(item.id));
                    }
                } catch (jwtErr) {
                    console.error("Ошибка декодирования токена:", jwtErr);
                }
            } else {
                const savedBasket = localStorage.getItem('basket');
                if (savedBasket) {
                    const parsedBasket = JSON.parse(savedBasket);
                    if (Array.isArray(parsedBasket)) {
                        isFound = parsedBasket.some(i => String(i.itemId || i.id) === String(item.id));
                    }
                }
            }
            setIsInCart(isFound);
        } catch (e) {
            console.error("Ошибка проверки корзины:", e);
        }
    };

    useEffect(() => {
        checkItemInCart();

        const handleCartUpdate = () => checkItemInCart();
        window.addEventListener('cartUpdated', handleCartUpdate);
        return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }, [item?.id]);

    const addToCart = async (count = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (token && token !== 'undefined' && token !== 'null') {
                try {
                    const userId = jwt_decode(token)?.id;
                    if (userId) {
                        const busket = await fetchBusketByUserId(userId);
                        // Проверяем, что busket существует и у него есть id
                        if (busket && busket.id) {
                            const currentItems = busket.itemsJsonb ? [...busket.itemsJsonb] : [];
                            if (!currentItems.some(i => String(i.itemId || i.id) === String(item.id))) {
                                currentItems.push({ itemId: parseInt(item.id), count });
                                await updateBusket(busket.id, { itemsJsonb: currentItems });
                            }
                        }
                    }
                } catch (jwtErr) {
                    console.error("Ошибка декодирования токена при добавлении:", jwtErr);
                }
            }
            
            // Локальная корзина (localStorage)
            let localBasket = [];
            try {
                localBasket = JSON.parse(localStorage.getItem('basket') || '[]');
                if (!Array.isArray(localBasket)) localBasket = [];
            } catch (e) {
                localBasket = [];
            }

            if (!localBasket.some(i => String(i.itemId || i.id) === String(item.id))) {
                localBasket.push({ itemId: item.id, id: item.id, count: 1 });
                localStorage.setItem('basket', JSON.stringify(localBasket));
            }

            window.dispatchEvent(new Event('cartUpdated'));
            setIsInCart(true);
            return true;
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Ошибка при добавлении');
            return false;
        }
    };

    const handleAddToCart = (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (isInCart) history.push(BUSKET_ROUTE);
        else addToCart(1);
    };

    const handleBuyNow = async (e) => {
        if (e && e.preventDefault) {
            e.preventDefault();
            e.stopPropagation();
        }
        if (!isInCart) await addToCart(1);
        history.push(BUSKET_ROUTE);
    };

    return children({
        isInCart,
        handleAddToCart,
        handleBuyNow
    });
};

export default AddToCartButton;