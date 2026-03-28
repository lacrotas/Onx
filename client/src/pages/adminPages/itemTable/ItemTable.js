import React, { useState, useEffect, useRef } from 'react';
import { fetchAllMainKategory, fetchAllKategory, fetchAllKategoryByMainKategoryId } from '../../../http/KategoryApi';
import { fetchAllItem, postItem, deleteItemById, updateItemById } from '../../../http/itemApi';
import { fetchAllFiltersByKategoryId, updateFilter } from '../../../http/filterApi';
import ItemTableHeader from './components/itemTableHeader/ItemTableHeader';
import ItemTableRow from './components/itemTableRow/ItemTableRow';
import ItemModal from './components/itemModal/ItemModal';
import "./ItemTable.scss";

const ItemTable = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]);
    const [categoriesByMain, setCategoriesByMain] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedFilterCategory, setSelectedFilterCategory] = useState('');

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        mainKategoryId: '',
        kategoryId: '',
        price: '',
        description: '',
        video: null,
        videoUrl: '',
        images: [],
        isExist: true,
        isShowed: true,
        specifications: {}
    });

    const [filtersForCategory, setFiltersForCategory] = useState([]);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    const [modifiedItems, setModifiedItems] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const hasChanges = Object.keys(modifiedItems).length > 0;

    useEffect(() => {
        loadItems();
        loadMainCategories();
        loadAllCategories();
    }, []);

    useEffect(() => {
        let result = items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = selectedFilterCategory === '' || item.kategoryId === parseInt(selectedFilterCategory);
            return matchesSearch && matchesCategory;
        });

        result = result.map(item => {
            if (modifiedItems[item.id]) {
                return { ...item, ...modifiedItems[item.id] };
            }
            return item;
        });

        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                if (sortConfig.key === 'mainKategoryId') {
                    aValue = getMainCategoryName(a.mainKategoryId);
                    bValue = getMainCategoryName(b.mainKategoryId);
                } else if (sortConfig.key === 'kategoryId') {
                    aValue = getCategoryName(a.kategoryId);
                    bValue = getCategoryName(b.kategoryId);
                } else if (sortConfig.key === 'price') {
                    aValue = parseFloat(a.price) || 0;
                    bValue = parseFloat(b.price) || 0;
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

        setFilteredItems(result);
    }, [searchTerm, selectedFilterCategory, items, sortConfig, mainCategories, allCategories, modifiedItems]);

    // загрузка данных с сервера
    const loadItems = async () => {
        try {
            const data = await fetchAllItem();
            setItems(data);
            setModifiedItems({});
        } catch (error) {
            console.error('Error loading items:', error);
        }
    };

    const loadMainCategories = async () => {
        try {
            const data = await fetchAllMainKategory();
            setMainCategories(data);
        } catch (error) {
            console.error('Error loading main categories:', error);
        }
    };

    const loadAllCategories = async () => {
        try {
            const data = await fetchAllKategory();
            setAllCategories(data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    };

    const loadCategoriesByMainCategory = async (mainCategoryId) => {
        try {
            const data = await fetchAllKategoryByMainKategoryId(mainCategoryId);
            setCategoriesByMain(data);

            if (formData.kategoryId && !data.some(cat => cat.id === formData.kategoryId)) {
                setFormData(prev => ({
                    ...prev,
                    kategoryId: data.length > 0 ? data[0].id : ''
                }));

                if (data.length > 0) {
                    loadFiltersForCategory(data[0].id);
                } else {
                    setFiltersForCategory([]);
                    setFormData(prev => ({ ...prev, specifications: {} }));
                }
            }
        } catch (error) {
            console.error('Error loading categories by main category:', error);
            setCategoriesByMain([]);
        }
    };

    const loadFiltersForCategory = async (kategoryId, existingSpecifications = {}) => {
        if (!kategoryId) {
            setFiltersForCategory([]);
            return;
        }

        try {
            const data = await fetchAllFiltersByKategoryId(kategoryId);
            setFiltersForCategory(data);

            const newSpecs = {};
            data.forEach(filter => {
                newSpecs[filter.name] = existingSpecifications[filter.name] || '';
            });

            setFormData(prev => ({
                ...prev,
                specifications: newSpecs
            }));
        } catch (error) {
            console.error('Error loading filters for category:', error);
            setFiltersForCategory([]);
        }
    };

    // внутренняя логика компонента
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

    const handleFilterCategoryChange = (e) => {
        setSelectedFilterCategory(e.target.value);
    };
    const getMainCategoryName = (mainKategoryId) => {
        const mainCat = mainCategories.find(cat => cat.id === mainKategoryId);
        return mainCat ? mainCat.name : 'Неизвестно';
    };

    const getCategoryName = (kategoryId) => {
        const category = allCategories.find(cat => cat.id === kategoryId);
        return category ? category.name : 'Неизвестно';
    };

    // обновление данных без отправки на сервак
    const handleQuickEdit = (itemId, field, newValue) => {
        setModifiedItems(prev => {
            const itemChanges = prev[itemId] || {};
            const originalItem = items.find(i => i.id === itemId);
            const newChanges = { ...itemChanges, [field]: newValue };

            if (originalItem && String(originalItem[field]) === String(newValue)) {
                delete newChanges[field];
            }

            if (Object.keys(newChanges).length === 0) {
                const newState = { ...prev };
                delete newState[itemId];
                return newState;
            }

            return { ...prev, [itemId]: newChanges };
        });
    };

    const cancelChanges = () => {
        if (window.confirm('Отменить все несохраненные изменения в таблице?')) {
            setModifiedItems({});
        }
    };
    // редактирование цены/наличия/показа и отправка на сервер
    const handleApplyChanges = async () => {
        setIsSaving(true);
        try {
            const updatePromises = Object.keys(modifiedItems).map(itemId => {
                const changes = modifiedItems[itemId];
                const myFormData = new FormData();

                if (changes.isExist !== undefined) myFormData.append("isExist", changes.isExist);
                if (changes.isShowed !== undefined) myFormData.append("isShowed", changes.isShowed);
                if (changes.price !== undefined) myFormData.append("price", changes.price);

                return updateItemById(itemId, myFormData);
            });

            await Promise.all(updatePromises);
            setModifiedItems({});
            loadItems();
            setTimeout(() => { alert("Изменения успешно сохранены!") }, 200);
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении изменений");
        } finally {
            setIsSaving(false);
        }
    };
    // модалка по добавлению/редактированию товара
    const openAddModal = () => {
        setEditingItem(null);
        const initialMainCategoryId = mainCategories.length > 0 ? mainCategories[0].id : '';

        setFormData({
            name: '',
            mainKategoryId: initialMainCategoryId,
            kategoryId: '',
            price: '',
            description: '',
            video: null,
            videoUrl: '',
            images: [],
            isExist: true,
            isShowed: true,
            specifications: {}
        });
        setIsModalOpen(true);

        if (initialMainCategoryId) {
            loadCategoriesByMainCategory(initialMainCategoryId);
        }
    };
    const openEditModal = (item) => {
        setEditingItem(item);

        const itemImages = Array.isArray(item.images)
            ? item.images.map(img => ({ url: img, file: null }))
            : [];

        const itemVideo = item.video || '';
        const localChanges = modifiedItems[item.id] || {};
        const itemSpecifications = item.specificationsJSONB || {};

        const initialFormData = {
            name: item.name || '',
            mainKategoryId: item.mainKategoryId || '',
            kategoryId: item.kategoryId || '',
            price: localChanges.price !== undefined ? localChanges.price : (item.price || ''),
            description: item.description || '',
            video: null,
            videoUrl: itemVideo,
            images: itemImages,
            isExist: localChanges.isExist !== undefined ? localChanges.isExist : (item.isExist ?? true),
            isShowed: localChanges.isShowed !== undefined ? localChanges.isShowed : (item.isShowed ?? true),
            specifications: itemSpecifications
        };

        setFormData(initialFormData);
        setIsModalOpen(true);

        if (item.mainKategoryId) {
            loadCategoriesByMainCategory(item.mainKategoryId);
        }

        if (item.kategoryId) {
            loadFiltersForCategory(item.kategoryId, itemSpecifications);
        }
    };
    const openDuplicateModal = (item) => {
        setEditingItem(null);

        const itemImages = Array.isArray(item.images)
            ? item.images.map(img => ({ url: img, file: null }))
            : [];

        const itemVideo = item.video || '';
        const itemSpecifications = item.specificationsJSONB || {};

        const initialFormData = {
            name: item.name + ' (Копия)',
            mainKategoryId: item.mainKategoryId || '',
            kategoryId: item.kategoryId || '',
            price: item.price || '',
            description: item.description || '',
            video: null,
            videoUrl: itemVideo,
            images: itemImages,
            isExist: item.isExist ?? true,
            isShowed: item.isShowed ?? true,
            specifications: itemSpecifications
        };

        setFormData(initialFormData);
        setIsModalOpen(true);

        if (item.mainKategoryId) {
            loadCategoriesByMainCategory(item.mainKategoryId);
        }
        if (item.kategoryId) {
            loadFiltersForCategory(item.kategoryId, itemSpecifications);
        }
    };
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFiltersForCategory([]);
        setCategoriesByMain([]);
    };
    const confirmAndCloseModal = () => {
        if (window.confirm('Хотите ли вы закрыть форму? Несохраненные данные будут потеряны.')) {
            closeModal();
        }
    };

    // обработка input
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleDescriptionChange = (value) => {
        setFormData(prev => ({ ...prev, description: value }));
    };

    const handleSpecificationChange = (filterNameOrFilter, value) => {
        let filterName;
        if (typeof filterNameOrFilter === 'string') {
            filterName = filterNameOrFilter;
        } else {
            filterName = filterNameOrFilter.name;
        }

        setFormData(prev => ({
            ...prev,
            specifications: {
                ...prev.specifications,
                [filterName]: value
            }
        }));
    };

    const handleMainCategoryChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            mainKategoryId: value,
            kategoryId: ''
        }));
        loadCategoriesByMainCategory(value);
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        const currentSpecs = formData.specifications;

        setFormData(prev => ({
            ...prev,
            kategoryId: value
        }));

        loadFiltersForCategory(value, currentSpecs);
    };

    const handleImagesChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            const newImageObjects = files.map(file => ({
                url: URL.createObjectURL(file),
                file: file
            }));

            setFormData(prev => ({
                ...prev,
                images: [...prev.images, ...newImageObjects]
            }));
        }
    };

    const setMainImage = (index) => {
        if (index === 0) return;

        const newImages = [...formData.images];
        const [selectedImage] = newImages.splice(index, 1);
        newImages.unshift(selectedImage);

        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const handleVideoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const videoUrl = URL.createObjectURL(file);
            setFormData(prev => ({
                ...prev,
                video: file,
                videoUrl: videoUrl
            }));
        }
    };

    const triggerImageInput = () => {
        imageInputRef.current?.click();
    };

    const triggerVideoInput = () => {
        videoInputRef.current?.click();
    };

    const removeImage = (index) => {
        const imageToRemove = formData.images[index];

        if (imageToRemove.file) {
            URL.revokeObjectURL(imageToRemove.url);
        }

        const newImages = [...formData.images];
        newImages.splice(index, 1);

        setFormData(prev => ({
            ...prev,
            images: newImages
        }));
    };

    const getImageSource = (imageObj) => {
        if (imageObj.file) {
            return imageObj.url;
        }
        return `${process.env.REACT_APP_API_URL}static/images/${imageObj.url}`;
    };

    // сбор данных для отправки на сервер
    const fillFormData = (myFormData) => {
        myFormData.append("mainKategoryId", formData.mainKategoryId);
        myFormData.append("kategoryId", formData.kategoryId);
        myFormData.append("name", formData.name);

        formData.images.forEach(imgObj => {
            myFormData.append('imageStrings', imgObj.url);
            if (imgObj.file) {
                myFormData.append("images", imgObj.file);
            }
        });

        myFormData.append("video", formData.video);
        myFormData.append("price", formData.price);
        myFormData.append("description", formData.description);
        myFormData.append("specificationsJSONB", JSON.stringify(formData.specifications));
        myFormData.append("isExist", formData.isExist);
        myFormData.append("isShowed", formData.isShowed);
    };

    // добавление/обновление/удаление данных на сервере
    const updateFilterAttributeValues = async (newSpecifications) => {
        try {
            // Получаем актуальные фильтры с сервера
            const allFilters = await fetchAllFiltersByKategoryId(formData.kategoryId);

            // Массив промисов для параллельной отправки (оптимизация скорости)
            const updatePromises = [];

            for (const filter of allFilters) {
                // 1. Берем текущие значения из самого фильтра
                let currentValues = [];
                if (Array.isArray(filter.attributeValues)) {
                    currentValues = filter.attributeValues;
                } else if (typeof filter.attributeValues === 'string') {
                    try {
                        currentValues = JSON.parse(filter.attributeValues);
                    } catch (e) {
                        currentValues = [];
                    }
                }

                // 2. Создаем Set для уникальности значений
                const allValues = new Set(currentValues);
                const initialSize = allValues.size; // Запоминаем размер до добавления

                // 3. Добавляем новое значение из формы (если оно заполнено)
                const newValue = newSpecifications[filter.name];
                if (newValue !== undefined && newValue !== null && newValue !== '') {
                    // Приводим к строке, чтобы Set корректно искал дубликаты
                    allValues.add(String(newValue));
                }

                // 4. Отправляем запрос ТОЛЬКО если появилось новое значение
                if (allValues.size > initialSize) {
                    const attributeValues = Array.from(allValues);

                    const myFormData = new FormData();
                    myFormData.append('name', filter.name);
                    myFormData.append('buttonType', filter.buttonType);
                    myFormData.append('kategoryId', filter.kategoryId);
                    myFormData.append('addition', filter.addition || '');
                    myFormData.append('attributeValues', JSON.stringify(attributeValues));

                    // Добавляем запрос в массив, чтобы потом выполнить их разом
                    updatePromises.push(updateFilter(filter.id, myFormData));
                }
            }

            // Ждем выполнения всех необходимых запросов на обновление фильтров
            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }

        } catch (error) {
            console.error('Ошибка при обновлении значений фильтров:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        fillFormData(myFormData);

        if (editingItem) {
            await updateItemById(editingItem.id, myFormData);
            setModifiedItems(prev => {
                const newState = { ...prev };
                delete newState[editingItem.id];
                return newState;
            });
        } else {
            await postItem(myFormData);
        }

        await updateFilterAttributeValues(formData.specifications);
        closeModal();
        loadItems();
    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        fillFormData(myFormData);

        if (editingItem) {
            await updateItemById(editingItem.id, myFormData);
        } else {
            await postItem(myFormData);
        }

        await updateFilterAttributeValues(formData.specifications);
        loadItems();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы действительно хотите удалить данный товар?')) {
            const itemToDelete = items.find(item => item.id === id);
            await deleteItemById(id);

            if (itemToDelete && itemToDelete.specificationsJSONB) {
                const categoryItems = items.filter(item => item.id !== id && item.kategoryId === itemToDelete.kategoryId);
                const allFilters = await fetchAllFiltersByKategoryId(itemToDelete.kategoryId);

                for (const filter of allFilters) {
                    const allValues = new Set();
                    categoryItems.forEach(item => {
                        if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                            allValues.add(item.specificationsJSONB[filter.name]);
                        }
                    });
                    const attributeValues = Array.from(allValues);
                    const myFormData = new FormData();
                    myFormData.append('name', filter.name);
                    myFormData.append('buttonType', filter.buttonType);
                    myFormData.append('kategoryId', filter.kategoryId);
                    myFormData.append('addition', filter.addition || '');
                    myFormData.append('attributeValues', JSON.stringify(attributeValues));
                    await updateFilter(filter.id, myFormData);
                }
            }
            setItems(items.filter(item => item.id !== id));

            if (modifiedItems[id]) {
                setModifiedItems(prev => {
                    const newState = { ...prev };
                    delete newState[id];
                    return newState;
                });
            }
        }
    };



    return (
        <div className="admin-item-editor">
            <ItemTableHeader
                selectedFilterCategory={selectedFilterCategory}
                handleFilterCategoryChange={handleFilterCategoryChange}
                allCategories={allCategories}
                searchTerm={searchTerm}
                handleSearch={handleSearch}
                openAddModal={openAddModal}
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
                                <th onClick={() => requestSort('kategoryId')} className="sortable my_p">
                                    Категория {getSortIndicator('kategoryId')}
                                </th>
                                <th className="my_p">Фото</th>
                                <th onClick={() => requestSort('name')} className="sortable my_p">
                                    Название {getSortIndicator('name')}
                                </th>
                                <th onClick={() => requestSort('price')} className="sortable my_p">
                                    Цена {getSortIndicator('price')}
                                </th>
                                <th className="my_p">
                                    Наличие
                                </th>
                                <th className="my_p">
                                    Показан
                                </th>
                                <th className="my_p">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredItems.map(item => (
                                <ItemTableRow
                                    key={item.id}
                                    item={item}
                                    modifiedItem={modifiedItems[item.id]}
                                    getMainCategoryName={getMainCategoryName}
                                    getCategoryName={getCategoryName}
                                    handleQuickEdit={handleQuickEdit}
                                    openEditModal={openEditModal}
                                    openDuplicateModal={openDuplicateModal}
                                    handleDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <ItemModal
                isModalOpen={isModalOpen}
                confirmAndCloseModal={confirmAndCloseModal}
                editingItem={editingItem}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleSubmit}
                mainCategories={mainCategories}
                handleMainCategoryChange={handleMainCategoryChange}
                categoriesByMain={categoriesByMain}
                handleCategoryChange={handleCategoryChange}
                handleDescriptionChange={handleDescriptionChange}
                setMainImage={setMainImage}
                getImageSource={getImageSource}
                removeImage={removeImage}
                triggerImageInput={triggerImageInput}
                imageInputRef={imageInputRef}
                handleImagesChange={handleImagesChange}
                videoInputRef={videoInputRef}
                triggerVideoInput={triggerVideoInput}
                handleVideoChange={handleVideoChange}
                filtersForCategory={filtersForCategory}
                handleSpecificationChange={handleSpecificationChange}
                handleSubmitWithoutClose={handleSubmitWithoutClose}
            />
        </div>
    );
};

export default ItemTable;