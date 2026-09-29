import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useParams, useHistory, NavLink } from 'react-router-dom';
import { fetchAllItemByKategoryId } from '../../../http/itemApi';
import { fetchAllFiltersByCategoryId } from "../../../http/filterApi";
import { fetchCategoryByParam, fetchCategoryByParentId } from "../../../http/KategoryApi";
import "./ItemPageKategory.scss";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import { ITEM_MAIN_ROUTE, ITEM_KATEGOTY_ROUTE } from "../../appRouter/Const";
import { FaSort } from "react-icons/fa";
import { LiaFilterSolid } from "react-icons/lia";
import { FiPackage } from "react-icons/fi";
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import ItemCard from './itemCard/ItemCard';
import FilterSidebar from './filterSidebar/FilterSidebar';
import AddToCart from '../../../customUI/addToCartButton/AddToCartButton';
import { ProductPageSkeleton, ItemCardSkeleton } from '../../../components/skeletons';
import NotFoundPage from '../notFoundPage/NotFoundPage';

const ItemPageKategory = () => {
    const { allias, mainAllias } = useParams();
    const [items, setItems] = useState([]);
    const [filters, setFilters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [itemsLoading, setItemsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [sortOption, setSortOption] = useState('default');
    const [selectedFilters, setSelectedFilters] = useState({});

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

    // получение данных о товарах
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setNotFound(false);

                if (!allias || !mainAllias) {
                    setNotFound(true);
                    return;
                }

                let categoryData = null;
                let mainCategoryData = null;

                try {
                    categoryData = await fetchCategoryByParam(allias);
                } catch (e) {
                    categoryData = null;
                }

                try {
                    mainCategoryData = await fetchCategoryByParam(mainAllias);
                } catch (e) {
                    mainCategoryData = null;
                }

                // Проверяем существование обеих категорий и принадлежность подкатегории
                if (!categoryData || !mainCategoryData) {
                    setNotFound(true);
                    return;
                }

                if (categoryData.parentId !== mainCategoryData.id) {
                    setNotFound(true);
                    return;
                }

                setCategory(categoryData);
                setMainCategory(mainCategoryData);

                const allCategoryData = await fetchCategoryByParentId(mainCategoryData.id);
                setAllCategory(Array.isArray(allCategoryData) ? allCategoryData : []);

                setItemsLoading(true);
                try {
                    const data = await fetchAllItemByKategoryId(categoryData.id);
                    const filterData = await fetchAllFiltersByCategoryId(categoryData.id);
                    setFilters(filterData);
                    setItems(Array.isArray(data) ? data : []);
                } catch (err) {
                    console.error('Ошибка загрузки товаров категории:', err);
                    setItems([]);
                } finally {
                    setItemsLoading(false);
                }
            } catch (err) {
                console.error('Ошибка загрузки:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [allias, mainAllias]);

    const sortItems = (itemsToSort) => {
        const sortedItems = [...itemsToSort];

        return sortedItems.sort((a, b) => {
            if (a.isExist !== b.isExist) {
                return b.isExist ? 1 : -1;
            }

            switch (sortOption) {
                case 'price-asc':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-desc':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'rating':
                    return (b.rating || 0) - (a.rating || 0);
                default:
                    return 0;
            }
        });
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

    if (notFound) {
        return (
            <NotFoundPage
                customTitle="Подкатегория не найдена"
                customMessage={`Раздел не найден по адресу /${mainAllias}/${allias}. Возможно, он был перемещен или удален.`}
            />
        );
    }

    if (loading) {
        return (
            <>
                <Header isAdminHeader={false} />
                <ProductPageSkeleton count={6} />
                <Footer />
            </>
        );
    }
    if (error) return <><Header isAdminHeader={false} /><div className="error">{error}</div><Footer /></>;
    return (
        <>
            <Header isAdminHeader={false} />
            <div className="category-page-wrapper">
                <div
                    onClick={() => setMobileFilters(false)}
                    className={mobileFilters ? 'filters-list_back open' : 'filters-list_back close'}
                ></div>

                {mainCategory && category && (
                    <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategory.name, path: '/' + mainAllias }, { title: category.name }]} />
                )}

                <div className="controls-area">
                    {allCategory && allCategory.map(cat => (
                        <NavLink
                            key={cat.id}
                            to={{
                                pathname: `/${mainAllias}/${cat.alias}`,
                                state: { path: { name: cat.name } }
                            }} >
                            <div className={`filter-pill my_p ${cat.id === category?.id ? "active" : ""}`}>{cat.name}</div>
                        </NavLink>
                    ))}
                </div>

                <div className={`main-container ${items.length === 0 ? 'no-sidebar' : ''}`}>
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
                                    <>
                                        <button className="mobile-filter-btn" onClick={() => setMobileFilters(!mobileFilters)}>
                                            <LiaFilterSolid size={20} />
                                            <span>Фильтры</span>
                                        </button>

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
                                    </>
                                )}
                            </div>
                        </div>

                        {itemsLoading ? (
                            <div className="product-grid">
                                {Array.from({ length: 6 }).map((_, idx) => (
                                    <ItemCardSkeleton key={idx} />
                                ))}
                            </div>
                        ) : items.length === 0 ? (
                            <div className="category-empty-state">
                                <div className="empty-state-icon">
                                    <FiPackage size={44} />
                                </div>
                                <h3 className="empty-state-title">В этой категории пока нет товаров</h3>
                                <p className="empty-state-desc">
                                    Мы уже работаем над наполнением этого раздела. Выберите другую категорию или вернитесь на главную страницу.
                                </p>
                                <div className="empty-state-actions">
                                    <NavLink to="/" className="btn-empty-action">
                                        На главную
                                    </NavLink>

                                </div>
                            </div>
                        ) : filteredAndSortedItems.length === 0 ? (
                            <div className="category-empty-state">
                                <div className="empty-state-icon">
                                    <LiaFilterSolid size={44} />
                                </div>
                                <h3 className="empty-state-title">По выбранным фильтрам ничего не найдено</h3>
                                <p className="empty-state-desc">
                                    Попробуйте изменить параметры фильтрации или сбросить активные фильтры.
                                </p>
                                <div className="empty-state-actions">
                                    <button className="btn-empty-action" onClick={() => setSelectedFilters({})}>
                                        Сбросить фильтры
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="product-grid">
                                {filteredAndSortedItems.map(item => (
                                    <AddToCart key={item.id} item={item}>
                                        {({ isInCart, handleAddToCart }) => (
                                            <ItemCard
                                                item={item}
                                                isInCart={isInCart}
                                                onAddToCart={handleAddToCart}
                                                renderStars={renderStars}
                                                mainAlias={mainAllias}
                                                alias={allias}
                                            />
                                        )}
                                    </AddToCart>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ItemPageKategory;