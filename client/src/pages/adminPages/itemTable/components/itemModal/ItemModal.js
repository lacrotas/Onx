import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './ItemModal.scss';

const ItemModal = ({
    isModalOpen,
    confirmAndCloseModal,
    editingItem,
    formData,
    handleInputChange,
    handleSubmit,
    mainCategories,
    handleMainCategoryChange,
    categoriesByMain,
    handleCategoryChange,
    handleDescriptionChange,
    setMainImage,
    getImageSource,
    removeImage,
    triggerImageInput,
    imageInputRef,
    handleImagesChange,
    videoInputRef,
    triggerVideoInput,
    handleVideoChange,
    filtersForCategory,
    handleSpecificationChange,
    handleSubmitWithoutClose
}) => {
    if (!isModalOpen) return null;
    console.log(formData);

    return (
        <div className="modal-overlay" onClick={confirmAndCloseModal}>
            <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="my_h2">{editingItem ? 'Редактирование' : 'Добавление товара'}</h2>
                </div>

                <form onSubmit={handleSubmit} className="item-form">
                    <div className="form-row">
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
                        <div className="form-group">
                            <label className="my_p">Цена:</label>
                            <input
                                type="number"
                                name="price"
                                value={formData.price}
                                onChange={handleInputChange}
                                required
                                className="form-input my_p"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="my_p">Главная категория:</label>
                            <select
                                name="mainKategoryId"
                                value={formData.mainKategoryId}
                                onChange={handleMainCategoryChange}
                                className="form-select my_p"
                                required
                            >
                                <option value="">Выберите...</option>
                                {mainCategories.map(mainCat => (
                                    <option key={mainCat.id} value={mainCat.id}>{mainCat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="my_p">Категория:</label>
                            <select
                                name="kategoryId"
                                value={formData.kategoryId}
                                onChange={handleCategoryChange}
                                className="form-select my_p"
                                required
                                disabled={!formData.mainKategoryId || categoriesByMain.length === 0}
                            >
                                <option value="">Выберите...</option>
                                {categoriesByMain.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-row checkbox-row">
                        <label className="custom-checkbox my_p">
                            <input
                                type="checkbox"
                                name="isExist"
                                checked={formData.isExist}
                                onChange={handleInputChange}
                            />
                            <span className="checkmark"></span>
                            В наличии
                        </label>
                        <label className="custom-checkbox my_p">
                            <input
                                type="checkbox"
                                name="isShowed"
                                checked={formData.isShowed}
                                onChange={handleInputChange}
                            />
                            <span className="checkmark"></span>
                            Показывать на сайте
                        </label>
                    </div>

                    <div className="form-group full-width">
                        <label className="my_p">Описание:</label>
                        <div className="quill-wrapper">
                            <ReactQuill
                                theme="snow"
                                value={formData.description}
                                onChange={handleDescriptionChange}
                                className="my_p"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="my_p">Изображения (первое - главное):</label>
                        <div className="images-grid">
                            {formData.images.map((imageObj, index) => (
                                <div
                                    key={index}
                                    className={`image-card ${index === 0 ? 'main-image' : ''}`}
                                    onClick={() => setMainImage(index)}
                                >
                                    {index === 0 && <div className="main-badge my_p_small">Главное</div>}
                                    <img src={getImageSource(imageObj)} alt={`img-${index}`} />
                                    <button
                                        type="button"
                                        className="remove-img-btn"
                                        onClick={(e) => { e.stopPropagation(); removeImage(index); }}
                                    >×</button>
                                </div>
                            ))}
                            <div className="image-card add-card" onClick={triggerImageInput}>
                                <span className="plus-icon">+</span>
                            </div>
                            <input
                                type="file"
                                ref={imageInputRef}
                                onChange={handleImagesChange}
                                accept="image/*"
                                multiple
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    <div className="form-group full-width">
                        <label className="my_p">Видео:</label>
                        <div className="video-section">
                            {formData.videoUrl && (
                                <video
                                    src={formData.videoUrl.startsWith('blob:') ? formData.videoUrl : `${process.env.REACT_APP_API_URL}static/video/${formData.videoUrl}`}
                                    controls
                                    className="video-player"
                                />
                            )}
                            <button type="button" className="upload-btn my_p" onClick={triggerVideoInput}>
                                {formData.videoUrl ? 'Изменить видео' : 'Загрузить видео'}
                            </button>
                            <input
                                type="file"
                                ref={videoInputRef}
                                onChange={handleVideoChange}
                                accept="video/*"
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

                    {filtersForCategory.length > 0 && (
                        <div className="form-group full-width spec-section">
                            <label className="my_p">Характеристики:</label>
                            <div className="spec-grid">
                                {filtersForCategory.map(filter => {
                                    const currentVal = formData.specifications[filter.name] || '';
                                    return (
                                        <div key={filter.id} className="spec-box">
                                            <span className="spec-name my_p_small">{filter.name}</span>

                                            {filter.buttonType === 'check' && (
                                                <label className="custom-checkbox my_p">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentVal === 'true'}
                                                        onChange={(e) => handleSpecificationChange(filter.name, e.target.checked ? 'true' : 'false')}
                                                    />
                                                    <span className="checkmark"></span>
                                                </label>
                                            )}

                                            {filter.buttonType === 'select' && (
                                                <div className="spec-select-wrapper">
                                                    <select
                                                        value={currentVal}
                                                        onChange={(e) => handleSpecificationChange(filter.name, e.target.value)}
                                                        className="form-select my_p"
                                                    >
                                                        <option value="">Не выбрано</option>
                                                        {Array.isArray(filter.attributeValues) && filter.attributeValues.map((val, i) => (
                                                            <option key={i} value={val}>{val}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            )}

                                            {filter.buttonType === 'number' && (
                                                <div className="spec-number-wrapper">
                                                    <input
                                                        type="number"
                                                        value={currentVal}
                                                        onChange={(e) => handleSpecificationChange(filter.name, e.target.value)}
                                                        className="form-input my_p"
                                                    />
                                                    {filter.addition && <span className="spec-addition my_p">{filter.addition}</span>}
                                                </div>
                                            )}

                                            {filter.buttonType !== 'check' && filter.buttonType !== 'select' && filter.buttonType !== 'number' && (
                                                <input
                                                    type="text"
                                                    value={currentVal}
                                                    onChange={(e) => handleSpecificationChange(filter.name, e.target.value)}
                                                    className="form-input my_p"
                                                />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="modal-actions">
                        <button type="button" onClick={confirmAndCloseModal} className="btn-cancel my_p">Отмена</button>
                        {!editingItem && (
                            <button type="button" onClick={handleSubmitWithoutClose} className="btn-secondary my_p">Добавить и продолжить</button>
                        )}
                        <button type="submit" className="btn-primary my_p">{editingItem ? 'Сохранить изменения' : 'Добавить товар'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemModal;