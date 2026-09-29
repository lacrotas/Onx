import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { fetchBusketByUserId, updateBusket, updateBusketByUserId } from '../../../http/busketApi';
import { fetchItemId } from '../../../http/itemApi';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import './BusketPage.scss';
import { NavLink } from 'react-router-dom';
import { FiTrash2, FiInfo } from 'react-icons/fi';
import ModalWindow from '../../../components/modalWindow/ModalWindow';
import CustomAlert from '../../../components/customAlert/CustomAlert';
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import { LOGIN_ROUTE } from '../../appRouter/Const';

const BASKET_LOCAL_STORAGE_KEY = 'basket';

const BusketPage = () => {
    const { userId } = useParams();
    const token = localStorage.getItem('token');
    const isAuth = !!(token && token !== 'undefined' && token !== 'null');
    
    const getResolvedUserId = () => {
        if (userId) return userId;
        if (isAuth) {
            try {
                return jwt_decode(token)?.id || null;
            } catch (e) {
                return null;
            }
        }
        return null;
    };

    const resolvedUserId = getResolvedUserId();
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
            itemId: item.id || item.itemId,
            id: item.id || item.itemId,
            count: item.count || 1
        }));
        localStorage.setItem(BASKET_LOCAL_STORAGE_KEY, JSON.stringify(basketData));
    };

    const loadBasketFromLocalStorage = () => {
        const saved = localStorage.getItem(BASKET_LOCAL_STORAGE_KEY);
        if (!saved) {
            return [];
        }
        try {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Ошибка парсинга корзины из localStorage:", e);
            return [];
        }
    };

    const updateQuantityInLocalStorage = (itemId, newCount) => {
        const current = loadBasketFromLocalStorage();
        let updated;

        if (newCount < 1) {
            updated = current.filter(item => String(item.itemId || item.id) !== String(itemId));
        } else {
            const existingIndex = current.findIndex(item => String(item.itemId || item.id) === String(itemId));
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
            const localItems = loadBasketFromLocalStorage();

            if (isAuth && resolvedUserId) {
                let basketData = null;
                try {
                    basketData = await fetchBusketByUserId(resolvedUserId);
                } catch (e) {
                    console.warn("Не удалось получить серверную корзину:", e);
                }
                setBasket(basketData);
                const serverItems = basketData?.itemsJsonb || [];

                // Слияние локальной корзины и серверной (не теряем товары)
                const mergedMap = new Map();
                serverItems.forEach(item => {
                    const id = item.itemId || item.id;
                    if (id) {
                        mergedMap.set(String(id), {
                            itemId: id,
                            id: id,
                            count: item.count || 1
                        });
                    }
                });
                localItems.forEach(item => {
                    const id = item.itemId || item.id;
                    if (id) {
                        if (mergedMap.has(String(id))) {
                            const existing = mergedMap.get(String(id));
                            mergedMap.set(String(id), {
                                ...existing,
                                count: Math.max(existing.count, item.count || 1)
                            });
                        } else {
                            mergedMap.set(String(id), {
                                itemId: id,
                                id: id,
                                count: item.count || 1
                            });
                        }
                    }
                });

                basketItems = Array.from(mergedMap.values());
                saveBasketToLocalStorage(basketItems);

                // Синхронизируем обратно на сервер в фоне
                try {
                    await updateBusketByUserId(resolvedUserId, { itemsJsonb: basketItems });
                } catch (syncErr) {
                    console.warn("Фоновое сохранение корзины на сервер:", syncErr);
                }
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                basketItems = localItems;
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
                            count: item.count || 1,
                        };
                    } catch (err) {
                        console.error(`Ошибка загрузки товара ${item.itemId || item.id}:`, err);
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
                saveBasketToLocalStorage(validItems);
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
    }, [resolvedUserId]);

    // --- ОБНОВЛЕНИЕ КОЛИЧЕСТВА ---
    const handleQuantityChange = async (itemId, newCount) => {
        if (newCount < 1) return;

        setLocalQuantities(prev => ({ ...prev, [itemId]: newCount }));

        const updatedItems = items.map(item =>
            item.id === itemId ? { ...item, count: newCount } : item
        );
        setItems(updatedItems);
        saveBasketToLocalStorage(updatedItems);

        if (isAuth && resolvedUserId) {
            const busketItems = updatedItems.map(item => ({
                itemId: item.id,
                id: item.id,
                count: item.count
            }));
            updateBusketByUserId(resolvedUserId, { itemsJsonb: busketItems }).catch(err => {
                console.warn("Ошибка обновления корзины на сервере:", err);
            });
        }

        window.dispatchEvent(new Event('cartUpdated'));
    };

    // --- УДАЛЕНИЕ ТОВАРА ---
    const handleRemoveItem = async (itemId) => {
        const updatedItems = items.filter(item => item.id !== itemId);
        setItems(updatedItems);
        setLocalQuantities(prev => {
            const newQuantities = { ...prev };
            delete newQuantities[itemId];
            return newQuantities;
        });

        saveBasketToLocalStorage(updatedItems);

        if (isAuth && resolvedUserId) {
            const busketItems = updatedItems.map(item => ({
                itemId: item.id,
                id: item.id,
                count: item.count
            }));
            updateBusketByUserId(resolvedUserId, { itemsJsonb: busketItems }).catch(err => {
                console.warn("Ошибка удаления товара из корзины на сервере:", err);
            });
        }

        window.dispatchEvent(new Event('cartUpdated'));
    };

    // Расчёты
    const calculateTotal = () => {
        return items.reduce((total, item) => {
            const price = parseFloat(item.price) || 0;
            const quantity = localQuantities[item.id] || item.count || 1;
            return total + (price * quantity);
        }, 0);
    };

    const calculateTotalItems = () => {
        return items.reduce((total, item) => {
            const quantity = localQuantities[item.id] || item.count || 1;
            return total + quantity;
        }, 0);
    };

    // Оформление заказа
    const handleCheckout = async () => {
        const itemsOrderInfo = items.map(item => ({
            id: item.id,
            itemId: item.id,
            alias: item.alias || item.id,
            name: item.name,
            images: item.images && item.images.length > 0 ? item.images[0] : '',
            count: localQuantities[item.id] || item.count || 1,
            price: item.price
        }));

        setItemsToLoad({
            items: itemsOrderInfo,
            totalValue: calculateTotal(),
            totalCounter: calculateTotalItems(),
            userId: resolvedUserId || null,
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
                    <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: "Корзина" }]} />

                    <div className="basket-header-row">
                        <h1 className="page-title">Корзина</h1>
                        {items.length > 0 && (
                            <span className="basket-count-badge">
                                {calculateTotalItems()} {calculateTotalItems() === 1 ? 'товар' : calculateTotalItems() < 5 ? 'товара' : 'товаров'}
                            </span>
                        )}
                    </div>

                    {items.length === 0 ? (
                        <div className="empty-basket">
                            <p>Ваша корзина пуста</p>
                            <NavLink to="/" className="continue-shopping">
                                Продолжить покупки
                            </NavLink>
                        </div>
                    ) : (
                        <>
                            {!isAuth && (
                                <div className="guest-tracker-banner">
                                    <div className="banner-icon-wrapper">
                                        <FiInfo className="banner-icon" />
                                    </div>
                                    <div className="banner-content">
                                        <span className="banner-title">Хотите отслеживать статус заказа?</span>
                                        <span className="banner-desc">
                                            Чтобы отслеживать статус заказа и сохранять историю покупок в личном кабинете,{' '}
                                            <NavLink to={{ pathname: LOGIN_ROUTE, search: '?mode=register' }} className="banner-link">зарегистрируйтесь</NavLink> или{' '}
                                            <NavLink to={{ pathname: LOGIN_ROUTE, search: '?mode=login' }} className="banner-link">войдите</NavLink> у нас на сайте.
                                        </span>
                                    </div>
                                    <NavLink to={{ pathname: LOGIN_ROUTE, search: '?mode=register' }} className="banner-action-btn">
                                        Зарегистрироваться
                                    </NavLink>
                                </div>
                            )}

                            <div className="basket-content">
                                <div className="basket-items">
                                    {items.map(item => {
                                        const currentQuantity = localQuantities[item.id] || item.count || 1;
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
                                                    <h3 className="item-name">{item.name}</h3>
                                                    <div className="item-price-unit">{item.price} BYN за шт.</div>
                                                    <div className='item-info_prise-container'>
                                                        <div className="item-total">
                                                            {totalPrice} BYN
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
                                        <div className="summary-title">Сумма заказа</div>
                                        <div className="summary-row">
                                            <span>Товаров ({calculateTotalItems()} шт.):</span>
                                            <span>{calculateTotal().toFixed(2)} BYN</span>
                                        </div>
                                        <div className="summary-row">
                                            <span>Доставка:</span>
                                            <span>Самовывоз</span>
                                        </div>
                                        <div className="summary-row total-row">
                                            <span>Итого к оплате:</span>
                                            <span className="total-price">{calculateTotal().toFixed(2)} BYN</span>
                                        </div>
                                    </div>

                                    <div className="basket-actions">
                                        <button
                                            className="checkout-btn"
                                            onClick={handleCheckout}
                                        >
                                            Оформить заказ
                                        </button>

                                        {!isAuth && (
                                            <div className="guest-summary-notice">
                                                <FiInfo className="notice-icon" />
                                                <span>
                                                    Чтобы отслеживать статус заказа,{' '}
                                                    <NavLink to={{ pathname: LOGIN_ROUTE, search: '?mode=register' }} className="notice-link">зарегистрируйтесь</NavLink> на сайте.
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default BusketPage;