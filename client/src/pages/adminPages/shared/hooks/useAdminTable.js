import { useState, useMemo, useCallback } from 'react';

/**
 * useAdminTable - универсальный хук для управления состоянием административных таблиц.
 * Инкапсулирует:
 * - Поиск и фильтрацию
 * - Сортировку по колонкам
 * - Быстрое инлайн-редактирование и отслеживание изменений
 * - Состояние модального окна добавления / редактирования
 * - Индикаторы загрузки и сохранения
 */
export function useAdminTable({
    items = [],
    searchFields = ['name'],
    customFilter = null,
    initialSort = { key: null, direction: 'ascending' },
    customSortResolvers = {}
} = {}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState(initialSort);
    const [modifiedItems, setModifiedItems] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Состояние модалки
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Сортировка
    const requestSort = useCallback((key) => {
        setSortConfig(prev => {
            let direction = 'ascending';
            if (prev.key === key && prev.direction === 'ascending') {
                direction = 'descending';
            }
            return { key, direction };
        });
    }, []);

    const getSortIndicator = useCallback((key) => {
        if (sortConfig.key !== key) return null;
        return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }, [sortConfig]);

    // Поиск
    const handleSearch = useCallback((e) => {
        const val = typeof e === 'string' ? e : e?.target?.value || '';
        setSearchTerm(val);
    }, []);

    // Быстрое редактирование
    const handleQuickEdit = useCallback((itemId, field, newValue) => {
        setModifiedItems(prev => {
            const itemChanges = prev[itemId] || {};
            const originalItem = items.find(it => it.id === itemId);
            const nextChanges = { ...itemChanges, [field]: newValue };

            // Если значение вернулось к исходному — удаляем поле
            if (originalItem && String(originalItem[field] ?? '') === String(newValue ?? '')) {
                delete nextChanges[field];
            }

            if (Object.keys(nextChanges).length === 0) {
                const nextState = { ...prev };
                delete nextState[itemId];
                return nextState;
            }

            return { ...prev, [itemId]: nextChanges };
        });
    }, [items]);

    const cancelChanges = useCallback((confirmMsg = 'Отменить все несохраненные изменения?') => {
        if (window.confirm(confirmMsg)) {
            setModifiedItems({});
        }
    }, []);

    const clearModified = useCallback(() => {
        setModifiedItems({});
    }, []);

    const hasChanges = useMemo(() => Object.keys(modifiedItems).length > 0, [modifiedItems]);

    // Модальное окно
    const openAddModal = useCallback(() => {
        setEditingItem(null);
        setIsModalOpen(true);
    }, []);

    const openEditModal = useCallback((item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setEditingItem(null);
    }, []);

    const confirmAndCloseModal = useCallback((confirmMsg = 'Закрыть форму? Несохраненные данные будут потеряны.') => {
        if (window.confirm(confirmMsg)) {
            closeModal();
        }
    }, [closeModal]);

    // Результирующий список элементов с учетом поиска, фильтра и сортировки
    const filteredItems = useMemo(() => {
        if (!Array.isArray(items)) return [];

        let result = items.map(item => {
            if (modifiedItems[item.id]) {
                return { ...item, ...modifiedItems[item.id] };
            }
            return item;
        });

        // Поиск по полям
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(item => {
                return searchFields.some(field => {
                    const val = item[field];
                    if (val === null || val === undefined) return false;
                    return String(val).toLowerCase().includes(term);
                });
            });
        }

        // Пользовательский фильтр
        if (typeof customFilter === 'function') {
            result = result.filter(customFilter);
        }

        // Сортировка
        if (sortConfig.key) {
            const { key, direction } = sortConfig;
            result.sort((a, b) => {
                let aVal;
                let bVal;

                if (typeof customSortResolvers[key] === 'function') {
                    aVal = customSortResolvers[key](a);
                    bVal = customSortResolvers[key](b);
                } else {
                    aVal = a[key];
                    bVal = b[key];
                }

                if (aVal === null || aVal === undefined) aVal = '';
                if (bVal === null || bVal === undefined) bVal = '';

                // Числовое сравнение, если оба числа
                const aNum = Number(aVal);
                const bNum = Number(bVal);
                if (!isNaN(aNum) && !isNaN(bNum) && typeof aVal !== 'boolean' && typeof bVal !== 'boolean' && aVal !== '' && bVal !== '') {
                    return direction === 'ascending' ? aNum - bNum : bNum - aNum;
                }

                // Строковое сравнение
                const comparison = String(aVal).localeCompare(String(bVal), undefined, { numeric: true, sensitivity: 'base' });
                return direction === 'ascending' ? comparison : -comparison;
            });
        }

        return result;
    }, [items, modifiedItems, searchTerm, searchFields, customFilter, sortConfig, customSortResolvers]);

    return {
        // Поиск
        searchTerm,
        setSearchTerm,
        handleSearch,

        // Сортировка
        sortConfig,
        requestSort,
        getSortIndicator,

        // Быстрое редактирование
        modifiedItems,
        handleQuickEdit,
        hasChanges,
        cancelChanges,
        clearModified,

        // Модалка
        isModalOpen,
        editingItem,
        openAddModal,
        openEditModal,
        closeModal,
        confirmAndCloseModal,

        // Лоадеры
        isLoading,
        setIsLoading,
        isSaving,
        setIsSaving,

        // Данные
        filteredItems
    };
}
