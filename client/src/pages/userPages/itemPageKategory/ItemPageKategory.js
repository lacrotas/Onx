import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllItemByKategoryId } from '../../../http/itemApi';
import { fetchAllFiltersByKategoryId } from "../../../http/filterApi";
import { fetchKategoryById, fetchMainKategoryById } from "../../../http/KategoryApi";
import "./ItemPageKategory.scss";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import { ITEM_PREVIEW_ROUTE } from "../../appRouter/Const";
import { NavLink } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import { FaSort } from "react-icons/fa";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import { ITEM_MAIN_ROUTE } from "../../appRouter/Const";

const ItemPageKategory = () => {
    const history = useHistory();
    const { categoryId } = useParams();
    const [items, setItems] = useState([]);
    const [filters, setFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [sortOption, setSortOption] = useState('default');
    const [selectedFilters, setSelectedFilters] = useState({});
    // breadcrubs
    const [category, setCategory] = useState(null);
    const [mainCategory, setMainCategory] = useState(null);
    // фильтры
    const [openFilters, setOpenFilters] = useState({});
    const toggleFilter = (filterId) => {
        setOpenFilters(prev => ({
            ...prev,
            [filterId]: !prev[filterId]
        }));
    };
    // сортировка
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sortRef.current && !sortRef.current.contains(event.target)) {
                setIsSortOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (categoryId) {
                    const categoryData = await fetchKategoryById(categoryId);
                    const mainCategoryData = await fetchMainKategoryById(categoryData.mainKategoryId);

                    setCategory(categoryData);
                    setMainCategory(mainCategoryData);
                }

                if (categoryId) {
                    const filtersData = await fetchAllFiltersByKategoryId(categoryId);
                    const filtersArray = Array.isArray(filtersData) ? filtersData : [];
                    setFilters(filtersArray);

                    // 🟢 Открыть все фильтры по умолчанию
                    const initialOpenFilters = {};
                    filtersArray.forEach(filter => {
                        // Только если это не checkbox (т.к. у них нет toggle-состояния)
                        if (filter.buttonType !== 'check') {
                            initialOpenFilters[filter.id] = true;
                        }
                    });
                    setOpenFilters(initialOpenFilters);

                    await loadItems();
                }
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setError('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [categoryId]);

    const loadItems = async () => {
        if (!categoryId) return;

        setItemsLoading(true);
        try {
            const data = await fetchAllItemByKategoryId(categoryId);
            setItems(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Ошибка загрузки товаров:', err);
            setError('Ошибка загрузки товаров');
            setItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    const sortItems = (itemsToSort) => {
        const sortedItems = [...itemsToSort];
        switch (sortOption) {
            case 'price-asc':
                return sortedItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            case 'price-desc':
                return sortedItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            case 'rating':
                return sortedItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default:
                return sortedItems;
        }
    };

    // Получаем все уникальные значения для каждого фильтра типа select
    const getFilterValues = (filter) => {
        if (!filter.name) return [];
        const values = new Set();
        items.forEach(item => {
            if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                values.add(item.specificationsJSONB[filter.name]);
            }
        });
        return Array.from(values);
    };

    // Получаем min и max для фильтра типа number
    const getNumberRange = (filter) => {
        if (!filter.name) return { min: 0, max: 0 };
        let min = Infinity;
        let max = -Infinity;
        let hasValues = false;

        items.forEach(item => {
            if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                const value = parseFloat(item.specificationsJSONB[filter.name]);
                if (!isNaN(value)) {
                    hasValues = true;
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                }
            }
        });

        return hasValues ? { min, max } : { min: 0, max: 0 };
    };

    const handleFilterChange = (filterId, ...args) => {
        const filter = filters.find(f => f.id === filterId);
        if (!filter) return;

        if (filter.buttonType === 'number') {
            // args: ['min', '150'] или ['max', '300']
            const [field, newValue] = args;
            setSelectedFilters(prev => {
                const current = prev[filterId] || { min: '', max: '' };
                return {
                    ...prev,
                    [filterId]: {
                        ...current,
                        [field]: newValue // 'min': '150'
                    }
                };
            });
        }
        else if (filter.buttonType === 'check') {
            // args: [true] или [false]
            const [checked] = args;
            setSelectedFilters(prev => ({
                ...prev,
                [filterId]: checked
            }));
        }
        else if (filter.buttonType === 'select') {
            // args: ['Red', true] или ['Red', false]
            const [value, isChecked] = args;
            setSelectedFilters(prev => {
                const currentValues = Array.isArray(prev[filterId]) ? prev[filterId] : [];
                let newValues;
                if (isChecked) {
                    if (!currentValues.includes(value)) {
                        newValues = [...currentValues, value];
                    } else {
                        newValues = currentValues;
                    }
                } else {
                    newValues = currentValues.filter(v => v !== value);
                }
                return {
                    ...prev,
                    [filterId]: newValues.length > 0 ? newValues : null
                };
            });
        }
    };

    // Фильтрация товаров
    const filteredItems = useMemo(() => {
        let result = [...items];

        // Применяем фильтры
        Object.entries(selectedFilters).forEach(([filterId, filterValue]) => {
            const filter = filters.find(f => f.id === parseInt(filterId));
            if (!filter || !filter.name) return;

            if (filter.buttonType === 'number') {
                // Числовые фильтры
                const { min, max } = filterValue;
                if (min !== '' || max !== '') {
                    result = result.filter(item => {
                        const itemValue = item.specificationsJSONB?.[filter.name];
                        if (itemValue === undefined || itemValue === null) return false;

                        const numValue = parseFloat(itemValue);
                        if (isNaN(numValue)) return false;

                        const minNum = min !== '' ? parseFloat(min) : -Infinity;
                        const maxNum = max !== '' ? parseFloat(max) : Infinity;

                        return numValue >= minNum && numValue <= maxNum;
                    });
                }
            } else if (filter.buttonType === 'check') {
                // Checkbox фильтры
                if (filterValue) {
                    result = result.filter(item => {
                        const itemValue = item.specificationsJSONB?.[filter.name];
                        return itemValue === 'true';
                    });
                }
            } else if (filter.buttonType === 'select') {
                if (Array.isArray(filterValue) && filterValue.length > 0) {
                    result = result.filter(item => {
                        const itemValue = item.specificationsJSONB?.[filter.name];
                        return itemValue !== undefined && filterValue.includes(itemValue);
                    });
                }
            }
        });

        return result;
    }, [items, selectedFilters, filters]);

    const filteredAndSortedItems = useMemo(() => {
        return sortItems(filteredItems);
    }, [filteredItems, sortOption]);

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating || 0);
        for (let i = 4; i > 0; i--) {
            stars.push(
                <span
                    key={i}
                    className={`star ${i <= roundedRating ? 'filled' : 'empty'}`}
                >
                    ★
                </span>
            );
        }
        return stars;
    };

    if (loading) {
        return (
            <>
                <Header isAdminHeader={false} />
                <div className="loading">Загрузка данных...</div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header isAdminHeader={false} />
                <div className="error">{error}</div>
                <Footer />
            </>
        );
    }
    const handleClick = (newPath) => {
        history.push({
            pathname: ITEM_PREVIEW_ROUTE,
            state: { path: newPath },
        });
    };
    return (
        <>
            <Header isAdminHeader={false} />
            <div className="item-page-kategory">
                <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategory.name, path: ITEM_MAIN_ROUTE + "/" + mainCategory.id }, { title: category.name }]} />

                <div className="main-layout">
                    {/* Левая панель с фильтрами */}
                    <div className="filters-list">

                        {filters.map(filter => {
                            const isOpen = openFilters[filter.id] || false;

                            if (filter.buttonType === 'select') {
                                const filterValues = getFilterValues(filter);
                                const selectedValues = selectedFilters[filter.id] || [];
                                const isOpen = openFilters[filter.id] || false;

                                return (
                                    <div key={filter.id} className="filter-item">
                                        <div
                                            className="filter-header"
                                            onClick={() => toggleFilter(filter.id)}
                                        >
                                            <h4 className='my_p_small'>
                                                {filter.name}
                                                {selectedValues.length > 0 && (
                                                    <span className="filter-count"> ({selectedValues.length})</span>
                                                )}
                                            </h4>
                                            {isOpen ? <IoIosArrowDown className='filter-header_icon' /> : <IoIosArrowUp className='filter-header_icon' />}
                                        </div>
                                        {isOpen && (
                                            <div className="filter-select-options">
                                                {filterValues.map((value) => (
                                                    <label key={value} className="filter-option my_p_small">
                                                        <input
                                                            className='my_p_small'
                                                            type="checkbox"
                                                            checked={selectedValues.includes(value)}
                                                            onChange={(e) => handleFilterChange(filter.id, value, e.target.checked)}
                                                        />
                                                        {value}
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            } else if (filter.buttonType === 'number') {
                                const { min, max } = getNumberRange(filter);
                                const currentValues = selectedFilters[filter.id] || { min: '', max: '' };
                                return (
                                    <div key={filter.id} className="filter-item">
                                        <div
                                            className="filter-header"
                                            onClick={() => toggleFilter(filter.id)}
                                        >
                                            <h4 className='my_p_small'>{`${filter.name} (${filter.addition})`}</h4>
                                            {isOpen ? <IoIosArrowDown className='filter-header_icon' /> : <IoIosArrowUp className='filter-header_icon' />}
                                        </div>
                                        {isOpen && (
                                            <div className="number-range-filter">
                                                <div className="range-input">
                                                    <input
                                                        type="number"
                                                        placeholder={`от ${min}`}
                                                        value={currentValues.min}
                                                        onChange={(e) => handleFilterChange(filter.id, 'min', e.target.value)}
                                                        min={min}
                                                        max={max}
                                                        className="range-input-field left my_p_small"
                                                    />
                                                    <input
                                                        type="number"
                                                        placeholder={`до ${max}`}
                                                        value={currentValues.max}
                                                        onChange={(e) => handleFilterChange(filter.id, 'max', e.target.value)}
                                                        min={min}
                                                        max={max}
                                                        className="range-input-field right my_p_small"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            } else if (filter.buttonType === 'check') {
                                // Чекбоксы остаются всегда видимыми — без раскрывания
                                return (
                                    <div key={filter.id} className="filter-item">
                                        <div className="filter-check">
                                            <label>
                                                <input
                                                    className='my_p_small'
                                                    type="checkbox"
                                                    checked={selectedFilters[filter.id] || false}
                                                    onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                                                />
                                                {filter.name}
                                            </label>
                                        </div>
                                    </div>
                                );
                            } else {
                                return null;
                            }
                        })}
                    </div>

                    {/* Основной контент */}
                    <div className="item-page-kategory_main-content">
                        <div className='main-content_header'>
                            <h1 className='item-page-kategory_label my_h1'>{category ? category.name : 'Категория'}</h1>
                            {/* Блок с сортировкой */}
                            <div className="sorting-section" ref={sortRef}>
                                <div
                                    className="sort-toggle"
                                    onClick={() => setIsSortOpen((prev) => !prev)}
                                >
                                    <FaSort className="icon" />
                                    <p className='my_p_small'>
                                        {sortOption === 'default'
                                            ? 'По умолчанию'
                                            : sortOption === 'price-asc'
                                                ? 'Цена (по возрастанию)'
                                                : sortOption === 'price-desc'
                                                    ? 'Цена (по убыванию)'
                                                    : 'Оценка'}
                                    </p>
                                </div>

                                {isSortOpen && (
                                    <div className="sorting-options">
                                        <button
                                            className={`sort-button ${sortOption === 'default' ? 'active' : ''}`}
                                            onClick={() => setSortOption('default')}
                                        >
                                            По умолчанию
                                        </button>
                                        <button
                                            className={`sort-button ${sortOption === 'price-asc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('price-asc')}
                                        >
                                            Цена (по возрастанию)
                                        </button>
                                        <button
                                            className={`sort-button ${sortOption === 'price-desc' ? 'active' : ''}`}
                                            onClick={() => setSortOption('price-desc')}
                                        >
                                            Цена (по убыванию)
                                        </button>
                                        <button
                                            className={`sort-button ${sortOption === 'rating' ? 'active' : ''}`}
                                            onClick={() => setSortOption('rating')}
                                        >
                                            Оценка
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Товары */}
                        <div className="items-section">
                            {itemsLoading ? (
                                <div className="loading">Загрузка товаров...</div>
                            ) : (
                                <div className="items-grid">
                                    {filteredAndSortedItems.length > 0 ? (
                                        filteredAndSortedItems.map(item => (
                                            <NavLink
                                                className="subcategory-title"
                                                to={{
                                                    pathname: `${ITEM_PREVIEW_ROUTE}/${item.id}`,
                                                    state: { path: [item.id] }
                                                }}
                                                onClick={() => handleClick([item.id])}
                                            >
                                                <div key={item.id} className="item-card">
                                                    <div className="item-image">
                                                        {item.images && Array.isArray(item.images) && item.images.length > 0 ? (
                                                            <img
                                                                src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`}
                                                                alt={item.name}
                                                                onError={(e) => {
                                                                    e.target.src = '/placeholder-image.jpg';
                                                                }}
                                                            />
                                                        ) : (
                                                            <div className="no-image">Нет изображения</div>
                                                        )}
                                                    </div>
                                                    <div className="item-rating">
                                                        <div className="stars">
                                                            {renderStars(item.rating)}
                                                        </div>
                                                    </div>
                                                    <div className="item-info">
                                                        <h3 className="item-name">{item.name}</h3>
                                                        <div className="item-status">
                                                            {item.isExist ? (
                                                                <span className="in-stock">В наличии</span>
                                                            ) : (
                                                                <span className="out-of-stock">Нет в наличии</span>
                                                            )}
                                                        </div>
                                                        <div className="item-price">
                                                            {item.price} руб.
                                                        </div>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        ))
                                    ) : (
                                        <div className="no-items">
                                            Товары не найдены
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ItemPageKategory;