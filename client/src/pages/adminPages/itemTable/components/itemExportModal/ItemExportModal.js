import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
    FiDownload,
    FiX,
    FiCheckSquare,
    FiSquare,
    FiSearch,
    FiLayers,
    FiChevronDown,
    FiChevronRight,
    FiCheck
} from 'react-icons/fi';
import './ItemExportModal.scss';

// Все доступные поля для выгрузки в Excel
const EXPORT_COLUMNS = [
    { key: 'id', label: 'ID', defaultChecked: true, required: true, highlight: true },
    { key: 'barcode', label: 'Артикул', defaultChecked: true, highlight: true },
    { key: 'name', label: 'Название', defaultChecked: true },
    { key: 'mainCategory', label: 'Главная категория', defaultChecked: true },
    { key: 'subCategory', label: 'Подкатегория', defaultChecked: true },
    { key: 'price', label: 'Цена (BYN)', defaultChecked: true, highlight: true },
    { key: 'isExist', label: 'В наличии', defaultChecked: true, highlight: true },
    { key: 'isShowed', label: 'Отображается на сайте', defaultChecked: true, highlight: true },
    { key: 'productUrl', label: 'Ссылка на товар', defaultChecked: true },
    { key: 'imagesCount', label: 'Количество фото', defaultChecked: false },
    { key: 'imagesList', label: 'Ссылки на фото', defaultChecked: true },
    { key: 'video', label: 'Видео', defaultChecked: false },
    { key: 'specifications', label: 'Характеристики', defaultChecked: true },
    { key: 'description', label: 'Описание', defaultChecked: true },
    { key: 'seoTitle', label: 'SEO Title', defaultChecked: false },
    { key: 'seoDesc', label: 'SEO Description', defaultChecked: false },
    { key: 'createdAt', label: 'Дата создания', defaultChecked: false },
    { key: 'updatedAt', label: 'Дата обновления', defaultChecked: false },
];

const BASIC_FIELD_KEYS = ['id', 'barcode', 'name', 'mainCategory', 'subCategory', 'price', 'isExist', 'isShowed'];

