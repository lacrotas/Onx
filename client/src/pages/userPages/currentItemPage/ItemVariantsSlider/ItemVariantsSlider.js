import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { ITEM_PREVIEW_ROUTE } from "../../../appRouter/Const";
import "./ItemVariantsSlider.scss";

const ItemVariantsSlider = ({ items, currentId, apiUrl }) => {
    const history = useHistory();
    const scrollRef = useRef(null);
    const [showLeft, setShowLeft] = useState(false);
    const [showRight, setShowRight] = useState(false);

    // Подготовка и сортировка данных
    const sortedItems = useMemo(() => {
        if (!items || !items.itemInfo || !items.itemIds) return [];

        // Собираем массив объектов для удобной сортировки
        const combined = items.itemInfo.map((info, idx) => ({
            info,
            id: items.itemIds[idx]
        }));

        return combined.sort((a, b) => {
            const idA = String(a.id);
            const idB = String(b.id);
            const currId = String(currentId);

            // 1. Текущий товар всегда первый
            if (idA === currId) return -1;
            if (idB === currId) return 1;

            // 2. Сортировка по статусу (true выше чем false)
            if (a.info.status !== b.info.status) {
                return a.info.status ? -1 : 1;
            }

            return 0;
        });
    }, [items, currentId]);

    const checkScroll = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            const hasLeft = scrollLeft > 2;
            const hasRight = scrollLeft + clientWidth < scrollWidth - 2;

            setShowLeft(hasLeft);
            setShowRight(hasRight);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            checkScroll();
        }, 100);

        window.addEventListener('resize', checkScroll);
        return () => {
            window.removeEventListener('resize', checkScroll);
            clearTimeout(timer);
        };
    }, [sortedItems]);

    const handleScroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = 300;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (sortedItems.length === 0) return null;

    return (
        <div className="apple-recommendations">
            <div className="slider-wrapper">
                {showLeft && (
                    <button className="nav-btn prev" onClick={() => handleScroll('left')}>
                        <FiChevronLeft />
                    </button>
                )}
                
                <div 
                    className="recommendations-slider" 
                    ref={scrollRef} 
                    onScroll={checkScroll}
                >
                    {sortedItems.map((item, idx) => {
                        const isCurrent = String(item.id) === String(currentId);
                        const isDisabled = item.info.status === false;

                        return (
                            <div 
                                key={item.id || idx} 
                                className={`recommendation-card ${isCurrent ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`}
                                onClick={() => !isCurrent && history.push(ITEM_PREVIEW_ROUTE + "/" + item.id)}
                            >
                                <div className="img-wrapper">
                                    <img 
                                        src={`${apiUrl}static/images/${item.info.image}`} 
                                        alt={item.info.name} 
                                        className={isDisabled ? "grayscale-img" : ""}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>

                {showRight && (
                    <button className="nav-btn next" onClick={() => handleScroll('right')}>
                        <FiChevronRight />
                    </button>
                )}
            </div>
        </div>
    );
};

export default ItemVariantsSlider;