import React from 'react';
import './Rating.scss';

const Rating = ({ rating }) => {
    const totalStars = 5;

    const getStarType = (index) => {
        if (index + 1 <= rating) {
            return 'full'; // Полная звезда
        } else if (index + 0.5 === rating) {
            return 'half'; // Полузвезда
        } else {
            return 'empty'; // Пустая звезда
        }
    };

    return (
        <div className="stars-container">
            {Array.from({ length: totalStars }, (_, index) => {
                const starType = getStarType(index);

                return (
                    <svg
                        key={index}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 576 512"
                        className={`star ${starType}`} // Определяем тип звезды (full, half, empty)
                        width="15"
                        height="15"
                    >
                        {starType === 'full' && (
                            <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                        )}
                        {starType === 'half' && (
                            <>
                                {/* Левая половина звезды */}
                                <path d="M259.3 17.8L194 150.2 47.9 171.4c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.1 23 46 46.4 33.7L288 439.6V0z" fill="#FFD700" />
                                {/* Правая половина звезды */}
                                <path d="M288 0v439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" fill="#DDDDDD" />
                            </>
                        )}
                        {starType === 'empty' && (
                            <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                        )}
                    </svg>
                );
            })}
        </div>
    );
};

export default Rating;
