import React, { useState, useRef } from 'react';
import ModalWindow from '../../../../components/modalWindow/ModalWindow';
import "./ItemGallery.scss";

const ItemGallery = ({ item }) => {
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isImageView, setIsImageView] = useState(false);

    // Стейты и реф для кастомного скролла (drag-to-scroll)
    const sliderRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isDragged, setIsDragged] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Контент галереи
    const mediaItems = item ? [
        ...(item.video ? [{ type: 'video', src: item.video }] : []),
        ...(item.images ? item.images.map(img => ({ type: 'image', src: img })) : [])
    ] : [];

    const handlePrevMedia = (e) => {
        e.stopPropagation();
        setCurrentMediaIndex(prev => prev === 0 ? (mediaItems.length - 1) : prev - 1);
    };

    const handleNextMedia = (e) => {
        e.stopPropagation();
        setCurrentMediaIndex(prev => prev === (mediaItems.length - 1) ? 0 : prev + 1);
    };

    // --- Логика перетягивания слайдера ---
    const startDrag = (e) => {
        setIsDragging(true);
        setIsDragged(false);
        setStartX(e.pageX - sliderRef.current.offsetLeft);
        setScrollLeft(sliderRef.current.scrollLeft);
    };

    const stopDrag = () => {
        setIsDragging(false);
    };

    const onDrag = (e) => {
        if (!isDragging) return;
        e.preventDefault();
        setIsDragged(true);
        const x = e.pageX - sliderRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        sliderRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleThumbClick = (index) => {
        if (isDragged) return;
        setCurrentMediaIndex(index);
    };

    // Обработчик клика по главному блоку
    const handleCardClick = () => {
        // Открываем модалку только если текущий элемент — это картинка, а не видео
        if (mediaItems[currentMediaIndex]?.type !== 'video') {
            setIsImageView(true);
        }
    };

    if (!item) return null;

    const isCurrentVideo = mediaItems[currentMediaIndex]?.type === 'video';

    return (
        <div className="apple-gallery-col">
            {isImageView && (
                <ModalWindow 
                    type="viewImages" 
                    value={item.images} 
                    setIsModalActive={setIsImageView} 
                />
            )}

            {/* Вешаем клик на сам блок. Добавляем класс, если это видео, чтобы менять курсор */}
            <div 
                className={`apple-viewer-card ${isCurrentVideo ? 'is-video' : ''}`}
                onClick={handleCardClick}
            >
                {/* Обертка, которая жестко держит картинку по центру */}
                <div className="media-wrapper">
                    {isCurrentVideo ? (
                        <video
                            controls
                            autoPlay
                            src={`${process.env.REACT_APP_API_URL}static/video/${mediaItems[currentMediaIndex].src}`}
                            className="apple-main-video"
                            onClick={(e) => e.stopPropagation()} // Чтобы клик по самому плееру не вызывал ничего лишнего
                        />
                    ) : (
                        <img
                            src={`${process.env.REACT_APP_API_URL}static/images/${mediaItems[currentMediaIndex]?.src}`}
                            alt={item.name}
                            className="apple-main-image"
                        />
                    )}
                </div>
                
                {mediaItems.length > 1 && (
                    <div className="apple-gallery-nav">
                        <button onClick={handlePrevMedia} className="apple-nav-btn">‹</button>
                        <button onClick={handleNextMedia} className="apple-nav-btn">›</button>
                    </div>
                )}
            </div>

            <div 
                className="apple-thumbnails-grid"
                ref={sliderRef}
                onMouseDown={startDrag}
                onMouseLeave={stopDrag}
                onMouseUp={stopDrag}
                onMouseMove={onDrag}
            >
                {mediaItems.map((media, index) => (
                    <div
                        key={index}
                        className={`apple-thumb-box ${index === currentMediaIndex ? 'active' : ''}`}
                        onClick={() => handleThumbClick(index)}
                    >
                        {media.type === 'video' ? (
                            <div className="apple-video-preview">▶</div>
                        ) : (
                            <img src={`${process.env.REACT_APP_API_URL}static/images/${media.src}`} alt="" />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ItemGallery;