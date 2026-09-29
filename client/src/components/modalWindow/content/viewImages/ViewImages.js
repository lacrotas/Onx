import React, { useState, useRef, useEffect } from 'react';
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { FiX } from "react-icons/fi";
import './ViewImages.scss';

function ViewImages({ images = [], initialIndex = 0, setIsModalActive }) {
  const [activeIndex, setActiveIndex] = useState(() => (
    initialIndex >= 0 && initialIndex < images.length ? initialIndex : 0
  ));

  // Стейты и реф для кастомного скролла (drag-to-scroll)
  const thumbnailsRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragged, setIsDragged] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ left: 0, top: 0 });

  // Свайпы для мобильных устройств на главном изображении
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchDeltaX = useRef(0);

  // Автоматический скролл к активной миниатюре в ленте
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.querySelector('.view-images-thumb.active');
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }
    }
  }, [activeIndex]);

  const goToPrev = () => {
    setActiveIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  // Обработчики тач-свайпа
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e) => {
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      touchDeltaX.current = deltaX;
    }
  };

  const handleTouchEnd = () => {
    const minSwipeDistance = 40;
    if (touchDeltaX.current > minSwipeDistance) {
      goToPrev();
    } else if (touchDeltaX.current < -minSwipeDistance) {
      goToNext();
    }
    touchDeltaX.current = 0;
  };

  // --- Логика перетягивания слайдера (универсальная X/Y) ---
  const startDrag = (e) => {
    setIsDragging(true);
    setIsDragged(false);
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
    setIsDragged(true);

    const x = e.pageX - thumbnailsRef.current.offsetLeft;
    const y = e.pageY - thumbnailsRef.current.offsetTop;
    
    const walkX = (x - startPos.x) * 2;
    const walkY = (y - startPos.y) * 2;
    
    thumbnailsRef.current.scrollLeft = scrollPos.left - walkX;
    thumbnailsRef.current.scrollTop = scrollPos.top - walkY;
  };

  const handleThumbnailClick = (index) => {
    if (isDragged) return;
    setActiveIndex(index);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowLeft') goToPrev();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') setIsModalActive(false);
  };

  if (!Array.isArray(images) || images.length === 0) {
    return <div className="view-images-empty my_p">Нет изображений</div>;
  }

  return (
    <div className="view-images" tabIndex={0} onKeyDown={handleKeyDown}>
      {/* Верхняя мобильная панель (счетчик + закрыть) */}
      <div className="view-images-mobile-header">
        <div className="view-images-counter">
          {activeIndex + 1} / {images.length}
        </div>
        <button 
          className="view-images-close-mobile" 
          onClick={() => setIsModalActive(false)}
          aria-label="Закрыть"
        >
          <FiX size={20} />
        </button>
      </div>

      {/* Панель с миниатюрами (на десктопе — слева, на мобилке — снизу) */}
      <div 
        className={`view-images-thumbnails ${images.length <= 5 ? 'centered' : ''}`}
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
      <div 
        className="view-images-main"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button 
          className="view-images-close" 
          onClick={() => setIsModalActive(false)}
          aria-label="Закрыть"
        >
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