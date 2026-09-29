// ItemSearchPage.js
import React, { useState, useEffect } from 'react';
import { useLocation, NavLink } from 'react-router-dom';
import Headers from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { fetchAllItemByName } from "../../../http/itemApi";
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import ItemCard from '../itemPageKategory/itemCard/ItemCard';
import AddToCart from '../../../customUI/addToCartButton/AddToCartButton';
import { ItemCardSkeleton } from '../../../components/skeletons';
import { FiSearch, FiPackage } from 'react-icons/fi';
import "./ItemSearchPage.scss";

function getSearchParam(search, param) {
    const params = new URLSearchParams(search);
    return params.get(param) || '';
}

const ItemSearchPage = () => {
    const location = useLocation();
    const query = getSearchParam(location.search, 'q');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadItems = async () => {
            if (!query.trim()) {
                setItems([]);
                return;
            }

            setLoading(true);
            setError(null);
            try {
                const data = await fetchAllItemByName(query.trim());
                setItems(Array.isArray(data) ? data : []);
            } catch (err) {
                console.error("Ошибка поиска:", err);
                setError("Не удалось загрузить результаты поиска");
                setItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadItems();
    }, [query]);

    return (
        <div className="search-page-wrapper">
            <Headers isAdminHeader={false} />
            <div className="item-search-page">
                <Breadcrumbs
                    items={[
                        { title: "Главная", path: "/" },
                        { title: query ? `Поиск: ${query}` : "Поиск" }
                    ]}
                />

                <div className="search-main-content">
                    <div className="search-header-row">
                        <h1 className="search-title">
                            {query ? (
                                <>Результаты поиска <span className="query-highlight">«{query}»</span></>
                            ) : (
                                'Поиск товаров'
                            )}
                        </h1>
                        {!loading && items.length > 0 && (
                            <span className="search-count-badge">
                                {items.length} {items.length === 1 ? 'товар' : items.length < 5 ? 'товара' : 'товаров'}
                            </span>
                        )}
                    </div>

                    <div className="items-section">
                        {loading ? (
                            <div className="search-products-grid">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <ItemCardSkeleton key={idx} />
                                ))}
                            </div>
                        ) : error ? (
                            <div className="search-status-box error">
                                <p>{error}</p>
                            </div>
                        ) : items.length > 0 ? (
                            <div className="search-products-grid">
                                {items.map(item => (
                                    <AddToCart key={item.id} item={item}>
                                        {({ isInCart, handleAddToCart }) => (
                                            <ItemCard
                                                item={item}
                                                isInCart={isInCart}
                                                onAddToCart={handleAddToCart}
                                                categoryName={item.categoryName}
                                                mainAlias={item.mainCategoryAlias}
                                                alias={item.categoryAlias}
                                            />
                                        )}
                                    </AddToCart>
                                ))}
                            </div>
                        ) : query ? (
                            <div className="search-empty-state">
                                <div className="empty-state-icon">
                                    <FiSearch size={44} />
                                </div>
                                <h3 className="empty-state-title">По запросу «{query}» ничего не найдено</h3>
                                <p className="empty-state-desc">
                                    Проверьте правильность написания запроса или попробуйте найти товар через каталог категорий.
                                </p>
                                <div className="empty-state-actions">
                                    <NavLink to="/" className="btn-empty-action">
                                        На главную
                                    </NavLink>
                                </div>
                            </div>
                        ) : (
                            <div className="search-empty-state">
                                <div className="empty-state-icon">
                                    <FiPackage size={44} />
                                </div>
                                <h3 className="empty-state-title">Введите поисковый запрос</h3>
                                <p className="empty-state-desc">
                                    Воспользуйтесь строкой поиска в шапке сайта, чтобы быстро найти интересующий вас товар.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default ItemSearchPage;