import React, { useState, useEffect, useRef } from 'react';
import { FiEdit2, FiTrash2, FiShoppingBag, FiChevronDown, FiCheck } from 'react-icons/fi';
import { fetchAllOrders, updateOrder, deleteOrder } from '../../../http/orderApi';
import { useAdminTable } from '../shared/hooks/useAdminTable';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import { AdminTable } from '../shared/components/AdminTable';
import { AdminModal } from '../shared/components/AdminModal';
import { AdminBadge } from '../shared/components/AdminBadge';
import './OrderTable.scss';

const COLUMNS = [
    { label: '№', sortKey: 'id', width: '80px' },
    { label: 'Дата', sortKey: 'createdAt', width: '150px' },
    { label: 'Клиент', sortKey: 'name' },
    { label: 'Телефон', sortKey: 'phone' },
    { label: 'Оплата' },
    { label: 'Сумма', sortKey: 'price', align: 'right', width: '130px' },
    { label: 'Статус', sortKey: 'orderStage', align: 'center', width: '160px' },
    { label: 'Действия', align: 'right', width: '130px' }
];

const ORDER_STAGES = [
    { key: 'start', label: 'Новый', variant: 'warning' },
    { key: 'inProcess', label: 'В обработке', variant: 'info' },
    { key: 'finished', label: 'Завершен', variant: 'success' },
    { key: 'canceled', label: 'Отменен', variant: 'danger' }
];

const STAGE_LABELS = {
    start: { label: 'Новый', variant: 'warning' },
    inProcess: { label: 'В обработке', variant: 'info' },
    finished: { label: 'Завершен', variant: 'success' },
    canceled: { label: 'Отменен', variant: 'danger' }
};

