import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllKategoryByMainKategoryId, fetchMainKategoryById } from "../../../http/KategoryApi";
import { ITEM_MAIN_ROUTE, ITEM_KATEGOTY_ROUTE, ITEM_PREVIEW_ROUTE } from "../../../pages/appRouter/Const";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";
import "./ItemPageMainKategory.scss";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Breadcrumbs from "../../../components/breadcrumbs/Breadcrumbs";

const ItemPageMainKategory = () => {
    const { maincategoryId } = useParams();
    const [categories, setCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const mainCategoriesData = await fetchMainKategoryById(maincategoryId);
                setMainCategories(mainCategoriesData);
                if (maincategoryId) {
                    const categoriesData = await fetchAllKategoryByMainKategoryId(maincategoryId);
                    setCategories(Array.isArray(categoriesData) ? categoriesData : []);
                }
            } catch (err) {
                console.error('Ошибка загрузки:', err);
            }
        };

        loadData();
    }, [maincategoryId]);

    return (
        <>
            <Header isAdminHeader={false} />
            
            <div className="item-page-main-kategory">
                <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategories.name }]} />

                <div className="page-header">
                    <h1 className="page-title my_h2">{mainCategories.name}.</h1>
                </div>

                <section className="subcat-grid">
                    {categories.map(category => (
                        <NavLink
                            key={category.id}
                            to={{
                                pathname: ITEM_KATEGOTY_ROUTE + "/" + category.id,
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
                    
                    {!categories.length > 0 && (
                        <p className='categories_section_no-item my_p'>Категорий пока нет</p>
                    )}
                </section>
            </div>
            
            <Footer />
        </>
    );
};

export default ItemPageMainKategory;