import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy
} from '@dnd-kit/sortable';

import {
  postMainKategory,
  fetchAllMainKategory,
  updateMainKategory,
  deleteMainKategoryById
} from '../../../http/KategoryApi';
import SortableCard from './sortableCard/SortableCard';
import "./MainCategoryTable.scss";

const MainCategoryTable = () => {
  const [categories, setCategories] = useState([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', imageFile: null, imageUrl: '' });

  const fileInputRef = useRef(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchAllMainKategory();
      const sorted = data.sort((a, b) => (a.gridItemIndex || 0) - (b.gridItemIndex || 0));
      setCategories(sorted);
      setHasChanges(false);
    } catch (error) {
      console.error("Ошибка при загрузке категорий:", error);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const changeSize = (id, newSize) => {
    setCategories(prev => prev.map(c => {
      if (c.id === id) {
        return { ...c, gridSpace: newSize };
      }
      return c;
    }));
    setHasChanges(true);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setCategories((items) => {
      const oldIndex = items.findIndex(i => i.id === active.id);
      const newIndex = items.findIndex(i => i.id === over.id);
      const updatedArray = arrayMove(items, oldIndex, newIndex);
      return updatedArray.map((item, index) => ({ ...item, gridItemIndex: index }));
    });
    setHasChanges(true);
  };

  const handleApplyChanges = async () => {
    setIsSaving(true);
    try {
      const updatePromises = categories.map(cat => {
        const fd = new FormData();
        fd.append("gridItemIndex", cat.gridItemIndex);
        fd.append("gridSpace", cat.gridSpace || 1);
        return updateMainKategory(cat.id, fd);
      });
      await Promise.all(updatePromises);
      setHasChanges(false);
      setTimeout(() => { alert("Изменения сетки применены успешно!") }, 200);
    } catch (error) {
      console.error(error);
      alert("Ошибка при сохранении сетки");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        name: category.name,
        imageFile: null,
        imageUrl: `${process.env.REACT_APP_API_URL}static/images/${category.image}`
      });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', imageFile: null, imageUrl: '' });
    }
    setIsModalOpen(!isModalOpen);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        imageFile: file,
        imageUrl: URL.createObjectURL(file)
      }));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('При удалении категории удалятся все связанные товары. Продолжить?')) {
      try {
        await deleteMainKategoryById(id);
        loadCategories();
      } catch (error) {
        console.error(error);
        alert("Ошибка при удалении");
      }
    }
  };

  const handleModalSubmit = async (e) => {
    if (e) e.preventDefault();
    const fd = new FormData();
    fd.append("name", formData.name);
    if (formData.imageFile) {
      fd.append("image", formData.imageFile);
    }

    try {
      if (editingCategory) {
        await updateMainKategory(editingCategory.id, fd);
      } else {
        await postMainKategory(fd);
      }
      setIsModalOpen(false);
      loadCategories();
    } catch (error) {
      console.error(error);
      alert("Ошибка при сохранении данных категории");
    }
  };

  return (
    <div className="admin-category-editor">
      <header className="admin-nav">
        <div className="nav-container">
          <div className="logo my_h2">Главные категории</div>
          <div className="nav-buttons">
            <button type="button" className="refresh-btn my_p" onClick={() => toggleModal()}>+ Добавить</button>
            {hasChanges && (
              <button
                type="button"
                className={`apply-btn my_p ${isSaving ? 'loading' : ''}`}
                onClick={handleApplyChanges}
                disabled={isSaving}
              >
                {isSaving ? 'Сохранение...' : 'Применить изменения'}
              </button>
            )}
            <button type="button" className="refresh-btn my_p" onClick={loadCategories}>Сбросить</button>
          </div>
        </div>
      </header>

      <main className="content-container">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={categories.map(c => c.id)} strategy={rectSortingStrategy}>
            <div className="catalog_section">
              {categories.map(cat => (
                <SortableCard
                  key={cat.id}
                  cat={cat}
                  onChangeSize={changeSize}
                  onEdit={toggleModal}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </main>

      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 className="my_h2">{editingCategory ? 'Редактирование' : 'Добавление'}</h2>
            <form onSubmit={handleModalSubmit}>
              <div className="form-group">
                <label className="label my_p">Название:</label>
                <input
                  type="text"
                  className="form-input my_p"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="label my_p">Картинка:</label>
                <div className="image-upload-container" onClick={() => fileInputRef.current.click()}>
                  {formData.imageUrl ? (
                    <div className="image-preview-container">
                      <img src={formData.imageUrl} className="uploaded-image" alt="Preview" />
                      <div className="image-overlay"><span className="overlay-text my_p">поменять</span></div>
                    </div>
                  ) : (
                    <div className="image-placeholder">
                      <div className="placeholder-icon my_h1">📁</div>
                      <span className="my_p">Загрузить фото</span>
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    accept="image/*"
                  />
                </div>
              </div>

              <div className="modal-buttons">
                <button type="button" onClick={() => setIsModalOpen(false)} className="cancel-button my_p">Отмена</button>
                <button type="submit" className="save-button my_p">
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