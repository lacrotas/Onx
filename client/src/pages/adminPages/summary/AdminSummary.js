import React, { useState, useEffect } from 'react';
import {
    FiPackage,
    FiShoppingBag,
    FiMessageSquare,
    FiLayers,
    FiPlus,
    FiArrowRight,
    FiTrendingUp
} from 'react-icons/fi';
import { fetchAllItem } from '../../../http/itemApi';
import { fetchAllKategory } from '../../../http/KategoryApi';
import { fetchAllOrders } from '../../../http/orderApi';
import { fetchAllReview } from '../../../http/reviewApi';
import { AdminBadge } from '../shared/components/AdminBadge';
import './AdminSummary.scss';

const STAGE_LABELS = {
    start: { label: 'Новый', variant: 'warning' },
    inProcess: { label: 'В обработке', variant: 'info' },
    finished: { label: 'Завершен', variant: 'success' },
    canceled: { label: 'Отменен', variant: 'danger' }
};

export default function AdminSummary({ onNavigate }) {
    const [stats, setStats] = useState({
        itemsCount: 0,
        categoriesCount: 0,
        ordersCount: 0,
        reviewsCount: 0,
        recentOrders: [],
        averageRating: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        setIsLoading(true);
        try {
            const [items, categories, orders, reviews] = await Promise.all([
                fetchAllItem().catch(() => []),
                fetchAllKategory().catch(() => []),
                fetchAllOrders().catch(() => []),
                fetchAllReview().catch(() => [])
            ]);

            const safeItems = Array.isArray(items) ? items : [];
            const safeCategories = Array.isArray(categories) ? categories : [];
            const safeOrders = Array.isArray(orders) ? orders : [];
            const safeReviews = Array.isArray(reviews) ? reviews : [];

            // Подсчет среднего рейтинга
            let avgRating = 0;
            if (safeReviews.length > 0) {
                const totalRating = safeReviews.reduce((acc, r) => acc + (parseFloat(r.mark) || 0), 0);
                avgRating = (totalRating / safeReviews.length).toFixed(1);
            }

            setStats({
                itemsCount: safeItems.length,
                categoriesCount: safeCategories.length,
                ordersCount: safeOrders.length,
                reviewsCount: safeReviews.length,
                recentOrders: safeOrders.slice(-5).reverse(),
                averageRating: avgRating
            });
        } catch (error) {
            console.error('Ошибка загрузки сводки:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-summary-page">
            {/* Hero / Welcome */}
            <div className="summary-hero">
                <div className="hero-text">
                    <h1 className="hero-title">Сводка магазина ONX</h1>
                    <p className="hero-subtitle">
                        Обзор ключевых показателей, каталога товаров и последних заказов
                    </p>
                </div>
                <div className="hero-quick-actions">
                    <button 
                        type="button" 
                        className="btn-quick-add"
                        onClick={() => onNavigate('products')}
                    >
                        <FiPlus />
                        <span>Добавить товар</span>
                    </button>
                    <button 
                        type="button" 
                        className="btn-quick-outline"
                        onClick={() => onNavigate('orders')}
                    >
                        <FiShoppingBag />
                        <span>Заказы</span>
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="metrics-grid">
                <div className="metric-card card-purple" onClick={() => onNavigate('products')}>
                    <div className="metric-header">
                        <span className="metric-label">Товаров в каталоге</span>
                        <div className="metric-icon-box">
                            <FiPackage />
                        </div>
                    </div>
                    <div className="metric-value">
                        {isLoading ? '...' : stats.itemsCount}
                    </div>
                    <div className="metric-footer">
                        <span className="metric-hint">В {stats.categoriesCount} категориях</span>
                        <span className="metric-link">Управление <FiArrowRight /></span>
                    </div>
                </div>

                <div className="metric-card card-blue" onClick={() => onNavigate('orders')}>
                    <div className="metric-header">
                        <span className="metric-label">Всего заказов</span>
                        <div className="metric-icon-box">
                            <FiShoppingBag />
                        </div>
                    </div>
                    <div className="metric-value">
                        {isLoading ? '...' : stats.ordersCount}
                    </div>
                    <div className="metric-footer">
                        <span className="metric-hint">Оформленных клиентами</span>
                        <span className="metric-link">Смотреть заказы <FiArrowRight /></span>
                    </div>
                </div>

                <div className="metric-card card-emerald" onClick={() => onNavigate('reviews')}>
                    <div className="metric-header">
                        <span className="metric-label">Отзывы клиентов</span>
                        <div className="metric-icon-box">
                            <FiMessageSquare />
                        </div>
                    </div>
                    <div className="metric-value">
                        {isLoading ? '...' : stats.reviewsCount}
                    </div>
                    <div className="metric-footer">
                        <span className="metric-hint">Рейтинг: ⭐ {stats.averageRating || '—'} / 5</span>
                        <span className="metric-link">Модерация <FiArrowRight /></span>
                    </div>
                </div>

                <div className="metric-card card-amber" onClick={() => onNavigate('categories')}>
                    <div className="metric-header">
                        <span className="metric-label">Категории и разделы</span>
                        <div className="metric-icon-box">
                            <FiLayers />
                        </div>
                    </div>
                    <div className="metric-value">
                        {isLoading ? '...' : stats.categoriesCount}
                    </div>
                    <div className="metric-footer">
                        <span className="metric-hint">Иерархия каталога</span>
                        <span className="metric-link">Настроить <FiArrowRight /></span>
                    </div>
                </div>
            </div>

            {/* Recent Orders Section */}
            <div className="summary-section">
                <div className="section-header">
                    <div className="section-title-group">
                        <h2 className="section-title">Недавние заказы</h2>
                        <span className="section-desc">Последние поступившие заказы клиентов</span>
                    </div>
                    <button 
                        type="button" 
                        className="btn-view-all"
                        onClick={() => onNavigate('orders')}
                    >
                        Все заказы <FiArrowRight />
                    </button>
                </div>

                <div className="recent-orders-card">
                    {stats.recentOrders.length > 0 ? (
                        <table className="recent-orders-table">
                            <thead>
                                <tr>
                                    <th>№ Заказа</th>
                                    <th>Клиент</th>
                                    <th>Телефон</th>
                                    <th>Сумма</th>
                                    <th>Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map(order => (
                                    <tr key={order.id} onClick={() => onNavigate('orders')}>
                                        <td className="order-id">#{order.id}</td>
                                        <td className="order-client">{order.name || 'Без имени'}</td>
                                        <td className="order-phone">{order.phone || '—'}</td>
                                        <td className="order-price">{order.price ? `${order.price} BYN` : '—'}</td>
                                        <td>
                                            {(() => {
                                                const stage = STAGE_LABELS[order.orderStage] || { label: order.orderStage || 'Новый', variant: 'neutral' };
                                                return (
                                                    <AdminBadge variant={stage.variant} dot>
                                                        {stage.label}
                                                    </AdminBadge>
                                                );
                                            })()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-orders-placeholder">
                            <FiTrendingUp className="placeholder-icon" />
                            <p>Заказов пока нет</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
