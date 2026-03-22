import React from 'react';
import './FilterModal.scss';

const FilterModal = ({
    isModalOpen,
    confirmAndCloseModal,
    editingFilter,
    formData,
    handleInputChange,
    handleSubmit,
    handleSubmitWithoutClose,
    categories,
    buttonTypeOptions
}) => {
    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={confirmAndCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="my_h2">{editingFilter ? 'Настройки фильтра' : 'Создание фильтра'}</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="filter-form">
                    <div className="form-group">
                        <label className="my_p">Название:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="form-input my_p"
                            placeholder="Например: Цвет"
                        />
                    </div>

                    <div className="form-group">
                        <label className="my_p">Категория:</label>
                        <select
                            name="kategoryId"
                            value={formData.kategoryId}
                            onChange={handleInputChange}
                            className="form-select my_p"
                            required
                        >
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label className="my_p">Тип фильтра:</label>
                        <select
                            name="buttonType"
                            value={formData.buttonType}
                            onChange={handleInputChange}
                            className="form-select my_p"
                            required
                        >
                            {buttonTypeOptions.map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {formData.buttonType === 'number' && (
                        <div className="form-group">
                            <label className="my_p">Дополнение (суффикс):</label>
                            <input
                                type="text"
                                name="addition"
                                value={formData.addition}
                                onChange={handleInputChange}
                                className="form-input my_p"
                                placeholder="Например: кг, см, Вт"
                            />
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={confirmAndCloseModal} className="btn-cancel my_p">Отмена</button>
                        {!editingFilter && (
                            <button type="button" onClick={handleSubmitWithoutClose} className="btn-secondary my_p">Создать и продолжить</button>
                        )}
                        <button type="submit" className="btn-primary my_p">{editingFilter ? 'Сохранить' : 'Создать'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default FilterModal;