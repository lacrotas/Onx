import React from 'react';
import { FiSearch, FiX, FiPlus, FiCheck, FiRotateCcw } from 'react-icons/fi';
import './AdminPageHeader.scss';

export default function AdminPageHeader({
    title,
    count,
    searchTerm,
    onSearch,
    searchPlaceholder = "Поиск...",
    onAdd,
    addButtonText = "+ Добавить",
    hasChanges = false,
    isSaving = false,
    onApplyChanges,
    onCancelChanges,
    extraActions,
    children // Дополнительные селекты/фильтры
}) {
    return (
        <header className="admin-page-header">
            <div className="header-left">
                <h1 className="header-title">
                    {title}
                    {count !== undefined && count !== null && (
                        <span className="header-count">{count}</span>
                    )}
                </h1>
            </div>

            <div className="header-right">
                {/* Слот для фильтров (например, выбор категории) */}
                {children && <div className="header-filters">{children}</div>}

                {/* Строка поиска */}
                {onSearch && (
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder={searchPlaceholder}
                            value={searchTerm || ''}
                            onChange={onSearch}
                            className="search-input"
                        />
                        {searchTerm && (
                            <button 
                                type="button" 
                                className="search-clear-btn" 
                                onClick={() => onSearch({ target: { value: '' } })}
                                title="Очистить"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>
                )}

                {/* Пакетные действия при наличии изменений */}
                {hasChanges && (
                    <div className="bulk-actions">
                        <button
                            type="button"
                            className={`btn-apply ${isSaving ? 'loading' : ''}`}
                            onClick={onApplyChanges}
                            disabled={isSaving}
                        >
                            <FiCheck />
                            <span>{isSaving ? 'Сохранение...' : 'Применить'}</span>
                        </button>
                        <button
                            type="button"
                            className="btn-cancel-changes"
                            onClick={onCancelChanges}
                            disabled={isSaving}
                            title="Отменить несохраненные изменения"
                        >
                            <FiRotateCcw />
                            <span>Отмена</span>
                        </button>
                    </div>
                )}

                {/* Дополнительные действия (например, экспорт) */}
                {extraActions}

                {/* Кнопка добавления */}
                {onAdd && (
                    <button type="button" className="btn-add-primary" onClick={onAdd}>
                        <FiPlus />
                        <span>{addButtonText}</span>
                    </button>
                )}
            </div>
        </header>
    );
}
