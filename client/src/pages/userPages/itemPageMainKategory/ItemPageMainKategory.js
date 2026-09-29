import React, { useState, useEffect } from 'react';
import { useParams, NavLink, useHistory } from 'react-router-dom';
import {
    FiPackage,
    FiArrowRight,
    FiTruck,
    FiShield,
    FiHeadphones,
    FiGrid,
    FiPhone,
    FiLayers,
    FiAward
} from 'react-icons/fi';
import { fetchCategoryByParentId, fetchCategoryByParam } from "../../../http/KategoryApi";
import Header from '../../../components/header/Header';
import Footer from '../../../components/footer/Footer';
import Breadcrumbs from "../../../components/breadcrumbs/Breadcrumbs";
import ModalWindow from '../../../components/modalWindow/ModalWindow';
import { CategoryPageSkeleton } from '../../../components/skeletons';
import NotFoundPage from '../notFoundPage/NotFoundPage';
import "./ItemPageMainKategory.scss";

const ItemPageMainKategory = () => {
    const history = useHistory();
    const { allias } = useParams();
    const [categories, setCategories] = useState([]);
    const [mainCategories, setMainCategories] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [imgErrors, setImgErrors] = useState({});
    const [isModalActive, setIsModalActive] = useState(false);
    const [modalType, setModalType] = useState('');

    const openModal = (type) => {
        setIsModalActive(true);
        setModalType(type);
    };

    const handleImgError = (id) => {
        setImgErrors(prev => ({ ...prev, [id]: true }));
    };

    const getSubcategoriesWord = (count) => {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'подкатегорий';
        if (mod10 === 1) return 'подкатегория';
        if (mod10 >= 2 && mod10 <= 4) return 'подкатегории';
        return 'подкатегорий';
    };

    const getItemsWord = (count) => {
        const mod10 = count % 10;
        const mod100 = count % 100;
        if (mod100 >= 11 && mod100 <= 19) return 'товаров';
        if (mod10 === 1) return 'товар';
        if (mod10 >= 2 && mod10 <= 4) return 'товара';
        return 'товаров';
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setNotFound(false);
                const mainCategoriesData = await fetchCategoryByParam(allias);

                if (!mainCategoriesData) {
                    setNotFound(true);
                    return;
                }

                // Если у категории parentId > 0, значит это подкатегория, перенаправляем на правильный URL
                if (mainCategoriesData.parentId && mainCategoriesData.parentId > 0) {
                    try {
                        const parent = await fetchCategoryByParam(mainCategoriesData.parentId);
                        if (parent && parent.alias) {
                            history.replace(`/${parent.alias}/${mainCategoriesData.alias}`);
                            return;
                        }
                    } catch (e) {
                        // Если родитель не найден
                    }
                }

                setMainCategories(mainCategoriesData);
                const categoriesData = await fetchCategoryByParentId(mainCategoriesData.id);
                setCategories(Array.isArray(categoriesData) ? categoriesData : []);
            } catch (err) {
                console.error('Ошибка загрузки категории:', err);
                setNotFound(true);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [allias, history]);

    if (notFound) {
        return (
            <NotFoundPage
                customTitle="Категория не найдена"
                customMessage={`Категория не найдена по адресу /${allias}. Возможно, она была удалена или набрана с ошибкой.`}
            />
        );
    }

    const categoryTitle = (mainCategories?.name || "Категория").trim();

    return (
        <>
            {isModalActive && (
                <ModalWindow setIsModalActive={setIsModalActive} type={modalType} />
            )}

            <Header isAdminHeader={false} />

            {loading ? (
                <CategoryPageSkeleton count={categories.length || 6} />
            ) : (
                <div className="item-page-main-kategory">
                    <div className="container">
                        <Breadcrumbs items={[
                            { title: "Главная", path: "/" },
                            { title: categoryTitle }
                        ]} />

                        {/* --- HERO HEADER --- */}
                        <header className="page-hero">
                            <div className="hero-content">
                                {/* <div className="hero-badge">
                                    <FiGrid size={15} />
                                    <span>Каталог направлений</span>
                                </div> */}
                                <h1 className="hero-title">{categoryTitle}</h1>
                                <p className="hero-description">
                                    "Выберите необходимый раздел для перехода к ассортименту товаров, удобным фильтрам и техническим характеристикам."
                                </p>
                            </div>

                            {categories.length > 0 && (
                                <div className="hero-meta-stats">
                                    <div className="stat-pill">
                                        <span className="stat-value">{categories.length}</span>
                                        <span className="stat-label">{getSubcategoriesWord(categories.length)}</span>
                                    </div>
                                </div>
                            )}
                        </header>

                        {/* --- SUBCATEGORIES GRID OR EMPTY STATE --- */}
                        {categories.length > 0 ? (
                            <section className={`subcat-grid count-${categories.length}`}>
                                {[...categories]
                                    .sort((a, b) => (parseInt(a.categoryIndex || a.kategoryIndex) || 0) - (parseInt(b.categoryIndex || b.kategoryIndex) || 0))
                                    .map((category, index) => {
                                        const cleanName = (category.name || '').trim();
                                        const hasImage = category.image && !imgErrors[category.id];

                                        return (
                                            <NavLink
                                                key={category.id}
                                                to={{
                                                    pathname: `/${allias}/${category.alias}`,
                                                    state: { path: { name: cleanName } }
                                                }}
                                                className="subcat-card"
                                            >
                                                <div className="card-top-bar">
                                                    <span className="card-index-tag">
                                                        {index < 9 ? `0${index + 1}` : index + 1}
                                                    </span>
                                                    {category.itemsCount && category.itemsCount > 0 ? (
                                                        <span className="card-count-badge">
                                                            {category.itemsCount} {getItemsWord(category.itemsCount)}
                                                        </span>
                                                    ) : (
                                                        <span className="card-category-badge">
                                                            Раздел
                                                        </span>
                                                    )}
                                                </div>

                                                <div className="card-media-wrapper">
                                                    {hasImage ? (
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL}static/images/${category.image}`}
                                                            alt={cleanName}
                                                            className="card-img"
                                                            onError={() => handleImgError(category.id)}
                                                        />
                                                    ) : (
                                                        <div className="category-placeholder-box">
                                                            <div className="placeholder-icon-glow">
                                                                <FiLayers size={36} />
                                                            </div>
                                                            <span className="placeholder-label">Каталог Onx</span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="card-info">
                                                    <div className="card-title-group">
                                                        <h2 className="card-title">{cleanName}</h2>
                                                        <p className="card-hint">
                                                            Модели в наличии, актуальные цены и подробные характеристики
                                                        </p>
                                                    </div>

                                                    <div className="card-action-row">
                                                        <span className="card-action-pill">
                                                            <span>Смотреть раздел</span>
                                                            <span className="arrow-box">
                                                                <FiArrowRight size={15} />
                                                            </span>
                                                        </span>
                                                    </div>
                                                </div>
                                            </NavLink>
                                        );
                                    })}
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

                        {/* --- ADVANTAGES / TRUST SECTION --- */}
                        <section className="category-advantages-section">
                            <div className="advantage-card">
                                <div className="advantage-icon">
                                    <FiTruck size={22} />
                                </div>
                                <div className="advantage-content">
                                    <h3 className="advantage-title">Быстрая доставка</h3>
                                    <p className="advantage-text">
                                        Оперативно доставим заказ прямо на объект или склад собственной службой доставки.
                                    </p>
                                </div>
                            </div>

                            <div className="advantage-card">
                                <div className="advantage-icon">
                                    <FiShield size={22} />
                                </div>
                                <div className="advantage-content">
                                    <h3 className="advantage-title">Заводская гарантия</h3>
                                    <p className="advantage-text">
                                        Вся продукция сертифицирована и поставляется с официальной гарантией производителя.
                                    </p>
                                </div>
                            </div>

                            <div className="advantage-card">
                                <div className="advantage-icon">
                                    <FiAward size={22} />
                                </div>
                                <div className="advantage-content">
                                    <h3 className="advantage-title">Надежное качество</h3>
                                    <p className="advantage-text">
                                        Прочные материалы, износостойкое порошковое покрытие и продуманная конструкция.
                                    </p>
                                </div>
                            </div>

                            <div className="advantage-card">
                                <div className="advantage-icon">
                                    <FiHeadphones size={22} />
                                </div>
                                <div className="advantage-content">
                                    <h3 className="advantage-title">Помощь экспертов</h3>
                                    <p className="advantage-text">
                                        Бесплатно поможем подобрать конфигурацию, габариты и рассчитать нагрузку.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* --- CTA / CONSULTATION BANNER --- */}
                        <section className="category-cta-banner">
                            <div className="cta-info">
                                <span className="cta-badge">Консультация специалистов</span>
                                <h2 className="cta-title">Нужна помощь с выбором или расчет проекта?</h2>
                                <p className="cta-description">
                                    Наши консультанты ответят на любые вопросы по характеристикам, наличию и подберут оптимальное решение под ваши требования.
                                </p>
                            </div>
                            <div className="cta-buttons">
                                <button className="cta-btn primary" onClick={() => openModal("contacts")}>
                                    <FiPhone size={17} />
                                    <span>Связаться с нами</span>
                                </button>
                                <button className="cta-btn secondary" onClick={() => openModal("delivery")}>
                                    <FiTruck size={17} />
                                    <span>Условия доставки</span>
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            )}

            <Footer />
        </>
    );
};

export default ItemPageMainKategory;