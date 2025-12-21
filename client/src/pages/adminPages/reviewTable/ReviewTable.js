import React, { useState, useEffect, useRef } from 'react';
import { fetchAllReview, updateOneReview, deleteReviewById } from '../../../http/reviewApi';
import { fetchAllItem } from '../../../http/itemApi';
import "./ReviewTable.scss";

const ReviewTable = () => {
    const [reviews, setReviews] = useState([]);
    const [filteredReviews, setFilteredReviews] = useState([]);
    const [items, setItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [activeTab, setActiveTab] = useState('reviews');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReview, setEditingReview] = useState(null);
    
    const imageInputRef = useRef(null);

    const [formData, setFormData] = useState({
        userName: '',
        mark: 5,
        description: '',
        label: '',
        isShowed: true,
        images: [],         // Массив всех картинок (URL сервера + blob URL) для отображения
        imageFiles: [],     // Массив новых файлов
        existingImages: []  // Массив исходных картинок с сервера
    });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        let result = reviews.filter(review => {
            const mark = parseInt(review.mark);
            if (activeTab === 'reviews' && mark <= 2) return false;
            if (activeTab === 'complaints' && mark > 2) return false;

            const itemName = getItemName(review.itemId, false).toLowerCase();
            const userName = (review.userName || '').toLowerCase();
            const description = (review.description || '').toLowerCase();
            const search = searchTerm.toLowerCase();

            return itemName.includes(search) || 
                   userName.includes(search) || 
                   description.includes(search);
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'itemId') {
                    aValue = getItemName(a.itemId, false);
                    bValue = getItemName(b.itemId, false);
                }

                if (aValue === null || aValue === undefined) aValue = '';
                if (bValue === null || bValue === undefined) bValue = '';

                if (aValue < bValue) {
                    return sortConfig.direction === 'ascending' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return sortConfig.direction === 'ascending' ? 1 : -1;
                }
                return 0;
            });
        }

        setFilteredReviews(result);
    }, [searchTerm, reviews, sortConfig, items, activeTab]);

    const loadData = async () => {
        try {
            const [reviewsData, itemsData] = await Promise.all([
                fetchAllReview(),
                fetchAllItem()
            ]);
            setReviews(reviewsData);
            setItems(itemsData);
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const getItemName = (itemId, truncate = true) => {
        const item = items.find(i => i.id === itemId);
        if (!item) return 'Неизвестный товар';
        
        const name = item.name;
        if (truncate && name.length > 20) {
            return name.substring(0, 20) + '...';
        }
        return name;
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
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

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openEditModal = (review) => {
        setEditingReview(review);
        
        let currentImages = [];
        if (Array.isArray(review.images)) {
            currentImages = review.images;
        } else if (typeof review.images === 'string') {
            try {
                currentImages = JSON.parse(review.images);
            } catch (e) {
                currentImages = [];
            }
        }

        setFormData({
            userName: review.userName || '',
            mark: review.mark || 5,
            description: review.description || '',
            label: review.label || '',
            isShowed: review.isShowed ?? true,
            images: currentImages,
            existingImages: currentImages,
            imageFiles: []
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReview(null);
    };

    const confirmAndCloseModal = () => {
        if (window.confirm('Хотите ли вы закрыть форму? Несохраненные данные будут потеряны.')) {
            closeModal();
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    // --- Логика работы с картинками ---

    const triggerImageInput = () => {
        imageInputRef.current?.click();
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImageFiles = [...formData.imageFiles, ...files];
            const newImageUrls = newImageFiles.map(file => URL.createObjectURL(file));
            const allImages = [...formData.existingImages, ...newImageUrls];

            setFormData(prev => ({
                ...prev,
                imageFiles: newImageFiles,
                images: allImages
            }));
        }
    };

    const removeImage = (index) => {
        const totalExistingImages = formData.existingImages.length;

        if (index < totalExistingImages) {
            // Удаляем существующую картинку
            const newExistingImages = [...formData.existingImages];
            newExistingImages.splice(index, 1);

            setFormData(prev => ({
                ...prev,
                existingImages: newExistingImages,
                images: [...newExistingImages, ...prev.images.slice(totalExistingImages)]
            }));
        } else {
            // Удаляем новую картинку
            const fileIndex = index - totalExistingImages;
            const newImageFiles = [...formData.imageFiles];
            const newImages = [...formData.images];

            newImageFiles.splice(fileIndex, 1);
            newImages.splice(index, 1);

            URL.revokeObjectURL(formData.images[index]);

            setFormData(prev => ({
                ...prev,
                imageFiles: newImageFiles,
                images: newImages
            }));
        }
    };

    const getImageSource = (image) => {
        if (image.startsWith('blob:')) {
            return image;
        }
        return `${process.env.REACT_APP_API_URL}static/images/${image}`;
    };

    // ----------------------------------------------------

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            myFormData.append("userName", formData.userName);
            myFormData.append("mark", formData.mark);
            myFormData.append("description", formData.description);
            myFormData.append("label", formData.label);
            myFormData.append("isShowed", formData.isShowed);
            
            // 1. Отправляем новые файлы
            formData.imageFiles.forEach(file => {
                myFormData.append("images", file);
            });

            // 2. Подготавливаем список старых картинок
            // Важно: фильтруем blob-ссылки, оставляем только имена файлов с сервера
            const oldImages = formData.images.filter(img => !img.startsWith('blob:'));

            if (oldImages.length === 0 && formData.imageFiles.length === 0) {
                // Если картинок нет вообще (удалили все), отправляем пустой массив
                // Отправляем в оба поля для надежности
                myFormData.append('imageStrings', '[]');
                myFormData.append('images', '[]'); 
            } else {
                // Если есть старые картинки, отправляем их
                oldImages.forEach(image => {
                    // Отправляем как imageStrings (для совместимости с ItemTable)
                    myFormData.append('imageStrings', image);
                    
                    // Отправляем также как images (текстовое поле), на случай если бэкенд Review ждет их там
                    // Это "страховка" для бэкендов, которые не поддерживают imageStrings
                    myFormData.append('images', image);
                });
            }

            if (editingReview) {
                await updateOneReview(editingReview.id, myFormData);
            }
            
            const updatedReviews = await fetchAllReview();
            setReviews(updatedReviews);
            
            closeModal();
        } catch (error) {
            console.error('Error saving review:', error);
            alert('Ошибка при сохранении отзыва');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить этот отзыв?')) {
            try {
                await deleteReviewById(id);
                setReviews(reviews.filter(r => r.id !== id));
            } catch (error) {
                console.error('Error deleting review:', error);
            }
        }
    };

    return (
        <div className="adminReviewTable">
            <div className="admin-header">
                <h1>Управление отзывами</h1>
                
                <div className="tabs-container">
                    <button 
                        className={`tab-button ${activeTab === 'reviews' ? 'active' : ''}`}
                        onClick={() => setActiveTab('reviews')}
                    >
                        Отзывы (3-5 ★)
                    </button>
                    <button 
                        className={`tab-button ${activeTab === 'complaints' ? 'active' : ''}`}
                        onClick={() => setActiveTab('complaints')}
                    >
                        Жалобы (1-2 ★)
                    </button>
                </div>

                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Поиск по товару, имени или тексту..."
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
                            <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>
                                ID{getSortIndicator('id')}
                            </th>
                            <th onClick={() => requestSort('createdAt')} style={{ cursor: 'pointer' }}>
                                Дата{getSortIndicator('createdAt')}
                            </th>
                            <th onClick={() => requestSort('itemId')} style={{ cursor: 'pointer' }}>
                                Товар{getSortIndicator('itemId')}
                            </th>
                            <th onClick={() => requestSort('mark')} style={{ cursor: 'pointer' }}>
                                Оценка{getSortIndicator('mark')}
                            </th>
                            <th onClick={() => requestSort('userName')} style={{ cursor: 'pointer' }}>
                                Имя{getSortIndicator('userName')}
                            </th>
                            <th onClick={() => requestSort('description')} style={{ cursor: 'pointer' }}>
                                Описание{getSortIndicator('description')}
                            </th>
                            <th onClick={() => requestSort('isShowed')} style={{ cursor: 'pointer' }}>
                                Статус{getSortIndicator('isShowed')}
                            </th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReviews.length > 0 ? (
                            filteredReviews.map(review => (
                                <tr key={review.id}>
                                    <td>{review.id}</td>
                                    <td>{formatDate(review.createdAt)}</td>
                                    <td title={getItemName(review.itemId, false)}>
                                        {getItemName(review.itemId, true)}
                                    </td>
                                    <td>
                                        <span style={{ color: '#f1c40f', fontWeight: 'bold' }}>
                                            {'★'.repeat(review.mark)}
                                        </span> 
                                        ({review.mark})
                                    </td>
                                    <td>{review.userName}</td>
                                    <td>
                                        {review.description && review.description.length > 20 
                                            ? `${review.description.substring(0, 20)}...` 
                                            : review.description}
                                    </td>
                                    <td>
                                        <span style={{ 
                                            color: review.isShowed ? '#27ae60' : '#e74c3c',
                                            fontWeight: 'bold'
                                        }}>
                                            {review.isShowed ? 'Показан' : 'Скрыт'}
                                        </span>
                                    </td>
                                    <td className="action-buttons">
                                        <button
                                            onClick={() => openEditModal(review)}
                                            className="edit-button"
                                        >
                                            Ред.
                                        </button>
                                        <button
                                            onClick={() => handleDelete(review.id)}
                                            className="delete-button"
                                        >
                                            Удалить
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="8" style={{textAlign: 'center', padding: '20px'}}>
                                    {activeTab === 'reviews' ? 'Отзывов не найдено' : 'Жалоб не найдено'}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={confirmAndCloseModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>Редактирование {activeTab === 'reviews' ? 'отзыва' : 'жалобы'}</h2>
                        
                        <div style={{marginBottom: '15px', color: '#666', fontSize: '14px'}}>
                            <div>Товар: <strong>{editingReview ? getItemName(editingReview.itemId, false) : ''}</strong></div>
                            <div style={{marginTop: '5px'}}>Дата создания: <strong>{editingReview ? formatDate(editingReview.createdAt) : ''}</strong></div>
                        </div>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="userName">Имя пользователя:</label>
                                <input
                                    type="text"
                                    id="userName"
                                    name="userName"
                                    value={formData.userName}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="mark">Оценка (1-5):</label>
                                <select
                                    id="mark"
                                    name="mark"
                                    value={formData.mark}
                                    onChange={handleInputChange}
                                    className="form-select"
                                >
                                    <option value="1">1 - Ужасно</option>
                                    <option value="2">2 - Плохо</option>
                                    <option value="3">3 - Нормально</option>
                                    <option value="4">4 - Хорошо</option>
                                    <option value="5">5 - Отлично</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="label">Заголовок/Метка:</label>
                                <input
                                    type="text"
                                    id="label"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Текст:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    rows="5"
                                    style={{resize: 'vertical', minHeight: '100px'}}
                                />
                            </div>

                            {/* Секция картинок */}
                            <div className="form-group">
                                <label>Изображения:</label>
                                <div className="images-container">
                                    {formData.images.map((image, index) => (
                                        <div key={index} className="image-item">
                                            <img
                                                src={getImageSource(image)}
                                                alt={`Preview ${index}`}
                                                className="uploaded-image-large"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="remove-image-button"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                    <div
                                        className="add-image-placeholder"
                                        onClick={triggerImageInput}
                                    >
                                        <div className="placeholder-icon">+</div>
                                        <span>Добавить фото</span>
                                    </div>
                                    <input
                                        type="file"
                                        ref={imageInputRef}
                                        onChange={handleImagesChange}
                                        accept="image/*"
                                        multiple
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label style={{display: 'flex', alignItems: 'center', cursor: 'pointer'}}>
                                    <input
                                        type="checkbox"
                                        name="isShowed"
                                        checked={formData.isShowed}
                                        onChange={handleInputChange}
                                        style={{marginRight: '10px', width: '18px', height: '18px'}}
                                    />
                                    Показывать на сайте
                                </label>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={confirmAndCloseModal} className="cancel-button">
                                    Отмена
                                </button>
                                <button type="submit" className="save-button">
                                    Сохранить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewTable;