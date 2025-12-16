// ItemGroupTable.jsx
import React, { useState, useEffect, useRef } from 'react';
import { fetchAllItemGroup, postItemGroup, updateItemGroup, deleteItemGroup } from '../../../http/itemGroupApi';
import { fetchAllItem } from '../../../http/itemApi'; 
import "./ItemGroupTable.scss";

const ItemGroupTable = () => {
    const [itemGroups, setItemGroups] = useState([]);
    const [filteredItemGroups, setFilteredItemGroups] = useState([]);
    const [items, setItems] = useState([]);
    const [filteredItems, setFilteredItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [itemSearchTerm, setItemSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItemGroup, setEditingItemGroup] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        itemIds: []
    });
    const fileInputRef = useRef(null);

    // Load item groups and items on component mount
    useEffect(() => {
        loadItemGroups();
        loadItems();
    }, []);

    // Filter item groups based on search term
    useEffect(() => {
        const filtered = itemGroups.filter(group =>
            group.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredItemGroups(filtered);
    }, [searchTerm, itemGroups]);

    // Filter items based on item search term
    useEffect(() => {
        const filtered = items.filter(item =>
            item.name.toLowerCase().includes(itemSearchTerm.toLowerCase())
        );
        setFilteredItems(filtered);
    }, [itemSearchTerm, items]);

    const loadItemGroups = async () => {
        try {
            const data = await fetchAllItemGroup();
            // Приводим данные к единому формату
            const normalizedData = data.map(group => ({
                ...group,
                itemIds: Array.isArray(group.itemIds) ? group.itemIds : (group.itemIds || [])
            }));
            setItemGroups(normalizedData);
            setFilteredItemGroups(normalizedData);
        } catch (error) {
            console.error('Error loading item groups:', error);
        }
    };

    const loadItems = async () => {
        try {
            const data = await fetchAllItem();
            setItems(data);
            setFilteredItems(data);
        } catch (error) {
            console.error('Error loading items:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleItemSearch = (e) => {
        setItemSearchTerm(e.target.value);
    };

    const openAddModal = () => {
        setEditingItemGroup(null);
        setFormData({
            name: '',
            itemIds: []
        });
        setItemSearchTerm(''); // Очищаем поиск при открытии
        setIsModalOpen(true);
    };

    const openEditModal = (group) => {
        setEditingItemGroup(group);
        setFormData({
            name: group.name,
            itemIds: Array.isArray(group.itemIds) ? group.itemIds : []
        });
        setItemSearchTerm(''); // Очищаем поиск при открытии
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItemGroup(null);
        setItemSearchTerm(''); // Очищаем поиск при закрытии
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleItemToggle = (itemId) => {
        setFormData(prev => {
            const newIds = [...prev.itemIds];
            const index = newIds.indexOf(itemId);
            if (index > -1) {
                newIds.splice(index, 1); // Удаляем, если уже есть
            } else {
                newIds.push(itemId); // Добавляем, если нет
            }
            return { ...prev, itemIds: newIds };
        });
    };

    const handleSelectAll = () => {
        setFormData(prev => ({
            ...prev,
            itemIds: filteredItems.map(item => item.id)
        }));
    };

    const handleDeselectAll = () => {
        setFormData(prev => ({
            ...prev,
            itemIds: []
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const myFormData = new FormData();
        try {
            myFormData.append("name", formData.name);
            // Добавляем каждый ID в formData как отдельное значение
            formData.itemIds.forEach(id => {
                myFormData.append("itemIds", id);
            });
            
            if (editingItemGroup) {
                await updateItemGroup(editingItemGroup.id, myFormData);
            } else {
                await postItemGroup(myFormData);
            }
            loadItemGroups(); // Обновляем список после сохранения
            closeModal();
        } catch (error) {
            console.error('Error saving item group:', error);
        }
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this item group?')) {
            deleteItemGroup(id).then(() => {
                loadItemGroups(); // Обновляем список после удаления
            }).catch(error => {
                console.error('Error deleting item group:', error);
            });
        }
    };

    const getItemNames = (itemIds) => {
        if (!itemIds || !Array.isArray(itemIds)) return 'No items';
        const names = itemIds.map(id => {
            const item = items.find(item => item.id === id);
            return item ? item.name : 'Unknown';
        });
        return names.join(', ');
    };

    return (
        <div className="adminItemGroupTable">
            <div className="admin-header">
                <h1>Группы товаров</h1>
                <div className="search-container">
                    <input
                        type="text"
                        placeholder="Найти группу..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="search-input"
                    />
                </div>
                <button onClick={openAddModal} className="add-button">
                    Добавить группу
                </button>
            </div>

            <div className="table-container">
                <table className="categories-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Название</th>
                            <th>Товары</th>
                            <th>Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItemGroups.map(group => (
                            <tr key={group.id}>
                                <td>{group.id}</td>
                                <td>{group.name}</td>
                                <td>{getItemNames(group.itemIds)}</td>
                                <td className="action-buttons">
                                    <button
                                        onClick={() => openEditModal(group)}
                                        className="edit-button"
                                    >
                                        Обновить
                                    </button>
                                    <button
                                        onClick={() => handleDelete(group.id)}
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
                            <h2>{editingItemGroup ? 'Обновить' : 'Добавить'}</h2>
                            <button className="close-button" onClick={closeModal}>×</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
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
                                <div className="item-selection-header">
                                    <label>Товары:</label>
                                    <div className="item-selection-controls">
                                        <button 
                                            type="button" 
                                            onClick={handleSelectAll}
                                            className="select-all-button"
                                        >
                                            Выбрать все
                                        </button>
                                        <button 
                                            type="button" 
                                            onClick={handleDeselectAll}
                                            className="deselect-all-button"
                                        >
                                            Снять выделение
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="item-search-container">
                                    <input
                                        type="text"
                                        placeholder="Поиск товаров..."
                                        value={itemSearchTerm}
                                        onChange={handleItemSearch}
                                        className="item-search-input"
                                    />
                                </div>
                                
                                <div className="items-list-container">
                                    {filteredItems.length > 0 ? (
                                        filteredItems.map(item => (
                                            <label key={item.id} className="item-checkbox">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.itemIds.includes(item.id)}
                                                    onChange={() => handleItemToggle(item.id)}
                                                />
                                                <span className="item-name">{item.name}</span>
                                            </label>
                                        ))
                                    ) : (
                                        <div className="no-items-message">
                                            {items.length === 0 ? 'Нет доступных товаров' : 'Товары не найдены'}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="modal-buttons">
                                <button type="button" onClick={closeModal} className="cancel-button">
                                    Отмена
                                </button>
                                <button type="submit" className="save-button">
                                    {editingItemGroup ? 'Обновить' : 'Добавить'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemGroupTable;