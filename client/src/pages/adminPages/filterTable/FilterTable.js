// FilterTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchAllFilters, postFilterForKategory, updateFilter, deleteFilter } from '../../../http/filterApi';
import { fetchAllKategory } from '../../../http/KategoryApi';
import "./FilterTable.scss";

const FilterTable = () => {
    const [filters, setFilters] = useState([]);
    const [filteredFilters, setFilteredFilters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filter filters based on search term
    useEffect(() => {
        const filtered = filters.filter(filter =>
            filter.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredFilters(filtered);
    }, [searchTerm, filters]);

    const loadFilters = async () => {
        try {
            const data = await fetchAllFilters();
            setFilters(data);
            setFilteredFilters(data);
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

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            myFormData.append("name", formData.name);
            myFormData.append("buttonType", formData.buttonType);
            myFormData.append("kategoryId", formData.kategoryId);
            myFormData.append("addition", formData.addition);
            
            if (editingFilter) {
                await updateFilter(editingFilter.id, myFormData);
            } else {
                await postFilterForKategory(myFormData);
            }
            loadFilters(); // Обновляем список вместо перезагрузки страницы
            closeModal();
        } catch (error) {
            console.error('Error saving filter:', error);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this filter?')) {
            deleteFilter(id);
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
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Категория</th>
                            <th>Тип</th>
                            <th>Дополнение</th>
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
                <div className="modal-overlay" onClick={closeModal}>
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
                                <button type="button" onClick={closeModal} className="cancel-button">
                                    Отмена
                                </button>
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