import React, { useState, useEffect, useRef } from 'react';
import { fetchAllKategory, fetchAllMainKategory, postKategory, updateKategory, deleteKategoryById } from '../../../http/KategoryApi';
import "./CategoryTable.scss";

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Добавляем состояние для сортировки
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        imageFile: null,
        imageUrl: '',
        mainKategoryId: ''
    });
    const fileInputRef = useRef(null);

    // Load categories and main categories on component mount
    useEffect(() => {
        loadCategories();
        loadMainCategories();
    }, []);

    // 2. Обновляем useEffect для фильтрации И сортировки
    useEffect(() => {
        // Сначала фильтруем
        let result = categories.filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Затем сортируем
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Специальная логика для сортировки по названию главной категории
                if (sortConfig.key === 'mainKategoryId') {
                    aValue = getMainCategoryName(a.mainKategoryId);
                    bValue = getMainCategoryName(b.mainKategoryId);
                }

                // Обработка null/undefined
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

        setFilteredCategories(result);
    }, [searchTerm, categories, sortConfig, mainCategories]); // Добавили зависимости

    const loadCategories = async () => {
        try {
            const data = await fetchAllKategory();
            setCategories(data);
            // setFilteredCategories(data); // Убрали, так как useEffect сработает
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadMainCategories = async () => {
        try {
            const data = await fetchAllMainKategory();
            setMainCategories(data);
            if (data.length > 0 && !editingCategory) {
                setFormData(prev => ({ ...prev, mainKategoryId: data[0].id }));
            }
        } catch (error) {
            console.error('Error loading main categories:', error);
        }
    };

    // 3. Функция запроса сортировки
    const requestSort = (key) => {
        let direction = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    // Вспомогательная функция для индикатора
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            imageFile: null,
            imageUrl: '',
            mainKategoryId: mainCategories.length > 0 ? mainCategories[0].id : ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            imageFile: null,
            imageUrl: `${process.env.REACT_APP_API_URL}static/images/${category.image}`,
            mainKategoryId: category.mainKategoryId
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
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

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({
                    ...prev,
                    imageFile: file,
                    imageUrl: event.target.result
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            if (editingCategory) {
                myFormData.append("name", formData.name);
                myFormData.append("image", formData.imageFile);
                await updateKategory(editingCategory.id, myFormData);

            } else {
                myFormData.append("name", formData.name);
                myFormData.append("image", formData.imageFile);
                myFormData.append("mainKategoryId", formData.mainKategoryId);
                await postKategory(myFormData);
            }
            closeModal();
            window.location.reload();

        } catch (error) {
            console.error('Error saving category:', error);
        }
    };
    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            if (editingCategory) {
                myFormData.append("name", formData.name);
                myFormData.append("image", formData.imageFile);
                await updateKategory(editingCategory.id, myFormData);

            } else {
                myFormData.append("name", formData.name);
                myFormData.append("image", formData.imageFile);
                myFormData.append("mainKategoryId", formData.mainKategoryId);
                await postKategory(myFormData);
            }
            alert("дынные успешно добавлены");

        } catch (error) {
            alert('Произошла ошибка сделай скрин и скинь мне:', error);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            deleteKategoryById(id);
            window.location.reload();
        }
    };

    const getMainCategoryName = (mainKategoryId) => {
        const mainCat = mainCategories.find(cat => cat.id === mainKategoryId);
        return mainCat ? mainCat.name : 'Unknown';
    };

    return (
        <div className="adminKategoryTable">
            <div className="admin-header">
                <h1>Категории</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Название категории..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button onClick={openAddModal} className="add-button">
                    Добавить категорию
                </button>
            </div>

            <div className="table-container">
                <table className="categories-table">
                    <thead>
                        {/* 4. Добавляем onClick и стили курсора */}
                        <tr>
                            <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>
                                ID{getSortIndicator('id')}
                            </th>
                            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                Название{getSortIndicator('name')}
                            </th>
                            <th>Картинка</th>
                            <th onClick={() => requestSort('mainKategoryId')} style={{ cursor: 'pointer' }}>
                                Главная категория{getSortIndicator('mainKategoryId')}
                            </th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCategories.map(category => (
                            <tr key={category.id}>
                                <td>{category.id}</td>
                                <td>{category.name}</td>
                                <td>
                                    <div className="image-preview">
                                        <img src={`${process.env.REACT_APP_API_URL}static/images/${category.image}`} alt="Category" className="preview-image" />
                                    </div>
                                </td>
                                <td>{getMainCategoryName(category.mainKategoryId)}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => openEditModal(category)}
                                        className="edit-button"
                                    >
                                        Обновить
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="delete-button"
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={() => confirmAndCloseModal()}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingCategory ? 'Редактирование' : 'Добавление'}</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Название:</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            {!editingCategory && mainCategories.length > 0 && (
                                <div className="form-group">
                                    <label htmlFor="mainKategoryId">Главная категория:</label>
                                    <select
                                        id="mainKategoryId"
                                        name="mainKategoryId"
                                        value={formData.mainKategoryId}
                                        onChange={handleInputChange}
                                        className="form-select"
                                        required
                                    >
                                        {mainCategories.map(mainCat => (
                                            <option key={mainCat.id} value={mainCat.id}>
                                                {mainCat.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {editingCategory && (
                                <div className="form-group">
                                    <label>Главная категория:</label>
                                    <div className="form-static">
                                        {getMainCategoryName(editingCategory.mainKategoryId)}
                                    </div>
                                </div>
                            )}

                            <div className="form-group">
                                <label>Картинка:</label>
                                <div
                                    className="image-upload-container"
                                    onClick={triggerFileInput}
                                >
                                    {formData.imageUrl ? (
                                        <div className="image-preview-container">
                                            <img
                                                src={formData.imageUrl}
                                                alt="Preview"
                                                className="uploaded-image"
                                            />
                                            <div className="image-overlay">
                                                <span className="overlay-text">Изменить</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="image-placeholder">
                                            <div className="placeholder-icon">📁</div>
                                            <span>Загрузить изображение</span>
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={() => confirmAndCloseModal()} className="cancel-button">
                                    Отмена
                                </button>
                                {!editingCategory ?
                                    <button type="button" onClick={(e) => handleSubmitWithoutClose(e)} className="save-button">
                                        Добавить без сброса
                                    </button>
                                    : <></>
                                }
                                <button type="submit" className="save-button">
                                    {editingCategory ? 'Обновить' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default CategoryTable;