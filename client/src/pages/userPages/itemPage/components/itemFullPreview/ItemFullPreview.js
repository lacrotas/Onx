import Headers from "../../../../../components/header/Header";
import Footer from "../../../../../components/footer/Footer";
import "./ItemFullPreview.scss";
import { useState, useEffect } from "react";
import { fetchItemId } from "../../../../../http/itemApi";
import { fetchAllItemImageByItemId } from "../../../../../http/itemImageApi";
import { fetchAllAttributeValuesByItemId } from "../../../../../http/itemAttributeApi";
import { fetchAttributeValuesById } from "../../../../../http/attributeValue";
import { fetchAttributeById } from "../../../../../http/filterApi";
import { fetchReviewByItemIdAndIsShowed } from "../../../../../http/reviewApi";
import CustomButton from "../../../../../customUI/customButton/CustomButton";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import Rating from "../../../../../components/rating/Rating";
import ItemReviews from "./itemReviews/ItemReviews";
import CustomAlert from "../../../../../components/customAlert/CustomAlert";
import { FiShoppingCart, FiCheck } from "react-icons/fi";


function ItemFullPreview() {
    const { id } = useParams();
    const [isAlertActive, setIsAlertActive] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [images, setImages] = useState([]);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [item, setItem] = useState(null);
    const [characteristics, setCharacteristics] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [averageMark, setAverageMark] = useState(0);
    const [activeTab, setActiveTab] = useState('description');

    const [isAddedToBasket, setIsAddedToBasket] = useState(false);
    useEffect(() => {
        let isMounted = true;
        fetchReviewByItemIdAndIsShowed(id).then(data => {
            setReviews(data);
            setAverageMark(calculateRating(data));
        })
        const loadData = async () => {
            try {
                const itemData = await fetchItemId(id);
                if (!isMounted) return;

                setItem(itemData);

                // Load images
                const imagesResponse = await fetchAllItemImageByItemId(itemData.id);
                const allImages = [itemData.image, ...imagesResponse.map(img => img.image)];
                setImages(allImages);

                // Load characteristics
                const attributesData = await fetchAllAttributeValuesByItemId(itemData.id);
                const characteristicsData = await Promise.all(
                    attributesData.map(async attr => {
                        const [value, attribute] = await Promise.all([
                            fetchAttributeValuesById(attr.valueId),
                            fetchAttributeById(attr.attributeId)
                        ]);
                        return {
                            name: attribute.name,
                            value: value.name
                        };
                    })
                );
                setCharacteristics(characteristicsData);

                // Load reviews
                // const reviewsData = await fetchReviewByItemIdAndIsShowed(id);
                // setReviews(reviewsData);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };

        loadData();

        return () => {
            isMounted = false;
        };
    }, [id]);

    function addToBasket() {
        setIsAddedToBasket(true);
        let basket = localStorage.getItem("maxiBasket") || "false";
        let newBasket = basket === "false" ? [] : basket.split(',');
        newBasket.push(item.id);
        localStorage.setItem('maxiBasket', newBasket);
    }
    function calculateRating(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((total, review) => total + Number(review.mark), 0);
        return sum / reviews.length;
    }
    const toggleFavorite = () => {
        setIsFavorite(!isFavorite);
    };

    const selectImage = (index) => {
        setCurrentImageIndex(index);
    };

    const getReviewWord = (number) => {
        const cases = [2, 0, 1, 1, 1, 2];
        const words = ['отзыв', 'отзыва', 'отзывов'];
        return words[
            (number % 100 > 4 && number % 100 < 20)
                ? 2
                : cases[Math.min(number % 10, 5)]
        ];
    };

    if (!item) return <div className="loading">Загрузка...</div>;
    return (
        <>
            {isAlertActive && (
                <CustomAlert
                    setIsModalActive={setIsAlertActive}
                    text={"Товар добавлен в корзину"}
                    autoClose={3000}
                />
            )}

            <Headers />

            <div className="product-page">
                <div className="product-header">
                    <h1 className="product-title">{item.name}</h1>
                    <div className="product-meta">
                        <div className="rating-availability">
                            <div className="rating-container">
                                {item.rating &&
                                    <Rating rating={Number(averageMark)} />
                                }
                                <span className="review-count">
                                    {reviews.length} {getReviewWord(reviews.length)}
                                </span>
                            </div>
                            <span className={`availability ${item.isExist ? 'in-stock' : 'out-of-stock'}`}>
                                {item.isExist ? 'В наличии' : 'Нет в наличии'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="product-content">
                    <div className="product-gallery">
                        <div className="thumbnail-list">
                            {images.map((img, index) => (
                                <div
                                    key={index}
                                    className={`thumbnail ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => selectImage(index)}
                                >
                                    <img
                                        src={process.env.REACT_APP_API_URL + img}
                                        alt={`Thumbnail ${index + 1}`}
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="main-image-container">
                            <div className="main-image">
                                <img
                                    src={process.env.REACT_APP_API_URL + images[currentImageIndex]}
                                    alt={item.name}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="product-info">
                        <div className="price-section">
                            <div className="price-container">
                                <span className="current-price">{item.price} ₽</span>
                                {item.oldPrice && (
                                    <span className="old-price">{item.oldPrice} ₽</span>
                                )}
                            </div>

                            <button
                                className={`add-to-cart ${isAddedToBasket ? 'added' : ''}`}
                                onClick={addToBasket}
                                disabled={!item.isExist}
                            >
                                {isAddedToBasket ? (
                                    <>
                                        <FiCheck className="cart-icon" />
                                        <span>В корзине</span>
                                    </>
                                ) : (
                                    <>
                                        <FiShoppingCart className="cart-icon" />
                                        <span>В корзину</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Characteristics */}
                        <div className="characteristics-section">
                            <h3 className="section-title">Характеристики</h3>
                            <div className="characteristics-grid">
                                {characteristics.map((char, index) => (
                                    <div key={index} className="characteristic-row">
                                        <span className="char-name">{char.name}</span>
                                        <span className="char-value">{char.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Product tabs */}
                <div className="product-tabs">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
                            onClick={() => setActiveTab('description')}
                        >
                            Описание
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
                            onClick={() => setActiveTab('reviews')}
                        >
                            Отзывы ({reviews.length})
                        </button>
                    </div>

                    <div className="tabs-content">
                        {activeTab === 'description' ? (
                            <div className="description-content">
                                <h3 className="content-title">Подробное описание</h3>
                                <div className="description-text">
                                    {item.description}
                                </div>
                            </div>
                        ) : (
                            <ItemReviews itemId={id} reviews={reviews} />
                        )}
                    </div>
                </div>

                {/* Mobile fixed cart button */}
                <div className="mobile-cart-fixed">
                    <div className="price-container">
                        <span className="current-price">{item.price} ₽</span>
                        {item.oldPrice && (
                            <span className="old-price">{item.oldPrice} ₽</span>
                        )}
                    </div>
                    <CustomButton
                        onClick={addToBasket}
                        disabled={!item.isExist}
                        className="add-to-cart-btn"
                    >
                        {item.isExist ? 'В корзину' : 'Нет в наличии'}
                    </CustomButton>
                </div>
            </div>

            <Footer />
        </>
    );
}

export default ItemFullPreview;