import React, { useState, useEffect } from 'react';
import { fetchAllFilters, postFilterForKategory, updateFilter, deleteFilter } from '../../../http/filterApi';
import { fetchAllKategory } from '../../../http/KategoryApi';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import FilterCard from './components/filterCard/FilterCard';
import FilterModal from './components/filterModal/FilterModal';
import Loader from '../../../components/loader/Loader';
import "./FilterTable.scss";

const FilterTable = () => {
    const [filters, setFilters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterCategory, setSelectedFilterCategory] = useState('');
    
    const [isSaving, setIsSaving] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFilter, setEditingFilter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        categoryId: '',
        kategoryId: '',
        buttonType: 'check',
        addition: '',
        filterIndex: ''
    });

    useEffect(() => {
        loadFilters();
        loadCategories();
    }, []);

    const loadFilters = async () => {
        try {
            const data = await fetchAllFilters();
            const sortedData = (Array.isArray(data) ? data : []).sort((a, b) => (a.filterIndex || 0) - (b.filterIndex || 0));
            setFilters(sortedData);
        } catch (error) {
            console.error('Error loading filters:', error);
        }
    };

    const loadCategories = async () => {
        try {
            const data = await fetchAllKategory();
            const safeData = Array.isArray(data) ? data : [];
            setCategories(safeData);
            if (safeData.length > 0 && !editingFilter) {
                setFormData(prev => ({ 
                    ...prev, 
                    categoryId: safeData[0].id,
                    kategoryId: safeData[0].id 
                }));
            }
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterCategoryChange = (e) => {
        setSelectedFilterCategory(e.target.value);
    };

    const saveFilterValues = async (filterObj, newValuesArray) => {
        setIsSaving(true);
        try {
            const targetCatId = filterObj.categoryId !== undefined && filterObj.categoryId !== null 
                ? filterObj.categoryId 
                : filterObj.kategoryId;
            const payload = {
                name: filterObj.name,
                buttonType: filterObj.buttonType,
                categoryId: Number(targetCatId),
                kategoryId: Number(targetCatId),
                addition: filterObj.addition || '',
                attributeValues: newValuesArray,
                filterIndex: filterObj.filterIndex
            };

            await updateFilter(filterObj.id, payload);
            await loadFilters(); 
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении значений");
        } finally {
            setIsSaving(false);
        }
    };

    const openAddModal = () => {
        setEditingFilter(null);
        const defaultCatId = selectedFilterCategory !== '' 
            ? selectedFilterCategory 
            : (categories.length > 0 ? categories[0].id : '');
        setFormData({
            name: '',
            categoryId: defaultCatId,
            kategoryId: defaultCatId,
            buttonType: 'check',
            addition: '',
            filterIndex: filters.length
        });
        setIsModalOpen(true);
    };

    const openEditModal = (filter) => {
        setEditingFilter(filter);
        const currentCatId = filter.categoryId !== undefined && filter.categoryId !== null 
            ? filter.categoryId 
            : (filter.kategoryId !== undefined && filter.kategoryId !== null ? filter.kategoryId : (categories.length > 0 ? categories[0].id : ''));
        setFormData({
            name: filter.name || '',
            categoryId: currentCatId,
            kategoryId: currentCatId,
            buttonType: filter.buttonType || 'check',
            addition: filter.addition || '',
            filterIndex: filter.filterIndex !== undefined && filter.filterIndex !== null ? filter.filterIndex : ''
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
        if (name === 'categoryId' || name === 'kategoryId') {
            setFormData(prev => ({ ...prev, categoryId: value, kategoryId: value }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const targetCatId = formData.categoryId !== undefined && formData.categoryId !== '' 
                ? formData.categoryId 
                : formData.kategoryId;
            const payload = {
                name: formData.name,
                buttonType: formData.buttonType,
                categoryId: Number(targetCatId),
                kategoryId: Number(targetCatId),
                addition: formData.addition,
                attributeValues: editingFilter ? (editingFilter.attributeValues || []) : [],
                filterIndex: formData.filterIndex !== '' ? Number(formData.filterIndex) : (filters.length || 0)
            };

            if (editingFilter) {
                await updateFilter(editingFilter.id, payload);
            } else {
                await postFilterForKategory(payload);
            }

            await loadFilters();
            closeModal();
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении фильтра");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const targetCatId = formData.categoryId !== undefined && formData.categoryId !== '' 
                ? formData.categoryId 
                : formData.kategoryId;
            const payload = {
                name: formData.name,
                buttonType: formData.buttonType,
                categoryId: Number(targetCatId),
                kategoryId: Number(targetCatId),
                addition: formData.addition,
                attributeValues: [],
                filterIndex: filters.length
            };

            await postFilterForKategory(payload);
            await loadFilters();
        } catch (error) {
            console.error(error);
            alert("Ошибка при создании");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы действительно хотите удалить данный фильтр?')) {
            setIsSaving(true);
            try {
                await deleteFilter(id);
                await loadFilters();
            } catch (error) {
                console.error(error);
                alert("Ошибка при удалении");
            } finally {
                setIsSaving(false);
            }
        }
    };

    const getFilteredAndGroupedData = () => {
        const result = filters.filter(filter => {
            const filterCatId = filter.categoryId !== undefined && filter.categoryId !== null ? filter.categoryId : filter.kategoryId;
            const matchesSearch = (filter.name || '').toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedFilterCategory === '' || String(filterCatId) === String(selectedFilterCategory);
            return matchesSearch && matchesCategory;
        });

        const grouped = result.reduce((acc, filter) => {
            const filterCatId = filter.categoryId !== undefined && filter.categoryId !== null ? filter.categoryId : filter.kategoryId;
            const cat = categories.find(c => String(c.id) === String(filterCatId)) || filter.category;
            const catName = cat && cat.name ? cat.name.trim() : 'Без категории';

            if (!acc[catName]) {
                acc[catName] = [];
            }
            acc[catName].push(filter);
            return acc;
        }, {});

        const sortedKeys = Object.keys(grouped).sort();

        return sortedKeys.map(key => ({
            categoryName: key,
            filters: grouped[key].sort((a, b) => (a.filterIndex || 0) - (b.filterIndex || 0))
        }));
    };

    const groupedData = getFilteredAndGroupedData();

    const buttonTypeOptions = [
        { value: 'check', label: 'Checkbox (Да/Нет)' },
        { value: 'color', label: 'Цвет' },
        { value: 'select', label: 'Выпадающий список' },
        { value: 'number', label: 'Числовое значение' }
    ];

    return (
        <div className="admin-page-container admin-filter-editor">
            <AdminPageHeader
                title="Фильтры характеристик"
                count={filters.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск фильтра..."
                onAdd={openAddModal}
                addButtonText="Добавить фильтр"
            >
                <select
                    value={selectedFilterCategory}
                    onChange={handleFilterCategoryChange}
                    className="admin-form-select"
                >
                    <option value="">Все категории</option>
                    {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </AdminPageHeader>

            <main className="content-container">
                {groupedData.length === 0 ? (
                    <div className="empty-state my_p">Ничего не найдено.</div>
                ) : (
                    groupedData.map((group, index) => (
                        <div key={index} className="category-group">
                            <h2 className="group-title my_h2">{group.categoryName}</h2>
                            <div className="filter-grid">
                                {group.filters.map(filter => (
                                    <FilterCard
                                        key={filter.id}
                                        filter={filter}
                                        saveFilterValues={saveFilterValues}
                                        openEditModal={openEditModal}
                                        handleDelete={handleDelete}
                                    />
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </main>

            <FilterModal
                isModalOpen={isModalOpen}
                confirmAndCloseModal={confirmAndCloseModal}
                editingFilter={editingFilter}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                handleSubmitWithoutClose={handleSubmitWithoutClose}
                categories={categories}
                buttonTypeOptions={buttonTypeOptions}
            />

            <Loader isVisible={isSaving} text="Обновление фильтров..." />
        </div>
    );
};

export default FilterTable;