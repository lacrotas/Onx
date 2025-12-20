// CurrentItemPage.jsx
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
import { FiShoppingCart } from 'react-icons/fi';
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const mainImageRef = useRef(null);
    const [mainKategory, setMainKategory] = useState(null);
    const [kategory, setKategory] = useState(null);
    // характеристки
    const [openInfor, setOpenInfor] = useState(true);
    const specsInforListRef = useRef(null);
    // описание
    const [openDescription, setOpenDescription] = useState(true);
    const specsListRef = useRef(null);
    // отзывы
    const [openReviews, setOpenReviews] = useState(true);
    const specsReviewListRef = useRef(null);
    const [isImageView, setIsImageView] = useState(false);


    useEffect(() => {
        const loadData = async () => {
            try {
                const itemData = await fetchItemId(itemId);
                const mainKategoryData = await fetchMainKategoryById(itemData.mainKategoryId);
                const KategoryData = await fetchKategoryById(itemData.kategoryId);
                setItem(itemData);
                setMainKategory(mainKategoryData);
                setKategory(KategoryData);
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
    }, [itemId]);

    const handleImageClick = (index) => {
        setCurrentImageIndex(index);
    };

    const handlePrevImage = () => {
        setCurrentImageIndex(prev =>
            prev === 0 ? (item.images.length - 1) : prev - 1
        );
    };

    const handleNextImage = () => {
        setCurrentImageIndex(prev =>
            prev === (item.images.length - 1) ? 0 : prev + 1
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
                    currentItems[existingItemIndex] = {
                        ...currentItems[existingItemIndex],
                        count: currentItems[existingItemIndex].count + count,
                    };
                } else {
                    currentItems.push({ itemId: parseInt(itemId), count });
                }
                await updateBusket(busket.id, { itemsJsonb: currentItems });
            }
            const existingBasket = JSON.parse(localStorage.getItem('basket')) || [];
            const existingItemIndex = existingBasket.findIndex(item =>
                String(item.id) === String(itemId)
            );

            if (existingItemIndex === -1) {
                const updatedBasket = [...existingBasket, { id: itemId, count: 1 }];
                localStorage.setItem('basket', JSON.stringify(updatedBasket));
                console.log('Товар добавлен');
            }
            window.dispatchEvent(new Event('cartUpdated'));
            return true;
        } catch (error) {
            console.error('Ошибка добавления в корзину:', error);
            alert('Ошибка при добавлении товара в корзину');
            return false;
        }
    };

    const handleAddToCart = async () => {
        const success = await addToCart(1);
        if (success) {
            alert('Товар добавлен в корзину!');
        }
    };

    const handleBuyNow = async () => {
        const success = await addToCart(1);
        if (success) {
            history.push(BUSKET_ROUTE);
        }
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
                        {/* Слайды */}
                        <div className="wb-thumbnails-column">
                            {item.images.map((image, index) => (
                                <button
                                    key={index}
                                    className={`wb-thumb ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => handleImageClick(index)}
                                    type="button"
                                    aria-label={`Изображение ${index + 1}`}
                                >
                                    <img
                                        src={`${process.env.REACT_APP_API_URL}static/images/${image}`}
                                        alt=""
                                        onError={(e) => {
                                            e.target.src = '/placeholder-image.jpg';
                                        }}
                                    />
                                </button>
                            ))}
                        </div>

                        {/* Главная картинка */}
                        <div className="wb-image-column">
                            <div className="wb-main-image" ref={mainImageRef} onClick={() => setIsImageView(true)}>
                                <img
                                    src={`${process.env.REACT_APP_API_URL}static/images/${item.images[currentImageIndex]}`}
                                    alt={item.name}
                                    onError={(e) => {
                                        e.target.src = '/placeholder-image.jpg';
                                    }}
                                />
                                {item.images.length > 1 && (
                                    <>
                                        <button
                                            className="wb-nav-arrow wb-nav-prev"
                                            onClick={handlePrevImage}
                                            aria-label="Предыдущее изображение"
                                        >
                                            ‹
                                        </button>
                                        <button
                                            className="wb-nav-arrow wb-nav-next"
                                            onClick={handleNextImage}
                                            aria-label="Следующее изображение"
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
                                <div onClick={handleAddToCart} className='wb-add-to-cart-btn'>
                                    <p className="my_p_small">
                                        В корзину
                                    </p>
                                    <FiShoppingCart className="icon" />

                                </div>
                                <button onClick={handleAddToCart} className="wb-add-to-cart-btn byu_im my_p_small">
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