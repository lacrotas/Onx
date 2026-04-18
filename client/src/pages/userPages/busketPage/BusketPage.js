import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchBusketByUserId, updateBusket } from '../../../http/busketApi';
import { fetchItemId } from '../../../http/itemApi';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import './BusketPage.scss';
import { NavLink } from 'react-router-dom';
import { FiTrash2 } from 'react-icons/fi';
import ModalWindow from '../../../components/modalWindow/ModalWindow';
import CustomAlert from '../../../components/customAlert/CustomAlert';

const BASKET_LOCAL_STORAGE_KEY = 'basket';

const BusketPage = () => {
    const { userId } = useParams();
    const isAuth = !!localStorage.getItem('token');
    const [basket, setBasket] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localQuantities, setLocalQuantities] = useState({});
    const [alertState, setAlertState] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemsToLoad, setItemsToLoad] = useState();

    // Вспомогательная функция для сохранения полного списка товаров в LS
    const saveBasketToLocalStorage = (itemsList) => {
        const basketData = itemsList.map(item => ({
            itemId: item.id, // Сохраняем ID
            id: item.id,     // Дублируем для надежности (для разных версий кода)
            count: item.count
        }));
        localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(basketData));
    };

    const loadBasketFromLocalStorage = () => {
        const saved = localStorage.getItem(BASKET_LOCAL_STORAGE_KEY);
        if (!saved) {
            return [];
        }
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error("Ошибка парсинга корзины из localStorage:", e);
            return [];
        }
    };

    const updateQuantityInLocalStorage = (itemId, newCount) => {
        const current = loadBasketFromLocalStorage();
        let updated;

        if (newCount < 1) {
            // Удаление
            updated = current.filter(item => String(item.itemId) !== String(itemId) && String(item.id) !== String(itemId));
        } else {
            // Обновление
            const existingIndex = current.findIndex(item => (String(item.itemId) === String(itemId)) || (String(item.id) === String(itemId)));
            if (existingIndex >= 0) {
                current[existingIndex].count = newCount;
                updated = current;
            } else {
                current.push({ itemId: itemId, id: itemId, count: newCount });
                updated = current;
            }
        }

        localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(updated));
        return updated;
    };

    const loadBasket = async () => {
        try {
            setLoading(true);
            let basketItems = [];

            if (isAuth && userId) {
                const basketData = await fetchBusketByUserId(userId);
                setBasket(basketData);
                basketItems = basketData?.itemsJsonb || [];

                // Синхронизируем серверную корзину с локальной при загрузке
                // Это важно, чтобы Header сразу показал правильное число
                const itemsForLS = basketItems.map(i => ({
                    itemId: i.itemId || i.id,
                    id: i.itemId || i.id,
                    count: i.count
                }));
                localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(itemsForLS));
                window.dispatchEvent(new Event('cartUpdated')); // Обновляем хедер при загрузке страницы
            } else {
                basketItems = loadBasketFromLocalStorage();
                setBasket(null);
            }

            if (basketItems && basketItems.length > 0) {
                const itemsPromises = basketItems.map(async (item) => {
                    try {
                        const idToFetch = item.itemId || item.id;
                        if (!idToFetch) return null;

                        const itemData = await fetchItemId(idToFetch);
                        return {
                            ...itemData,
                            count: item.count,
                        };
                    } catch (err) {
                        console.error(`Ошибка загрузки товара ${item.itemId}:`, err);
                        return null;
                    }
                });

                const loadedItems = await Promise.all(itemsPromises);
                const validItems = loadedItems.filter(item => item !== null);
                setItems(validItems);

                const initialQuantities = {};
                validItems.forEach(item => {
                    initialQuantities[item.id] = item.count;
                });
                setLocalQuantities(initialQuantities);

                if (!isAuth) {
                    saveBasketToLocalStorage(validItems);
                }
            } else {
                setItems([]);
                setLocalQuantities({});
            }
        } catch (err) {
            console.error('Ошибка загрузки корзины:', err);
            setError('Ошибка загрузки корзины');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        loadBasket();
        // eslint-disable-next-line
    }, [userId]);

    // --- ОБНОВЛЕНИЕ КОЛИЧЕСТВА ---
    const handleQuantityChange = async (itemId, newCount) => {
        if (newCount < 1) return;

        setLocalQuantities(prev => ({ ...prev, [itemId]: newCount }));

        // Обновляем стейт items, чтобы интерфейс был реактивным
        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, count: newCount } : item
        );
        setItems(updatedItems);

        if (isAuth && basket) {
            // 1. Обновляем на сервере
            const busketItems = updatedItems.map(item => ({ itemId: item.id, count: item.count }));
            await updateBusket(basket.id, { itemId: basket.id, itemsJsonb: busketItems });

            // 2. ВАЖНО: Обновляем localStorage, чтобы Header был в курсе (даже если мы авторизованы)
            saveBasketToLocalStorage(updatedItems);
        } else {
            // Обновляем в localStorage (гость)
            updateQuantityInLocalStorage(itemId, newCount);
        }

        // 3. Сообщаем хедеру об изменениях
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // --- УДАЛЕНИЕ ТОВАРА ---
    const handleRemoveItem = async (itemId) => {

        // 1. Сначала обновляем UI
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        setLocalQuantities(prev => {
            const newQuantities = { ...prev };
            delete newQuantities[itemId];
            return newQuantities;
        });

        if (isAuth && basket) {
            // 2. Обновляем сервер
            const busketItems = updatedItems.map(item => ({ itemId: item.id, count: item.count }));
            await updateBusket(basket.id, { itemId: basket.id, itemsJsonb: busketItems });

            // 3. ВАЖНО: Синхронизируем localStorage для авторизованного юзера
            saveBasketToLocalStorage(updatedItems);
        } else {
            // 2. Обновляем localStorage для гостя
            updateQuantityInLocalStorage(itemId, 0);
        }

        // 4. ГЛАВНОЕ: Отправляем событие для Header
        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Расчёты
    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = localQuantities[item.id] || item.count;
            return total + (price * quantity);
        }, 0);
    };

    const calculateTotalItems = () => {
        return items.reduce((total, item) => {
            const quantity = localQuantities[item.id] || item.count;
            return total + quantity;
        }, 0);
    };

    // Оформление заказа
    const handleCheckout = async () => {
        const itemsOrderInfo = items.map(item => ({
            id: item.id,
            name: item.name,
            images: item.images[0],
            count: localQuantities[item.id] || item.count,
            price: item.price
        }));

        setItemsToLoad({
            items: itemsOrderInfo,
            totalValue: calculateTotal(),
            totalCounter: calculateTotalItems(),
            userId: userId,
            basketId: basket ? basket.id : null
        });
        setIsModalOpen(true);
    };

    if (loading) {
        return (
            <>
                <Header isAdminHeader={false} />
                <div className="basket-page loading">Загрузка корзины...</div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header isAdminHeader={false} />
                <div className="basket-page error">{error}</div>
                <Footer />
            </>
        );
    }

    return (
        <>
            {isModalOpen && <ModalWindow type="order" setIsModalActive={setIsModalOpen} itemsArr={itemsToLoad} />}
            <Header isAdminHeader={false} />
            {alertState && <CustomAlert setIsModalActive={setAlertState} text={"Вы действительно хотите удалить этот товар из корзины?"} onConfirm={() => handleRemoveItem(alertState)} />}
            <div className="basket-page">
                <div className="container">
                    <h1 className="page-title my_h1">Мои заказы</h1>

                    {items.length === 0 ? (
                        <div className="empty-basket">
                            <p>Ваша корзина пуста</p>
                            <NavLink to="/" className="continue-shopping">
                                Продолжить покупки
                            </NavLink>
                        </div>
                    ) : (
                        <div className="basket-content">
                            <div className="basket-items">
                                {items.map(item => {
                                    const currentQuantity = localQuantities[item.id] || item.count;
                                    const totalPrice = (parseFloat(item.price) * currentQuantity).toFixed(2);

                                    return (
                                        <div key={item.id} className="basket-item">
                                            <div className="item-image">
                                                {item.images && item.images.length > 0 ? (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`}
                                                        alt={item.name}
                                                        onError={(e) => {
                                                            e.target.src = '/placeholder-image.jpg';
                                                        }}
                                                    />
                                                ) : (
                                                    <div className="no-image">Нет изображения</div>
                                                )}
                                            </div>
                                            <div className="item-info">
                                                <h3 className="item-name my_h3">{item.name}</h3>
                                                <div className='item-info_prise-container'>
                                                    <div className="item-total my_h3">
                                                        {totalPrice} р.
                                                    </div>
                                                    <div className="item-quantity-control">
                                                        <div className="quantity-selector">
                                                            <button
                                                                className="quantity-btn"
                                                                onClick={() => handleQuantityChange(item.id, currentQuantity - 1)}
                                                                disabled={currentQuantity <= 1}
                                                            >
                                                                -
                                                            </button>
                                                            <span className="quantity-value">{currentQuantity}</span>
                                                            <button
                                                                className="quantity-btn"
                                                                onClick={() => handleQuantityChange(item.id, currentQuantity + 1)}
                                                            >
                                                                +
                                                            </button>
                                                        </div>
                                                    </div>

                                                </div>
                                            </div>
                                            <button
                                                className="remove-item-icon"
                                                onClick={() => setAlertState(item.id)}
                                                title="Удалить товар"
                                            >
                                                <FiTrash2 size={18} />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="basket-summary-fixed">
                                <div className="summary-info">
                                    <div className="summary-row">
                                        <span className='my_p'>Товаров:</span>
                                        <span className='my_h3'>{calculateTotalItems()} шт.</span>
                                    </div>
                                    <div className="summary-row total-row">
                                        <span className='my_p'>Итого:</span>
                                        <span className="total-price my_h3">{calculateTotal().toFixed(2)} ₽</span>
                                    </div>
                                </div>

                                <div className="basket-actions">
                                    <button
                                        className="checkout-btn my_p"
                                        onClick={handleCheckout}
                                    >
                                        Оформить заказ
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BusketPage;