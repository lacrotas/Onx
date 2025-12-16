import "./GridItemPrewiev.scss";
import Rating from "../../../../../../components/rating/Rating";
import { ITEM_PREVIEW_ROUTE } from "../../../../../appRouter/Const";
import { NavLink } from "react-router-dom";
import { fetchAllAttributeValuesByItemId } from "../../../../../../http/itemAttributeApi";
import { fetchReviewByItemIdAndIsShowed } from "../../../../../../http/reviewApi";
import { useState, useEffect } from "react";
import { FiShoppingCart, FiCheck } from "react-icons/fi";

function GridItemPreview({ itemPrice, item, currentFilter }) {
    const [attributesValue, setAttributeValue] = useState([]);
    const [averageMark, setAverageMark] = useState(0);
    const [reviewsLength, setReviewsLength] = useState(0);
    const [isRight, setIsRight] = useState(true);
    const [isAddedToBasket, setIsAddedToBasket] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        fetchAllAttributeValuesByItemId(item.id).then(data => {
            setAttributeValue(data || []);
        });
        fetchReviewByItemIdAndIsShowed(item.id).then(data => {
            setAverageMark(calculateRating(data));
            setReviewsLength(data.length);
        });
    }, [item.id]);

    useEffect(() => {
        if (Number(item.price) > itemPrice.min && Number(item.price) < itemPrice.max) {
            setIsRight(checkFilters(currentFilter, attributesValue));
        } else {
            setIsRight(false);
        }
    }, [currentFilter, itemPrice, item.price, attributesValue]);

    function calculateRating(reviews) {
        if (!reviews || reviews.length === 0) return 0;
        const sum = reviews.reduce((total, review) => total + Number(review.mark), 0);
        return sum / reviews.length;
    }

    function checkFilters(currentFilter, attributesValue) {
        const groupedFilters = currentFilter.reduce((acc, filter) => {
            if (!acc[filter.attributeId]) {
                acc[filter.attributeId] = [];
            }
            acc[filter.attributeId].push(filter);
            return acc;
        }, {});

        for (let attributeId in groupedFilters) {
            const matchingAttribute = attributesValue.find(item =>
                Number(item.attributeId) === Number(attributeId)
            );

            if (matchingAttribute) {
                const hasMatchingValueId = groupedFilters[attributeId].some(filter =>
                    Number(filter.valueId) === Number(matchingAttribute.valueId)
                );

                if (!hasMatchingValueId) {
                    return false;
                }
            }
        }

        return true;
    }

    function addToBasket() {
        setIsAddedToBasket(true);
        let basket = localStorage.getItem("maxiBasket") || "false";
        let newBasket = basket === "false" ? [] : basket.split(',');
        newBasket.push(item.id);
        localStorage.setItem('maxiBasket', newBasket);
    }

    return (
        <>
            {isRight && (
                <div
                    className={`product-card ${isHovered ? 'hovered' : ''} ${!item.isExist ? 'out-of-stock' : ''}`}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                >
                    <div className={`card-badge ${item.isExist ? 'in-stock' : 'out-of-stock'}`}>
                        {item.isExist ? 'В наличии' : 'Нет в наличии'}
                    </div>

                    <NavLink to={ITEM_PREVIEW_ROUTE + "/" + item.id} className="card-image-link">
                        <div className="card-image-container">
                            <img
                                src={process.env.REACT_APP_API_URL + item.image}
                                alt={item.name}
                                className="card-image"
                                loading="lazy"
                            />
                        </div>
                    </NavLink>

                    <div className="card-content">
                        <h3 className="card-title">{item.name}</h3>

                        <div className="card-rating">
                            <Rating rating={averageMark} />
                            {reviewsLength > 0 ? (
                                <span className="reviews-count">{reviewsLength} отзывов</span>
                            ) : (
                                <span className="reviews-count">Нет отзывов</span>
                            )}
                        </div>

                        <div className="card-price">{item.price} Р.</div>

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
                </div>
            )}
        </>
    );
}

export default GridItemPreview;