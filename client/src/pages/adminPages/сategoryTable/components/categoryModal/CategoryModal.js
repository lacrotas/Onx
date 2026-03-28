import React from 'react';
import './CategoryModal.scss';

const CategoryModal = ({
    isModalOpen,
    confirmAndCloseModal,
    editingCategory,
    formData,
    handleInputChange,
    handleSubmit,
    handleSubmitWithoutClose,
    mainCategories,
    getMainCategoryName,
    triggerFileInput,
    fileInputRef,
    handleFileChange
}) => {
    if (!isModalOpen) return null;

    return (
        <div className="modal-overlay" onClick={confirmAndCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="my_h2">{editingCategory ? 'Редактирование' : 'Добавление категории'}</h2>
                </div>
                {console.log(formData)}
                <form onSubmit={handleSubmit} className="category-form">
                    <div className="form-group">
                        <label className="my_p">Название:</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="form-input my_p"
                        />
                    </div>

                    {!editingCategory && mainCategories.length > 0 && (
                        <div className="form-group">
                            <label className="my_p">Главная категория:</label>
                            <select
                                name="mainKategoryId"
                                value={formData.mainKategoryId}
                                onChange={handleInputChange}
                                className="form-select my_p"
                                required
                            >
                                <option value="">Выберите...</option>
                                {mainCategories.map(mainCat => (
                                    <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {editingCategory && (
                        <div className="form-group">
                            <label className="my_p">Главная категория:</label>
                            <div className="form-static my_p">
                                {getMainCategoryName(editingCategory.mainKategoryId)}
                            </div>
                        </div>
                    )}

                    <div className="form-group">
                        <label className="my_p">Картинка:</label>
                        <div className="image-upload-container" onClick={triggerFileInput}>
                            {formData.imageUrl ? (
                                <div className="image-preview-container">
                                    <img src={formData.imageUrl} className="uploaded-image" alt="Preview" />
                                    <div className="image-overlay">
                                        <span className="overlay-text my_p">Изменить</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="image-placeholder">
                                    <div className="placeholder-icon my_h1">📁</div>
                                    <span className="my_p">Загрузить изображение</span>
                                </div>
                            )}
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept="image/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="my_p">Порядок отображения:</label>
                        <input
                            type="text"
                            name="kategoryIndex"
                            value={formData.kategoryIndex}
                            onChange={handleInputChange}
                            required
                            className="form-input my_p"
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" onClick={confirmAndCloseModal} className="btn-cancel my_p">Отмена</button>
                        {!editingCategory && (
                            <button type="button" onClick={handleSubmitWithoutClose} className="btn-secondary my_p">Добавить без сброса</button>
                        )}
                        <button type="submit" className="btn-primary my_p">{editingCategory ? 'Обновить' : 'Добавить'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CategoryModal;