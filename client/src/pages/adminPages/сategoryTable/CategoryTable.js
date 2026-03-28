import React, { useState, useEffect, useRef } from 'react';
import { fetchAllKategory, fetchAllMainKategory, postKategory, updateKategory, deleteKategoryById } from '../../../http/KategoryApi';
import CategoryTableHeader from './components/categoryTableHeader/CategoryTableHeader';
import CategoryTableRow from './components/categoryTableRow/CategoryTableRow';
import CategoryModal from './components/categoryModal/CategoryModal';
import "./CategoryTable.scss";

const CategoryTable = () => {
    const [categories, setCategories] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [selectedFilterMainCategory, setSelectedFilterMainCategory] = useState('');

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        imageFile: null,
        imageUrl: '',
        mainKategoryId: '',
        kategoryIndex: ''
    });
    const fileInputRef = useRef(null);

    // НОВОЕ: Состояния для быстрого редактирования
    const [modifiedCategories, setModifiedCategories] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const hasChanges = Object.keys(modifiedCategories).length > 0;

    useEffect(() => {
        loadCategories();
        loadMainCategories();
    }, []);

    useEffect(() => {
        let result = categories.filter(category => {
            const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesMainCategory = selectedFilterMainCategory === '' || category.mainKategoryId === parseInt(selectedFilterMainCategory);
            
            return matchesSearch && matchesMainCategory;
        });

        // НОВОЕ: Подмешиваем локальные изменения перед сортировкой
        result = result.map(category => {
            if (modifiedCategories[category.id]) {
                return { ...category, ...modifiedCategories[category.id] };
            }
            return category;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'mainKategoryId') {
                    aValue = getMainCategoryName(a.mainKategoryId);
                    bValue = getMainCategoryName(b.mainKategoryId);
                } else if (sortConfig.key === 'kategoryIndex') {
                    aValue = parseInt(a.kategoryIndex) || 0;
                    bValue = parseInt(b.kategoryIndex) || 0;
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

        setFilteredCategories(result);
    }, [searchTerm, selectedFilterMainCategory, categories, sortConfig, mainCategories, modifiedCategories]);

    const loadCategories = async () => {
        try {
            const data = await fetchAllKategory();
            setCategories(data);
            setModifiedCategories({}); // Сбрасываем изменения при новой загрузке
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

    const handleFilterMainCategoryChange = (e) => {
        setSelectedFilterMainCategory(e.target.value);
    };

    // НОВОЕ: Логика быстрого редактирования
    const handleQuickEdit = (categoryId, field, newValue) => {
        setModifiedCategories(prev => {
            const categoryChanges = prev[categoryId] || {};
            const originalCategory = categories.find(c => c.id === categoryId);
            const newChanges = { ...categoryChanges, [field]: newValue };

            // Если вернули к оригинальному значению - удаляем из изменений
            if (originalCategory && String(originalCategory[field]) === String(newValue)) {
                delete newChanges[field];
            }

            // Если для категории больше нет изменений - удаляем категорию из объекта
            if (Object.keys(newChanges).length === 0) {
                const newState = { ...prev };
                delete newState[categoryId];
                return newState;
            }

            return { ...prev, [categoryId]: newChanges };
        });
    };

    const cancelChanges = () => {
        if (window.confirm('Отменить все несохраненные изменения в таблице?')) {
            setModifiedCategories({});
        }
    };

    const handleApplyChanges = async () => {
        setIsSaving(true);
        try {
            const updatePromises = Object.keys(modifiedCategories).map(categoryId => {
                const changes = modifiedCategories[categoryId];
                const myFormData = new FormData();

                if (changes.kategoryIndex !== undefined) myFormData.append("kategoryIndex", changes.kategoryIndex);

                return updateKategory(categoryId, myFormData);
            });

            await Promise.all(updatePromises);
            setModifiedCategories({});
            loadCategories();
            setTimeout(() => { alert("Изменения успешно сохранены!") }, 200);
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении изменений");
        } finally {
            setIsSaving(false);
        }
    };

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            imageFile: null,
            imageUrl: '',
            mainKategoryId: mainCategories.length > 0 ? mainCategories[0].id : '',
            kategoryIndex: ''
        });
        setIsModalOpen(true);
    };

    const openEditModal = (category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            imageFile: null,
            imageUrl: `${process.env.REACT_APP_API_URL}static/images/${category.image}`,
            mainKategoryId: category.mainKategoryId,
            kategoryIndex: category.kategoryIndex
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
        if (editingCategory) {
            myFormData.append("name", formData.name);
            myFormData.append("image", formData.imageFile);
            myFormData.append("kategoryIndex", formData.kategoryIndex);
            await updateKategory(editingCategory.id, myFormData);
        } else {
            myFormData.append("name", formData.name);
            myFormData.append("image", formData.imageFile);
            myFormData.append("mainKategoryId", formData.mainKategoryId);
            myFormData.append("kategoryIndex", formData.kategoryIndex);
            await postKategory(myFormData);
        }
        closeModal();
        loadCategories();
    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        if (editingCategory) {
            myFormData.append("name", formData.name);
            myFormData.append("image", formData.imageFile);
            myFormData.append("kategoryIndex", formData.kategoryIndex);
            await updateKategory(editingCategory.id, myFormData);
        } else {
            myFormData.append("name", formData.name);
            myFormData.append("image", formData.imageFile);
            myFormData.append("mainKategoryId", formData.mainKategoryId);
            myFormData.append("kategoryIndex", formData.kategoryIndex);
            await postKategory(myFormData);
        }
        loadCategories();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы уверены, что хотите удалить эту категорию?')) {
            await deleteKategoryById(id);
            loadCategories();
        }
    };

    const getMainCategoryName = (mainKategoryId) => {
        const mainCat = mainCategories.find(cat => cat.id === mainKategoryId);
        return mainCat ? mainCat.name : 'Unknown';
    };

    return (
        <div className="admin-category-editor">
            <CategoryTableHeader 
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                openAddModal={openAddModal}
                mainCategories={mainCategories}
                selectedFilterMainCategory={selectedFilterMainCategory}
                handleFilterMainCategoryChange={handleFilterMainCategoryChange}
                // Передаем новые пропсы
                hasChanges={hasChanges}
                isSaving={isSaving}
                handleApplyChanges={handleApplyChanges}
                cancelChanges={cancelChanges}
            />

            <main className="content-container">
                <div className="table-wrapper">
                    <table className="apple-table">
                        <thead>
                            <tr>
                                <th onClick={() => requestSort('name')} className="sortable my_p">
                                    Название {getSortIndicator('name')}
                                </th>
                                <th className="my_p">Картинка</th>
                                <th onClick={() => requestSort('mainKategoryId')} className="sortable my_p">
                                    Главная категория {getSortIndicator('mainKategoryId')}
                                </th>
                                {/* НОВОЕ: Столбец для индекса */}
                                <th onClick={() => requestSort('kategoryIndex')} className="sortable my_p">
                                    Индекс {getSortIndicator('kategoryIndex')}
                                </th>
                                <th className="my_p">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map(category => (
                                <CategoryTableRow 
                                    key={category.id}
                                    category={category}
                                    modifiedCategory={modifiedCategories[category.id]}
                                    getMainCategoryName={getMainCategoryName}
                                    handleQuickEdit={handleQuickEdit}
                                    openEditModal={openEditModal}
                                    handleDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <CategoryModal 
                isModalOpen={isModalOpen}
                confirmAndCloseModal={confirmAndCloseModal}
                editingCategory={editingCategory}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                handleSubmitWithoutClose={handleSubmitWithoutClose}
                mainCategories={mainCategories}
                getMainCategoryName={getMainCategoryName}
                triggerFileInput={triggerFileInput}
                fileInputRef={fileInputRef}
                handleFileChange={handleFileChange}
            />
        </div>
    );
};

export default CategoryTable;