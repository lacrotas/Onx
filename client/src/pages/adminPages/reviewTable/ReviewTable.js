import React, { useState, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiStar } from 'react-icons/fi';
import { fetchAllReview, updateOneReview, deleteReviewById } from '../../../http/reviewApi';
import { fetchAllItem } from '../../../http/itemApi';
import { useAdminTable } from '../shared/hooks/useAdminTable';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import { AdminTable } from '../shared/components/AdminTable';
import { AdminModal } from '../shared/components/AdminModal';
import { AdminBadge } from '../shared/components/AdminBadge';
import './ReviewTable.scss';

const COLUMNS = [
    { label: 'ID', sortKey: 'id', width: '70px' },
    { label: 'Товар', width: '22%' },
    { label: 'Автор', sortKey: 'userName', width: '15%' },
    { label: 'Оценка', sortKey: 'mark', align: 'center', width: '100px' },
    { label: 'Отзыв' },
    { label: 'Дата', sortKey: 'createdAt', width: '120px' },
    { label: 'Статус', align: 'center', width: '120px' },
    { label: 'Действия', align: 'right', width: '130px' }
];

export default function ReviewTable() {
    const [reviews, setReviews] = useState([]);
    const [items, setItems] = useState([]);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'reviews' | 'complaints'

    const [formData, setFormData] = useState({
        userName: '',
        mark: 5,
        description: '',
        label: '',
        isShowed: true,
        images: []
    });

    const getItemName = (itemId) => {
        const found = items.find(i => i.id === itemId);
        return found ? found.name : `Товар #${itemId}`;
    };

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
        items: reviews,
        searchFields: ['userName', 'description', 'label'],
        customFilter: (review) => {
            const mark = parseInt(review.mark, 10);
            if (activeTab === 'reviews' && mark <= 2) return false;
            if (activeTab === 'complaints' && mark > 2) return false;
            return true;
        },
        initialSort: { key: 'id', direction: 'descending' }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [reviewsData, itemsData] = await Promise.all([
                fetchAllReview(),
                fetchAllItem()
            ]);
            setReviews(Array.isArray(reviewsData) ? reviewsData : []);
            setItems(Array.isArray(itemsData) ? itemsData : []);
        } catch (error) {
            console.error('Ошибка загрузки отзывов:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEdit = (review) => {
        let currentImages = [];
        if (Array.isArray(review.images)) {
            currentImages = review.images;
        } else if (typeof review.images === 'string') {
            try {
                currentImages = JSON.parse(review.images);
            } catch {
                currentImages = [];
            }
        }

        setFormData({
            userName: review.userName || '',
            mark: parseInt(review.mark, 10) || 5,
            description: review.description || '',
            label: review.label || '',
            isShowed: review.isShowed !== false,
            images: currentImages
        });
        openEditModal(review);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!editingItem) return;

        setIsSaving(true);
        try {
            const myFormData = new FormData();
            myFormData.append("userName", formData.userName);
            myFormData.append("mark", formData.mark);
            myFormData.append("description", formData.description);
            myFormData.append("label", formData.label);
            myFormData.append("isShowed", formData.isShowed);

            await updateOneReview(editingItem.id, myFormData);
            await loadData();
            closeModal();
        } catch (error) {
            console.error('Ошибка сохранения отзыва:', error);
            alert('Ошибка при сохранении отзыва');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            try {
                await deleteReviewById(id);
                await loadData();
            } catch (error) {
                console.error('Ошибка удаления отзыва:', error);
                alert('Ошибка при удалении');
            }
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '—';
        const d = new Date(dateString);
        return d.toLocaleDateString('ru-RU');
    };

    return (
        <div className="admin-page-container admin-reviews-view">
            <AdminPageHeader
                title="Отзывы и жалобы"
                count={filteredItems.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск по автору, тексту..."
            >
                <div className="review-filter-tabs">
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Все ({reviews.length})
                    </button>
                    <button
                        type="button"
                        className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Положительные ({reviews.filter(r => parseInt(r.mark, 10) > 2).length})
                    </button>
                    <button
                        type="button"
                        className={`tab-btn complaints ${activeTab === 'complaints' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaints')}
                    >
                        Жалобы ({reviews.filter(r => parseInt(r.mark, 10) <= 2).length})
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
                emptyMessage="Отзывы не найдены"
                renderRow={(review) => {
                    const mark = parseInt(review.mark, 10) || 5;
                    const isComplaint = mark <= 2;

                    return (
                        <tr key={review.id}>
                            <td style={{ color: '#64748b', fontWeight: 600 }}>#{review.id}</td>
                            <td style={{ fontWeight: 600, color: '#f8fafc' }}>
                                {getItemName(review.itemId)}
                            </td>
                            <td>{review.userName || 'Аноним'}</td>
                            <td className="text-center">
                                <span style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '3px',
                                    fontWeight: 700,
                                    color: isComplaint ? '#ef4444' : '#fbbf24'
                                }}>
                                    <FiStar /> {mark}
                                </span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxWidth: '380px' }}>
                                    {review.label && <strong style={{ fontSize: '13px' }}>{review.label}</strong>}
                                    <span style={{ color: '#94a3b8', fontSize: '13px', lineHeight: 1.4 }}>
                                        {review.description}
                                    </span>
                                </div>
                            </td>
                            <td style={{ color: '#64748b', fontSize: '12.5px' }}>{formatDate(review.createdAt)}</td>
                            <td className="text-center">
                                <AdminBadge variant={review.isShowed ? 'success' : 'neutral'} dot>
                                    {review.isShowed ? 'Опубликован' : 'Скрыт'}
                                </AdminBadge>
                            </td>
                            <td className="text-right">
                                <div className="action-buttons-group">
                                    <button
                                        type="button"
                                        className="btn-action edit"
                                        onClick={() => handleOpenEdit(review)}
                                        title="Редактировать / Модерировать"
                                    >
                                        <FiEdit2 />
                                    </button>
                                    <button
                                        type="button"
                                        className="btn-action delete"
                                        onClick={() => handleDelete(review.id)}
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

            <AdminModal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Модерация отзыва"
                subtitle={`Отзыв к товару: ${getItemName(editingItem?.itemId)}`}
                onSubmit={handleSubmit}
                isSubmitting={isSaving}
                submitText="Сохранить изменения"
            >
                <div className="admin-form-row">
                    <div className="admin-form-group">
                        <label className="admin-form-label">Автор</label>
                        <input
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            className="admin-form-input"
                        />
                    </div>

                    <div className="admin-form-group">
                        <label className="admin-form-label">Оценка (от 1 до 5)</label>
                        <select
                            name="mark"
                            value={formData.mark}
                            onChange={handleInputChange}
                            className="admin-form-select"
                        >
                            <option value="5">⭐⭐⭐⭐⭐ (5 - Отлично)</option>
                            <option value="4">⭐⭐⭐⭐ (4 - Хорошо)</option>
                            <option value="3">⭐⭐⭐ (3 - Удовлетворительно)</option>
                            <option value="2">⭐⭐ (2 - Плохо)</option>
                            <option value="1">⭐ (1 - Ужасно)</option>
                        </select>
                    </div>
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Заголовок отзыва</label>
                    <input
                        type="text"
                        name="label"
                        value={formData.label}
                        onChange={handleInputChange}
                        className="admin-form-input"
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-label">Текст отзыва</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="admin-form-textarea"
                    />
                </div>

                <div className="admin-form-group">
                    <label className="admin-form-checkbox">
                        <input
                            type="checkbox"
                            name="isShowed"
                            checked={formData.isShowed}
                            onChange={handleInputChange}
                        />
                        <span>Отображать отзыв на сайте (опубликован)</span>
                    </label>
                </div>
            </AdminModal>
        </div>
    );
}