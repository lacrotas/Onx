import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { fetchAllKategoryByMainKategoryId } from "../../../http/KategoryApi";
import { fetchMainKategoryById } from "../../../http/KategoryApi";
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
        console.log(maincategoryId);
    }, [maincategoryId]);


    return (
        <>
            <Header isAdminHeader={false} />
            <div className="item-page-main-kategory">
                <Breadcrumbs items={[{ title: "Главная", path: "/" }, { title: mainCategories.name }]} />
                {/* 
                <h2 className="category-header my_h1">
                    {mainCategories
                        ? mainCategories.name
                        : 'Товары'
                    }
                </h2> */}

                <section className="categories_section">
                    {categories.map(category => (

                        <div
                            key={category.id}
                            className={`category-card`}
                        >
                            <NavLink
                                to={{
                                    pathname: ITEM_KATEGOTY_ROUTE + "/" + category.id,
                                    state: { path: { name: category.name } }
                                }} >
                                <div className="category-image">
                                    {category.image ? (
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}static/images/${category.image}`}
                                            alt={category.name}
                                            onError={(e) => {
                                                e.target.src = '/placeholder-category.jpg';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-category-image">📁</div>
                                    )}
                                </div>
                                <div className="category-name my_p">{category.name}</div>
                            </NavLink>

                        </div>
                    ))}
                    {!categories.length > 0 ?
                        <p className='categories_section_no-item my_p'>Категорий пока нет</p> : <></>}
                </section>
            </div>
            <Footer />
        </>
    );
};

export default ItemPageMainKategory;