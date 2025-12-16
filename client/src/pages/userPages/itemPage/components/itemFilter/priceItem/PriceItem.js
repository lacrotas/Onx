import { useState, useRef, useEffect } from "react";
import "./PriceItem.scss";

function PriceItem({ setItemPrice }) {
    const [minPrice, setMinPrice] = useState(0);
    const [maxPrice, setMaxPrice] = useState(5000);
    const [isOpen, setIsOpen] = useState(false);
    const sliderRef = useRef(null);
    const minValRef = useRef(null);
    const maxValRef = useRef(null);
    const rangeRef = useRef(null);

    useEffect(() => {
        if (maxValRef.current && minValRef.current && rangeRef.current) {
            const minPercent = (minPrice / 5000) * 100;
            const maxPercent = (maxPrice / 5000) * 100;
            rangeRef.current.style.left = `${minPercent}%`;
            rangeRef.current.style.width = `${maxPercent - minPercent}%`;
        }
    }, [minPrice, maxPrice]);

    const handleMinChange = (event) => {
        const value = Math.min(Number(event.target.value), maxPrice - 1);
        setMinPrice(value);
    };

    const handleMaxChange = (event) => {
        const value = Math.max(Number(event.target.value), minPrice + 1);
        setMaxPrice(value);
    };

    const handleMinInputChange = (event) => {
        let value = Math.min(Number(event.target.value), maxPrice - 1);
        if (value < 0) value = 0;
        if (value > 5000) value = 5000;
        setMinPrice(value);
    };

    const handleMaxInputChange = (event) => {
        let value = Math.max(Number(event.target.value), minPrice + 1);
        if (value < 0) value = 0;
        if (value > 5000) value = 5000;
        setMaxPrice(value);
    };

    function UpdatePriceRange() {
        setItemPrice({ min: Number(minPrice), max: Number(maxPrice) });
    }

    return (
        <div className="filter-item">
            <div className="filter-item-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="filter-item-title common_reg tiny_p">Цена</span>
                <span className="filter-item-toggle">
                    {isOpen ? '−' : '+'}
                </span>
            </div>
            {isOpen && (
                <div className="price_slider-description">
                    <div className="slider-container" ref={sliderRef}>
                        <input
                            type="range"
                            min="0"
                            max="5000"
                            value={minPrice}
                            onChange={handleMinChange}
                            className="thumb thumb--left"
                            ref={minValRef}
                        />
                        <input
                            type="range"
                            min="0"
                            max="5000"
                            value={maxPrice}
                            onChange={handleMaxChange}
                            className="thumb thumb--right"
                            ref={maxValRef}
                        />
                        <div className="slider">
                            <div className="slider__track" />
                            <div className="slider__range" ref={rangeRef} />
                        </div>
                    </div>
                    <div className="price-inputs">
                        <div className="price-input">
                            <input
                                type="number"
                                value={minPrice}
                                onChange={handleMinInputChange}
                                min="0"
                                max={maxPrice - 1}
                            />
                        </div>
                        <div className="price-input">
                            <input
                                type="number"
                                value={maxPrice}
                                onChange={handleMaxInputChange}
                                min={minPrice + 1}
                                max="5000"
                            />
                        </div>
                    </div>
                    <div className="custom_button_price" onClick={UpdatePriceRange}>
                        <p className="custom_button_text tiny_p common_reg">Применить</p>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PriceItem;