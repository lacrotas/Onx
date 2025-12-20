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

const BASKET_LOCAL_STORAGE_KEY = 'basket';

const BusketPage = () => {
    const { userId } = useParams();
    const isAuth = !!localStorage.getItem('token');
    const [basket, setBasket] = useState(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [localQuantities, setLocalQuantities] = useState({});

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [itemsToLoad, setItemsToLoad] = useState();

    const saveBasketToLocalStorage = (itemsList) => {
        const basketData = itemsList.map(item => ({
            itemId: item.id,
            count: item.count
        }));
        localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(basketData));
    };

    const loadBasketFromLocalStorage = () => {
        const saved = localStorage.getItem(BASKET_LOCAL_STORAGE_KEY) || [];
        localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, saved);
        return saved ? JSON.parse(saved) : [];
    };

    const updateQuantityInLocalStorage = (itemId, newCount) => {
        const current = loadBasketFromLocalStorage();
        if (newCount < 1) {
            const updated = current.filter(item => item.id !== itemId);
            localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        } else {
            const existingIndex = current.findIndex(item => item.id === itemId);
            if (existingIndex >= 0) {
                current[existingIndex].count = newCount;
            } else {
                current.push({ itemId: itemId, count: newCount });
            }
            localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(current));
            return current;
        }
    };

    const loadBasket = async () => {
        try {
            setLoading(true);
            let basketItems = [];

            if (isAuth && userId) {
                const basketData = await fetchBusketByUserId(userId);
                setBasket(basketData);
                basketItems = basketData?.itemsJsonb || [];
                localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(basketItems));
            } else {
                basketItems = loadBasketFromLocalStorage();
                setBasket(null);
            }

            if (basketItems.length > 0) {
                const itemsPromises = basketItems.map(async (item) => {
                    try {
                        const itemData = await fetchItemId(item.itemId);
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

                // Для неавторизованного — синхронизируем начальное состояние
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
        loadBasket();
    }, [userId]);

    // Обновление количества
    const handleQuantityChange = async (itemId, newCount) => {
        if (newCount < 1) return;

        setLocalQuantities(prev => ({ ...prev, [itemId]: newCount }));

        if (isAuth && basket) {
            // Обновляем на сервере
            const updatedItems = items.map(item =>
                item.id === itemId ? { ...item, count: newCount } : item
            );
            setItems(updatedItems);
            const busketItems = updatedItems.map(item => ({ itemId: item.id, count: item.count }));
            await updateBusket(basket.id, { itemId: basket.id, itemsJsonb: busketItems });
        } else {
            // Обновляем в localStorage
            updateQuantityInLocalStorage(itemId, newCount);
            const updatedItems = items.map(item =>
                item.id === itemId ? { ...item, count: newCount } : item
            );
            setItems(updatedItems);
        }
    };

    // Удаление товара
    const handleRemoveItem = async (itemId) => {
        if (!window.confirm('Вы действительно хотите удалить этот товар из корзины?')) {
            return;
        }

        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        setLocalQuantities(prev => {
            const newQuantities = { ...prev };
            delete newQuantities[itemId];
            return newQuantities;
        });

        if (isAuth && basket) {
            const busketItems = updatedItems.map(item => ({ itemId: item.id, count: item.count }));
            await updateBusket(basket.id, { itemId: basket.id, itemsJsonb: busketItems });
        } else {
            updateQuantityInLocalStorage(itemId, 0); // удалит из localStorage
        }
    };


    // Оформление заказа
    const handleCheckout = async () => {
        const itemsOrderInfo = items.map(item => ({
            id: item.id,
            name: item.name,
            images: item.images[0],
            count: item.count,
            price: item.price
        }));
        setItemsToLoad({ items: itemsOrderInfo, totalValue: calculateTotal(), totalCounter: calculateTotalItems(), userId: userId, basketId: basket.id })
        setIsModalOpen(true)
        // if (items.length === 0) {
        //     alert('Корзина пуста');
        //     return;
        // }

        // try {
        //     if (isAuth && basket) {
        //         // updateBusket(basket.id, { id: basket.id, itemsJsonb: [] });
        //         // localStorage.removeItem(BASKET_LOCAL_STORAGE_KEY);
        //         alert('Заказ оформлен успешно!');
        //     } else {
        //         // Неавторизованный: предложить войти или продолжить как гость
        //         localStorage.removeItem(BASKET_LOCAL_STORAGE_KEY);
        //         return;
        //     }

        //     // Очистка после заказа
        //     setItems([]);
        //     setLocalQuantities({});
        //     if (!isAuth) {
        //         localStorage.removeItem(BASKET_LOCAL_STORAGE_KEY);
        //     }
        // } catch (err) {
        //     console.error('Ошибка оформления заказа:', err);
        //     alert('Ошибка при оформлении заказа. Попробуйте еще раз.');
        // }
    };

    // Расчёты (без изменений)
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
                                                {/* <div className="item-price">
                                                    {item.price} ₽
                                                </div> */}

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
                                                onClick={() => handleRemoveItem(item.id)}
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