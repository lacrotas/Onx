import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllItemByKategoryId } from '../../../http/itemApi';
import { fetchAllFiltersByKategoryId } from "../../../http/filterApi";
import { fetchKategoryById, fetchMainKategoryById } from "../../../http/KategoryApi";
import "./ItemPageKategory.scss";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import { ITEM_PREVIEW_ROUTE, BUSKET_ROUTE, ITEM_MAIN_ROUTE } from "../../appRouter/Const"; 
import { NavLink } from "react-router-dom";
import { useHistory } from 'react-router-dom';
import { FaSort } from "react-icons/fa";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { LiaFilterSolid } from "react-icons/lia";
import { FiX, FiCheck, FiShoppingCart } from "react-icons/fi"; // Добавил FiCheck
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import jwt_decode from 'jwt-decode'; // Добавил для декодирования токена
import { updateBusket, fetchBusketByUserId } from '../../../http/busketApi'; // Добавил API корзины

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
    
    // Храним ID товаров, которые уже в корзине (для быстрого поиска)
    const [cartItemIds, setCartItemIds] = useState(new Set());

    // breadcrubs
    const [category, setCategory] = useState(null);
    const [mainCategory, setMainCategory] = useState(null);
    // фильтры
    const [openFilters, setOpenFilters] = useState({});
    const [mobileFilters, setMobileFilters] = useState(false);
    
    const toggleFilter = (filterId) => {
        setOpenFilters(prev => ({
            ...prev,
            [filterId]: !prev[filterId]
        }));
    };
    
    // сортировка
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);

    // --- ЛОГИКА КОРЗИНЫ ---

    // 1. Функция загрузки содержимого корзины (возвращает Set из ID)
    const fetchCartItems = async () => {
        const idsInCart = new Set();
        try {
            const userId = localStorage.getItem('token');
            
            if (userId) {
                // Авторизованный пользователь
                const busket = await fetchBusketByUserId(jwt_decode(userId).id);
                const currentItems = busket.itemsJsonb || [];
                
                // Синхронизация с localStorage (как мы делали в карточке товара)
                const itemsForLocalStorage = currentItems.map(item => ({
                    id: item.itemId || item.id,
                    count: item.count || 1
                }));
                localStorage.setItem('basket', JSON.stringify(itemsForLocalStorage));

                currentItems.forEach(item => {
                    idsInCart.add(String(item.itemId || item.id));
                });
            } else {
                // Гость
                const savedBasket = localStorage.getItem('basket');
                if (savedBasket) {
                    const parsedBasket = JSON.parse(savedBasket);
                    if (Array.isArray(parsedBasket)) {
                        parsedBasket.forEach(item => {
                            idsInCart.add(String(item.itemId || item.id));
                        });
                    }
                }
            }
            setCartItemIds(idsInCart);
        } catch (e) {
            console.error("Ошибка при проверке корзины:", e);
        }
    };

    // 2. Обработчик клика по кнопке "В корзину"
    const handleAddToCart = async (e, item) => {
        e.preventDefault(); // ВАЖНО: Предотвращаем переход по ссылке NavLink
        e.stopPropagation(); // Останавливаем всплытие события

        const itemIdStr = String(item.id);

        // Если товар уже в корзине — переходим в корзину
        if (cartItemIds.has(itemIdStr)) {
            history.push(BUSKET_ROUTE);
            return;
        }

        try {
            const userId = localStorage.getItem('token');
            
            // Логика добавления (Сервер)
            if (userId) {
                const busket = await fetchBusketByUserId(jwt_decode(userId).id);
                const currentItems = busket.itemsJsonb ? [...busket.itemsJsonb] : [];
                
                // Проверка на дубликат на всякий случай
                if (!currentItems.some(i => String(i.itemId || i.id) === itemIdStr)) {
                    currentItems.push({ itemId: item.id, count: 1 });
                    await updateBusket(busket.id, { itemsJsonb: currentItems });
                }
            }

            // Логика добавления (LocalStorage)
            let existingBasket = [];
            const savedBasket = localStorage.getItem('basket');
            if (savedBasket) {
                try { existingBasket = JSON.parse(savedBasket); } catch (e) {}
            }
            
            if (!existingBasket.some(i => String(i.itemId || i.id) === itemIdStr)) {
                const updatedBasket = [...existingBasket, { id: item.id, count: 1 }];
                localStorage.setItem('basket', JSON.stringify(updatedBasket));
            }

            // Обновляем локальный стейт (чтобы кнопка сразу позеленела)
            setCartItemIds(prev => new Set(prev).add(itemIdStr));
            
            // Событие для обновления хедера
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Ошибка при добавлении товара');
        }
    };

    // --- КОНЕЦ ЛОГИКИ КОРЗИНЫ ---

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

                    const initialOpenFilters = {};
                    filtersArray.forEach(filter => {
                        if (filter.buttonType !== 'check') {
                            initialOpenFilters[filter.id] = true;
                        }
                    });
                    setOpenFilters(initialOpenFilters);

                    await loadItems();
                    // Загружаем состояние корзины
                    await fetchCartItems();
                }
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setError('Ошибка загрузки данных');
            } finally {
                setLoading(false);
            }
        };

        loadData();
        // eslint-disable-next-line
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
            const [field, newValue] = args;
            setSelectedFilters(prev => {
                const current = prev[filterId] || { min: '', max: '' };
                return {
                    ...prev,
                    [filterId]: {
                        ...current,
                        [field]: newValue
                    }
                };
            });
        }
        else if (filter.buttonType === 'check') {
            const [checked] = args;
            setSelectedFilters(prev => ({
                ...prev,
                [filterId]: checked
            }));
        }
        else if (filter.buttonType === 'select') {
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

    const filteredItems = useMemo(() => {
        let result = [...items];

        Object.entries(selectedFilters).forEach(([filterId, filterValue]) => {
            const filter = filters.find(f => f.id === parseInt(filterId));
            if (!filter || !filter.name) return;

            if (filter.buttonType === 'number') {
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
            <div onClick={() => setMobileFilters(!mobileFilters)} className={mobileFilters ? 'filters-list_back open' : 'filters-list_back close'}></div>

            <div className="item-page-kategory">

                <div className="main-layout">
                    {/* Левая панель с фильтрами */}
                    {filteredAndSortedItems.length > 0 ?
                        <>
                            <div onClick={() => setMobileFilters(!mobileFilters)} className={!mobileFilters ? 'filters-list_button open' : 'filters-list_button close'}>
                                <LiaFilterSolid className="icon" />
                            </div>
                            <div className={mobileFilters ? 'filters-list open' : 'filters-list close'}>
                                <div onClick={() => setMobileFilters(!mobileFilters)} className="filters-list_close">
                                    <FiX size={24} />
                                </div>

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
                                <div className="filter-item filter-item_button my_p_small" onClick={() => setSelectedFilters({})}>
                                    Сбросить фильтры
                                </div>
                            </div>
                        </>
                        : <></>}
                    {/* Основной контент */}
                    <div className="item-page-kategory_main-content">
                        <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategory.name, path: ITEM_MAIN_ROUTE + "/" + mainCategory.id }, { title: category.name }]} />
                        <div className='main-content_header'>
                            <h1 className='item-page-kategory_label my_h2'>{category ? category.name : 'Категория'}</h1>
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
                                <>
                                    {!filteredAndSortedItems.length > 0 ?
                                        < div className="no-items">
                                            Товары не найдены
                                        </div>
                                        : <></>
                                    }
                                    <div className="items-grid">
                                        {
                                            filteredAndSortedItems.map(item => {
                                                // Проверяем, есть ли этот товар в корзине
                                                const isInCart = cartItemIds.has(String(item.id));

                                                return (
                                                    <NavLink
                                                        key={item.id}
                                                        className="subcategory-title"
                                                        to={{
                                                            pathname: `${ITEM_PREVIEW_ROUTE}/${item.id}`,
                                                            state: { path: [item.id] }
                                                        }}
                                                        // onClick={() => handleClick([item.id])}
                                                    >
                                                        <div className="item-card">
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
                                                                <div className="item-status">
                                                                    {item.isExist ? (
                                                                        <>
                                                                            <span className="in-stock my_p_small">В наличии</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <span className="out-of-stock  my_p_small">Нет в наличии</span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <h3 className="item-name">{item.name}</h3>
                                                                <div className="item-price my_h3">
                                                                    {item.price} Byn
                                                                </div>
                                                                <div className={item.isExist ? "item-buy" : "item-buy_no"}>
                                                                    {/* КНОПКА В КОРЗИНУ */}
                                                                    <div 
                                                                        className='item-buy_button'
                                                                        onClick={(e) => handleAddToCart(e, item)}
                                                                        style={isInCart ? { backgroundColor: '#3aa41d', borderColor: '#3aa41d', color: 'white' } : {}}
                                                                    >
                                                                        {isInCart ? <FiCheck className='button_icon' size={15} /> : <FiShoppingCart className='button_icon' size={15} />}
                                                                        <p className='item_status-button my_p_small'>
                                                                            {isInCart ? 'В корзине' : 'В корзину'}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </NavLink>
                                                );
                                            })
                                        }
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div >
            <Footer />
        </>
    );
};

export default ItemPageKategory;