import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchItemId } from '../../../http/itemApi';
import { updateBusket, fetchBusketByUserId } from '../../../http/busketApi';
import { fetchMainKategoryById, fetchKategoryById } from '../../../http/KategoryApi';
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { BUSKET_ROUTE, ITEM_MAIN_ROUTE, ITEM_KATEGOTY_ROUTE } from "../../appRouter/Const";
import "./CurrentItemPage.scss";
import jwt_decode from 'jwt-decode';
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';
import { IoIosArrowDown } from "react-icons/io";
import ItemReviews from './itemReviews/ItemReviews';
import ModalWindow from '../../../components/modalWindow/ModalWindow';

const CurrentItemPage = () => {
    const history = useHistory();
    const { itemId } = useParams();
    
    // Состояния данных
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [mainKategory, setMainKategory] = useState(null);
    const [kategory, setKategory] = useState(null);

    // Состояния интерфейса
    const [isInCart, setIsInCart] = useState(false);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isImageView, setIsImageView] = useState(false);
    
    // Состояния аккордеонов
    const [openInfor, setOpenInfor] = useState(true);
    const [openDescription, setOpenDescription] = useState(true);
    const [openReviews, setOpenReviews] = useState(true);

    // Рефы для скролла
    const specsInforListRef = useRef(null);

    // Проверка наличия товара в корзине
    const checkItemInCart = async () => {
        setIsInCart(false);
        try {
            const token = localStorage.getItem('token');
            let isFound = false;

            if (token) {
                const userId = jwt_decode(token).id;
                const busket = await fetchBusketByUserId(userId);
                const currentItems = busket.itemsJsonb || [];

                const itemsForLocalStorage = currentItems.map(i => ({
                    id: i.itemId || i.id,
                    count: i.count || 1
                }));

                localStorage.setItem('basket', JSON.stringify(itemsForLocalStorage));
                window.dispatchEvent(new Event('cartUpdated'));

                isFound = currentItems.some(i => String(i.itemId || i.id) === String(itemId));
            } else {
                const savedBasket = localStorage.getItem('basket');
                if (savedBasket) {
                    const parsedBasket = JSON.parse(savedBasket);
                    isFound = parsedBasket.some(i => String(i.itemId || i.id) === String(itemId));
                }
            }
            setIsInCart(isFound);
        } catch (e) {
            console.error("Ошибка проверки корзины:", e);
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const itemData = await fetchItemId(itemId);
                const [mkData, kData] = await Promise.all([
                    fetchMainKategoryById(itemData.mainKategoryId),
                    fetchKategoryById(itemData.kategoryId)
                ]);
                
                setItem(itemData);
                setMainKategory(mkData);
                setKategory(kData);
                await checkItemInCart();
            } catch (err) {
                setError('Ошибка загрузки');
            } finally {
                setLoading(false);
            }
        };

        if (itemId) loadData();
    }, [itemId]);

    // Контент галереи
    const mediaItems = item ? [
        ...(item.video ? [{ type: 'video', src: item.video }] : []),
        ...(item.images ? item.images.map(img => ({ type: 'image', src: img })) : [])
    ] : [];

    const handleMediaClick = (index) => setCurrentMediaIndex(index);

    const handlePrevMedia = (e) => {
        e.stopPropagation();
        setCurrentMediaIndex(prev => prev === 0 ? (mediaItems.length - 1) : prev - 1);
    };

    const handleNextMedia = (e) => {
        e.stopPropagation();
        setCurrentMediaIndex(prev => prev === (mediaItems.length - 1) ? 0 : prev + 1);
    };

    const addToCart = async (count = 1) => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                const busket = await fetchBusketByUserId(jwt_decode(token).id);
                const currentItems = busket.itemsJsonb ? [...busket.itemsJsonb] : [];
                
                if (!currentItems.some(i => i.itemId === parseInt(itemId))) {
                    currentItems.push({ itemId: parseInt(itemId), count });
                    await updateBusket(busket.id, { itemsJsonb: currentItems });
                }
            }

            let localBasket = JSON.parse(localStorage.getItem('basket') || '[]');
            if (!localBasket.some(i => String(i.itemId || i.id) === String(itemId))) {
                localBasket.push({ itemId: itemId, id: itemId, count: 1 });
                localStorage.setItem('basket', JSON.stringify(localBasket));
            }

            window.dispatchEvent(new Event('cartUpdated'));
            setIsInCart(true);
            return true;
        } catch (error) {
            alert('Ошибка при добавлении');
            return false;
        }
    };

    const handleAddToCart = () => {
        if (isInCart) history.push(BUSKET_ROUTE);
        else addToCart(1);
    };

    const handleBuyNow = async () => {
        if (!isInCart) await addToCart(1);
        history.push(BUSKET_ROUTE);
    };

    const scrollToFullDetails = () => {
        const element = document.getElementById('full-spec');
        if (element) {
            const offset = element.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: offset, behavior: "smooth" });
        }
    };

    if (loading) return <div className="apple-loader my_h3">Загрузка...</div>;
    if (error || !item) return <div className="apple-error my_h3">Товар не найден</div>;

    return (
        <div className="apple-theme-page">
            <Header />
            
            {isImageView && (
                <ModalWindow 
                    type="viewImages" 
                    value={item.images} 
                    setIsModalActive={setIsImageView} 
                />
            )}

            <div className="apple-main-container">
                {/* Хлебные крошки */}
                <div className="apple-breadcrumbs">
                    {mainKategory && kategory && (
                        <Breadcrumbs items={[
                            { title: "Главная", path: "/" },
                            { title: mainKategory.name, path: ITEM_MAIN_ROUTE + "/" + mainKategory.id },
                            { title: kategory.name, path: ITEM_KATEGOTY_ROUTE + "/" + kategory.id },
                            { title: item.name }
                        ]} />
                    )}
                </div>

                <div className="apple-grid-layout">
                    {/* ГАЛЕРЕЯ */}
                    <div className="apple-gallery-col">
                        <div className="apple-viewer-card">
                            {mediaItems[currentMediaIndex]?.type === 'video' ? (
                                <video
                                    controls
                                    autoPlay
                                    src={`${process.env.REACT_APP_API_URL}static/video/${mediaItems[currentMediaIndex].src}`}
                                    className="apple-main-video"
                                />
                            ) : (
                                <img
                                    onClick={() => setIsImageView(true)}
                                    src={`${process.env.REACT_APP_API_URL}static/images/${mediaItems[currentMediaIndex]?.src}`}
                                    alt={item.name}
                                    className="apple-main-image"
                                />
                            )}
                            
                            {mediaItems.length > 1 && (
                                <div className="apple-gallery-nav">
                                    <button onClick={handlePrevMedia} className="apple-nav-btn">‹</button>
                                    <button onClick={handleNextMedia} className="apple-nav-btn">›</button>
                                </div>
                            )}
                        </div>

                        <div className="apple-thumbnails-grid">
                            {mediaItems.map((media, index) => (
                                <div
                                    key={index}
                                    className={`apple-thumb-box ${index === currentMediaIndex ? 'active' : ''}`}
                                    onClick={() => handleMediaClick(index)}
                                >
                                    {media.type === 'video' ? (
                                        <div className="apple-video-preview">▶</div>
                                    ) : (
                                        <img src={`${process.env.REACT_APP_API_URL}static/images/${media.src}`} alt="" />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ИНФОРМАЦИЯ */}
                    <div className="apple-info-col">
                        <h1 className="apple-product-title my_h1">{item.name}</h1>
                        
                        <div className="apple-price-row">
                            <span className="apple-price-tag my_h2">{item.price} BYN</span>
                            <span className={`apple-status-label my_p ${item.isExist ? 'in' : 'out'}`}>
                                {item.isExist ? '● В наличии' : '○ Нет в наличии'}
                            </span>
                        </div>

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

                        {item.specificationsJSONB && (
                            <div className="apple-preview-specs">
                                <h3 className="my_h3">Характеристики</h3>
                                {Object.entries(item.specificationsJSONB).slice(0, 5).map(([key, value]) => (
                                    <div key={key} className="apple-mini-spec">
                                        <span className="key my_p">{key}</span>
                                        <span className="dots"></span>
                                        <span className="val my_p">{value}</span>
                                    </div>
                                ))}
                                <button className="apple-text-link my_p" onClick={scrollToFullDetails}>
                                    Все характеристики ↓
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* НИЖНИЕ АККОРДЕОНЫ */}
                <div className="apple-bottom-details">
                    {/* Описание */}
                    <div className="apple-accordion-item">
                        <div className="apple-accordion-header" onClick={() => setOpenDescription(!openDescription)}>
                            <h2 className="my_h3">Полное описание</h2>
                            <IoIosArrowDown className={openDescription ? 'open' : ''} />
                        </div>
                        <div className={`apple-accordion-content ${openDescription ? 'show' : ''}`}>
                            <div className="apple-rich-text" dangerouslySetInnerHTML={{ __html: item.description }} />
                        </div>
                    </div>

                    {/* Все характеристики */}
                    <div id="full-spec" className="apple-accordion-item">
                        <div className="apple-accordion-header" onClick={() => setOpenInfor(!openInfor)}>
                            <h2 className="my_h3">Технические характеристики</h2>
                            <IoIosArrowDown className={openInfor ? 'open' : ''} />
                        </div>
                        <div className={`apple-accordion-content ${openInfor ? 'show' : ''}`}>
                            <div className="apple-specs-full-grid">
                                {item.specificationsJSONB && Object.entries(item.specificationsJSONB).map(([key, value]) => (
                                    <div key={key} className="apple-full-spec-row">
                                        <span className="key my_p">{key}</span>
                                        <span className="dots"></span>
                                        <span className="val my_p">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Отзывы */}
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