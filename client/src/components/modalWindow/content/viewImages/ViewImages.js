// ViewImages.jsx
import React, { useState } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import './ViewImages.scss';

function ViewImages({ images = [], setIsModalActive }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!Array.isArray(images) || images.length === 0) {
    return <div className="view-images-empty">Нет изображений</div>;
  }

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
  };

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setIsModalActive(false);
  };

  return (
    <div className="view-images" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Крестик закрытия */}
      <button
        className="view-images-close"
        onClick={() => setIsModalActive(false)}
        aria-label="Закрыть галерею"
      >
        ×
      </button>

      {/* Миниатюры слева */}
      <div className="view-images-thumbnails">
        {images.map((image, index) => (
          <button
            key={index}
            className={`view-images-thumb ${index === activeIndex ? 'active' : ''}`}
            onClick={() => handleThumbnailClick(index)}
            type="button"
            aria-label={`Изображение ${index + 1}`}
          >
            <img
              src={`${process.env.REACT_APP_API_URL}static/images/${image}`}
              alt={`Миниатюра ${index + 1}`}
              onError={(e) => (e.target.src = '/placeholder-image.jpg')}
            />
          </button>
        ))}
      </div>

      {/* Основное изображение с кнопками навигации */}
      <div className="view-images-main">
        {images.length > 1 && (
          <>
            <button
              className="view-images-nav view-images-nav--prev"
              onClick={goToPrev}
              aria-label="Предыдущее изображение"
            >
              <IoIosArrowBack size={32} />
            </button>

            <button
              className="view-images-nav view-images-nav--next"
              onClick={goToNext}
              aria-label="Следующее изображение"
            >
              <IoIosArrowForward size={32} />
            </button>
          </>
        )}

        <img
          src={`${process.env.REACT_APP_API_URL}static/images/${images[activeIndex]}`}
          alt={`Основное изображение ${activeIndex + 1}`}
          className="view-images-main-img"
          onError={(e) => (e.target.src = '/placeholder-image.jpg')}
        />
      </div>
    </div>
  );
}

export default ViewImages;