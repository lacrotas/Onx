import React, { useState, useEffect } from 'react';
import { fetchAllFilters, postFilterForKategory, updateFilter, deleteFilter } from '../../../http/filterApi';
import { fetchAllKategory } from '../../../http/KategoryApi';
import FilterTableHeader from './components/filterTableHeader/FilterTableHeader';
import FilterCard from './components/filterCard/FilterCard';
import FilterModal from './components/filterModal/FilterModal';
import "./FilterTable.scss";

const FilterTable = () => {
    const [filters, setFilters] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterCategory, setSelectedFilterCategory] = useState('');

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFilter, setEditingFilter] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        kategoryId: '',
        buttonType: 'check',
        addition: '',
        filterIndex:''
    });

    useEffect(() => {
        loadFilters();
        loadCategories();
    }, []);

    const loadFilters = async () => {
        try {
            const data = await fetchAllFilters();
            // Сортируем полученные фильтры по filterIndex
            const sortedData = data.sort((a, b) => (a.filterIndex || 0) - (b.filterIndex || 0));
            setFilters(sortedData);
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

    const handleFilterCategoryChange = (e) => {
        setSelectedFilterCategory(e.target.value);
    };

    const saveFilterValues = async (filterObj, newValuesArray) => {
        try {
            const payload = {
                name: filterObj.name,
                buttonType: filterObj.buttonType,
                kategoryId: filterObj.kategoryId,
                addition: filterObj.addition || '',
                attributeValues: newValuesArray,
                filterIndex: filterObj.filterIndex // Сохраняем индекс при обновлении значений
            };

            await updateFilter(filterObj.id, payload);
            await loadFilters(); 
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении значений");
        }
    };

    const openAddModal = () => {
        setEditingFilter(null);
        setFormData({
            name: '',
            kategoryId: categories.length > 0 ? categories[0].id : '',
            buttonType: 'check',
            addition: '',
            filterIndex: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (filter) => {
        setEditingFilter(filter);
        setFormData({
            name: filter.name,
            kategoryId: filter.kategoryId,
            buttonType: filter.buttonType,
            addition: filter.addition || '',
            filterIndex: filter.filterIndex || ''
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

        const payload = {
            name: formData.name,
            buttonType: formData.buttonType,
            kategoryId: formData.kategoryId,
            addition: formData.addition,
            attributeValues: editingFilter ? (editingFilter.attributeValues || []) : [],
            filterIndex: formData.filterIndex
        };
        console.log(payload);

        if (editingFilter) {
            await updateFilter(editingFilter.id, payload);
        } else {
            await postFilterForKategory(payload);
        }

        loadFilters();
        closeModal();
    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        
        const payload = {
            name: formData.name,
            buttonType: formData.buttonType,
            kategoryId: formData.kategoryId,
            addition: formData.addition,
            attributeValues: [],
            filterIndex: filters.length
        };

        await postFilterForKategory(payload);
        loadFilters();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы действительно хотите удалить данный фильтр?')) {
            await deleteFilter(id);
            loadFilters();
        }
    };

    const getFilteredAndGroupedData = () => {
        const result = filters.filter(filter => {
            const matchesSearch = filter.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedFilterCategory === '' || filter.kategoryId === parseInt(selectedFilterCategory);
            return matchesSearch && matchesCategory;
        });

        const grouped = result.reduce((acc, filter) => {
            const cat = categories.find(c => c.id === filter.kategoryId);
            const catName = cat ? cat.name : 'Без категории';

            if (!acc[catName]) {
                acc[catName] = [];
            }
            acc[catName].push(filter);
            return acc;
        }, {});

        const sortedKeys = Object.keys(grouped).sort();

        return sortedKeys.map(key => ({
            categoryName: key,
            // Дополнительная сортировка внутри группы на случай, если массив filters был изменен
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
        <div className="admin-filter-editor">
            <FilterTableHeader
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                openAddModal={openAddModal}
                categories={categories}
                selectedFilterCategory={selectedFilterCategory}
                handleFilterCategoryChange={handleFilterCategoryChange}
            />

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
        </div>
    );
};

export default FilterTable;