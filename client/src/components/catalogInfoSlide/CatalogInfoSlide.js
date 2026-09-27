import "./CatalogInfoSlide.scss";
import { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { fetchAllMainCategory, fetchAllKategory } from "../../http/KategoryApi";
import { FiX, FiChevronRight, FiChevronLeft, FiSearch, FiLayers } from "react-icons/fi";

function CatalogInfoSlide({ setIsCategoryActive }) {
    const history = useHistory();
    const [activeIndex, setActiveIndex] = useState(0);
    const [mobileActiveCategory, setMobileActiveCategory] = useState(null);
    const [catalogData, setCatalogData] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setIsLoading(true);
                const [mains, allCats] = await Promise.all([
                    fetchAllMainCategory(),
                    fetchAllKategory()
                ]);

                // Сортируем главные категории
                const sortedMains = Array.isArray(mains) ? [...mains].sort((a, b) =>
                    (parseInt(a.gridItemIndex) || 0) - (parseInt(b.gridItemIndex) || 0)
                ) : [];

                // Связываем подкатегории с главными категориями по parentId или mainKategoryId
                const combined = sortedMains.map((m) => {
                    const subs = Array.isArray(allCats) ? allCats.filter(
                        (cat) => (Number(cat.parentId) === Number(m.id) || Number(cat.mainKategoryId) === Number(m.id)) && Number(cat.id) !== Number(m.id)
                    ).sort((a, b) => (parseInt(a.categoryIndex) || 0) - (parseInt(b.categoryIndex) || 0)) : [];
                    return { ...m, subs };
                });

                setCatalogData(combined);
            } catch (e) {
                console.error("Ошибка загрузки данных каталога:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAllData();
    }, []);

    // Закрытие по Escape
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                setIsCategoryActive(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [setIsCategoryActive]);

    // Переход в подкатегорию: /:mainAlias/:subAlias
    const navigateToSub = (mainCat, subCat) => {
        const mainAlias = mainCat.alias || mainCat.id;
        const subAlias = subCat.alias || subCat.id;
        history.push({
            pathname: `/${mainAlias}/${subAlias}`,
            state: { path: { name: subCat.name } },
        });
        setIsCategoryActive(false);
    };

    const filteredCatalog = catalogData.filter(item => {
        if (!searchQuery.trim()) return true;
        const query = searchQuery.toLowerCase();
        const matchesMain = item.name.toLowerCase().includes(query);
        const matchesSub = item.subs && item.subs.some(s => s.name.toLowerCase().includes(query));
        return matchesMain || matchesSub;
    });

    const activeGroup = catalogData[activeIndex] || catalogData[0];

    return (
        <div className="catalog-modal">
            <div className="catalog_modal-overlay" onClick={() => setIsCategoryActive(false)}></div>

            <div className="modal-container">
                {/* ДЕСКТОПНАЯ КНОПКА ЗАКРЫТИЯ */}
                <button
                    className="close-button desktop-only"
                    onClick={() => setIsCategoryActive(false)}
                    title="Закрыть (Esc)"
                    aria-label="Закрыть"
                >
                    <FiX size={22} />
                </button>

                {/* ========================================================
                    МОБИЛЬНЫЙ ВИД (ЭКРАНЫ <= 768px)
                   ======================================================== */}
                <div className="mobile-catalog-wrapper">
                    {/* МОБИЛЬНЫЙ УРОВЕНЬ 1: СПИСОК ГЛАВНЫХ КАТЕГОРИЙ */}
                    {!mobileActiveCategory ? (
                        <div className="mobile-level-main">
                            <div className="mobile-header">
                                <div className="mobile-header-title">
                                    <span>Каталог товаров</span>
                                </div>
                                <button
                                    className="mobile-close-btn"
                                    onClick={() => setIsCategoryActive(false)}
                                    aria-label="Закрыть"
                                >
                                    <FiX size={22} />
                                </button>
                            </div>

                            <div className="mobile-search-bar">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Поиск категории..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                {searchQuery && (
                                    <button className="clear-search-btn" onClick={() => setSearchQuery("")}>
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="mobile-main-list">
                                {isLoading ? (
                                    <div className="catalog-loading-skeleton">
                                        <div className="skeleton-row"></div>
                                        <div className="skeleton-row"></div>
                                        <div className="skeleton-row"></div>
                                        <div className="skeleton-row"></div>
                                    </div>
                                ) : filteredCatalog.length > 0 ? (
                                    filteredCatalog.map((item) => (
                                        <div
                                            key={item.id}
                                            className="mobile-main-card"
                                            onClick={() => setMobileActiveCategory(item)}
                                        >
                                            <div className="card-info">
                                                {item.image && (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}static/images/${item.image}`}
                                                        alt={item.name}
                                                        className="card-thumb"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <div className="card-text">
                                                    <div className="card-name">{item.name}</div>
                                                    <div className="card-count">
                                                        {item.subs?.length ? `${item.subs.length} подкатегорий` : 'Перейти к товарам'}
                                                    </div>
                                                </div>
                                            </div>
                                            <FiChevronRight className="arrow-icon" />
                                        </div>
                                    ))
                                ) : (
                                    <div className="catalog-empty-notice">Категории не найдены</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        /* МОБИЛЬНЫЙ УРОВЕНЬ 2: ПОДКАТЕГОРИИ ВЫБРАННОЙ ГЛАВНОЙ КАТЕГОРИИ */
                        <div className="mobile-level-subs">
                            <div className="mobile-header">
                                <button
                                    className="mobile-back-btn"
                                    onClick={() => setMobileActiveCategory(null)}
                                >
                                    <FiChevronLeft size={22} />
                                    <span>Назад</span>
                                </button>
                                <span className="mobile-header-category-name">{mobileActiveCategory.name}</span>
                                <button
                                    className="mobile-close-btn"
                                    onClick={() => setIsCategoryActive(false)}
                                    aria-label="Закрыть"
                                >
                                    <FiX size={22} />
                                </button>
                            </div>

                            <div className="mobile-subs-content">
                                <div className="mobile-subs-list">
                                    {mobileActiveCategory.subs && mobileActiveCategory.subs.length > 0 ? (
                                        mobileActiveCategory.subs.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="mobile-sub-card"
                                                onClick={() => navigateToSub(mobileActiveCategory, sub)}
                                            >
                                                {sub.image && (
                                                    <img
                                                        src={`${process.env.REACT_APP_API_URL}static/images/${sub.image}`}
                                                        alt={sub.name}
                                                        className="sub-thumb"
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                )}
                                                <span className="sub-name">{sub.name}</span>
                                                <FiChevronRight className="arrow-icon" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="catalog-empty-notice">
                                            <span>В этом разделе пока нет подкатегорий</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ========================================================
                    ДЕСКТОПНЫЙ ВИД (ЭКРАНЫ > 768px)
                   ======================================================== */}
                <div className="desktop-catalog-layout">
                    {/* ЛЕВАЯ КОЛОНКА: ГЛАВНЫЕ КАТЕГОРИИ */}
                    <div className="main-categories-sidebar">
                        {/* <div className="sidebar-header">
                            <FiLayers className="sidebar-header-icon" />
                            <span>Каталог товаров</span>
                        </div> */}
                        <div className="sidebar-scrollable">
                            {isLoading ? (
                                <div className="catalog-loading-skeleton">
                                    <div className="skeleton-row"></div>
                                    <div className="skeleton-row"></div>
                                    <div className="skeleton-row"></div>
                                </div>
                            ) : (
                                catalogData.map((item, index) => (
                                    <div
                                        key={item.id}
                                        className={`desktop-main-item ${activeIndex === index ? 'active' : ''}`}
                                        onMouseEnter={() => setActiveIndex(index)}
                                        onClick={() => setActiveIndex(index)}
                                    >
                                        {item.image && (
                                            <img
                                                src={`${process.env.REACT_APP_API_URL}static/images/${item.image}`}
                                                alt={item.name}
                                                className="desktop-thumb"
                                                onError={(e) => { e.target.style.display = 'none'; }}
                                            />
                                        )}
                                        <span className="desktop-name">{item.name}</span>
                                        {item.subs?.length > 0 && (
                                            <span className="desktop-badge">{item.subs.length}</span>
                                        )}
                                        <FiChevronRight className="desktop-chevron" />
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* ПРАВАЯ ОБЛАСТЬ: ПОДКАТЕГОРИИ ВЫБРАННОЙ КАТЕГОРИИ */}
                    <div className="subcategories-panel">
                        {activeGroup && (
                            <div className="panel-inner">
                                <div className="panel-header">
                                    <div className="panel-title-group">
                                        <h2 className="panel-title">{activeGroup.name}</h2>
                                        {activeGroup.subs?.length > 0 && (
                                            <span className="panel-subtitle">
                                                {activeGroup.subs.length} подкатегорий
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="podcategories-grid">
                                    {activeGroup.subs && activeGroup.subs.length > 0 ? (
                                        activeGroup.subs.map((sub) => (
                                            <div
                                                key={sub.id}
                                                className="desktop-sub-card"
                                                onClick={() => navigateToSub(activeGroup, sub)}
                                            >
                                                {sub.image && (
                                                    <div className="sub-card-img-wrapper">
                                                        <img
                                                            src={`${process.env.REACT_APP_API_URL}static/images/${sub.image}`}
                                                            alt={sub.name}
                                                            onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                                                        />
                                                    </div>
                                                )}
                                                <div className="sub-card-content">
                                                    <span className="sub-card-title">{sub.name}</span>
                                                    <FiChevronRight className="sub-card-arrow" />
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="desktop-empty-state">
                                            <p>В этом разделе пока нет подкатегорий</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CatalogInfoSlide;