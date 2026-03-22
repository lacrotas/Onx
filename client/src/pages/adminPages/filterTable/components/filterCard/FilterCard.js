import React, { useState, useEffect } from 'react';
import './FilterCard.scss';

const FilterCard = ({
    filter,
    saveFilterValues,
    openEditModal,
    handleDelete
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Оригинальные значения из БД
    const originalValues = Array.isArray(filter.attributeValues) ? filter.attributeValues : [];
    
    // Локальные значения, которые мы редактируем
    const [localValues, setLocalValues] = useState(originalValues);

    // Синхронизируем, если данные обновились на сервере
    useEffect(() => {
        setLocalValues(Array.isArray(filter.attributeValues) ? filter.attributeValues : []);
    }, [filter.attributeValues]);

    // Проверяем, есть ли изменения (сравниваем массивы через JSON)
    const hasChanges = JSON.stringify(originalValues) !== JSON.stringify(localValues);

    // Добавление тега по нажатию Enter
    const handleAddValue = (e) => {
        if (e.key === 'Enter' && inputValue.trim() !== '') {
            e.preventDefault();
            const newValue = inputValue.trim();
            
            // Защита от дубликатов
            if (!localValues.includes(newValue)) {
                setLocalValues([...localValues, newValue]);
            }
            setInputValue('');
        }
    };

    // Удаление тега
    const handleRemoveValue = (valueToRemove) => {
        setLocalValues(localValues.filter(val => val !== valueToRemove));
    };

    // Сохранение именно этой карточки на сервер
    const handleApply = async () => {
        setIsSaving(true);
        await saveFilterValues(filter, localValues);
        setIsSaving(false);
    };

    // Отмена изменений в карточке
    const handleCancel = () => {
        setLocalValues(originalValues);
        setInputValue('');
    };

    const typeMap = {
        'check': 'Checkbox',
        'color': 'Цвет',
        'select': 'Select',
        'number': 'Число'
    };

    return (
        <div className={`filter-card ${hasChanges ? 'modified' : ''}`}>
            <div className="filter-header">
                <div>
                    <div className="filter-name my_h2">{filter.name}</div>
                    {filter.addition && (
                        <div className="filter-addition my_p_small">Доп: {filter.addition}</div>
                    )}
                </div>
                <span className="filter-type my_p_small">{typeMap[filter.buttonType] || filter.buttonType}</span>
            </div>

            <div className="values-list">
                {localValues.map((val, index) => (
                    <div key={index} className="value-tag my_p">
                        {val} 
                        <span className="remove" onClick={() => handleRemoveValue(val)}>×</span>
                    </div>
                ))}
                
                <input 
                    type="text" 
                    className="add-value-input my_p" 
                    placeholder="+ Добавить (Enter)"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleAddValue}
                />
            </div>

            {/* Блок с кнопками сохранения (появляется только если есть изменения) */}
            {hasChanges && (
                <div className="local-actions">
                    <span className="unsaved-badge my_p_small">Есть несохраненные изменения</span>
                    <div className="action-btns">
                        <button 
                            className="btn-local-cancel my_p_small" 
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            Отменить
                        </button>
                        <button 
                            className="btn-local-apply my_p_small" 
                            onClick={handleApply}
                            disabled={isSaving}
                        >
                            {isSaving ? 'Сохранение...' : 'Применить'}
                        </button>
                    </div>
                </div>
            )}

            <div className="card-footer">
                <span className="info-text my_p_small">
                    {localValues.length} {localValues.length === 1 ? 'значение' : 'значений'}
                </span>
                <div className="card-settings">
                    <button type="button" className="btn-action my_p" onClick={() => openEditModal(filter)} title="Настройки фильтра">⚙️</button>
                    <button type="button" className="btn-action delete my_p" onClick={() => handleDelete(filter.id)} title="Удалить фильтр">🗑</button>
                </div>
            </div>
        </div>
    );
};

export default FilterCard;