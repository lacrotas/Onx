import React, { useState, useEffect, useRef } from 'react';
import './CustomSelectWIthInput.scss';

const CustomSelectWIthInput = ({ 
    options,       // Массив объектов, например [{id: 1, name: 'Категория 1'}, ...]
    value,         // Текущее выбранное значение (id)
    onChange,      // Функция-обработчик
    name,          // Имя поля (для совместимости с вашими handleInputChange)
    placeholder = "Выберите значение...",
    disabled = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const wrapperRef = useRef(null);

    // Синхронизация текста в input с выбранным value при загрузке или изменении извне
    useEffect(() => {
        if (value) {
            const selectedOption = options.find(opt => opt.id === parseInt(value) || opt.id === value);
            if (selectedOption) {
                setSearchTerm(selectedOption.name);
            } else {
                setSearchTerm('');
            }
        } else {
            setSearchTerm('');
        }
    }, [value, options]);

    // Обработчик клика вне компонента для закрытия списка
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
                // Если пользователь что-то напечатал, но не выбрал, возвращаем текст к текущему выбранному значению
                const selectedOption = options.find(opt => opt.id === parseInt(value) || opt.id === value);
                setSearchTerm(selectedOption ? selectedOption.name : '');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [value, options]);

    // Обработка ввода текста (поиск)
    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setIsOpen(true);
        
        // Если мы начали печатать новый текст, значит текущий выбор сбрасывается
        if (value !== '') {
            // Эмулируем стандартный event для вашей функции handleInputChange
            onChange({ target: { name, value: '' } });
        }
    };

    // Обработка выбора элемента из выпадающего списка
    const handleOptionClick = (option) => {
        setSearchTerm(option.name);
        setIsOpen(false);
        onChange({ target: { name, value: option.id } });
    };

    // Очистка поля
    const handleClear = (e) => {
        e.stopPropagation();
        setSearchTerm('');
        onChange({ target: { name, value: '' } });
        setIsOpen(true);
    };

    // Фильтрация опций по введенному тексту
    const filteredOptions = options.filter(opt => 
        opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className={`custom-select-wrapper ${disabled ? 'disabled' : ''}`} ref={wrapperRef}>
            <div className="input-container" onClick={() => !disabled && setIsOpen(true)}>
                <input
                    type="text"
                    className="custom-select-input my_p"
                    placeholder={placeholder}
                    value={searchTerm}
                    onChange={handleInputChange}
                    disabled={disabled}
                />
                
                {/* Кнопка крестика для очистки (появляется, если что-то выбрано) */}
                {value && !disabled && (
                    <div className="clear-icon" onClick={handleClear}>✕</div>
                )}
                
                {/* Иконка стрелочки */}
                <div className={`chevron-icon ${isOpen ? 'open' : ''}`}>▼</div>
            </div>
            
            {isOpen && !disabled && (
                <ul className="custom-select-dropdown">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(opt => (
                            <li 
                                key={opt.id} 
                                className={`custom-select-option my_p ${opt.id === value ? 'selected' : ''}`}
                                onClick={() => handleOptionClick(opt)}
                            >
                                {opt.name}
                            </li>
                        ))
                    ) : (
                        <li className="custom-select-no-options my_p">Ничего не найдено</li>
                    )}
                </ul>
            )}
        </div>
    );
};

export default CustomSelectWIthInput;