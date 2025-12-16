// ItemSearchPage.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // ← v5
import Headers from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { fetchAllItemByName } from "../../../http/itemApi";
import { ITEM_PREVIEW_ROUTE } from "../../appRouter/Const";
import { NavLink } from "react-router-dom";
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import "./ItemSearchPage.scss";

// Вспомогательная функция для извлечения query-параметра
function getSearchParam(search, param) {
    const params = new URLSearchParams(search);
    return params.get(param) || '';
}

const ItemSearchPage = () => {
    const location = useLocation(); // ← v5
    const query = getSearchParam(location.search, 'q'); // ← парсим ?q=...
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

    const renderStars = (rating) => {
        const stars = [];
        const roundedRating = Math.round(rating || 0);
        for (let i = 1; i <= 4; i++) {
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

    return (
        <>
            <Headers />
            <div className="item-search-page">
                <Breadcrumbs
                    items={[
                        { title: "Главная", path: "/" },
                        { title: `Поиск: "${query}"` }
                    ]}
                />

                <div className="search-main-content">
                    <h1 className="search-title my_h1">
                        Результаты поиска: <span className="query-highlight">"{query}"</span>
                    </h1>

                    <div className="items-section">
                        {loading ? (
                            <div className="loading">Загрузка товаров...</div>
                        ) : error ? (
                            <div className="error">{error}</div>
                        ) : items.length > 0 ? (
                            <div className="items-grid">
                                {items.map(item => (
                                    <NavLink
                                        key={item.id}
                                        to={`${ITEM_PREVIEW_ROUTE}/${item.id}`}
                                    >
                                        <div className="item-card">
                                            <div className="item-image">
                                                {item.images?.length > 0 ? (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`}
                                                        alt={item.name}
                                                        onError={(e) => e.target.src = '/placeholder-image.jpg'}
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
                                ))}
                            </div>
                        ) : query ? (
                            <div className="no-items">
                                По запросу <strong>"{query}"</strong> ничего не найдено.
                            </div>
                        ) : (
                            <div className="no-items">
                                Введите поисковый запрос.
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
};

export default ItemSearchPage;