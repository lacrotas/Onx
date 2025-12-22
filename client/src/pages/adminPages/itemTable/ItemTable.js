import React, { useState, useEffect, useRef } from 'react';
import { fetchAllMainKategory, fetchAllKategory, fetchAllKategoryByMainKategoryId } from '../../../http/KategoryApi';
import { fetchAllItem, postItem, deleteItemById, updateItemById } from '../../../http/itemApi';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'
import { fetchAllFiltersByKategoryId, updateFilter } from '../../../http/filterApi';
import "./ItemTable.scss";

const ItemTable = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // все категории
    const [categoriesByMain, setCategoriesByMain] = useState([]); // категории по выбранной главной категории
    const [searchTerm, setSearchTerm] = useState('');

    // 1. Добавляем состояние для сортировки
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
        imageFiles: [],
        existingImages: [],
        isExist: true,
        isShowed: true,
        specifications: {}
    });
    const [filtersForCategory, setFiltersForCategory] = useState([]);
    const imageInputRef = useRef(null);
    const videoInputRef = useRef(null);

    // Load items, main categories, and categories on component mount
    useEffect(() => {
        loadItems();
        loadMainCategories();
        loadAllCategories();
    }, []);

    // 2. Обновляем useEffect для фильтрации И сортировки
    useEffect(() => {
        // Сначала фильтруем
        let result = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );

        // Затем сортируем
        if (sortConfig.key) {
            result.sort((a, b) => {
                let aValue = a[sortConfig.key];
                let bValue = b[sortConfig.key];

                // Специальная логика для разных типов полей
                if (sortConfig.key === 'mainKategoryId') {
                    // Сортируем по названию главной категории
                    aValue = getMainCategoryName(a.mainKategoryId);
                    bValue = getMainCategoryName(b.mainKategoryId);
                } else if (sortConfig.key === 'kategoryId') {
                    // Сортируем по названию категории
                    aValue = getCategoryName(a.kategoryId);
                    bValue = getCategoryName(b.kategoryId);
                } else if (sortConfig.key === 'price') {
                    // Преобразуем цену в число для корректного сравнения
                    aValue = parseFloat(a.price) || 0;
                    bValue = parseFloat(b.price) || 0;
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

        setFilteredItems(result);
    }, [searchTerm, items, sortConfig, mainCategories, allCategories]); // Добавили зависимости

    const loadItems = async () => {
        try {
            const data = await fetchAllItem();
            setItems(data);
            // setFilteredItems(data); // Убрали, так как useEffect сработает
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

    // ... (остальные функции загрузки и модального окна без изменений) ...
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
            imageFiles: [],
            existingImages: [],
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

        const itemImages = Array.isArray(item.images) ? item.images : [];
        const itemVideo = item.video || '';
        const itemSpecifications = item.specificationsJSONB || {};

        const initialFormData = {
            name: item.name || '',
            mainKategoryId: item.mainKategoryId || '',
            kategoryId: item.kategoryId || '',
            price: item.price || '',
            description: item.description || '',
            video: null,
            videoUrl: itemVideo,
            images: itemImages,
            imageFiles: [],
            existingImages: itemImages,
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
        const totalExistingImages = formData.existingImages.length;

        if (index < totalExistingImages) {
            const newExistingImages = [...formData.existingImages];
            newExistingImages.splice(index, 1);

            setFormData(prev => ({
                ...prev,
                existingImages: newExistingImages,
                images: [...newExistingImages, ...prev.images.slice(totalExistingImages)]
            }));
        } else {
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

    const updateFilterAttributeValues = async (newSpecifications, oldSpecifications = {}) => {
        const allFilters = await fetchAllFiltersByKategoryId(formData.kategoryId);

        for (const filter of allFilters) {
            const categoryItems = items.filter(item => item.kategoryId === formData.kategoryId);
            const allValues = new Set();

            categoryItems.forEach(item => {
                if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                    allValues.add(item.specificationsJSONB[filter.name]);
                }
            });

            if (newSpecifications[filter.name]) {
                allValues.add(newSpecifications[filter.name]);
            }

            if (editingItem && oldSpecifications[filter.name] && oldSpecifications[filter.name] !== newSpecifications[filter.name]) {
                allValues.delete(oldSpecifications[filter.name]);
            }

            const attributeValues = Array.from(allValues);
            const myFormData = new FormData();
            myFormData.append('name', filter.name);
            myFormData.append('buttonType', filter.buttonType);
            myFormData.append('kategoryId', filter.kategoryId);
            myFormData.append('addition', filter.addition || '');
            myFormData.append('attributeValues', JSON.stringify(attributeValues));
            await updateFilter(filter.id, myFormData);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const myFormData = new FormData();
            // ... (код отправки формы без изменений) ...
            if (editingItem) {
                myFormData.append("mainKategoryId", formData.mainKategoryId);
                myFormData.append("kategoryId", formData.kategoryId);
                myFormData.append("name", formData.name);
                formData.imageFiles.forEach(file => {
                    myFormData.append("images", file);
                });
                formData.images.forEach(image => {
                    myFormData.append('imageStrings', image);
                });
                myFormData.append("video", formData.video);
                myFormData.append("price", formData.price);
                myFormData.append("description", formData.description);
                myFormData.append("specificationsJSONB", JSON.stringify(formData.specifications));
                myFormData.append("isExist", formData.isExist);
                myFormData.append("isShowed", formData.isShowed);
                await updateItemById(editingItem.id, myFormData)
            } else {
                myFormData.append("mainKategoryId", formData.mainKategoryId);
                myFormData.append("kategoryId", formData.kategoryId);
                myFormData.append("name", formData.name);
                formData.imageFiles.forEach(file => {
                    myFormData.append("images", file);
                });
                myFormData.append("video", formData.video);
                myFormData.append("price", formData.price);
                myFormData.append("description", formData.description);
                myFormData.append("specificationsJSONB", JSON.stringify(formData.specifications));
                myFormData.append("isExist", formData.isExist);
                myFormData.append("isShowed", formData.isShowed);
                await postItem(myFormData);
                alert('Данные успешно добавлены');

            }

            await updateFilterAttributeValues(formData.specifications, editingItem ? editingItem.specificationsJSONB : {});
            alert('Данные успешно добавлены');
            closeModal();
            window.location.reload();
        } catch (error) {
            alert('Ошибка добавления сделай скрин и отправь мне:', error);
            if (error.response && error.response.status === 413) {
                alert("Ошибка: Слишком большой размер загружаемых файлов!");
            } else {
                alert("Произошла ошибка при сохранении.");
            }
        }
    };

    const handleSubmitWithoutClose = async (e) => {
        e.preventDefault();
        try {
            const myFormData = new FormData();
            // ... (код отправки формы без изменений) ...
            if (editingItem) {
                myFormData.append("mainKategoryId", formData.mainKategoryId);
                myFormData.append("kategoryId", formData.kategoryId);
                myFormData.append("name", formData.name);
                formData.imageFiles.forEach(file => {
                    myFormData.append("images", file);
                });
                formData.images.forEach(image => {
                    myFormData.append('imageStrings', image);
                });
                myFormData.append("video", formData.video);
                myFormData.append("price", formData.price);
                myFormData.append("description", formData.description);
                myFormData.append("specificationsJSONB", JSON.stringify(formData.specifications));
                myFormData.append("isExist", formData.isExist);
                myFormData.append("isShowed", formData.isShowed);
                await updateItemById(editingItem.id, myFormData)
            } else {
                myFormData.append("mainKategoryId", formData.mainKategoryId);
                myFormData.append("kategoryId", formData.kategoryId);
                myFormData.append("name", formData.name);
                formData.imageFiles.forEach(file => {
                    myFormData.append("images", file);
                });
                myFormData.append("video", formData.video);
                myFormData.append("price", formData.price);
                myFormData.append("description", formData.description);
                myFormData.append("specificationsJSONB", JSON.stringify(formData.specifications));
                myFormData.append("isExist", formData.isExist);
                myFormData.append("isShowed", formData.isShowed);
                await postItem(myFormData);
            }

            await updateFilterAttributeValues(formData.specifications, editingItem ? editingItem.specificationsJSONB : {});
            alert('Данные успешно добавлены');

        } catch (error) {
            alert('Ошибка добавления сделай скрин и отправь мне:', error);
            if (error.response && error.response.status === 413) {
                alert("Ошибка: Слишком большой размер загружаемых файлов!");
            } else {
                alert("Произошла ошибка при сохранении.");
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы дейтвительно хотите удалить данный товар?')) {
            try {
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
            } catch (error) {
                console.error('Error deleting item:', error);
            }
        }
    };

    const getMainCategoryName = (mainKategoryId) => {
        const mainCat = mainCategories.find(cat => cat.id === mainKategoryId);
        return mainCat ? mainCat.name : 'Unknown';
    };

    const getCategoryName = (kategoryId) => {
        const category = allCategories.find(cat => cat.id === kategoryId);
        return category ? category.name : 'Unknown';
    };

    return (
        <div className="adminItemTable">
            <div className="admin-header">
                <h1>Товары</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Название товара..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button onClick={openAddModal} className="add-button">
                    Добавить товар
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
                            <th onClick={() => requestSort('mainKategoryId')} style={{ cursor: 'pointer' }}>
                                Главная категория{getSortIndicator('mainKategoryId')}
                            </th>
                            <th onClick={() => requestSort('kategoryId')} style={{ cursor: 'pointer' }}>
                                Категория{getSortIndicator('kategoryId')}
                            </th>
                            <th>Фото</th> {/* Фото обычно не сортируют */}
                            <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                                Название{getSortIndicator('name')}
                            </th>
                            <th onClick={() => requestSort('price')} style={{ cursor: 'pointer' }}>
                                Цена{getSortIndicator('price')}
                            </th>
                            <th onClick={() => requestSort('isExist')} style={{ cursor: 'pointer' }}>
                                В наличии{getSortIndicator('isExist')}
                            </th>
                            <th onClick={() => requestSort('isShowed')} style={{ cursor: 'pointer' }}>
                                Показан{getSortIndicator('isShowed')}
                            </th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map(item => (
                            <tr key={item.id}>
                                <td>{item.id}</td>
                                <td>{getMainCategoryName(item.mainKategoryId)}</td>
                                <td>{getCategoryName(item.kategoryId)}</td>
                                <td>
                                    <div className="image-preview">
                                        <img src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`} alt="Item" className="preview-image" />
                                    </div>
                                </td>
                                <td className='td_name'>{item.name}</td>
                                <td>{item.price}</td>
                                <td>{item.isExist ? 'Да' : 'Нет'}</td>
                                <td>{item.isShowed ? 'Да' : 'Нет'}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => openEditModal(item)}
                                        className="edit-button"
                                    >
                                        Редактировать
                                    </button>
                                    <button
                                        onClick={() => handleDelete(item.id)}
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
                    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingItem ? 'Редактирования' : 'Добавление'}</h2>
                        <form onSubmit={handleSubmit} className="item-form">
                            {/* ... (форма осталась без изменений) ... */}
                            <div className="form-row">
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
                                    <label htmlFor="price">Цена:</label>
                                    <input
                                        type="text"
                                        id="price"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleInputChange}
                                        required
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="mainKategoryId">Главная категория:</label>
                                    <select
                                        id="mainKategoryId"
                                        name="mainKategoryId"
                                        value={formData.mainKategoryId}
                                        onChange={handleMainCategoryChange}
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

                                <div className="form-group">
                                    <label htmlFor="kategoryId">Категория:</label>
                                    <select
                                        id="kategoryId"
                                        name="kategoryId"
                                        value={formData.kategoryId}
                                        onChange={handleCategoryChange}
                                        className="form-select"
                                        required
                                        disabled={!formData.mainKategoryId || categoriesByMain.length === 0}
                                    >
                                        <option value="">Выберите категорию</option>
                                        {categoriesByMain.map(category => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {!formData.mainKategoryId && (
                                        <div className="form-hint">Сначала выберите главную категорию</div>
                                    )}
                                    {formData.mainKategoryId && categoriesByMain.length === 0 && (
                                        <div className="form-hint">Нет категорий для выбранной главной категории</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isExist"
                                            checked={formData.isExist}
                                            onChange={handleInputChange}
                                            className="form-checkbox"
                                        />
                                        В наличии
                                    </label>
                                </div>

                                <div className="form-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            name="isShowed"
                                            checked={formData.isShowed}
                                            onChange={handleInputChange}
                                            className="form-checkbox"
                                        />
                                        Показан
                                    </label>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Описание:</label>
                                <ReactQuill
                                    theme="snow"
                                    value={formData.description}
                                    onChange={handleDescriptionChange}
                                    className="form-quill" 
                                    modules={{
                                        toolbar: [
                                            [{ 'header': [1, 2, false] }],
                                            ['bold', 'italic', 'underline', 'strike'],
                                            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                            ['clean'] // Кнопка очистки форматирования
                                        ],
                                    }}
                                />
                            </div>

                            <div className="form-group full-width">
                                <label>Картинки:</label>
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

                            <div className="form-group full-width">
                                <label>Видео:</label>
                                <div className="video-container">
                                    {formData.videoUrl && (
                                        <div className="video-preview">
                                            <video
                                                src={formData.videoUrl.startsWith('blob:')
                                                    ? formData.videoUrl
                                                    : `${process.env.REACT_APP_API_URL}static/video/${formData.videoUrl}`}
                                                controls
                                                className="video-element"
                                            />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={triggerVideoInput}
                                        className="video-upload-button"
                                    >
                                        {formData.videoUrl ? 'Change Video' : 'Upload Video'}
                                    </button>
                                    <input
                                        type="file"
                                        ref={videoInputRef}
                                        onChange={handleVideoChange}
                                        accept="video/*"
                                        style={{ display: 'none' }}
                                    />
                                </div>
                            </div>
                            {filtersForCategory.length > 0 && (
                                <div className="form-group full-width">
                                    <label>Характеристики:</label>
                                    <div className="specifications-container">
                                        {filtersForCategory.map(filter => {
                                            const currentSpecValue = formData.specifications[filter.name] || '';

                                            if (filter.buttonType === 'check') {
                                                return (
                                                    <div key={filter.id} className="specification-item">
                                                        <label className="checkbox-label">
                                                            <input
                                                                type="checkbox"
                                                                checked={currentSpecValue === 'true'}
                                                                onChange={(e) => handleSpecificationChange(filter.name, e.target.checked ? 'true' : 'false')}
                                                                className="form-checkbox"
                                                            />
                                                            {filter.name}
                                                        </label>
                                                    </div>
                                                );
                                            } else if (filter.buttonType === 'select') {
                                                const attributeValues = Array.isArray(filter.attributeValues) ? filter.attributeValues : [];
                                                const showCustomInput = currentSpecValue && !attributeValues.includes(currentSpecValue);

                                                return (
                                                    <div key={filter.id} className="specification-item">
                                                        <label htmlFor={`spec-${filter.name}`}>{filter.name}:</label>
                                                        <select
                                                            id={`spec-${filter.name}`}
                                                            value={currentSpecValue}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (value === '__custom__') {
                                                                    handleSpecificationChange(filter.name, '');
                                                                } else {
                                                                    handleSpecificationChange(filter.name, value);
                                                                }
                                                            }}
                                                            className="form-select"
                                                        >
                                                            <option value="">Выберите значение</option>
                                                            {attributeValues.map((val, index) => (
                                                                <option key={index} value={val}>
                                                                    {val}
                                                                </option>
                                                            ))}
                                                            <option value="__custom__">➕ Добавить значение</option>
                                                        </select>

                                                        {(showCustomInput || currentSpecValue === '') && (
                                                            <input
                                                                type="text"
                                                                value={currentSpecValue}
                                                                onChange={(e) => handleSpecificationChange(filter.name, e.target.value)}
                                                                placeholder="Введите новое значение"
                                                                className="form-input custom-value-input"
                                                            />
                                                        )}
                                                    </div>
                                                );
                                            } else if (filter.buttonType === 'number') {
                                                return (
                                                    <div key={filter.id} className="specification-item">
                                                        <label htmlFor={`spec-${filter.name}`}>{filter.name}:</label>
                                                        <div className="number-with-addition">
                                                            <input
                                                                type="number"
                                                                id={`spec-${filter.name}`}
                                                                value={currentSpecValue}
                                                                onChange={(e) => handleSpecificationChange(filter.name, e.target.value)}
                                                                className="form-input number-input"
                                                                placeholder="Введите число"
                                                            />
                                                            {filter.addition && (
                                                                <span className="addition-suffix">{filter.addition}</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            } else {
                                                return (
                                                    <div key={filter.id} className="specification-item">
                                                        <label htmlFor={`spec-${filter.name}`}>{filter.name}:</label>
                                                        <input
                                                            type="text"
                                                            id={`spec-${filter.name}`}
                                                            value={currentSpecValue}
                                                            onChange={(e) => handleSpecificationChange(filter.name, e.target.value)}
                                                            className="form-input"
                                                        />
                                                    </div>
                                                );
                                            }
                                        })}
                                    </div>
                                </div>
                            )}

                            <div className="modal-buttons">
                                <button type="button" onClick={() => confirmAndCloseModal()} className="cancel-button">
                                    Отмена
                                </button>
                                {!editingItem ?
                                    <button type="button" onClick={(e) => handleSubmitWithoutClose(e)} className="save-button">
                                        Добавить без сброса
                                    </button>
                                    : <></>
                                }
                                <button type="submit" className="save-button">
                                    {editingItem ? 'Обновить' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ItemTable;