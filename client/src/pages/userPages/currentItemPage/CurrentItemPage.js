import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // Импортируем Helmet
import { fetchItemId } from '../../../http/itemApi';
import { fetchCategoryByParam } from '../../../http/KategoryApi';
import { fetchItemGroupById } from '../../../http/itemGroupApi'; 
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { ITEM_MAIN_ROUTE, ITEM_KATEGOTY_ROUTE } from "../../appRouter/Const";
import "./CurrentItemPage.scss";
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { IoIosArrowDown } from "react-icons/io";
import ItemReviews from './itemReviews/ItemReviews';
import ItemGallery from './ItemGallery/ItemGallery';
import ItemVariantsSlider from './ItemVariantsSlider/ItemVariantsSlider';
import AddToCart from '../../../customUI/addToCartButton/AddToCartButton';
import { ProductDetailSkeleton } from '../../../components/skeletons';

// Вспомогательная функция для удаления HTML-тегов из описания для meta-тегов
const stripHtml = (html) => {
    if (!html) return '';
    return html.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim();
};

const CurrentItemPage = () => {
    const { allias, mainAllias, itemAllias } = useParams();
    const [item, setItem] = useState(null);
    const [itemGroup, setItemGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainKategory, setMainKategory] = useState(null);
    const [kategory, setKategory] = useState(null);
    const [openInfor, setOpenInfor] = useState(true);
    const [openDescription, setOpenDescription] = useState(true);
    const [openReviews, setOpenReviews] = useState(true);
    const [itemFilters, setItemFilters] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const itemData = await fetchItemId(itemAllias);
                const categoryData = await fetchCategoryByParam(allias);
                const mainCategoryData = await fetchCategoryByParam(mainAllias);
                
                if (itemData.itemGroupId) {
                    try {
                        const groupData = await fetchItemGroupById(itemData.itemGroupId);
                        setItemGroup(groupData);
                    } catch (e) {
                        console.error("Группа не загружена", e);
                    }
                } else {
                    setItemGroup(null);
                }

                setItem(itemData);
                setMainKategory(mainCategoryData);
                setKategory(categoryData);
            } catch (err) {
                setError('Ошибка загрузки');
            } finally {
                setLoading(false);
            }
        };
        if (allias) loadData();
    }, [allias, itemAllias, mainAllias]);

    const scrollToFullDetails = () => {
        const element = document.getElementById('full-spec');
        if (element) {
            const offset = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: "smooth" });
        }
    };

    if (loading) {
        return (
            <div className="apple-theme-page">
                <Header isAdminHeader={false} />
                <ProductDetailSkeleton />
                <Footer />
            </div>
        );
    }
    if (error || !item) return <><Header isAdminHeader={false} /><div className="apple-error my_h3">Товар не найден</div><Footer /></>;

    // Функция парсинга PostgreSQL массива в обычный массив JS
    const parsePostgresArray = (pgArrayStr) => {
        if (!pgArrayStr) return [];
        if (Array.isArray(pgArrayStr)) return pgArrayStr; // Если pg driver уже превратил в массив
        if (typeof pgArrayStr === 'string') {
            // Удаляем скобки { и } и разбиваем по запятой
            return pgArrayStr.replace(/^\{|\}$/g, '').split(',').map(img => img.trim());
        }
        return [];
    };
    // --- SEO ДАННЫЕ ---
    const pageTitle = `Купить ${item.name} по цене ${item.price} BYN в Минске | ${kategory?.name || 'ONX'}`;
    const plainDescription = stripHtml(item.description).slice(0, 160) || `Закажите ${item.name} по низкой цене ${item.price} BYN с доставкой по всей Беларуси.`;
    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const imagesList = parsePostgresArray(item?.images);
    const firstImageFilename = imagesList[0] || '';
    const mainImageUrl = firstImageFilename 
    ? `${process.env.REACT_APP_API_URL}static/images/${firstImageFilename}` 
    : `${process.env.REACT_APP_API_URL}logo192.png`;
    // const mainImageUrl = item.images ? `${process.env.REACT_APP_API_URL}/${item.image}` : '';

    // Schema.org: Разметка товара (Product)
    const productSchema = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": item.name,
        "image": mainImageUrl ? [mainImageUrl] : [],
        "description": stripHtml(item.description).slice(0, 300),
        "offers": {
            "@type": "Offer",
            "url": currentUrl,
            "priceCurrency": "BYN",
            "price": item.price,
            "priceValidUntil": "2026-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": item.isExist ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
        }
    };

    // Schema.org: Хлебные крошки (BreadcrumbList)
    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": typeof window !== 'undefined' ? window.location.origin : ''
            },
            mainKategory && {
                "@type": "ListItem",
                "position": 2,
                "name": mainKategory.name,
                "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/${mainKategory.alias}`
            },
            kategory && {
                "@type": "ListItem",
                "position": 3,
                "name": kategory.name,
                "item": `${typeof window !== 'undefined' ? window.location.origin : ''}/${mainKategory?.alias}/${kategory.alias}`
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": item.name
            }
        ].filter(Boolean)
    };

    return (
        <div className="apple-theme-page">
            {/* --- SEO БЛОК HELMET --- */}
            <Helmet>
                <title>{pageTitle}</title>
                <meta name="description" content={plainDescription} />
                <link rel="canonical" href={currentUrl} />

                {/* Open Graph (для Telegram, Viber, соцсетей) */}
                <meta property="og:type" content="product" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={plainDescription} />
                <meta property="og:url" content={currentUrl} />
                <meta property="og:image" content={mainImageUrl} />

                {/* Микроразметка Schema.org */}
                <script type="application/ld+json">
                    {JSON.stringify(productSchema)}
                </script>
                <script type="application/ld+json">
                    {JSON.stringify(breadcrumbSchema)}
                </script>
            </Helmet>

            <Header />
            <div className="apple-main-container">
                <div className="apple-breadcrumbs">
                    {mainKategory && kategory && (
                        <Breadcrumbs items={[
                            { title: "Главная", path: "/" },
                            { title: mainKategory.name, path:  "/" + mainKategory.alias },
                            { title: kategory.name, path: "/" + mainKategory.alias + "/" + kategory.alias },
                            { title: item.name }
                        ]} />
                    )}
                </div>

                <div className="apple-grid-layout">
                    <ItemGallery item={item} />

                    <div className="apple-info-col">
                        <h1 className="apple-product-title my_h1">{item.name}</h1>

                        <div className="apple-price-row">
                            <span className="apple-price-tag my_h2">{item.price} BYN</span>
                            <span className={`apple-status-label my_p ${item.isExist ? 'in' : 'out'}`}>
                                {item.isExist ? '● В наличии' : '○ Нет в наличии'}
                            </span>
                        </div>

                        {itemGroup && (
                            <ItemVariantsSlider 
                                items={itemGroup} 
                                currentId={item.id} 
                                apiUrl={process.env.REACT_APP_API_URL} 
                            />
                        )}

                        <AddToCart item={item}>
                            {({ isInCart, handleAddToCart, handleBuyNow }) => (
                                <div className="apple-btn-group">
                                    <button
                                        onClick={handleAddToCart}
                                        className={`apple-primary-button my_p ${isInCart ? 'success' : ''}`}
                                        disabled={!item.isExist}
                                    >
                                        {isInCart ? 'В корзине' : 'Добавить в корзину'}
                                        {isInCart ? <FiCheck /> : <FiShoppingCart />}
                                    </button>
                                    <button
                                        onClick={handleBuyNow}
                                        className="apple-secondary-button my_p"
                                        disabled={!item.isExist}
                                    >
                                        Купить сейчас
                                    </button>
                                </div>
                            )}
                        </AddToCart>

                        {item.specificationsJSONB && (
                            <div className="apple-preview-specs">
                                <h3 className="my_h3">Характеристики</h3>
                                {Object.entries(item.specificationsJSONB).slice(0, 5).map(([key, value]) => {
                                    if (value === "") return null;
                                    const filterMatch = itemFilters.find(f => f.name === key);
                                    const addition = filterMatch ? ` ${filterMatch.addition}` : "";
                                    return (
                                        <div key={key} className="apple-mini-spec">
                                            <span className="key my_p">{key}</span>
                                            <span className="dots"></span>
                                            <span className="val my_p">{value}{addition}</span>
                                        </div>
                                    );
                                })}
                                <button className="apple-text-link my_p" onClick={scrollToFullDetails}>
                                    Все характеристики ↓
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                <div className="apple-bottom-details">
                    <div className="apple-accordion-item">
                        <div className="apple-accordion-header" onClick={() => setOpenDescription(!openDescription)}>
                            <h2 className="my_h3">Полное описание</h2>
                            <IoIosArrowDown className={openDescription ? 'open' : ''} />
                        </div>
                        <div className={`apple-accordion-content ${openDescription ? 'show' : ''}`}>
                            <div className="apple-rich-text" dangerouslySetInnerHTML={{ __html: item.description }} />
                        </div>
                    </div>

                    <div id="full-spec" className="apple-accordion-item">
                        <div className="apple-accordion-header" onClick={() => setOpenInfor(!openInfor)}>
                            <h2 className="my_h3">Технические характеристики</h2>
                            <IoIosArrowDown className={openInfor ? 'open' : ''} />
                        </div>
                        <div className={`apple-accordion-content ${openInfor ? 'show' : ''}`}>
                            <div className="apple-specs-full-grid">
                                {item.specificationsJSONB && Object.entries(item.specificationsJSONB).map(([key, value]) => {
                                    if (value === "") return null;
                                    const filterMatch = itemFilters.find(f => f.name === key);
                                    const addition = filterMatch ? ` ${filterMatch.addition}` : "";
                                    return (
                                        <div key={key} className="apple-full-spec-row">
                                            <span className="key my_p">{key}</span>
                                            <span className="dots"></span>
                                            <span className="val my_p">{value}{addition}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="apple-accordion-item">
                        <div className="apple-accordion-header" onClick={() => setOpenReviews(!openReviews)}>
                            <h2 className="my_h3">Отзывы покупателей</h2>
                            <IoIosArrowDown className={openReviews ? 'open' : ''} />
                        </div>
                        <div className={`apple-accordion-content ${openReviews ? 'show' : ''}`}>
                            <ItemReviews itemId={item.id} />
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default CurrentItemPage;