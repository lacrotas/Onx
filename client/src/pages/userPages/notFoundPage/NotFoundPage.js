// NotFoundPage.js
import React, { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import { fetchAllMainCategory } from '../../../http/KategoryApi';
import { FiHome, FiArrowLeft, FiAlertCircle } from 'react-icons/fi';
import { Helmet } from 'react-helmet-async';
import './NotFoundPage.scss';

const NotFoundPage = ({ customTitle, customMessage }) => {
    const history = useHistory();
    const [popularCategories, setPopularCategories] = useState([]);

    useEffect(() => {
        window.scrollTo(0, 0);
        const loadCategories = async () => {
            try {
                const cats = await fetchAllMainCategory();
                if (Array.isArray(cats)) {
                    setPopularCategories(cats.slice(0, 6));
                }
            } catch (e) {
                console.error("Не удалось загрузить категории:", e);
            }
        };
        loadCategories();
    }, []);

    return (
        <div className="not-found-page-wrapper">
            <Helmet>
                <title>404 — Страница не найдена | ONX</title>
                <meta name="robots" content="noindex, nofollow" />
            </Helmet>
            <Header isAdminHeader={false} />

            <main className="not-found-main-container">
                <div className="not-found-card">
                    <div className="not-found-badge">
                        <FiAlertCircle className="badge-icon" />
                        <span>Ошибка 404</span>
                    </div>

                    <h1 className="not-found-code">404</h1>
                    <h2 className="not-found-title">
                        {customTitle || "Страница не найдена"}
                    </h2>
                    <p className="not-found-desc">
                        {customMessage || "Запрашиваемая страница, категория или товар не существует, либо были перемещены по другому адресу."}
                    </p>

                    <div className="not-found-actions">
                        <NavLink to="/" className="action-btn primary">
                            <FiHome />
                            <span>На главную</span>
                        </NavLink>
                        <button onClick={() => history.goBack()} className="action-btn secondary">
                            <FiArrowLeft />
                            <span>Вернуться назад</span>
                        </button>
                    </div>

                    {popularCategories.length > 0 && (
                        <div className="not-found-categories-block">
                            <span className="categories-label">Популярные разделы каталога:</span>
                            <div className="categories-pills">
                                {popularCategories.map(cat => (
                                    <NavLink
                                        key={cat.id}
                                        to={`/${cat.alias}`}
                                        className="category-pill"
                                    >
                                        {cat.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NotFoundPage;
