import React, { useState, useRef } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiX } from "react-icons/fi";
import './ViewImages.scss';

function ViewImages({ images = [], setIsModalActive }) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Стейты и реф для кастомного скролла (drag-to-scroll)
  const thumbnailsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  if (!Array.isArray(images) || images.length === 0) {
    return <div className="view-images-empty my_p">Нет изображений</div>;
  }

  // --- Логика перетягивания слайдера (универсальная X/Y) ---
  const startDrag = (e) => {
    setIsDragging(true);
    setIsDragged(false); // Сбрасываем флаг перетягивания
    setStartPos({
      x: e.pageX - thumbnailsRef.current.offsetLeft,
      y: e.pageY - thumbnailsRef.current.offsetTop
    });
    setScrollPos({
      left: thumbnailsRef.current.scrollLeft,
      top: thumbnailsRef.current.scrollTop
    });
  };

  const stopDrag = () => {
    setIsDragging(false);
  };

  const onDrag = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    setIsDragged(true); // Произошел именно свайп, а не клик

    const x = e.pageX - thumbnailsRef.current.offsetLeft;
    const y = e.pageY - thumbnailsRef.current.offsetTop;
    
    // Высчитываем смещение (умножаем на 2 для скорости)
    const walkX = (x - startPos.x) * 2;
    const walkY = (y - startPos.y) * 2;
    
    // Применяем скролл (будет работать и вертикально, и горизонтально)
    thumbnailsRef.current.scrollLeft = scrollPos.left - walkX;
    thumbnailsRef.current.scrollTop = scrollPos.top - walkY;
  };

  const handleThumbnailClick = (index) => {
    if (isDragged) return; // Блокируем клик, если пользователь просто листал ленту
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
      
      {/* Левая панель с миниатюрами (на мобилке — нижняя) */}
      <div 
        className="view-images-thumbnails"
        ref={thumbnailsRef}
        onMouseDown={startDrag}
        onMouseLeave={stopDrag}
        onMouseUp={stopDrag}
        onMouseMove={onDrag}
      >
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

      {/* Основная область */}
      <div className="view-images-main">
        <button className="view-images-close" onClick={() => setIsModalActive(false)}>
          <FiX size={24} />
        </button>

        {images.length > 1 && (
          <>
            <button
              className="view-images-nav view-images-nav--prev"
              onClick={goToPrev}
              aria-label="Предыдущее изображение"
            >
              <IoIosArrowBack size={36} />
            </button>

            <button
              className="view-images-nav view-images-nav--next"
              onClick={goToNext}
              aria-label="Следующее изображение"
            >
              <IoIosArrowForward size={36} />
            </button>
          </>
        )}

        <img
          key={activeIndex} 
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