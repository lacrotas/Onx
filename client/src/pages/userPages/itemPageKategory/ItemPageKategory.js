import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { fetchAllItemByKategoryId } from '../../../http/itemApi';
import { fetchAllFiltersByKategoryId } from "../../../http/filterApi";
import { fetchKategoryById, fetchMainKategoryById, fetchAllKategoryByMainKategoryId } from "../../../http/KategoryApi";
import "./ItemPageKategory.scss";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import { ITEM_PREVIEW_ROUTE, BUSKET_ROUTE, ITEM_MAIN_ROUTE, ITEM_KATEGOTY_ROUTE } from "../../appRouter/Const";
import { FaSort } from "react-icons/fa";
import { LiaFilterSolid } from "react-icons/lia";
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import jwt_decode from 'jwt-decode';
import { updateBusket, fetchBusketByUserId } from '../../../http/busketApi';
import ItemCard from './itemCard/ItemCard';
import FilterSidebar from './filterSidebar/FilterSidebar';

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

    const [cartItemIds, setCartItemIds] = useState(new Set());
    const [category, setCategory] = useState(null);
    const [allCategory, setAllCategory] = useState(null);
    const [mainCategory, setMainCategory] = useState(null);
    const [openFilters, setOpenFilters] = useState({});
    const [mobileFilters, setMobileFilters] = useState(false);
    const [isSortOpen, setIsSortOpen] = useState(false);
    const sortRef = useRef(null);

    // Блокировка скролла при открытии фильтров
    useEffect(() => {
        if (mobileFilters) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        // Сброс стиля при размонтировании компонента
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mobileFilters]);

    const toggleFilter = (filterId) => {
        setOpenFilters(prev => ({
            ...prev,
            [filterId]: !prev[filterId]
        }));
    };

    // --- ЛОГИКА КОРЗИНЫ ---
    const fetchCartItems = async () => {
        const idsInCart = new Set();
        try {
            const userId = localStorage.getItem('token');
            if (userId) {
                const busket = await fetchBusketByUserId(jwt_decode(userId).id);
                const currentItems = busket.itemsJsonb || [];
                const itemsForLocalStorage = currentItems.map(item => ({
                    id: item.itemId || item.id,
                    count: item.count || 1
                }));
                localStorage.setItem('basket', JSON.stringify(itemsForLocalStorage));
                currentItems.forEach(item => {
                    idsInCart.add(String(item.itemId || item.id));
                });
            } else {
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

    const handleAddToCart = async (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        const itemIdStr = String(item.id);

        if (cartItemIds.has(itemIdStr)) {
            history.push(BUSKET_ROUTE);
            return;
        }

        try {
            const userId = localStorage.getItem('token');
            if (userId) {
                const busket = await fetchBusketByUserId(jwt_decode(userId).id);
                const currentItems = busket.itemsJsonb ? [...busket.itemsJsonb] : [];
                if (!currentItems.some(i => String(i.itemId || i.id) === itemIdStr)) {
                    currentItems.push({ itemId: item.id, count: 1 });
                    await updateBusket(busket.id, { itemsJsonb: currentItems });
                }
            }

            let existingBasket = [];
            const savedBasket = localStorage.getItem('basket');
            if (savedBasket) {
                try { existingBasket = JSON.parse(savedBasket); } catch (e) { }
            }

            if (!existingBasket.some(i => String(i.itemId || i.id) === itemIdStr)) {
                const updatedBasket = [...existingBasket, { id: item.id, count: 1 }];
                localStorage.setItem('basket', JSON.stringify(updatedBasket));
            }

            setCartItemIds(prev => new Set(prev).add(itemIdStr));
            window.dispatchEvent(new Event('cartUpdated'));

        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Ошибка при добавлении товара');
        }
    };

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
                    const allCategoryData = await fetchAllKategoryByMainKategoryId(categoryData.mainKategoryId);

                    setCategory(categoryData);
                    setMainCategory(mainCategoryData);
                    setAllCategory(Array.isArray(allCategoryData) ? allCategoryData : []);
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
            setError('Ошибка загрузки товаров');
            setItems([]);
        } finally {
            setItemsLoading(false);
        }
    };

    const sortItems = (itemsToSort) => {
        const sortedItems = [...itemsToSort];
        switch (sortOption) {
            case 'price-asc': return sortedItems.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
            case 'price-desc': return sortedItems.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
            case 'rating': return sortedItems.sort((a, b) => (b.rating || 0) - (a.rating || 0));
            default: return sortedItems;
        }
    };

    const handleFilterChange = (filterId, ...args) => {
        const filter = filters.find(f => f.id === filterId);
        if (!filter) return;

        if (filter.buttonType === 'number') {
            const [field, newValue] = args;
            setSelectedFilters(prev => {
                const current = prev[filterId] || { min: '', max: '' };
                return { ...prev, [filterId]: { ...current, [field]: newValue } };
            });
        } else if (filter.buttonType === 'check') {
            const [checked] = args;
            setSelectedFilters(prev => ({ ...prev, [filterId]: checked }));
        } else if (filter.buttonType === 'select') {
            const [value, isChecked] = args;
            setSelectedFilters(prev => {
                const currentValues = Array.isArray(prev[filterId]) ? prev[filterId] : [];
                let newValues;
                if (isChecked) {
                    newValues = !currentValues.includes(value) ? [...currentValues, value] : currentValues;
                } else {
                    newValues = currentValues.filter(v => v !== value);
                }
                return { ...prev, [filterId]: newValues.length > 0 ? newValues : null };
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
                    result = result.filter(item => item.specificationsJSONB?.[filter.name] === 'true');
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
            stars.push(<span key={i} className={`star ${i <= roundedRating ? 'filled' : 'empty'}`}>★</span>);
        }
        return stars;
    };

    if (loading) return <><Header isAdminHeader={false} /><div className="loading">Загрузка данных...</div><Footer /></>;
    if (error) return <Header isAdminHeader={false} /> && <div className="error">{error}</div> && <Footer />;

    return (
        <>
            <Header isAdminHeader={false} />
            <div className="category-page-wrapper">

                {/* Затемнение для мобильных фильтров */}
                <div
                    onClick={() => setMobileFilters(false)}
                    className={mobileFilters ? 'filters-list_back open' : 'filters-list_back close'}
                ></div>


                {mainCategory && category && (
                    <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategory.name, path: ITEM_MAIN_ROUTE + "/" + mainCategory.id }, { title: category.name }]} />
                )}

                <div className="controls-area">
                    {allCategory.map(category => (
                        <NavLink
                            key={category.id}
                            to={{
                                pathname: ITEM_KATEGOTY_ROUTE + "/" + category.id,
                                state: { path: { name: category.name } }
                            }} >
                            <div className={`filter-pill my_p  ${category.id == categoryId ? "active" : ""}`}>{category.name}</div>
                        </NavLink>
                    ))}
                </div>

                <div className="main-container">

                    {items.length > 0 && (
                        <FilterSidebar
                            mobileFilters={mobileFilters}
                            setMobileFilters={setMobileFilters}
                            filters={filters}
                            openFilters={openFilters}
                            toggleFilter={toggleFilter}
                            selectedFilters={selectedFilters}
                            handleFilterChange={handleFilterChange}
                            setSelectedFilters={setSelectedFilters}
                            items={items}
                        />
                    )}

                    <main className="content-area">

                        <div className='main-content_header'>
                            <h1 className='item-page-kategory_label my_h1'>{category ? category.name : 'Категория'}</h1>

                            <div className="header-actions">
                                {items.length > 0 && (
                                    <button className="mobile-filter-btn" onClick={() => setMobileFilters(!mobileFilters)}>
                                        <LiaFilterSolid size={20} />
                                        <span>Фильтры</span>
                                    </button>
                                )}

                                <div className="sorting-section" ref={sortRef}>
                                    <div className="sort-toggle" onClick={() => setIsSortOpen((prev) => !prev)}>
                                        <FaSort className="icon" />
                                        <span className="my_p">
                                            {sortOption === 'default' ? 'По умолчанию' :
                                                sortOption === 'price-asc' ? 'Сначала дешевле' :
                                                    sortOption === 'price-desc' ? 'Сначала дороже' : 'По оценке'}
                                        </span>
                                    </div>

                                    {isSortOpen && (
                                        <div className="sorting-options">
                                            <button className={`my_p ${sortOption === 'default' ? 'active' : ''}`} onClick={() => { setSortOption('default'); setIsSortOpen(false); }}>По умолчанию</button>
                                            <button className={`my_p ${sortOption === 'price-asc' ? 'active' : ''}`} onClick={() => { setSortOption('price-asc'); setIsSortOpen(false); }}>Сначала дешевле</button>
                                            <button className={`my_p ${sortOption === 'price-desc' ? 'active' : ''}`} onClick={() => { setSortOption('price-desc'); setIsSortOpen(false); }}>Сначала дороже</button>
                                            <button className={`my_p ${sortOption === 'rating' ? 'active' : ''}`} onClick={() => { setSortOption('rating'); setIsSortOpen(false); }}>По оценке</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {itemsLoading ? (
                            <div className="loading my_p">Загрузка товаров...</div>
                        ) : (
                            <>
                                {filteredAndSortedItems.length === 0 ? (
                                    <div className="no-items my_p">Товары не найдены</div>
                                ) : (
                                    <div className="product-grid">
                                        {filteredAndSortedItems.map(item => (
                                            <ItemCard
                                                key={item.id}
                                                item={item}
                                                isInCart={cartItemIds.has(String(item.id))}
                                                onAddToCart={handleAddToCart}
                                                renderStars={renderStars}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div >
            <Footer />
        </>
    );
};

export default ItemPageKategory;