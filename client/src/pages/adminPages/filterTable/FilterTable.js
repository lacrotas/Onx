import React, { useState, useEffect, useRef } from 'react';
import { fetchAllFilters, postFilterForKategory, updateFilter, deleteFilter } from '../../../http/filterApi';
import { fetchAllKategory } from '../../../http/KategoryApi';
import "./FilterTable.scss";

const FilterTable = () => {
    const [filters, setFilters] = useState([]);
    const [filteredFilters, setFilteredFilters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Добавляем состояние для сортировки
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFilter, setEditingFilter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        kategoryId: '',
        buttonType: 'check',
        addition: ''
    });
    const fileInputRef = useRef(null);

    // Load filters and categories on component mount
    useEffect(() => {
        loadFilters();
        loadCategories();
    }, []);

    // 2. Обновляем useEffect для фильтрации И сортировки
    useEffect(() => {
        // Сначала фильтруем по поиску
        let result = filters.filter(filter =>
            filter.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Затем сортируем, если есть конфигурация
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Специальная обработка для колонки "Категория", так как там ID, а сортировать хотим по названию
                if (sortConfig.key === 'kategoryId') {
                    aValue = getCategoryName(a.kategoryId);
                    bValue = getCategoryName(b.kategoryId);
                }

                // Обработка null/undefined значений
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

        setFilteredFilters(result);
    }, [searchTerm, filters, sortConfig, categories]); // Добавили sortConfig и categories в зависимости

    const loadFilters = async () => {
        try {
            const data = await fetchAllFilters();
            setFilters(data);
            // setFilteredFilters(data); // Это больше не нужно здесь, так как useEffect сработает при изменении filters
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await fetchAllKategory();
            setCategories(data);
            if (data.length > 0 && !editingFilter) {
                setFormData(prev => ({ ...prev, kategoryId: data[0].id }));
            }
        } catch (error) {
            console.error('Error loading categories:', error);
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

    // Вспомогательная функция для отображения стрелочки
    const getSortIndicator = (key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setEditingFilter(null);
        setFormData({
            name: '',
            kategoryId: categories.length > 0 ? categories[0].id : '',
            buttonType: 'check',
            addition: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (filter) => {
        setEditingFilter(filter);
        setFormData({
            name: filter.name,
            kategoryId: filter.kategoryId,
            buttonType: filter.buttonType,
            addition: filter.addition || ''
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingFilter(null);
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
        const myFormData = new FormData();
        myFormData.append("name", formData.name);
        myFormData.append("buttonType", formData.buttonType);
        myFormData.append("kategoryId", formData.kategoryId);
        myFormData.append("addition", formData.addition);

        if (editingFilter) {
            await updateFilter(editingFilter.id, myFormData);
        } else {
            await postFilterForKategory(myFormData);
        }
        loadFilters();
        closeModal();

    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        myFormData.append("name", formData.name);
        myFormData.append("buttonType", formData.buttonType);
        myFormData.append("kategoryId", formData.kategoryId);
        myFormData.append("addition", formData.addition);

        if (editingFilter) {
            await updateFilter(editingFilter.id, myFormData);
        } else {
            await postFilterForKategory(myFormData);
        }
        loadFilters();
    }

    const handleDelete = (id) => {
        if (window.confirm('Вы действительно хотите удалить данный  фильтр?')) {
            deleteFilter(id);
            window.location.reload();
        }
    };

    const getCategoryName = (kategoryId) => {
        const category = categories.find(cat => cat.id === kategoryId);
        return category ? category.name : 'Unknown';
    };

    const buttonTypeOptions = [
        { value: 'check', label: 'Checkbox' },
        { value: 'color', label: 'Color' },
        { value: 'select', label: 'Select' },
        { value: 'number', label: 'Number' }
    ];

    return (
        <div className="adminFilterTable">
            <div className="admin-header">
                <h1>Фильтры</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Найти фильтр..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button onClick={openAddModal} className="add-button">
                    Добавить фильтр
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
                            <th onClick={() => requestSort('kategoryId')} style={{ cursor: 'pointer' }}>
                                Категория{getSortIndicator('kategoryId')}
                            </th>
                            <th onClick={() => requestSort('buttonType')} style={{ cursor: 'pointer' }}>
                                Тип{getSortIndicator('buttonType')}
                            </th>
                            <th onClick={() => requestSort('addition')} style={{ cursor: 'pointer' }}>
                                Дополнение{getSortIndicator('addition')}
                            </th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFilters.map(filter => (
                            <tr key={filter.id}>
                                <td>{filter.id}</td>
                                <td>{filter.name}</td>
                                <td>{getCategoryName(filter.kategoryId)}</td>
                                <td>{filter.buttonType}</td>
                                <td>{filter.addition || '-'}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => openEditModal(filter)}
                                        className="edit-button"
                                    >
                                        Обновить
                                    </button>
                                    <button
                                        onClick={() => handleDelete(filter.id)}
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
                        <h2>{editingFilter ? 'Обновить' : 'Добавить'}</h2>
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

                            <div className="form-group">
                                <label htmlFor="kategoryId">Категория:</label>
                                <select
                                    id="kategoryId"
                                    name="kategoryId"
                                    value={formData.kategoryId}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="buttonType">Тип:</label>
                                <select
                                    id="buttonType"
                                    name="buttonType"
                                    value={formData.buttonType}
                                    onChange={handleInputChange}
                                    className="form-select"
                                    required
                                >
                                    {buttonTypeOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {formData.buttonType === 'number' && (
                                <div className="form-group">
                                    <label htmlFor="addition">Дополнение (для числового фильтра):</label>
                                    <input
                                        type="text"
                                        id="addition"
                                        name="addition"
                                        value={formData.addition}
                                        onChange={handleInputChange}
                                        className="form-input"
                                        placeholder="Введите строку для числового фильтра"
                                    />
                                </div>
                            )}

                            <div className="modal-buttons">
                                <button type="button" onClick={() => confirmAndCloseModal()} className="cancel-button">
                                    Отмена
                                </button>
                                {!editingFilter ?
                                    <button type="button" onClick={(e) => handleSubmitWithoutClose(e)} className="save-button">
                                        Добавить без сброса
                                    </button>
                                    : <></>
                                }
                                <button type="submit" className="save-button">
                                    {editingFilter ? 'Обновить' : 'Добавить'}
                                </button>

                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FilterTable;