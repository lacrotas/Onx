import React, { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';
import { FiDownload } from 'react-icons/fi';
import { fetchAllMainCategory, fetchAllKategory, fetchAllKategoryByMainKategoryId } from '../../../http/KategoryApi';
import { fetchAllItem, postItem, deleteItemById, updateItemById } from '../../../http/itemApi';
import { fetchAllFiltersByCategoryId, updateFilter } from '../../../http/filterApi';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import { AdminTable } from '../shared/components/AdminTable';
import ItemTableRow from './components/itemTableRow/ItemTableRow';
import ItemModal from './components/itemModal/ItemModal';
import Loader from '../../../components/loader/Loader';
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
        alias: '',
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
            const itemCatId = item.categoryId || item.kategoryId;
            const matchesCategory = selectedFilterCategory === '' || String(itemCatId) === String(selectedFilterCategory);
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
                } else if (sortConfig.key === 'kategoryId' || sortConfig.key === 'categoryId') {
                    aValue = getCategoryName(a.categoryId || a.kategoryId);
                    bValue = getCategoryName(b.categoryId || b.kategoryId);
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
            const data = await fetchAllMainCategory();
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
            const data = await fetchAllFiltersByCategoryId(kategoryId);
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
        if (!mainKategoryId && mainKategoryId !== 0) return 'Неизвестно';
        const mainCat = mainCategories.find(cat => String(cat.id) === String(mainKategoryId));
        return mainCat ? (mainCat.name || '').trim() : 'Неизвестно';
    };

    const getCategoryName = (kategoryId) => {
        if (!kategoryId && kategoryId !== 0) return 'Неизвестно';
        const category = allCategories.find(cat => String(cat.id) === String(kategoryId));
        return category ? (category.name || '').trim() : 'Неизвестно';
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
            await loadItems();
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
            alias: '',
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

        const currentCategoryId = item.categoryId || item.kategoryId || '';
        const currentCategory = allCategories.find(c => String(c.id) === String(currentCategoryId));
        const currentMainCategoryId = item.mainKategoryId || currentCategory?.parentId || '';

        const initialFormData = {
            name: item.name || '',
            alias: item.alias || '',
            mainKategoryId: currentMainCategoryId,
            kategoryId: currentCategoryId,
            categoryId: currentCategoryId,
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

        if (currentMainCategoryId) {
            loadCategoriesByMainCategory(currentMainCategoryId);
        }

        if (currentCategoryId) {
            loadFiltersForCategory(currentCategoryId, itemSpecifications);
        }
    };

    const openDuplicateModal = (item) => {
        setEditingItem(null);

        const itemImages = Array.isArray(item.images)
            ? item.images.map(img => ({ url: img, file: null }))
            : [];

        const itemVideo = item.video || '';
        const itemSpecifications = item.specificationsJSONB || {};
        const currentCategoryId = item.categoryId || item.kategoryId || '';
        const currentCategory = allCategories.find(c => String(c.id) === String(currentCategoryId));
        const currentMainCategoryId = item.mainKategoryId || currentCategory?.parentId || '';

        const initialFormData = {
            name: item.name + ' (Копия)',
            alias: item.alias ? `${item.alias}-copy` : '',
            mainKategoryId: currentMainCategoryId,
            kategoryId: currentCategoryId,
            categoryId: currentCategoryId,
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

        if (currentMainCategoryId) {
            loadCategoriesByMainCategory(currentMainCategoryId);
        }
        if (currentCategoryId) {
            loadFiltersForCategory(currentCategoryId, itemSpecifications);
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

    const fillFormData = (myFormData) => {
        const catId = formData.kategoryId || formData.categoryId || '';
        myFormData.append("mainKategoryId", formData.mainKategoryId);
        myFormData.append("kategoryId", catId);
        myFormData.append("categoryId", catId);
        myFormData.append("name", formData.name);
        myFormData.append("alias", (formData.alias || '').trim());

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

    const updateFilterAttributeValues = async (newSpecifications) => {
        try {
            const allFilters = await fetchAllFiltersByCategoryId(formData.kategoryId);
            const updatePromises = [];

            for (const filter of allFilters) {
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

                const allValues = new Set(currentValues);
                const initialSize = allValues.size;

                const newValue = newSpecifications[filter.name];
                if (newValue !== undefined && newValue !== null && newValue !== '') {
                    allValues.add(String(newValue));
                }

                if (allValues.size > initialSize) {
                    const attributeValues = Array.from(allValues);
                    const myFormData = new FormData();
                    myFormData.append('name', filter.name);
                    myFormData.append('buttonType', filter.buttonType);
                    myFormData.append('kategoryId', filter.kategoryId);
                    myFormData.append('addition', filter.addition || '');
                    myFormData.append('attributeValues', JSON.stringify(attributeValues));

                    updatePromises.push(updateFilter(filter.id, myFormData));
                }
            }

            if (updatePromises.length > 0) {
                await Promise.all(updatePromises);
            }
        } catch (error) {
            console.error('Ошибка при обновлении значений фильтров:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
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
            await loadItems();
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const myFormData = new FormData();
            fillFormData(myFormData);

            if (editingItem) {
                await updateItemById(editingItem.id, myFormData);
            } else {
                await postItem(myFormData);
            }

            await updateFilterAttributeValues(formData.specifications);
            await loadItems();
        } catch (error) {
            console.error(error);
            alert("Ошибка при сохранении");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы действительно хотите удалить данный товар?')) {
            setIsSaving(true);
            try {
                const itemToDelete = items.find(item => item.id === id);
                await deleteItemById(id);

                const itemCatId = itemToDelete ? (itemToDelete.categoryId || itemToDelete.kategoryId) : null;
                if (itemToDelete && itemToDelete.specificationsJSONB && itemCatId) {
                    const categoryItems = items.filter(item => item.id !== id && (item.categoryId === itemCatId || item.kategoryId === itemCatId));
                    const allFilters = await fetchAllFiltersByCategoryId(itemCatId);

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
                await loadItems();
            } catch (error) {
                console.error(error);
                alert("Ошибка при удалении");
            } finally {
                setIsSaving(false);
            }
        }
    };

    // Выгрузка всех товаров в Excel
    const handleExportToExcel = () => {
        if (!items || items.length === 0) {
            alert('Нет товаров для выгрузки в Excel');
            return;
        }

        const origin = window.location.origin;

        const dataToExport = items.map((item) => {
            const itemCatId = item.categoryId || item.kategoryId;
            const subCat = allCategories.find(c => String(c.id) === String(itemCatId));
            const mainCatId = subCat?.parentId || item.mainKategoryId;
            const mainCat = mainCategories.find(m => String(m.id) === String(mainCatId));

            const mainCategoryName = mainCat ? (mainCat.name || '').trim() : '';
            const subCategoryName = subCat ? (subCat.name || '').trim() : '';

            // Формирование ссылки на товар
            let productUrl = '';
            if (mainCat?.alias && subCat?.alias && item.alias) {
                productUrl = `${origin}/${mainCat.alias}/${subCat.alias}/${item.alias}`;
            } else if (subCat?.alias && item.alias) {
                productUrl = `${origin}/${subCat.alias}/${item.alias}`;
            } else if (item.alias) {
                productUrl = `${origin}/itemPreview/${item.alias}`;
            } else {
                productUrl = `${origin}/item/${item.id}`;
            }

            // Очистка HTML тегов из описания
            const cleanDescription = (item.description || '')
                .replace(/<[^>]*>?/gm, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            // Читаемый список характеристик
            let specsString = '';
            if (item.specificationsJSONB && typeof item.specificationsJSONB === 'object') {
                specsString = Object.entries(item.specificationsJSONB)
                    .filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
                    .map(([k, v]) => `${k}: ${v}`)
                    .join('; ');
            }

            // Ссылки на фото
            const imagesList = Array.isArray(item.images) && item.images.length > 0
                ? item.images.map(img => `${origin}/static/images/${img}`).join(';\n')
                : '';

            return {
                'ID': item.id,
                'Название': item.name || '',
                'Главная категория': mainCategoryName,
                'Подкатегория': subCategoryName,
                'Цена (BYN)': parseFloat(item.price) || 0,
                'В наличии': item.isExist ? 'Да' : 'Нет',
                'Отображается на сайте': item.isShowed ? 'Да' : 'Нет',
                'Ссылка на товар': productUrl,
                'Количество фото': Array.isArray(item.images) ? item.images.length : 0,
                'Ссылки на фото': imagesList,
                'Видео': item.video ? `${origin}/static/video/${item.video}` : 'Нет',
                'Характеристики': specsString,
                'Описание': cleanDescription,
                'SEO Title': item.seo_title || '',
                'SEO Description': item.seo_desc || '',
                'Дата создания': item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : '',
                'Дата обновления': item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : ''
            };
        });

        // Создаем лист
        const worksheet = XLSX.utils.json_to_sheet(dataToExport);

        // Рассчитываем автоширину колонок
        const colWidths = Object.keys(dataToExport[0]).map(key => {
            let maxLen = key.length;
            dataToExport.forEach(row => {
                const val = row[key];
                if (val !== undefined && val !== null) {
                    const firstLine = String(val).split('\n')[0];
                    if (firstLine.length > maxLen) {
                        maxLen = firstLine.length;
                    }
                }
            });
            return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
        });
        worksheet['!cols'] = colWidths;

        // Создаем книгу и инициируем скачивание
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');

        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU').replace(/\./g, '-');
        XLSX.writeFile(workbook, `Товары_ONX_${dateStr}.xlsx`);
    };

    const COLUMNS = [
        { label: 'Категория', sortKey: 'categoryId' },
        { label: 'Фото', width: '100px' },
        { label: 'Название', sortKey: 'name' },
        { label: 'Цена', sortKey: 'price', width: '145px' },
        { label: 'Наличие', width: '110px' },
        { label: 'Показан', width: '110px' },
        { label: 'Действия', align: 'right', width: '250px' }
    ];

    return (
        <div className="admin-page-container admin-item-editor">
            <AdminPageHeader
                title="Товары каталога"
                count={filteredItems.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск товара по названию..."
                onAdd={openAddModal}
                addButtonText="Добавить товар"
                hasChanges={hasChanges}
                isSaving={isSaving}
                onApplyChanges={handleApplyChanges}
                onCancelChanges={cancelChanges}
                extraActions={
                    <button
                        type="button"
                        className="btn-export-excel"
                        onClick={handleExportToExcel}
                        title={`Выгрузить все товары (${items.length} шт.) в Excel (.xlsx)`}
                    >
                        <FiDownload />
                        <span>Экспорт в Excel</span>
                    </button>
                }
            >
                <select
                    value={selectedFilterCategory}
                    onChange={handleFilterCategoryChange}
                    className="admin-form-select"
                >
                    <option value="">Все категории</option>
                    {allCategories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                </select>
            </AdminPageHeader>

            <AdminTable
                columns={COLUMNS}
                data={filteredItems}
                sortConfig={sortConfig}
                onSort={requestSort}
                getSortIndicator={getSortIndicator}
                isLoading={isSaving}
                emptyMessage="Товары не найдены"
                renderRow={(item) => (
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
                )}
            />

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

            {/* Глобальный лоадер */}
            <Loader isVisible={isSaving} text="Синхронизация с сервером..." />
        </div>
    );
};

export default ItemTable;