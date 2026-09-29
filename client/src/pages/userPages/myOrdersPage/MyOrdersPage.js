import React, { useState, useEffect } from 'react';
import { useHistory, NavLink } from 'react-router-dom';
import { FiPackage, FiShoppingBag, FiTruck, FiClock, FiCheckCircle, FiXCircle, FiCalendar, FiMapPin, FiCreditCard } from 'react-icons/fi';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import { fetchMyOrders } from '../../../http/orderApi';
import { LOGIN_ROUTE, MAIN_ROUTE } from '../../appRouter/Const';
import './MyOrdersPage.scss';

const MyOrdersPage = () => {
    const history = useHistory();
    const token = localStorage.getItem('token');
    const isAuth = !!(token && token !== 'undefined' && token !== 'null');

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (!isAuth) {
            setLoading(false);
            return;
        }

        const loadOrders = async () => {
            try {
                setLoading(true);
                const data = await fetchMyOrders();
                setOrders(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Ошибка загрузки заказов:", err);
                setError("Не удалось загрузить историю заказов");
            } finally {
                setLoading(false);
            }
        };

        loadOrders();
    }, [isAuth]);

    const breadcrumbsItems = [
        { title: 'Главная', path: MAIN_ROUTE },
        { title: 'Мои заказы' }
    ];

    const getStatusInfo = (stage) => {
        const raw = (stage || '').trim();
        const normalized = raw.toLowerCase();

        switch (normalized) {
            case 'start':
            case 'new':
                return {
                    label: 'Новый',
                    className: 'status-new',
                    icon: <FiClock />
                };
            case 'inprocess':
            case 'in_process':
            case 'processing':
                return {
                    label: 'В обработке',
                    className: 'status-processing',
                    icon: <FiClock />
                };
            case 'accepted':
            case 'confirmed':
                return {
                    label: 'Подтвержден',
                    className: 'status-confirmed',
                    icon: <FiCheckCircle />
                };
            case 'delivery':
            case 'delivering':
                return {
                    label: 'В доставке',
                    className: 'status-delivery',
                    icon: <FiTruck />
                };
            case 'finished':
            case 'done':
            case 'completed':
            case 'success':
                return {
                    label: 'Завершен',
                    className: 'status-completed',
                    icon: <FiCheckCircle />
                };
            case 'canceled':
            case 'cancelled':
            case 'rejected':
                return {
                    label: 'Отменен',
                    className: 'status-cancelled',
                    icon: <FiXCircle />
                };
            default:
                return {
                    label: raw || 'Новый',
                    className: 'status-default',
                    icon: <FiClock />
                };
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    };

    const parseItems = (itemsJsonb) => {
        if (!itemsJsonb) return [];
        if (Array.isArray(itemsJsonb)) return itemsJsonb;
        try {
            const parsed = JSON.parse(itemsJsonb);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            return [];
        }
    };

    return (
        <div className="my-orders-page-wrapper">
            <Header isAdminHeader={false} />

            <main className="orders-main-container">
                <Breadcrumbs items={breadcrumbsItems} />

                <div className="orders-header-section">
                    <h1 className="orders-title">Мои заказы</h1>
                    {isAuth && !loading && orders.length > 0 && (
                        <span className="orders-count-badge">
                            {orders.length} {orders.length === 1 ? 'заказ' : orders.length < 5 ? 'заказа' : 'заказов'}
                        </span>
                    )}
                </div>

                {!isAuth ? (
                    <div className="orders-auth-prompt-card">
                        <div className="prompt-icon-circle">
                            <FiPackage className="prompt-icon" />
                        </div>
                        <h2>Авторизуйтесь для просмотра заказов</h2>
                        <p>
                            Войдите в свой аккаунт ONX, чтобы отслеживать статус текущих покупок и просматривать историю всех оформленных заказов.
                        </p>
                        <button
                            className="auth-prompt-btn"
                            onClick={() => history.push(LOGIN_ROUTE)}
                        >
                            Войти в аккаунт
                        </button>
                    </div>
                ) : loading ? (
                    <div className="orders-loading-state">
                        <div className="loading-spinner"></div>
                        <p>Загрузка ваших заказов...</p>
                    </div>
                ) : error ? (
                    <div className="orders-error-state">
                        <FiXCircle className="error-icon" />
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Повторить
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="orders-empty-state">
                        <div className="empty-icon-circle">
                            <FiShoppingBag className="empty-icon" />
                        </div>
                        <h2>У вас пока нет заказов</h2>
                        <p>Вы пока не совершили ни одной покупки в нашем магазине. Самое время выбрать что-то интересное!</p>
                        <NavLink to={MAIN_ROUTE} className="empty-action-btn">
                            Перейти к покупкам
                        </NavLink>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => {
                            const status = getStatusInfo(order.orderStage);
                            const itemsList = parseItems(order.itemsJsonb);

                            return (
                                <div key={order.id} className="order-card-apple">
                                    <div className="order-card-header">
                                        <div className="order-main-meta">
                                            <div className="order-number-title">
                                                Заказ #{order.id}
                                            </div>
                                            <div className="order-date">
                                                <FiCalendar className="meta-icon" />
                                                <span>{formatDate(order.createdAt)}</span>
                                            </div>
                                        </div>

                                        <div className={`order-status-pill ${status.className}`}>
                                            {status.icon}
                                            <span>{status.label}</span>
                                        </div>
                                    </div>

                                    {/* Список товаров в заказе */}
                                    <div className="order-items-table">
                                        {itemsList.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <div className="order-item-image">
                                                    {item.images ? (
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL}static/images/${item.images}`}
                                                            alt={item.name}
                                                            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                                                        />
                                                    ) : (
                                                        <div className="placeholder-box">ONX</div>
                                                    )}
                                                </div>

                                                <div className="order-item-info">
                                                    {(item.alias || item.id || item.itemId) ? (
                                                        <NavLink 
                                                            to={`/itemPreview/${encodeURIComponent(item.alias || item.id || item.itemId)}`} 
                                                            className="order-item-name"
                                                            style={{ textDecoration: 'none' }}
                                                        >
                                                            {item.name}
                                                        </NavLink>
                                                    ) : (
                                                        <span className="order-item-name">{item.name}</span>
                                                    )}
                                                    <span className="order-item-price-unit">
                                                        {item.price} BYN × {item.count || item.quantity || 1} шт
                                                    </span>
                                                </div>

                                                <div className="order-item-subtotal">
                                                    {(Number(item.price || 0) * (item.count || item.quantity || 1)).toLocaleString()} BYN
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Данные доставки и итоговая сумма */}
                                    <div className="order-card-footer">
                                        <div className="order-delivery-meta">
                                            {order.adress && (
                                                <div className="meta-item">
                                                    <FiMapPin className="item-icon" />
                                                    <span>{order.adress}</span>
                                                </div>
                                            )}
                                            {order.payment && (
                                                <div className="meta-item">
                                                    <FiCreditCard className="item-icon" />
                                                    <span>Оплата: {order.payment}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="order-total-block">
                                            <span className="total-label">Сумма заказа:</span>
                                            <span className="total-amount">{Number(order.price || 0).toLocaleString()} BYN</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default MyOrdersPage;
