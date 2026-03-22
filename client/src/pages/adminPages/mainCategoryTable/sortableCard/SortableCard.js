import React, { useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import "./SortableCard.scss";

const SortableCard = ({ cat, onChangeSize, onEdit, onDelete }) => {
  const { 
    attributes, 
    listeners, 
    setNodeRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({ id: cat.id });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 1,
    opacity: isDragging ? 0.6 : 1,
  };

  const spanClass = cat.gridSpace ? `span-${cat.gridSpace}` : 'span-1';

  const handleSizeSelect = (size) => {
    onChangeSize(cat.id, size);
    setIsMenuOpen(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`cat-card ${spanClass} ${isDragging ? 'dragging' : ''}`}
    >
      <div className="card-controls">
        <div className="dropdown-container" ref={menuRef}>
          <button 
            type="button" 
            className={`ctrl-btn my_p ${isMenuOpen ? 'active' : ''}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            title="Изменить размер"
          >
            ↔
          </button>
          
          {isMenuOpen && (
            <div className="size-dropdown">
              {[1, 2, 3, 4].map(size => (
                <button
                  key={size}
                  type="button"
                  className={`size-option my_p ${cat.gridSpace === size || (!cat.gridSpace && size === 1) ? 'selected' : ''}`}
                  onClick={() => handleSizeSelect(size)}
                >
                  {size} {size === 1 ? 'блок' : 'блока'}
                </button>
              ))}
            </div>
          )}
        </div>

        <button type="button" className="ctrl-btn my_p" onClick={() => onEdit(cat)} title="Редактировать">✎</button>
        <button type="button" className="ctrl-btn delete my_p" onClick={() => onDelete(cat.id)} title="Удалить">✕</button>
      </div>

      <div className="drag-handle" {...attributes} {...listeners}>
        <img 
          src={process.env.REACT_APP_API_URL + "static/images/" + cat.image} 
          className="cat-img" 
          alt={cat.name} 
        />
        <div className="cat-overlay">
          <div className="cat-title my_h2">{cat.name}</div>
          <div className="cat-subtitle my_p_small">
            Позиция: {cat.gridItemIndex} | Размер: {cat.gridSpace || 1}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SortableCard;