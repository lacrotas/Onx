// ItemTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchAllMainKategory, fetchAllKategory, fetchAllKategoryByMainKategoryId } from '../../../http/KategoryApi';
import { fetchAllItem, postItem, deleteItemById, updateItemById } from '../../../http/itemApi';
import { fetchAllFiltersByKategoryId, updateFilter } from '../../../http/filterApi';
import "./ItemTable.scss";

const ItemTable = () => {
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);
    const [allCategories, setAllCategories] = useState([]); // все категории
    const [categoriesByMain, setCategoriesByMain] = useState([]); // категории по выбранной главной категории
    const [searchTerm, setSearchTerm] = useState('');
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

    // Filter items based on search term
    useEffect(() => {
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
    }, [searchTerm, items]);

    // Загружаем категории при изменении главной категории в форме
    useEffect(() => {
        if (formData.mainKategoryId) {
            loadCategoriesByMainCategory(formData.mainKategoryId);
        } else {
            setCategoriesByMain([]);
        }
    }, [formData.mainKategoryId]);

    const loadItems = async () => {
        try {
            const data = await fetchAllItem();
            setItems(data);
            setFilteredItems(data);
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

            // Если текущая выбранная категория не принадлежит этой главной категории, сбрасываем её
            if (formData.kategoryId && !data.some(cat => cat.id === formData.kategoryId)) {
                setFormData(prev => ({
                    ...prev,
                    kategoryId: data.length > 0 ? data[0].id : ''
                }));

                // Также сбрасываем фильтры
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

            // Создаем новый объект спецификаций на основе фильтров
            const newSpecs = {};
            data.forEach(filter => {
                // Используем существующее значение или пустую строку
                newSpecs[filter.name] = existingSpecifications[filter.name] || '';
            });

            console.log('Setting specifications:', newSpecs);
            setFormData(prev => ({
                ...prev,
                specifications: newSpecs
            }));
        } catch (error) {
            console.error('Error loading filters for category:', error);
            setFiltersForCategory([]);
        }
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

        // Загружаем категории для выбранной главной категории
        if (initialMainCategoryId) {
            loadCategoriesByMainCategory(initialMainCategoryId);
        }
    };

    const openEditModal = (item) => {
        console.log('Editing item:', item);
        console.log('Item specifications:', item.specificationsJSONB);

        setEditingItem(item);

        const itemImages = Array.isArray(item.images) ? item.images : [];
        const itemVideo = item.video || '';
        const itemSpecifications = item.specificationsJSONB || {};

        // Сначала устанавливаем базовые данные
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
            specifications: itemSpecifications // сразу устанавливаем спецификации
        };

        setFormData(initialFormData);
        setIsModalOpen(true);

        // Затем загружаем категории
        if (item.mainKategoryId) {
            loadCategoriesByMainCategory(item.mainKategoryId);
        }

        // И сразу загружаем фильтры с существующими спецификациями
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSpecificationChange = (filterNameOrFilter, value) => {
        let filterName;
        if (typeof filterNameOrFilter === 'string') {
            filterName = filterNameOrFilter;
        } else {
            // Это объект фильтра
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
            kategoryId: '' // сбрасываем выбор категории при изменении главной категории
        }));
        // useEffect автоматически вызовет loadCategoriesByMainCategory
    };

    const handleCategoryChange = (e) => {
        const value = e.target.value;

        // Сохраняем текущие спецификации
        const currentSpecs = formData.specifications;

        setFormData(prev => ({
            ...prev,
            kategoryId: value
        }));

        // Передаем текущие спецификации при загрузке фильтров
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
        // Получаем все фильтры для текущей категории
        const allFilters = await fetchAllFiltersByKategoryId(formData.kategoryId);

        // Для каждого фильтра обновляем его attributeValues
        for (const filter of allFilters) {
            // Получаем все товары в этой категории
            const categoryItems = items.filter(item => item.kategoryId === formData.kategoryId);

            // Собираем все значения для текущего фильтра
            const allValues = new Set();

            // Добавляем значения из существующих товаров
            categoryItems.forEach(item => {
                if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                    allValues.add(item.specificationsJSONB[filter.name]);
                }
            });

            // Добавляем новое значение из текущего товара
            if (newSpecifications[filter.name]) {
                allValues.add(newSpecifications[filter.name]);
            }

            // Удаляем старое значение, если товар редактируется и значение изменилось
            if (editingItem && oldSpecifications[filter.name] && oldSpecifications[filter.name] !== newSpecifications[filter.name]) {
                allValues.delete(oldSpecifications[filter.name]);
            }

            // Преобразуем в массив
            const attributeValues = Array.from(allValues);

            // Обновляем фильтр
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

            // Обновляем attributeValues для фильтров
            await updateFilterAttributeValues(formData.specifications, editingItem ? editingItem.specificationsJSONB : {});

            closeModal();
            window.location.reload();
        } catch (error) {
            console.error('Error saving item:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Вы дейтвительно хотите удалить данный товар?')) {
            try {
                // Получаем товар перед удалением для получения его спецификаций
                const itemToDelete = items.find(item => item.id === id);

                await deleteItemById(id);

                // Обновляем attributeValues для фильтров после удаления
                if (itemToDelete && itemToDelete.specificationsJSONB) {
                    // Получаем все товары в той же категории
                    const categoryItems = items.filter(item => item.id !== id && item.kategoryId === itemToDelete.kategoryId);

                    // Для каждого фильтра в категории обновляем attributeValues
                    const allFilters = await fetchAllFiltersByKategoryId(itemToDelete.kategoryId);

                    for (const filter of allFilters) {
                        const allValues = new Set();

                        // Добавляем значения из оставшихся товаров
                        categoryItems.forEach(item => {
                            if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                                allValues.add(item.specificationsJSONB[filter.name]);
                            }
                        });

                        // Преобразуем в массив
                        const attributeValues = Array.from(allValues);

                        // Обновляем фильтр
                        const myFormData = new FormData();
                        myFormData.append('name', filter.name);
                        myFormData.append('buttonType', filter.buttonType);
                        myFormData.append('kategoryId', filter.kategoryId);
                        myFormData.append('addition', filter.addition || '');
                        myFormData.append('attributeValues', JSON.stringify(attributeValues));

                        await updateFilter(filter.id, myFormData);
                    }
                }

                // Обновляем локальный список товаров
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
                        <tr>
                            <th>ID</th>
                            <th>Главная категория</th>
                            <th>Категория</th>
                            <th>Фото</th>
                            <th>Название</th>
                            <th>Цена</th>
                            <th>В наличии</th>
                            <th>Показан</th>
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
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
                        <h2>{editingItem ? 'Редактирования' : 'Добавление'}</h2>
                        <form onSubmit={handleSubmit} className="item-form">
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
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    rows="4"
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
                                <button type="button" onClick={closeModal} className="cancel-button">
                                    Отмена
                                </button>
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