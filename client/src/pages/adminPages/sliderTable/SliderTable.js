// SliderTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchAllSliders, postSlider, updateSlider, deleteSlider } from '../../../http/SliderApi';
import "./SliderTable.scss";

const SliderTable = () => {
    const [sliders, setSliders] = useState([]);
    const [filteredSliders, setFilteredSliders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingSlider, setEditingSlider] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        image: null,
        description: '',
        link: ''
    });
    const [previewImage, setPreviewImage] = useState(null);
    const fileInputRef = useRef(null);

    // Load sliders on component mount
    useEffect(() => {
        loadSliders();
    }, []);

    // Filter sliders based on search term
    useEffect(() => {
        const filtered = sliders.filter(slider =>
            slider.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slider.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            slider.link.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredSliders(filtered);
    }, [searchTerm, sliders]);

    const loadSliders = async () => {
        try {
            const data = await fetchAllSliders();
            setSliders(data);
            setFilteredSliders(data);
        } catch (error) {
            console.error('Error loading sliders:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setEditingSlider(null);
        setFormData({
            label: '',
            image: null,
            description: '',
            link: ''
        });
        setPreviewImage(null);
        setIsModalOpen(true);
    };

    const openEditModal = (slider) => {
        setEditingSlider(slider);
        setFormData({
            label: slider.label,
            image: null, // Не передаем существующее изображение в formData, если не изменяется
            description: slider.description,
            link: slider.link
        });
        setPreviewImage(slider.image); // Показываем существующее изображение
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSlider(null);
        setPreviewImage(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({ ...prev, image: file }));
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, image: null }));
        setPreviewImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            myFormData.append("label", formData.label);
            myFormData.append("description", formData.description);
            myFormData.append("link", formData.link);
            
            if (formData.image) {
                myFormData.append("image", formData.image);
            }
            
            if (editingSlider) {
                await updateSlider(editingSlider.id, myFormData);
            } else {
                await postSlider(myFormData);
            }
            loadSliders(); // Обновляем список после сохранения
            closeModal();
        } catch (error) {
            console.error('Error saving slider:', error);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this slider?')) {
            deleteSlider(id).then(() => {
                loadSliders(); // Обновляем список после удаления
            }).catch(error => {
                console.error('Error deleting slider:', error);
            });
        }
    };

    return (
        <div className="adminSliderTable">
            <div className="admin-header">
                <h1>Слайдер</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Найти слайд..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button onClick={openAddModal} className="add-button">
                    Добавить слайд
                </button>
            </div>

            <div className="table-container">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Изображение</th>
                            <th>Название</th>
                            <th>Описание</th>
                            <th>Ссылка</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSliders.map(slider => (
                            <tr key={slider.id}>
                                <td>{slider.id}</td>
                                <td className="image-cell">
                                    {slider.image && (
                                        <img 
                                            src={`${process.env.REACT_APP_API_URL}static/images/${slider.image}`} 
                                            alt={slider.label} 
                                            className="slider-image"
                                        />
                                    )}
                                </td>
                                <td>{slider.label}</td>
                                <td>{slider.description}</td>
                                <td>{slider.link}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => openEditModal(slider)}
                                        className="edit-button"
                                    >
                                        Обновить
                                    </button>
                                    <button
                                        onClick={() => handleDelete(slider.id)}
                                        className="delete-button"
                                    >
                                        Удалить
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{editingSlider ? 'Обновить' : 'Добавить'}</h2>
                            <button className="close-button" onClick={closeModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            <div className="form-group">
                                <label htmlFor="label">Название:</label>
                                <input
                                    type="text"
                                    id="label"
                                    name="label"
                                    value={formData.label}
                                    onChange={handleInputChange}
                                    required
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label>Изображение:</label>
                                <div className="image-upload-container">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        accept="image/*"
                                        className="file-input"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={triggerFileInput}
                                        className="upload-button"
                                    >
                                        Выбрать изображение
                                    </button>
                                    
                                    {previewImage && (
                                        <div className="image-preview-container">
                                            <img 
                                                src={previewImage} 
                                                alt="Preview" 
                                                className="image-preview"
                                            />
                                            <button 
                                                type="button" 
                                                onClick={removeImage}
                                                className="remove-image-button"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Описание:</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-textarea"
                                    rows="3"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="link">Ссылка:</label>
                                <input
                                    type="url"
                                    id="link"
                                    name="link"
                                    value={formData.link}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    placeholder="https://example.com"
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={closeModal} className="cancel-button">
                                    Отмена
                                </button>
                                <button type="submit" className="save-button">
                                    {editingSlider ? 'Обновить' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SliderTable;