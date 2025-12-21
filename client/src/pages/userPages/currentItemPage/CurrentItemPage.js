import React, { useState, useEffect, useRef } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { fetchItemId } from '../../../http/itemApi';
import { postToBusket, updateBusket, fetchBusketByUserId } from '../../../http/busketApi';
import { fetchMainKategoryById, fetchKategoryById } from '../../../http/KategoryApi';
import Header from "../../../components/header/Header";
import Footer from "../../../components/footer/Footer";
import { BUSKET_ROUTE } from "../../appRouter/Const";
import "./CurrentItemPage.scss";
import jwt_decode from 'jwt-decode';
import Breadcrumbs from '../../../components/breadcrumbs/Breadcrumbs';
import { FiShoppingCart, FiCheck } from 'react-icons/fi'; // Добавил иконку галочки
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { ITEM_MAIN_ROUTE, ITEM_KATEGOTY_ROUTE } from "../../appRouter/Const";
import ItemReviews from './itemReviews/ItemReviews';
import ModalWindow from '../../../components/modalWindow/ModalWindow';

const CurrentItemPage = () => {
    const history = useHistory();
    const { itemId } = useParams();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Состояние: товар уже в корзине?
    const [isInCart, setIsInCart] = useState(false);

    // Индекс текущего медиа (видео или картинки)
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);

    const mainImageRef = useRef(null);
    const [mainKategory, setMainKategory] = useState(null);
    const [kategory, setKategory] = useState(null);

    // Характеристики
    const [openInfor, setOpenInfor] = useState(true);
    const specsInforListRef = useRef(null);

    // Описание
    const [openDescription, setOpenDescription] = useState(true);
    const specsListRef = useRef(null);

    // Отзывы
    const [openReviews, setOpenReviews] = useState(true);
    const specsReviewListRef = useRef(null);

    const [isImageView, setIsImageView] = useState(false);

    // Проверка наличия товара в корзине + Синхронизация с localStorage
    const checkItemInCart = async () => {
        // Сбрасываем состояние перед проверкой
        setIsInCart(false);

        try {
            const userId = localStorage.getItem('token');
            let isFound = false;

            if (userId) {
                // --- ЛОГИКА ДЛЯ АВТОРИЗОВАННОГО ПОЛЬЗОВАТЕЛЯ ---
                const busket = await fetchBusketByUserId(jwt_decode(userId).id);
                const currentItems = busket.itemsJsonb || [];

                console.log("Корзина с сервера:", currentItems);

                // === ВАЖНО: СИНХРОНИЗАЦИЯ СЕРВЕРА С LOCALSTORAGE ===
                // Преобразуем формат сервера (itemId) в формат localStorage (id)
                const itemsForLocalStorage = currentItems.map(item => ({
                    id: item.itemId || item.id, // Берем itemId, если есть, иначе id
                    count: item.count || 1
                }));

                // Сохраняем актуальную корзину с сервера в память браузера
                localStorage.setItem('basket', JSON.stringify(itemsForLocalStorage));
                // Генерируем событие, чтобы шапка сайта (если она слушает) обновилась
                window.dispatchEvent(new Event('cartUpdated'));

                if (currentItems && Array.isArray(currentItems)) {
                    isFound = currentItems.some(item => {
                        const idInBasket = item.itemId || item.id;
                        return String(idInBasket) === String(itemId);
                    });
                }
            } else {
                const savedBasket = localStorage.getItem('basket');
                if (savedBasket) {
                    const parsedBasket = JSON.parse(savedBasket);

                    if (Array.isArray(parsedBasket)) {
                        isFound = parsedBasket.some(item => {
                            const idInBasket = item.itemId || item.id;
                            return String(idInBasket) === String(itemId);
                        });
                    }
                }
            }

            setIsInCart(isFound);

        } catch (e) {
            console.error("Ошибка проверки корзины:", e);
            setIsInCart(false);
        }
    };
    useEffect(() => {
        // Сбрасываем состояние СРАЗУ при смене товара, до начала любых загрузок
        setIsInCart(false);

        const loadData = async () => {
            try {
                const itemData = await fetchItemId(itemId);
                const mainKategoryData = await fetchMainKategoryById(itemData.mainKategoryId);
                const KategoryData = await fetchKategoryById(itemData.kategoryId);
                setItem(itemData);
                setMainKategory(mainKategoryData);
                setKategory(KategoryData);

                // Запускаем проверку корзины
                await checkItemInCart();
            } catch (err) {
                console.error('Ошибка загрузки товара:', err);
                setError('Ошибка загрузки товара');
            } finally {
                setLoading(false);
            }
        };

        if (itemId) {
            loadData();
        }
        // eslint-disable-next-line
    }, [itemId]);

    // Формируем единый список медиа-контента
    const mediaItems = item ? [
        ...(item.video ? [{ type: 'video', src: item.video }] : []),
        ...(item.images ? item.images.map(img => ({ type: 'image', src: img })) : [])
    ] : [];

    const handleMediaClick = (index) => {
        setCurrentMediaIndex(index);
    };

    const handlePrevMedia = (e) => {
        if (e) e.stopPropagation();
        setCurrentMediaIndex(prev =>
            prev === 0 ? (mediaItems.length - 1) : prev - 1
        );
    };

    const handleNextMedia = (e) => {
        if (e) e.stopPropagation();
        setCurrentMediaIndex(prev =>
            prev === (mediaItems.length - 1) ? 0 : prev + 1
        );
    };

    const addToCart = async (count = 1) => {
        try {
            const userId = localStorage.getItem('token');
            if (userId) {
                const busket = await fetchBusketByUserId(jwt_decode(userId).id);
                const currentItems = busket.itemsJsonb ? [...busket.itemsJsonb] : [];
                const existingItemIndex = currentItems.findIndex(item => item.itemId === parseInt(itemId));

                if (existingItemIndex >= 0) {
                    // Если товар уже есть, мы просто обновляем стейт (хотя кнопка не должна давать сюда зайти)
                    setIsInCart(true);
                    return true;
                } else {
                    currentItems.push({ itemId: parseInt(itemId), count });
                }
                await updateBusket(busket.id, { itemsJsonb: currentItems });
            }

            // Логика для localStorage
            let existingBasket = [];
            const savedBasket = localStorage.getItem('basket');
            if (savedBasket) {
                try {
                    existingBasket = JSON.parse(savedBasket);
                } catch (e) {
                    existingBasket = [];
                }
            }

            const existingItemIndex = existingBasket.findIndex(item =>
                String(item.itemId) === String(itemId)
            );

            if (existingItemIndex === -1) {
                const updatedBasket = [...existingBasket, { itemId: itemId, count: 1 }];
                localStorage.setItem('basket', JSON.stringify(updatedBasket));
            }

            console.log('Товар добавлен');
            window.dispatchEvent(new Event('cartUpdated'));
            setIsInCart(true);
            return true;
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Ошибка при добавлении товара в корзину');
            return false;
        }
    };

    const handleAddToCart = async () => {
        if (isInCart) {
            // Если уже в корзине, переходим в корзину
            history.push(BUSKET_ROUTE);
            return;
        }

        const success = await addToCart(1);
        if (success) {
            // alert('Товар добавлен в корзину!'); // Можно убрать алерт, так как кнопка меняется
        }
    };

    const handleBuyNow = async () => {
        if (!isInCart) {
            await addToCart(1);
        }
        history.push(BUSKET_ROUTE);
    };

    const scrollToFullDetails = () => {
        document.getElementById('full-spec')?.scrollIntoView({ behavior: 'smooth' });
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="wb-current-item loading">Загрузка...</div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="wb-current-item error">Ошибка загрузки товара</div>
                <Footer />
            </>
        );
    }

    if (!item) {
        return (
            <>
                <Header />
                <div className="wb-current-item error">Товар не найден</div>
                <Footer />
            </>
        );
    }

    return (
        <>
            {isImageView &&
                <ModalWindow type="viewImages"
                    value={item.images}
                    setIsModalActive={setIsImageView} />}
            <Header />
            <div className="wb-container">
                <h1 className="wb-product-header my_h2">{item.name}</h1>
                {mainKategory && kategory && item &&
                    <Breadcrumbs items={[
                        { title: "Главная", path: "/" },
                        { title: mainKategory.name, path: ITEM_MAIN_ROUTE + "/" + mainKategory.id },
                        { title: kategory.name, path: ITEM_KATEGOTY_ROUTE + "/" + kategory.id },
                        { title: item.name }
                    ]} />
                }
                <div className="wb-main-content">
                    <div className='wb-content_image'>
                        {/* Слайды (Миниатюры) */}
                        <div className="wb-thumbnails-column">
                            {mediaItems.map((media, index) => (
                                <button
                                    key={index}
                                    className={`wb-thumb ${index === currentMediaIndex ? 'active' : ''}`}
                                    onClick={() => handleMediaClick(index)}
                                    type="button"
                                    aria-label={`Медиа ${index + 1}`}
                                >
                                    {media.type === 'video' ? (
                                        <div className="video-thumb-wrapper">
                                            <video
                                                src={`${process.env.REACT_APP_API_URL}static/video/${media.src}`}
                                                className="thumb-video"
                                                muted
                                                preload="metadata"
                                            />
                                            <div className="video-badge">▶</div>
                                        </div>
                                    ) : (
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}static/images/${media.src}`}
                                            alt=""
                                            onError={(e) => {
                                                e.target.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Главный просмотрщик */}
                        <div className="wb-image-column">
                            <div className="wb-main-image" ref={mainImageRef}>
                                {mediaItems[currentMediaIndex]?.type === 'video' ? (
                                    <video
                                        controls
                                        autoPlay
                                        src={`${process.env.REACT_APP_API_URL}static/video/${mediaItems[currentMediaIndex].src}`}
                                        className="main-video-player"
                                    />
                                ) : (
                                    <img
                                        onClick={() => setIsImageView(true)}
                                        src={`${process.env.REACT_APP_API_URL}static/images/${mediaItems[currentMediaIndex]?.src}`}
                                        alt={item.name}
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                )}

                                {mediaItems.length > 1 && (
                                    <>
                                        <button
                                            className="wb-nav-arrow wb-nav-prev"
                                            onClick={handlePrevMedia}
                                            aria-label="Предыдущее"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            className="wb-nav-arrow wb-nav-next"
                                            onClick={handleNextMedia}
                                            aria-label="Следующее"
                                        >
                                            ›
                                        </button>
                                    </>
                                )}
                                {!item.isExist && (
                                    <div className="wb-out-of-stock my_p_small">
                                        Нет в наличии
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    {/* Правая колонка - информация */}
                    <div className="wb-info-column">
                        {/* Блок покупки */}
                        <div className="wb-actions">
                            <div className="wb-price-section">
                                <div className="wb-price my_h1">{item.price} BYN</div>
                                {item.isExist ? (
                                    <div className="wb-availability my_p_small">В наличии</div>
                                ) : (
                                    <div className="wb-availability out-of-stock my_p_small">Нет в наличии</div>
                                )}
                            </div>
                            <div className='actions_down'>
                                {/* КНОПКА В КОРЗИНУ */}
                                <div
                                    onClick={() => handleAddToCart()}
                                    className={`wb-add-to-cart-btn ${isInCart ? 'in-cart' : ''}`}
                                    style={isInCart ? { backgroundColor: '#3aa41d', borderColor: '#3aa41d' } : {}}
                                >
                                    <p className="my_p_small">
                                        {isInCart ? 'В корзине' : 'В корзину'}
                                    </p>
                                    {isInCart ? <FiCheck className="icon" /> : <FiShoppingCart className="icon" />}
                                </div>

                                <button onClick={() => handleBuyNow()} className="wb-add-to-cart-btn byu_im my_p_small">
                                    Купить сейчас
                                </button>
                            </div>
                        </div>
                        {item.specificationsJSONB && Object.keys(item.specificationsJSONB).length > 0 && (
                            <div className="wb-specs wb-specs-short">
                                <h3 className="wb-specs-title my_p">Характеристики</h3>
                                <div className="wb-specs-list">
                                    {Object.entries(item.specificationsJSONB).slice(0, 6).map(([key, value]) => (
                                        <div key={key} className="wb-spec-item">
                                            <span className="wb-spec-key my_p">{key}:</span>
                                            <span className="wb-spec-val my_p">{value}</span>
                                        </div>
                                    ))}

                                </div>
                                <div className="wb-view-all-btn my_p" onClick={() => scrollToFullDetails()}>
                                    Все характеристики
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Полный блок внизу */}
                <div className="wb-full-details">
                    {item.description && (
                        <div className="wb-description wb-description-full">
                            <div
                                className="spec_full_header"
                                onClick={() => setOpenDescription(!openDescription)}
                            >
                                <h3 className="wb-desc-title my_h3">Полное описание</h3>
                                {!openDescription ? (
                                    <IoIosArrowDown className="header_icon-item" />
                                ) : (
                                    <IoIosArrowUp className="header_icon-item" />
                                )}
                            </div>
                            <div ref={specsListRef}
                                className={`wb-specs-list-descrption ${openDescription ? 'open' : ''}`}
                            >
                                {item.description.split('\r\n').map((paragraph, index) => (
                                    <p className="wb-description_text my_p" key={index}>{paragraph}</p>
                                ))}
                            </div>
                        </div>
                    )}
                    {item.specificationsJSONB && Object.keys(item.specificationsJSONB).length > 0 && (
                        <div id='full-spec' className="wb-specs wb-specs-full">
                            <div
                                className="spec_full_header"
                                onClick={() => setOpenInfor(!openInfor)}
                            >
                                <h3 className="wb-specs-title my_h3">Все характеристики</h3>
                                {!openInfor ? (
                                    <IoIosArrowDown className="header_icon-item" />
                                ) : (
                                    <IoIosArrowUp className="header_icon-item" />
                                )}
                            </div>
                            <div
                                ref={specsInforListRef}
                                className={`wb-specs-list ${openInfor ? 'open' : ''}`}
                            >
                                {Object.entries(item.specificationsJSONB).map(([key, value]) => (
                                    <div key={key} className="wb-spec-item_full">
                                        <span className="wb-spec-key my_p">{key}:</span>
                                        <span className="wb-spec-dots my_p"></span>
                                        <span className="wb-spec-val my_p">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {/* отзывыв */}
                    {item.description && (
                        <div className="wb-description wb-description-full">
                            <div
                                className="spec_full_header"
                                onClick={() => setOpenReviews(!openReviews)}
                            >
                                <h3 className="wb-desc-title my_h3">Отзывы</h3>
                                {!openReviews ? (
                                    <IoIosArrowDown className="header_icon-item" />
                                ) : (
                                    <IoIosArrowUp className="header_icon-item" />
                                )}
                            </div>
                            <div ref={specsReviewListRef}
                                className={`wb-specs-list-descrption ${openReviews ? 'open' : ''}`}
                            >
                                <ItemReviews itemId={item.id} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default CurrentItemPage;