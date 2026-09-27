import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { fetchCategoryByParentId, fetchCategoryByParam } from "../../../http/KategoryApi";
import { ITEM_KATEGOTY_ROUTE } from "../../../pages/appRouter/Const";
import "./ItemPageMainKategory.scss";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Breadcrumbs from "../../../components/breadcrumbs/Breadcrumbs";

const ItemPageMainKategory = () => {
    const { allias } = useParams();
    const [categories, setCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                const mainCategoriesData = await fetchCategoryByParam(allias);
                if (mainCategoriesData) {
                    setMainCategories(mainCategoriesData);
                    const categoriesData = await fetchCategoryByParentId(mainCategoriesData.id);
                    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                }
            } catch (err) {
                console.error('Ошибка загрузки:', err);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [allias]);

    return (
        <>
            <Header isAdminHeader={false} />
            <div className="item-page-main-kategory">
                <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategories?.name || "Категория" }]} />
                <div className="page-header">
                    <h1 className="page-title my_h2">{mainCategories?.name || "Категория"}</h1>
                </div>

                {loading ? (
                    <div className="categories-loading my_p">Загрузка категорий...</div>
                ) : categories.length > 0 ? (
                    <section className="subcat-grid">
                        {[...categories]
                            .sort((a, b) => (parseInt(a.kategoryIndex) || 0) - (parseInt(b.kategoryIndex) || 0))
                            .map(category => (
                                <NavLink
                                    key={category.id}
                                    to={{
                                        pathname: `/${allias}/${category.alias}`,
                                        state: { path: { name: category.name } }
                                    }}
                                    className="subcat-card"
                                >
                                    <div className="card-img-wrapper">
                                        {category.image ? (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}static/images/${category.image}`}
                                                alt={category.name}
                                                className="card-img"
                                                onError={(e) => {
                                                    e.target.onerror = null; // Отключаем повторный вызов при ошибке заглушки
                                                    e.target.src = '/placeholder-category.jpg';
                                                }}
                                            />
                                        ) : (
                                            <div className="no-category-image my_h1">📁</div>
                                        )}
                                    </div>
                                    <div className="card-content">
                                        <div className="card-title my_h3">{category.name}</div>
                                        <span className="btn-link my_p_small">Смотреть раздел <span className="arrow">→</span></span>
                                    </div>
                                </NavLink>
                            ))}
                    </section>
                ) : (
                    <div className="category-empty-state">
                        <div className="empty-state-icon">
                            <FiPackage size={44} />
                        </div>
                        <h3 className="empty-state-title">В этом разделе пока нет категорий</h3>
                        <p className="empty-state-desc">
                            Мы уже работаем над наполнением этого раздела. Вернитесь на главную страницу или ознакомьтесь с другими разделами в каталоге.
                        </p>
                        <div className="empty-state-actions">
                            <NavLink to="/" className="btn-empty-action">
                                На главную
                            </NavLink>
                        </div>
                    </div>
                )}
            </div>

            <Footer />
        </>
    );
};

export default ItemPageMainKategory;