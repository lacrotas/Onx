import React from 'react';
import './Loader.scss';

const Loader = ({ isVisible, text = "Сохранение данных..." }) => {
    if (!isVisible) return null;

    return (
        <div className="loading-overlay">
            <div className="loader-content">
                <div className="spinner"></div>
                {text && <p className="loader-text">{text}</p>}
            </div>
        </div>
    );
};

export default Loader;