import React, { useState } from 'react';
import './InteractiveRating.scss';

const InteractiveRating = ({ initialRating = 0, setItemRating }) => {
    const [rating, setRating] = useState(initialRating); // Текущее значение рейтинга
    const [hoverRating, setHoverRating] = useState(0); // Рейтинг при наведении
    const totalStars = 5; // Общее количество звезд

    // Функция для обновления рейтинга при клике
    const handleClick = (index) => {
        setRating(index);
        setItemRating(index);
    };

    // Функция для обновления состояния при наведении
    const handleMouseEnter = (index) => {
        setHoverRating(index);
    };

    // Функция для сброса состояния при убирании мыши
    const handleMouseLeave = () => {
        setHoverRating(0);
    };

    const getStarType = (index) => {
        if (hoverRating) {
            return index <= hoverRating ? 'full' : 'empty';
        }
        return index <= rating ? 'full' : 'empty';
    };

    return (
        <div className="stars-container">
            {Array.from({ length: totalStars }, (_, i) => {
                const starIndex = (i);

                return (
                    <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        className={`star ${getStarType(starIndex)}`}
                        width="20"
                        height="20"
                        onClick={() => handleClick(starIndex)}
                        onMouseEnter={() => handleMouseEnter(starIndex)}
                        onMouseLeave={handleMouseLeave}
                    >
                        <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                    </svg>
                );
            })}
        </div>
    );
};

export default InteractiveRating;