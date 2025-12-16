import { useState } from "react";
import "./PriceItem.scss";
import ArrowClosed from "../../assets/images/plus.png";
import ArrowOpen from "../../assets/images/minus.png";

function PriceItem({ setItemPrice }) {
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [isPriceOpen, setIsPriceOpen] = useState(false);
    const handleMinPriceChange = (event) => {
        const value = Math.min(Number(event.target.value), maxPrice - 1);
        setMinPrice(value);
    };

    const handleMaxPriceChange = (event) => {
        const value = Math.max(Number(event.target.value), minPrice + 1);
        setMaxPrice(value);
    };

    function UpdatePriceRange() {
        setItemPrice({ min: Number(minPrice), max: Number(maxPrice) })
    }

    return (
        <div className="price_slider">
            <div className="price_slider-header" onClick={() => { setIsPriceOpen(!isPriceOpen) }}>
                <img className="slider_header-image" src={isPriceOpen ? ArrowOpen : ArrowClosed} alt="arrow" />
                <p className="slider_header-paragraph jura_semi-medium_p">Стоимость</p>
            </div>
            <div className={`price_slider-description ${isPriceOpen ? "active" : "unactive"}`}>
                <div className="slider_container">
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        value={minPrice}
                        onChange={handleMinPriceChange}
                    />
                    <input
                        type="range"
                        min="0"
                        max="5000"
                        value={maxPrice}
                        onChange={handleMaxPriceChange}
                    />
                </div>
                <div className="price_values">
                    <p>Мин.цена: {minPrice} руб.</p>
                    <p>Макс. цена: {maxPrice} руб.</p>
                </div>
                <div className="custom_button" onClick={() => UpdatePriceRange()}>
                    < p className="custom_button_text tiny_p" >Применить</p >
                </div >
            </div>

        </div >
    );
};
export default PriceItem;


