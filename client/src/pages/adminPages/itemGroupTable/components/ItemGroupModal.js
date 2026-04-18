import React, { useState } from 'react';
import CustomSelectWIthInput from "../../../../customUI/сustomSelectWithInput/CustomSelectWIthInput";

const ItemGroupModal = ({ isOpen, onClose, formData, setFormData, allItems, onSubmit, editingGroup }) => {
    if (!isOpen) return null;

    const handleAddItem = (itemId) => {
        const item = allItems.find(i => i.id === parseInt(itemId));
        if (item && !formData.itemIds.includes(item.id)) {
            setFormData(prev => ({
                ...prev,
                itemIds: [...prev.itemIds, item.id],
                selectedItemsData: [...prev.selectedItemsData, item]
            }));
        }
    };

    const removeSelectedItem = (id) => {
        setFormData(prev => ({
            ...prev,
            itemIds: prev.itemIds.filter(itemId => itemId !== id),
            selectedItemsData: prev.selectedItemsData.filter(item => item.id !== id)
        }));
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-large" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="my_h2">{editingGroup ? 'Редактировать группу' : 'Создать группу'}</h2>
                </div>
                
                <form onSubmit={onSubmit} className="item-form">
                    <div className="form-group full-width">
                        <label className="my_p">Название группы:</label>
                        <input 
                            className="form-input my_p"
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>

                    <div className="form-group full-width">
                        <label className="my_p">Товары в группе:</label>
                        <div className="selected-items-list" style={{ marginBottom: '20px' }}>
                            {formData.selectedItemsData.map(item => (
                                <div key={item.id} className="selected-item-tag" style={{
                                    display: 'flex', alignItems: 'center', gap: '10px', 
                                    padding: '10px', background: '#f5f5f7', borderRadius: '8px', marginBottom: '8px'
                                }}>
                                    <img 
                                        src={`${process.env.REACT_APP_API_URL}static/images/${item.images?.[0]}`} 
                                        alt="" style={{ width: '30px', height: '30px', borderRadius: '4px', objectFit: 'cover' }}
                                    />
                                    <span className="my_p" style={{ flex: 1 }}>{item.name}</span>
                                    <button type="button" onClick={() => removeSelectedItem(item.id)} style={{ color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
                                </div>
                            ))}
                        </div>

                        <label className="my_p">Добавить товар в группу:</label>
                        <CustomSelectWIthInput 
                            options={allItems}
                            value="" // Сбрасываем после выбора
                            onChange={(e) => handleAddItem(e.target.value)}
                            placeholder="Начните вводить название товара..."
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="btn-cancel my_p" onClick={onClose}>Отмена</button>
                        <button type="submit" className="btn-primary my_p">
                            {editingGroup ? 'Сохранить' : 'Создать группу'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ItemGroupModal;