const ItemExportModal = ({
    isOpen,
    onClose,
    items = [],
    mainCategories = [],
    allCategories = [],
    currentFilteredItems = []
}) => {
    const [selectedCategoryIds, setSelectedCategoryIds] = useState(new Set());
    const [categorySearch, setCategorySearch] = useState('');
    const [onlyInStock, setOnlyInStock] = useState(false);
    const [onlyShowed, setOnlyShowed] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    // Раскрытые/свернутые группы категорий (по умолчанию раскрыты)
    const [collapsedCategoryIds, setCollapsedCategoryIds] = useState(new Set());

    // Выбранные пользователем поля для Excel
    const [selectedFields, setSelectedFields] = useState(
        new Set(EXPORT_COLUMNS.filter(c => c.defaultChecked).map(c => c.key))
    );

    // Подсчет количества товаров в каждой категории/подкатегории
    const itemsCountByCatId = useMemo(() => {
        const counts = {};
        items.forEach(item => {
            const catId = String(item.categoryId || item.kategoryId);
            counts[catId] = (counts[catId] || 0) + 1;
        });
        return counts;
    }, [items]);

    // Группировка категорий по главным категориям
    const categoryTree = useMemo(() => {
        return mainCategories.map(mainCat => {
            const subs = allCategories.filter(cat => String(cat.parentId) === String(mainCat.id));
            const directCount = itemsCountByCatId[String(mainCat.id)] || 0;
            const subsTotal = subs.reduce((acc, sub) => acc + (itemsCountByCatId[String(sub.id)] || 0), 0);
            const totalItems = directCount + subsTotal;

            return {
                ...mainCat,
                subCategories: subs,
                directCount,
                totalItems
            };
        });
    }, [mainCategories, allCategories, itemsCountByCatId]);

    // Фильтрация категорий по поисковой строке
    const filteredCategoryTree = useMemo(() => {
        if (!categorySearch.trim()) return categoryTree;
        const q = categorySearch.toLowerCase().trim();

        return categoryTree.map(mainCat => {
            const cleanMainName = (mainCat.name || '').replace(/\n/g, '').trim();
            const mainMatches = cleanMainName.toLowerCase().includes(q);
            const matchingSubs = mainCat.subCategories.filter(sub => {
                const cleanSubName = (sub.name || '').replace(/\n/g, '').trim();
                return cleanSubName.toLowerCase().includes(q);
            });

            if (mainMatches) {
                return mainCat;
            }
            if (matchingSubs.length > 0) {
                return {
                    ...mainCat,
                    subCategories: matchingSubs
                };
            }
            return null;
        }).filter(Boolean);
    }, [categoryTree, categorySearch]);

    // Товары, которые попадут в выгрузку по выбранным категориям
    const itemsToExport = useMemo(() => {
        let list = items.filter(item => {
            const catId = Number(item.categoryId || item.kategoryId);
            const subCat = allCategories.find(c => Number(c.id) === catId);
            const mainCatId = Number(subCat?.parentId || item.mainKategoryId);

            return selectedCategoryIds.has(catId) || (mainCatId && selectedCategoryIds.has(mainCatId));
        });

        if (onlyInStock) {
            list = list.filter(item => item.isExist);
        }
        if (onlyShowed) {
            list = list.filter(item => item.isShowed);
        }

        return list;
    }, [items, selectedCategoryIds, allCategories, onlyInStock, onlyShowed]);

    if (!isOpen) return null;

    // Свернуть / развернуть категорию
    const handleToggleCollapse = (catId, e) => {
        e.stopPropagation();
        const idNum = Number(catId);
        setCollapsedCategoryIds(prev => {
            const next = new Set(prev);
            if (next.has(idNum)) {
                next.delete(idNum);
            } else {
                next.add(idNum);
            }
            return next;
        });
    };

    // Выбрать все категории (и главные, и подкатегории)
    const handleSelectAllCategories = () => {
        const allIds = new Set();
        mainCategories.forEach(cat => allIds.add(Number(cat.id)));
        allCategories.forEach(cat => allIds.add(Number(cat.id)));
        setSelectedCategoryIds(allIds);
    };

    // Снять выбор со всех категорий
    const handleDeselectAllCategories = () => {
        setSelectedCategoryIds(new Set());
    };

    // Переключить подкатегорию
    const handleToggleCategory = (catId) => {
        const idNum = Number(catId);
        setSelectedCategoryIds(prev => {
            const next = new Set(prev);
            if (next.has(idNum)) {
                next.delete(idNum);
            } else {
                next.add(idNum);
            }
            return next;
        });
    };

    // Переключить всю главную категорию
    const handleToggleMainCategory = (mainCat) => {
        const mainId = Number(mainCat.id);
        const subIds = mainCat.subCategories.map(s => Number(s.id));
        const allTargetIds = [mainId, ...subIds];

        // Проверяем, выбраны ли все
        const allSelected = allTargetIds.every(id => selectedCategoryIds.has(id));

        setSelectedCategoryIds(prev => {
            const next = new Set(prev);
            if (allSelected) {
                allTargetIds.forEach(id => next.delete(id));
            } else {
                allTargetIds.forEach(id => next.add(id));
            }
            return next;
        });
    };

    // Управление выбором полей
    const handleToggleField = (fieldKey) => {
        // Поле ID является обязательным для идентификации товаров при последующем импорте
        if (fieldKey === 'id') return;

        setSelectedFields(prev => {
            const next = new Set(prev);
            if (next.has(fieldKey)) {
                // Предотвращаем отключение всех полей сразу
                if (next.size > 1) {
                    next.delete(fieldKey);
                }
            } else {
                next.add(fieldKey);
            }
            return next;
        });
    };

    const handleSelectAllFields = () => {
        setSelectedFields(new Set(EXPORT_COLUMNS.map(c => c.key)));
    };

    const handleSelectBasicFields = () => {
        setSelectedFields(new Set(BASIC_FIELD_KEYS));
    };

    const handleDeselectAllFields = () => {
        // Оставляем обязательный ID
        setSelectedFields(new Set(['id']));
    };

    // Генерация и скачивание Excel с учетом выбранных колонок
    const handleExport = () => {
        if (itemsToExport.length === 0) {
            alert('Нет товаров, соответствующих выбранным критериям для выгрузки!');
            return;
        }

        if (selectedFields.size === 0) {
            alert('Выберите хотя бы одно поле для выгрузки в файл Excel!');
            return;
        }

        setIsExporting(true);
        try {
            const origin = window.location.origin;

            const dataToExport = itemsToExport.map(item => {
                const itemCatId = item.categoryId || item.kategoryId;
                const subCat = allCategories.find(c => String(c.id) === String(itemCatId));
                const mainCatId = subCat?.parentId || item.mainKategoryId;
                const mainCat = mainCategories.find(m => String(m.id) === String(mainCatId));

                const mainCategoryName = mainCat ? (mainCat.name || '').replace(/\n/g, '').trim() : '';
                const subCategoryName = subCat ? (subCat.name || '').replace(/\n/g, '').trim() : '';

                // Ссылка на товар
                let productUrl = '';
                if (mainCat?.alias && subCat?.alias && item.alias) {
                    productUrl = `${origin}/${mainCat.alias}/${subCat.alias}/${item.alias}`;
                } else if (subCat?.alias && item.alias) {
                    productUrl = `${origin}/${subCat.alias}/${item.alias}`;
                } else if (item.alias) {
                    productUrl = `${origin}/itemPreview/${item.alias}`;
                } else {
                    productUrl = `${origin}/item/${item.id}`;
                }

                // Очистка HTML тегов
                const cleanDescription = (item.description || '')
                    .replace(/<[^>]*>?/gm, ' ')
                    .replace(/\s+/g, ' ')
                    .trim();

                // Характеристики
                let specsString = '';
                if (item.specificationsJSONB && typeof item.specificationsJSONB === 'object') {
                    specsString = Object.entries(item.specificationsJSONB)
                        .filter(([_, v]) => v !== undefined && v !== null && String(v).trim() !== '')
                        .map(([k, v]) => `${k}: ${v}`)
                        .join('; ');
                }

                // Фото
                const imagesList = Array.isArray(item.images) && item.images.length > 0
                    ? item.images.map(img => `${origin}/static/images/${img}`).join(';\n')
                    : '';

                // Формируем строку только из тех колонок, которые выбрал пользователь
                const rowObj = {};

                if (selectedFields.has('id')) rowObj['ID'] = item.id;
                if (selectedFields.has('barcode')) rowObj['Артикул'] = item.barcode || '';
                if (selectedFields.has('name')) rowObj['Название'] = item.name || '';
                if (selectedFields.has('mainCategory')) rowObj['Главная категория'] = mainCategoryName;
                if (selectedFields.has('subCategory')) rowObj['Подкатегория'] = subCategoryName;
                if (selectedFields.has('price')) rowObj['Цена (BYN)'] = parseFloat(item.price) || 0;
                if (selectedFields.has('isExist')) rowObj['В наличии'] = item.isExist ? 'Да' : 'Нет';
                if (selectedFields.has('isShowed')) rowObj['Отображается на сайте'] = item.isShowed ? 'Да' : 'Нет';
                if (selectedFields.has('productUrl')) rowObj['Ссылка на товар'] = productUrl;
                if (selectedFields.has('imagesCount')) rowObj['Количество фото'] = Array.isArray(item.images) ? item.images.length : 0;
                if (selectedFields.has('imagesList')) rowObj['Ссылки на фото'] = imagesList;
                if (selectedFields.has('video')) rowObj['Видео'] = item.video ? `${origin}/static/video/${item.video}` : 'Нет';
                if (selectedFields.has('specifications')) rowObj['Характеристики'] = specsString;
                if (selectedFields.has('description')) rowObj['Описание'] = cleanDescription;
                if (selectedFields.has('seoTitle')) rowObj['SEO Title'] = item.seo_title || '';
                if (selectedFields.has('seoDesc')) rowObj['SEO Description'] = item.seo_desc || '';
                if (selectedFields.has('createdAt')) rowObj['Дата создания'] = item.createdAt ? new Date(item.createdAt).toLocaleString('ru-RU') : '';
                if (selectedFields.has('updatedAt')) rowObj['Дата обновления'] = item.updatedAt ? new Date(item.updatedAt).toLocaleString('ru-RU') : '';

                return rowObj;
            });

            const worksheet = XLSX.utils.json_to_sheet(dataToExport);

            // Автоширина колонок
            const colWidths = Object.keys(dataToExport[0]).map(key => {
                let maxLen = key.length;
                dataToExport.forEach(row => {
                    const val = row[key];
                    if (val !== undefined && val !== null) {
                        const firstLine = String(val).split('\n')[0];
                        if (firstLine.length > maxLen) {
                            maxLen = firstLine.length;
                        }
                    }
                });
                return { wch: Math.min(Math.max(maxLen + 3, 10), 60) };
            });
            worksheet['!cols'] = colWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Товары');

            const now = new Date();
            const dateStr = now.toLocaleDateString('ru-RU').replace(/\./g, '-');
            const filename = `Товары_ONX_${dateStr}.xlsx`;

            XLSX.writeFile(workbook, filename);
            onClose();
        } catch (error) {
            console.error('Export error:', error);
            alert('Произошла ошибка при экспорте в Excel');
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-export" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-icon-title">
                        <FiDownload className="header-icon" />
                        <div>
                            <h2>Гибкая выгрузка в Excel</h2>
                            <p className="modal-subtitle">Экспорт каталога с выбором категорий, фильтрацией и настройкой колонок</p>
                        </div>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="export-body">
                    {/* 1. Выберите категории для выгрузки */}
                    <div className="export-section categories-selector-section">
                        <div className="section-header-row">
                            <label className="section-label">1. Выберите категории для выгрузки:</label>
                            <div className="quick-select-btns">
                                <button
                                    type="button"
                                    className="btn-text-action"
                                    onClick={handleSelectAllCategories}
                                >
                                    <FiCheckSquare /> Выбрать все
                                </button>
                                    <button
                                        type="button"
                                        className="btn-text-action"
                                        onClick={handleDeselectAllCategories}
                                    >
                                        <FiSquare /> Снять все
                                    </button>
                                </div>
                            </div>

                            <div className="category-search-box">
                                <FiSearch className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Поиск категории по названию..."
                                    value={categorySearch}
                                    onChange={e => setCategorySearch(e.target.value)}
                                    className="category-search-input"
                                />
                                {categorySearch && (
                                    <button
                                        type="button"
                                        className="clear-search-btn"
                                        onClick={() => setCategorySearch('')}
                                    >
                                        <FiX />
                                    </button>
                                )}
                            </div>

                            <div className="categories-tree-container">
                                {filteredCategoryTree.map(mainCat => {
                                    const mainId = Number(mainCat.id);
                                    const subIds = mainCat.subCategories.map(s => Number(s.id));
                                    const allTargetIds = [mainId, ...subIds];

                                    const selectedCount = allTargetIds.filter(id => selectedCategoryIds.has(id)).length;
                                    const allSelected = allTargetIds.length > 0 && selectedCount === allTargetIds.length;
                                    const partiallySelected = selectedCount > 0 && !allSelected;
                                    const isCollapsed = collapsedCategoryIds.has(mainId);
                                    const hasSubs = mainCat.subCategories.length > 0;
                                    const cleanName = (mainCat.name || '').replace(/\n/g, '').trim();

                                    return (
                                        <div key={mainCat.id} className="main-cat-group">
                                            <div
                                                className={`main-cat-header ${allSelected ? 'all-checked' : ''} ${partiallySelected ? 'partial-checked' : ''}`}
                                                onClick={() => handleToggleMainCategory(mainCat)}
                                            >
                                                <div className="custom-checkbox-wrapper" onClick={e => e.stopPropagation()}>
                                                    <input
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        ref={el => {
                                                            if (el) el.indeterminate = partiallySelected;
                                                        }}
                                                        onChange={() => handleToggleMainCategory(mainCat)}
                                                    />
                                                </div>

                                                <span className="main-cat-name">
                                                    <FiLayers className="cat-icon" /> {cleanName}
                                                </span>

                                                <span className="main-cat-count" title="Всего товаров в категории и её подкатегориях">
                                                    {mainCat.totalItems} шт.
                                                </span>

                                                {hasSubs && (
                                                    <button
                                                        type="button"
                                                        className="btn-collapse"
                                                        onClick={(e) => handleToggleCollapse(mainId, e)}
                                                        title={isCollapsed ? 'Развернуть подкатегории' : 'Свернуть подкатегории'}
                                                    >
                                                        {isCollapsed ? <FiChevronRight /> : <FiChevronDown />}
                                                    </button>
                                                )}
                                            </div>

                                            {hasSubs && !isCollapsed && (
                                                <div className="sub-cats-list">
                                                    {mainCat.subCategories.map(subCat => {
                                                        const isChecked = selectedCategoryIds.has(Number(subCat.id));
                                                        const count = itemsCountByCatId[String(subCat.id)] || 0;
                                                        const cleanSubName = (subCat.name || '').replace(/\n/g, '').trim();

                                                        return (
                                                            <label
                                                                key={subCat.id}
                                                                className={`sub-cat-item ${isChecked ? 'selected' : ''}`}
                                                                onClick={e => e.stopPropagation()}
                                                            >
                                                                <input
                                                                    type="checkbox"
                                                                    checked={isChecked}
                                                                    onChange={() => handleToggleCategory(subCat.id)}
                                                                />
                                                                <span className="sub-cat-name" title={cleanSubName}>
                                                                    {cleanSubName}
                                                                </span>
                                                                <span className="sub-cat-count">{count} шт.</span>
                                                            </label>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}

                                {filteredCategoryTree.length === 0 && (
                                    <div className="categories-not-found">
                                        Категории не найдены по запросу "{categorySearch}"
                                    </div>
                                )}
                            </div>
                        </div>

                    {/* 2. Дополнительные фильтры наличия и видимости */}
                    <div className="export-section filters-section">
                        <label className="section-label">2. Дополнительные условия:</label>
                        <div className="filter-checkboxes-row">
                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={onlyInStock}
                                    onChange={e => setOnlyInStock(e.target.checked)}
                                />
                                <span>Только со статусом «В наличии»</span>
                            </label>
                            <label className="filter-checkbox">
                                <input
                                    type="checkbox"
                                    checked={onlyShowed}
                                    onChange={e => setOnlyShowed(e.target.checked)}
                                />
                                <span>Только со статусом «Отображается на сайте»</span>
                            </label>
                        </div>
                    </div>

                    {/* 3. Выбор полей для включения в файл Excel */}
                    <div className="export-section fields-selector-section">
                        <div className="section-header-row">
                            <label className="section-label">
                                3. Выберите поля для включения в файл Excel ({selectedFields.size} из {EXPORT_COLUMNS.length}):
                            </label>
                            <div className="quick-select-btns">
                                <button
                                    type="button"
                                    className="btn-text-action"
                                    onClick={handleSelectAllFields}
                                >
                                    Выбрать все
                                </button>
                                <button
                                    type="button"
                                    className="btn-text-action"
                                    onClick={handleSelectBasicFields}
                                    title="ID, Артикул, Название, Категория, Цена, Наличие, Видимость"
                                >
                                    Только основные
                                </button>
                                <button
                                    type="button"
                                    className="btn-text-action"
                                    onClick={handleDeselectAllFields}
                                >
                                    Снять все
                                </button>
                            </div>
                        </div>

                        <div className="fields-grid">
                            {EXPORT_COLUMNS.map(col => {
                                const isChecked = selectedFields.has(col.key);
                                const isRequired = Boolean(col.required);
                                return (
                                    <div
                                        key={col.key}
                                        className={`field-chip ${isChecked ? 'active' : ''} ${col.highlight ? 'highlight' : ''} ${isRequired ? 'locked' : ''}`}
                                        onClick={() => handleToggleField(col.key)}
                                        title={isRequired ? 'Обязательное поле для идентификации товара в системе' : ''}
                                    >
                                        <div className="field-checkbox">
                                            {isChecked && <FiCheck className="check-icon" />}
                                        </div>
                                        <span className="field-label">{col.label}</span>
                                        {isRequired && <span className="field-badge-req">Обязательно</span>}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Подвал с итогом и кнопкой выгрузки */}
                <div className="modal-footer">
                    <div className="export-summary">
                        Будет выгружено: <strong>{itemsToExport.length}</strong> товаров
                        <span> ({selectedCategoryIds.size} выбранных категорий)</span>
                        <span> • колонок в Excel: <strong>{selectedFields.size}</strong></span>
                    </div>
                    <div className="footer-actions">
                        <button type="button" className="btn-cancel" onClick={onClose} disabled={isExporting}>
                            Отмена
                        </button>
                        <button
                            type="button"
                            className="btn-download"
                            onClick={handleExport}
                            disabled={isExporting || itemsToExport.length === 0 || selectedFields.size === 0}
                        >
                            <FiDownload />
                            <span>{isExporting ? 'Формирование...' : `Выгрузить в Excel (${itemsToExport.length} шт.)`}</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemExportModal;
