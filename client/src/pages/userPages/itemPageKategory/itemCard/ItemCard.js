import React from 'react';
import { NavLink } from 'react-router-dom';
import { FiCheck, FiShoppingCart, FiBell } from "react-icons/fi";
import { ITEM_PREVIEW_ROUTE } from "../../../appRouter/Const";
import './ItemCard.scss';

const ItemCard = ({ item, isInCart, onAddToCart, renderStars, categoryName }) => {
    // Кастомный рендер звезд для нового стиля
    const renderModernStars = (rating) => {
        const rounded = Math.round(rating || 0);
        return [...Array(5)].map((_, i) => (
            <span key={i} className={`star ${i < rounded ? 'filled' : 'empty'}`}>★</span>
        ));
    };

    return (
        <div className={`card ${!item.isExist ? 'out-of-stock' : ''}`}>
            <NavLink
                className="card-link"
                to={{
                    pathname: `${ITEM_PREVIEW_ROUTE}/${item.id}`,
                    state: { path: [item.id] }
                }}
            >
                <div className="card-img-wrapper">
                    {item.images && item.images.length > 0 ? (
                        <img
                            src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`}
                            alt={item.name}
                            className="card-img"
                            onError={(e) => { e.target.src = '/placeholder-image.jpg'; }}
                        />
                    ) : (
                        <div className="no-image">Нет фото</div>
                    )}
                </div>

                <div className="status-wrapper">
                    <span className={`status-dot ${item.isExist ? 'instock-dot' : 'outstock-dot'}`}></span>
                    <span className={item.isExist ? 'instock-text' : 'outstock-text'}>
                        {item.isExist ? 'В наличии' : 'Нет в наличии'}
                    </span>
                </div>

                <div className="card-tags">
                    {categoryName} {item.rating > 0 && `• ⭐ ${item.rating}`}
                </div>

                <h3 className="card-title">{item.name}</h3>
                
                <div className="card-price">{item.price} BYN</div>
            </NavLink>

            {item.isExist ? (
                <button 
                    className={`btn-add ${isInCart ? 'active' : ''}`}
                    onClick={(e) => onAddToCart(e, item)}
                >
                    {isInCart ? (
                        <><FiCheck size={16} /> В корзине</>
                    ) : (
                        <><FiShoppingCart size={16} /> В корзину</>
                    )}
                </button>
            ) : (
                <></>
                // <button className="btn-add btn-notify">
                //     <FiBell size={16} /> Уведомить
                // </button>
            )}
        </div>
    );
};

export default ItemCard;