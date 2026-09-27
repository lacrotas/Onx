import React, { useState, useEffect } from 'react';
import { fetchAllItemGroup, postItemGroup, updateItemGroup, deleteItemGroup } from '../../../http/itemGroupApi';
import { fetchAllItem, updateItemById } from '../../../http/itemApi';
import { useAdminTable } from '../shared/hooks/useAdminTable';
import AdminPageHeader from '../shared/components/AdminPageHeader';
import { AdminTable } from '../shared/components/AdminTable';
import ItemGroupTableRow from './components/ItemGroupTableRow';
import ItemGroupModal from './components/ItemGroupModal';
import Loader from '../../../components/loader/Loader';
import "./ItemGroupTable.scss";

const COLUMNS = [
    { label: 'Превью', width: '120px' },
    { label: 'Название группы', sortKey: 'name' },
    { label: 'Кол-во товаров в группе', width: '220px' },
    { label: 'Действия', align: 'right', width: '190px' }
];

const ItemGroupTable = () => {
    const [groups, setGroups] = useState([]);
    const [allItems, setAllItems] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        itemIds: [],
        selectedItemsData: []
    });

    const {
        searchTerm,
        handleSearch,
        sortConfig,
        requestSort,
        getSortIndicator,
        filteredItems,
        isModalOpen,
        editingItem,
        openAddModal,
        openEditModal,
        closeModal,
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving
    } = useAdminTable({
        items: groups,
        searchFields: ['name'],
        initialSort: { key: 'name', direction: 'ascending' }
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [groupsData, itemsData] = await Promise.all([
                fetchAllItemGroup(),
                fetchAllItem()
            ]);
            setGroups(Array.isArray(groupsData) ? groupsData : []);
            setAllItems(Array.isArray(itemsData) ? itemsData : []);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenAdd = () => {
        setFormData({ name: '', itemIds: [], selectedItemsData: [] });
        openAddModal();
    };

    const handleOpenEdit = (group) => {
        const selected = allItems.filter(item => group.itemIds.includes(item.id));
        setFormData({
            name: group.name,
            itemIds: group.itemIds,
            selectedItemsData: selected
        });
        openEditModal(group);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Удалить группу?')) {
            setIsSaving(true);
            try {
                await deleteItemGroup(id);
                await loadData();
            } catch {
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
            if (editingItem) {
                savedGroup = await updateItemGroup(editingItem.id, payload);
                const itemsToRemove = editingItem.itemIds.filter(id => !formData.itemIds.includes(id));
                const updatePromises = [
                    ...formData.itemIds.map(itemId => updateItemById(itemId, { itemGroupId: editingItem.id })),
                    ...itemsToRemove.map(itemId => updateItemById(itemId, { itemGroupId: null }))
                ];
                await Promise.all(updatePromises);
            } else {
                savedGroup = await postItemGroup(payload);
                const updatePromises = formData.itemIds.map(itemId => updateItemById(itemId, { itemGroupId: savedGroup.id }));
                await Promise.all(updatePromises);
            }

            closeModal();
            await loadData();
        } catch (e) {
            console.error(e);
            alert("Ошибка сохранения и обновления товаров");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="admin-page-container">
            <AdminPageHeader
                title="Группы товаров"
                count={groups.length}
                searchTerm={searchTerm}
                onSearch={handleSearch}
                searchPlaceholder="Поиск группы..."
                onAdd={handleOpenAdd}
                addButtonText="Добавить группу"
            />

            <AdminTable
                columns={COLUMNS}
                data={filteredItems}
                sortConfig={sortConfig}
                onSort={requestSort}
                getSortIndicator={getSortIndicator}
                isLoading={isLoading}
                emptyMessage="Группы товаров не найдены"
                renderRow={(group) => (
                    <ItemGroupTableRow
                        key={group.id}
                        group={group}
                        onEdit={handleOpenEdit}
                        onDelete={handleDelete}
                    />
                )}
            />

            <ItemGroupModal
                isOpen={isModalOpen}
                onClose={closeModal}
                formData={formData}
                setFormData={setFormData}
                allItems={allItems}
                onSubmit={handleSubmit}
                editingGroup={editingItem}
            />

            <Loader isVisible={isSaving} text="Синхронизация..." />
        </div>
    );
};

export default ItemGroupTable;