export default function OrderTable() {
    const [orders, setOrders] = useState([]);
    const [selectedStage, setSelectedStage] = useState('all');
    const [activeStatusDropdownId, setActiveStatusDropdownId] = useState(null);
    const [updatingStatusId, setUpdatingStatusId] = useState(null);
    const dropdownMenuRef = useRef(null);

    const [formData, setFormData] = useState({
        name: '',
        adress: '',
        phone: '',
        comment: '',
        payment: '',
        price: 0,
        orderStage: 'start',
        itemsJsonb: []
    });

    const {
        searchTerm,
        handleSearch,
        sortConfig,
        requestSort,
        getSortIndicator,
        filteredItems,
        isModalOpen,
        editingItem,
        openEditModal,
        closeModal,
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving
    } = useAdminTable({
        items: orders,
        searchFields: ['name', 'phone', 'adress', 'id'],
        customFilter: (item) => selectedStage === 'all' || item.orderStage === selectedStage,
        initialSort: { key: 'id', direction: 'descending' }
    });

    useEffect(() => {
        loadOrders();
    }, []);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownMenuRef.current && !dropdownMenuRef.current.contains(e.target)) {
                setActiveStatusDropdownId(null);
            }
        };
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setActiveStatusDropdownId(null);
            }
        };

        if (activeStatusDropdownId !== null) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleKeyDown);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [activeStatusDropdownId]);

    const loadOrders = async () => {
        setIsLoading(true);
        try {
            const data = await fetchAllOrders();
            const safeData = Array.isArray(data) ? data : [];
            setOrders(safeData);
        } catch (error) {
            console.error('Ошибка загрузки заказов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickStatusChange = async (orderId, newStage, e) => {
        if (e) e.stopPropagation();
        setActiveStatusDropdownId(null);

        const currentOrder = orders.find(o => o.id === orderId);
        if (!currentOrder || currentOrder.orderStage === newStage) return;

        const previousOrders = [...orders];
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, orderStage: newStage } : o));
        setUpdatingStatusId(orderId);

        try {
            await updateOrder(orderId, { orderStage: newStage });
        } catch (error) {
            console.error('Ошибка изменения статуса заказа:', error);
            setOrders(previousOrders);
            alert('Не удалось изменить статус заказа. Попробуйте еще раз.');
        } finally {
            setUpdatingStatusId(null);
        }
    };

    const handleOpenEdit = (order) => {
        setFormData({
            name: order.name || '',
            adress: order.adress || '',
            phone: order.phone || '',
            comment: order.comment || '',
            payment: order.payment || '',
            price: order.price || 0,
            orderStage: order.orderStage || 'start',
            itemsJsonb: Array.isArray(order.itemsJsonb) ? order.itemsJsonb : []
        });
        openEditModal(order);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingItem) return;

        setIsSaving(true);
        try {
            await updateOrder(editingItem.id, {
                name: formData.name,
                adress: formData.adress,
                phone: formData.phone,
                comment: formData.comment,
                payment: formData.payment,
                price: parseFloat(formData.price) || 0,
                orderStage: formData.orderStage
            });

            await loadOrders();
            closeModal();
        } catch (error) {
            console.error('Ошибка обновления заказа:', error);
            alert('Ошибка при сохранении заказа');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm(`Удалить заказ #${id}?`)) {
            try {
                await deleteOrder(id);
                await loadOrders();
            } catch (error) {
                console.error('Ошибка удаления заказа:', error);
                alert('Ошибка при удалении заказа');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="admin-page-container admin-orders-view">
            <AdminPageHeader
                title="Заказы"
                count={filteredItems.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск по имени, номеру, телефону..."
            >
                {/* Вкладки стадий заказа */}
                <div className="order-stage-tabs">
                    <button
                        type="button"
                        className={`stage-tab-btn ${selectedStage === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedStage('all')}
                    >
                        Все ({orders.length})
                    </button>
                    <button
                        type="button"
                        className={`stage-tab-btn ${selectedStage === 'start' ? 'active' : ''}`}
                        onClick={() => setSelectedStage('start')}
                    >
                        Новые ({orders.filter(o => o.orderStage === 'start').length})
                    </button>
                    <button
                        type="button"
                        className={`stage-tab-btn ${selectedStage === 'inProcess' ? 'active' : ''}`}
                        onClick={() => setSelectedStage('inProcess')}
                    >
                        В обработке ({orders.filter(o => o.orderStage === 'inProcess').length})
                    </button>
                    <button
                        type="button"
                        className={`stage-tab-btn ${selectedStage === 'finished' ? 'active' : ''}`}
                        onClick={() => setSelectedStage('finished')}
                    >
                        Завершенные ({orders.filter(o => o.orderStage === 'finished').length})
                    </button>
                    <button
                        type="button"
                        className={`stage-tab-btn ${selectedStage === 'canceled' ? 'active' : ''}`}
                        onClick={() => setSelectedStage('canceled')}
                    >
                        Отмененные ({orders.filter(o => o.orderStage === 'canceled').length})
                    </button>
                </div>
            </AdminPageHeader>

            <AdminTable
                columns={COLUMNS}
                data={filteredItems}
                sortConfig={sortConfig}
                onSort={requestSort}
                getSortIndicator={getSortIndicator}
                isLoading={isLoading}
                emptyMessage="Заказы не найдены"
                renderRow={(order, index) => {
                    const stageConfig = STAGE_LABELS[order.orderStage] || { label: order.orderStage || 'Новый', variant: 'neutral' };
                    const isOpen = activeStatusDropdownId === order.id;
                    const isUpdating = updatingStatusId === order.id;
                    const isNearBottom = filteredItems.length > 2 && index >= filteredItems.length - 2;

                    return (
                        <tr key={order.id}>
                            <td style={{ color: '#818cf8', fontWeight: 700 }}>#{order.id}</td>
                            <td style={{ color: '#94a3b8', fontSize: '12.5px' }}>{formatDate(order.createdAt)}</td>
                            <td style={{ fontWeight: 600 }}>{order.name || 'Без имени'}</td>
                            <td style={{ color: '#94a3b8' }}>{order.phone || '—'}</td>
                            <td>
                                <span style={{ fontSize: '12.5px', color: '#94a3b8' }}>
                                    {order.payment || 'Не указана'}
                                </span>
                            </td>
                            <td className="text-right" style={{ fontWeight: 700 }}>
                                {order.price ? `${order.price} BYN` : '0 BYN'}
                            </td>
                            <td className="text-center status-col-cell">
                                <div
                                    className="status-select-container"
                                    ref={isOpen ? dropdownMenuRef : null}
                                >
                                    <button
                                        type="button"
                                        className={`status-badge-trigger status-${stageConfig.variant} ${isOpen ? 'open' : ''} ${isUpdating ? 'updating' : ''}`}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveStatusDropdownId(prev => prev === order.id ? null : order.id);
                                        }}
                                        title="Нажмите, чтобы изменить статус"
                                        disabled={isUpdating}
                                    >
                                        <span className="badge-dot" />
                                        <span className="badge-text">{stageConfig.label}</span>
                                        <FiChevronDown className="status-chevron" />
                                    </button>

                                    {isOpen && (
                                        <div className={`status-dropdown-menu ${isNearBottom ? 'drop-up' : ''}`}>
                                            <div className="status-dropdown-header">Сменить статус:</div>
                                            {ORDER_STAGES.map((stage) => {
                                                const isCurrent = (order.orderStage || 'start') === stage.key;
                                                return (
                                                    <button
                                                        key={stage.key}
                                                        type="button"
                                                        className={`status-dropdown-item ${isCurrent ? 'active' : ''}`}
                                                        onClick={(e) => handleQuickStatusChange(order.id, stage.key, e)}
                                                    >
                                                        <div className="item-content">
                                                            <span className={`item-dot dot-${stage.variant}`} />
                                                            <span className="item-label">{stage.label}</span>
                                                        </div>
                                                        {isCurrent && <FiCheck className="item-check" />}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            </td>
                            <td className="text-right">
                                <div className="action-buttons-group">
                                    <button
                                        type="button"
                                        className="btn-action edit"
                                        onClick={() => handleOpenEdit(order)}
                                        title="Просмотр и редактирование"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action delete"
                                        onClick={() => handleDelete(order.id)}
                                        title="Удалить"
                                    >
                                        <FiTrash2 />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                }}
            />

            {/* Модальное окно просмотра / редактирования заказа */}
            <AdminModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={`Заказ #${editingItem?.id}`}
                subtitle={`Оформлен: ${formatDate(editingItem?.createdAt)}`}
                onSubmit={handleSubmit}
                isSubmitting={isSaving}
                submitText="Сохранить изменения"
                maxWidth="760px"
            >
                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Статус заказа</label>
                        <select
                            name="orderStage"
                            value={formData.orderStage}
                            onChange={handleInputChange}
                            className="admin-form-select"
                        >
                            <option value="start">Новый</option>
                            <option value="inProcess">В обработке</option>
                            <option value="finished">Завершен</option>
                            <option value="canceled">Отменен</option>
                        </select>
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Итоговая сумма (BYN)</label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            className="admin-form-input"
                        />
                    </div>
                </div>

                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Имя клиента</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="admin-form-input"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Телефон</label>
                        <input
                            type="text"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            className="admin-form-input"
                        />
                    </div>
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Адрес доставки</label>
                    <input
                        type="text"
                        name="adress"
                        value={formData.adress}
                        onChange={handleInputChange}
                        className="admin-form-input"
                    />
                </div>

                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Способ оплаты</label>
                        <input
                            type="text"
                            name="payment"
                            value={formData.payment}
                            onChange={handleInputChange}
                            className="admin-form-input"
                        />
                    </div>
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Комментарий клиента</label>
                    <textarea
                        name="comment"
                        value={formData.comment}
                        onChange={handleInputChange}
                        className="admin-form-textarea"
                    />
                </div>

                {/* Состав заказа (товары) */}
                <div className="order-items-section">
                    <h3 className="section-subtitle">
                        <FiShoppingBag /> Состав заказа ({formData.itemsJsonb.length})
                    </h3>
                    {formData.itemsJsonb.length > 0 ? (
                        <div className="order-items-list">
                            {formData.itemsJsonb.map((item, idx) => (
                                <div key={idx} className="order-item-card">
                                    <div className="item-info">
                                        {(item.alias || item.id || item.itemId) ? (
                                            <a
                                                href={`/itemPreview/${encodeURIComponent(item.alias || item.id || item.itemId)}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="item-name item-link"
                                                title="Перейти к товару на сайте"
                                                style={{ color: 'var(--admin-primary)', textDecoration: 'none', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                            >
                                                {item.name || `Товар #${item.id || item.itemId}`}
                                                <span style={{ fontSize: '11px', opacity: 0.7 }}>↗</span>
                                            </a>
                                        ) : (
                                            <span className="item-name">{item.name || `Товар #${item.id}`}</span>
                                        )}
                                        {item.price && (
                                            <span className="item-price">{item.price} BYN</span>
                                        )}
                                    </div>
                                    <div className="item-qty">
                                        Кол-во: <strong>{item.count || item.quantity || 1}</strong>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#64748b', fontSize: '13px' }}>Товары не указаны</p>
                    )}
                </div>
            </AdminModal>
        </div>
    );
}