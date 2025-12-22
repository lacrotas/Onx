import React, { useState, useEffect } from 'react';
// Импортируйте ваши реальные функции API
import { fetchAllOrders, updateOrder, deleteOrder } from '../../../http/orderApi';
import "./OrderTable.scss";

const OrderTable = () => {
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // Вкладки соответствуют стадиям заказа
    const [activeTab, setActiveTab] = useState('start');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        adress: '',
        phone: '',
        comment: '',
        payment: '',
        price: 0,
        orderStage: 'start',
        itemsJsonb: [] // Для отображения состава заказа
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let result = orders.filter(order => {
            // Фильтрация по вкладкам (стадиям)
            if (order.orderStage !== activeTab) return false;

            // Поиск
            const search = searchTerm.toLowerCase();
            const name = (order.name || '').toLowerCase();
            const adress = (order.adress || '').toLowerCase();
            const phone = (order.phone || '').toLowerCase();
            const id = order.id.toString();

            return name.includes(search) ||
                adress.includes(search) ||
                phone.includes(search) ||
                id.includes(search);
        });

        // Сортировка
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        setFilteredOrders(result);
    }, [searchTerm, orders, sortConfig, activeTab]);

    const loadData = async () => {
        try {
            const data = await fetchAllOrders();
            console.log(data);
            // Сортируем по умолчанию новые сверху
            data.sort((a, b) => b.id - a.id);
            setOrders(data);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString('ru-RU');
    };

    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const handleSearch = (e) => setSearchTerm(e.target.value);

    const openEditModal = (order) => {
        setEditingOrder(order);

        // Парсим itemsJsonb если это строка, или оставляем как есть если объект
        let items = [];
        if (typeof order.itemsJsonb === 'string') {
            try { items = JSON.parse(order.itemsJsonb); } catch (e) { }
        } else if (Array.isArray(order.itemsJsonb)) {
            items = order.itemsJsonb;
        }

        setFormData({
            name: order.name || '',
            adress: order.adress || '',
            phone: order.phone || '',
            comment: order.comment || '',
            payment: order.payment || '',
            price: order.price || 0,
            orderStage: order.orderStage || 'start',
            itemsJsonb: items
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingOrder(null);
    };
    const confirmAndCloseModal = () => {
        if (window.confirm('Хотите ли вы закрыть форму? Несохраненные данные будут потеряны.')) {
            closeModal();
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Отправляем обновленные данные
            // Предполагается, что updateOrder принимает ID и объект/FormData
            await updateOrder(editingOrder.id, {
                name: formData.name,
                adress: formData.adress,
                phone: formData.phone,
                comment: formData.comment,
                price: formData.price,
                orderStage: formData.orderStage
                // itemsJsonb обычно не редактируют через админку таким образом, но можно добавить
            });

            // Обновляем локальный стейт или перезагружаем данные
            loadData();
            closeModal();
        } catch (error) {
            alert('Ошибка сделай скрин и пришли мне', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот заказ?')) {
            try {
                await deleteOrder(id);
                setOrders(orders.filter(o => o.id !== id));
            } catch (error) {
                alert('Ошибка сделай скрин и пришли мне', error);
            }
        }
    };

    // Хелпер для перевода стадий
    const getStageName = (stage) => {
        switch (stage) {
            case 'start': return 'Новый';
            case 'inProcess': return 'В обработке';
            case 'finished': return 'Завершен';
            default: return stage;
        }
    };

    return (
        <div className="adminOrderTable">
            <div className="admin-header">
                <h1>Управление заказами</h1>

                <div className="tabs-container">
                    <button
                        className={`tab-button ${activeTab === 'start' ? 'active' : ''}`}
                        onClick={() => setActiveTab('start')}
                    >
                        Новые
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'inProcess' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inProcess')}
                    >
                        В обработке
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'finished' ? 'active' : ''}`}
                        onClick={() => setActiveTab('finished')}
                    >
                        Завершенные
                    </button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Поиск по имени, адресу, телефону..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
            </div>

            <div className="table-container">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th onClick={() => requestSort('id')}>ID{getSortIndicator('id')}</th>
                            <th onClick={() => requestSort('createdAt')}>Дата{getSortIndicator('createdAt')}</th>
                            <th onClick={() => requestSort('name')}>Имя{getSortIndicator('name')}</th>
                            <th onClick={() => requestSort('payment')}>Оплата{getSortIndicator('payment')}</th>
                            <th onClick={() => requestSort('phone')}>Телефон{getSortIndicator('phone')}</th>
                            <th onClick={() => requestSort('price')}>Сумма{getSortIndicator('price')}</th>
                            <th onClick={() => requestSort('orderStage')}>Статус{getSortIndicator('orderStage')}</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.length > 0 ? (
                            filteredOrders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{formatDate(order.createdAt)}</td>
                                    <td>{order.name}</td>
                                    <td>{order.payment}</td>
                                    <td>{order.phone}</td>
                                    <td>{order.price} ₽</td>
                                    <td>
                                        <span className={`status-badge status-${order.orderStage}`}>
                                            {getStageName(order.orderStage)}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button onClick={() => openEditModal(order)} className="edit-button">Ред.</button>
                                        <button onClick={() => handleDelete(order.id)} className="delete-button">Удалить</button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{ textAlign: 'center', padding: '20px' }}>
                                    Заказов в этой категории не найдено
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => confirmAndCloseModal()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Заказ №{editingOrder?.id}</h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-row-split">
                                <div className="form-group">
                                    <label>Статус заказа:</label>
                                    <select
                                        name="orderStage"
                                        value={formData.orderStage}
                                        onChange={handleInputChange}
                                        className="form-select"
                                        style={{ borderColor: '#3498db', background: '#f0f8ff' }}
                                    >
                                        <option value="start">Новый</option>
                                        <option value="inProcess">В обработке</option>
                                        <option value="finished">Завершен</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Сумма:</label>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Имя клиента:</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Адрес доставки:</label>
                                <input
                                    type="text"
                                    name="adress"
                                    value={formData.adress}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Телефон:</label>
                                <input
                                    type="text"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>
                            <div className="form-group">
                                <label>Способ оплаты:</label>
                                <input
                                    type="text"
                                    name="payment"
                                    value={formData.payment}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Комментарий к заказу:</label>
                                <textarea
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>

                            {/* Блок просмотра товаров */}
                            <div className="order-items-preview">
                                <h3>Состав заказа:</h3>
                                <div className="items-list">
                                    {formData.itemsJsonb && formData.itemsJsonb.length > 0 ? (
                                        formData.itemsJsonb.map((item, idx) => (
                                            <div key={idx} className="order-item-row">
                                                <span>{item.name || 'Товар'}</span>
                                                <span className="dots"></span>
                                                <span>{item.count || 1} шт. x {item.price} ₽</span>
                                            </div>
                                        ))
                                    ) : (
                                        <p>Нет товаров</p>
                                    )}
                                </div>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={() => confirmAndCloseModal()} className="cancel-button">Отмена</button>
                                <button type="submit" className="save-button">Сохранить</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderTable;