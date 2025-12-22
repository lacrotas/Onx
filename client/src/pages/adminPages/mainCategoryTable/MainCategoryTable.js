import React, { useState, useEffect, useRef } from 'react';
import { fetchAllMainKategory, postMainKategory, updateMainKategory, deleteMainKategoryById } from '../../../http/KategoryApi';
import "./MainCategoryTable.scss";

const MainCategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Добавляем состояние для сортировки
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', imageFile: null, imageUrl: '' });
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadCategories();
  }, []);

  // 2. Обновляем useEffect для фильтрации И сортировки
  useEffect(() => {
    // Сначала фильтруем
    let result = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Затем сортируем
    if (sortConfig.key) {
      result.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        // Обработка null/undefined
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';

        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredCategories(result);
  }, [searchTerm, categories, sortConfig]); // Добавили sortConfig в зависимости

  const loadCategories = async () => {
    try {
      const data = await fetchAllMainKategory();
      setCategories(data);
      // setFilteredCategories(data); // Убрали, так как useEffect сработает автоматически
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  // 3. Функция запроса сортировки
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Вспомогательная функция для индикатора
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', imageFile: null, imageUrl: '' });
    setIsModalOpen(true);
  };

  const openEditModal = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      imageFile: null,
      imageUrl: `${process.env.REACT_APP_API_URL}static/images/${category.image}`
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };
  const confirmAndCloseModal = () => {
    if (window.confirm('Хотите ли вы закрыть форму? Несохраненные данные будут потеряны.')) {
      closeModal();
    }
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setFormData(prev => ({
          ...prev,
          imageFile: file,
          imageUrl: event.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const myFormData = new FormData();

    if (editingCategory) {
      myFormData.append("name", formData.name);
      myFormData.append("image", formData.imageFile);

      await updateMainKategory(editingCategory.id, myFormData);
    } else {
      myFormData.append("name", formData.name);
      myFormData.append("image", formData.imageFile);

      await postMainKategory(myFormData);
    }
    closeModal();
    window.location.reload();
  };
  const handleSubmitWithoutClose = async (e) => {
    const myFormData = new FormData();

    if (editingCategory) {
      myFormData.append("name", formData.name);
      myFormData.append("image", formData.imageFile);

      await updateMainKategory(editingCategory.id, myFormData);
    } else {
      myFormData.append("name", formData.name);
      myFormData.append("image", formData.imageFile);

      await postMainKategory(myFormData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('При удалении главной категории удалятся все товары, фильтры, категории которые с ней связанны?')) {
      deleteMainKategoryById(id)
      window.location.reload();
    }
  };


  return (
    <div className="adminMainKategoryTable">
      <div className="admin-header">
        <h1>Главные категории</h1>
        <div className="search-container">
          <input
            type="text"
            placeholder="Название категории..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
        <button onClick={openAddModal} className="add-button">
          Добавить категорию
        </button>
      </div>

      <div className="table-container">
        <table className="categories-table">
          <thead>
            {/* 4. Добавляем onClick и стили курсора */}
            <tr>
              <th onClick={() => requestSort('id')} style={{ cursor: 'pointer' }}>
                ID{getSortIndicator('id')}
              </th>
              <th onClick={() => requestSort('name')} style={{ cursor: 'pointer' }}>
                Название{getSortIndicator('name')}
              </th>
              <th>Картинка</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {filteredCategories.map(category => (
              <tr key={category.id}>
                <td>{category.id}</td>
                <td>{category.name}</td>
                <td>
                  <div className="image-preview">
                    <img src={`${process.env.REACT_APP_API_URL}static/images/${category.image}`} alt="Category" className="preview-image" />
                  </div>
                </td>
                <td className="action-buttons">
                  <button
                    onClick={() => openEditModal(category)}
                    className="edit-button"
                  >
                    Обновить
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
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
        <div className="modal-overlay" onClick={() => confirmAndCloseModal()}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingCategory ? 'Редактирование' : 'Добавление'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Название:</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Картинка:</label>
                <div
                  className="image-upload-container"
                  onClick={triggerFileInput}
                >
                  {formData.imageUrl ? (
                    <div className="image-preview-container">
                      <img
                        src={formData.imageUrl}
                        alt="Preview"
                        className="uploaded-image"
                      />
                      <div className="image-overlay">
                        <span className="overlay-text">поменять</span>
                      </div>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <div className="placeholder-icon">📁</div>
                      <span>Нажмите чтобы загрузить</span>
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
              <div className="modal-buttons">
                <button type="button" onClick={() => confirmAndCloseModal()} className="cancel-button">
                  Отмена
                </button>
                {!editingCategory ?
                  <button type="button" onClick={(e) => handleSubmitWithoutClose(e)} className="save-button">
                    Добавить без сброса
                  </button>
                  : <></>
                }
                <button type="submit" className="save-button">
                  {editingCategory ? 'Обновить' : 'Добавить'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default MainCategoryTable;