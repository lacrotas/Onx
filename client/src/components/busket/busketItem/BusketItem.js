import { useState } from "react";
import { FaMinus, FaPlus, FaTimes } from "react-icons/fa";
import "./BusketItem.scss";

function BusketItem({ removeItem, item, setFinalSum, index, initialQuantity = 1 }) {
    const [counter, setCounter] = useState(initialQuantity);
    const [price, setPrice] = useState(item.price);

    function changeCounter(type) {
        setCounter(prevCounter => {
            if (type === "minus" && prevCounter <= 1) return prevCounter;

            const newCounter = type === "minus" ? prevCounter - 1 : prevCounter + 1;
            const priceDiff = item.price * (newCounter - prevCounter);
            setPrice(item.price * newCounter);
            setFinalSum(prev => prev + priceDiff);

            // Обновляем localStorage
            let busket = localStorage.getItem("maxiBasket") || "false";
            let newBusket = busket === "false" ? [] : busket.split(',');

            if (type === "minus") {
                const index = newBusket.findIndex(id => id === item.id.toString());
                if (index !== -1) newBusket.splice(index, 1);
            } else {
                newBusket.push(item.id.toString());
            }

            localStorage.setItem('maxiBasket', newBusket.join(','));

            return newCounter;
        });
    }

    return (
        <div className="cart-item">
            <div className="item-image-container">
                <img
                    src={process.env.REACT_APP_API_URL + item.image}
                    className="item-image"
                    alt={item.name}
                />
            </div>

            <div className="item-details">
                <h3 className="item-name">{item.name}</h3>
                <p className="item-status">
                    <span className="status-dot"></span>
                    есть в наличии
                </p>

                <div className="item-controls">
                    <div className="quantity-selector">
                        <button
                            className="quantity-btn minus"
                            onClick={() => changeCounter("minus")}
                            disabled={counter <= 1}
                        >
                            <FaMinus size={12} />
                        </button>
                        <span className="quantity-value">{counter}</span>
                        <button
                            className="quantity-btn plus"
                            onClick={() => changeCounter("plus")}
                        >
                            <FaPlus size={12} />
                        </button>
                    </div>

                    <div className="price-container">
                        <span className="price-label">Сумма:</span>
                        <span className="price-value">{price} руб</span>
                    </div>
                </div>
            </div>

            <button
                className="remove-btn"
                onClick={() => removeItem(index)}
                aria-label="Удалить товар"
            >
                <FaTimes size={16} />
            </button>
        </div>
    );
}

export default BusketItem;