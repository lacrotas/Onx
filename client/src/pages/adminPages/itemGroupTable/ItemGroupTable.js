import React, { useState, useEffect } from 'react';
import { fetchAllItemGroup, postItemGroup, updateItemGroup, deleteItemGroup } from '../../../http/itemGroupApi';
import { fetchAllItem, updateItemById } from '../../../http/itemApi'; // Импортируем метод обновления товара
import ItemGroupTableHeader from './components/ItemGroupTableHeader';
import ItemGroupTableRow from './components/ItemGroupTableRow';
import ItemGroupModal from './components/ItemGroupModal';
import Loader from '../../../components/loader/Loader';
import "./ItemGroupTable.scss";

const ItemGroupTable = () => {
    const [groups, setGroups] = useState([]);
    const [allItems, setAllItems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState(null);

    const [formData, setFormData] = useState({
        name: '',
        itemIds: [],
        selectedItemsData: [] // Для отображения выбранных товаров в модалке
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [groupsData, itemsData] = await Promise.all([
                fetchAllItemGroup(),
                fetchAllItem()
            ]);
            setGroups(groupsData);
            setAllItems(itemsData);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        }
    };

    const openAddModal = () => {
        setEditingGroup(null);
        setFormData({ name: '', itemIds: [], selectedItemsData: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (group) => {
        setEditingGroup(group);
        const selected = allItems.filter(item => group.itemIds.includes(item.id));
        setFormData({
            name: group.name,
            itemIds: group.itemIds,
            selectedItemsData: selected
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить группу?')) {
            setIsSaving(true);
            try {
                // Перед удалением группы желательно отвязать товары на фронте или это сделает бэкенд каскадно
                await deleteItemGroup(id);
                await loadData();
            } catch (e) { 
                alert("Ошибка при удалении"); 
            } finally { 
                setIsSaving(false); 
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.selectedItemsData.length === 0) {
            return alert("Выберите хотя бы один товар");
        }

        setIsSaving(true);
        try {
            const itemsInfoArray = formData.selectedItemsData.map(item => ({
                name: item.name,
                status: item.isExist,
                image: item.images?.[0] || ''
            }));

            const payload = {
                name: formData.name,
                itemIds: formData.itemIds,
                itemInfo: itemsInfoArray
            };

            let savedGroup;
            if (editingGroup) {
                // 1. Обновляем саму группу
                savedGroup = await updateItemGroup(editingGroup.id, payload);
                
                // 2. Логика обновления связей в товарах:
                // Находим товары, которые были в группе, но теперь удалены из неё
                const itemsToRemove = editingGroup.itemIds.filter(id => !formData.itemIds.includes(id));
                
                const updatePromises = [
                    // Привязываем новые/текущие товары к группе
                    ...formData.itemIds.map(itemId => 
                        updateItemById(itemId, { itemGroupId: editingGroup.id })
                    ),
                    // Отвязываем удаленные товары (ставим null)
                    ...itemsToRemove.map(itemId => 
                        updateItemById(itemId, { itemGroupId: null })
                    )
                ];
                await Promise.all(updatePromises);

            } else {
                // 1. Создаем новую группу
                savedGroup = await postItemGroup(payload);
                
                // 2. Привязываем выбранные товары к ID созданной группы
                const updatePromises = formData.itemIds.map(itemId => 
                    updateItemById(itemId, { itemGroupId: savedGroup.id })
                );
                await Promise.all(updatePromises);
            }

            setIsModalOpen(false);
            await loadData();
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения и обновления товаров");
        } finally {
            setIsSaving(false);
        }
    };

    const filteredGroups = groups.filter(g =>
        g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-item-editor">
            <ItemGroupTableHeader
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                openAddModal={openAddModal}
            />

            <main className="content-container">
                <div className="table-wrapper">
                    <table className="apple-table">
                        <thead>
                            <tr>
                                <th className="my_p">Фото (превью)</th>
                                <th className="my_p">Название группы</th>
                                <th className="my_p">Кол-во товаров</th>
                                <th className="my_p">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredGroups.map(group => (
                                <ItemGroupTableRow
                                    key={group.id}
                                    group={group}
                                    onEdit={openEditModal}
                                    onDelete={handleDelete}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            <ItemGroupModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                formData={formData}
                setFormData={setFormData}
                allItems={allItems}
                onSubmit={handleSubmit}
                editingGroup={editingGroup}
            />

            <Loader isVisible={isSaving} text="Синхронизация..." />
        </div>
    );
};

export default ItemGroupTable;