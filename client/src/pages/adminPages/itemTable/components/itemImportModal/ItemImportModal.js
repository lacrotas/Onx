import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
    FiUpload,
    FiX,
    FiFileText,
    FiAlertTriangle,
    FiDownload,
    FiRefreshCw,
    FiCheck
} from 'react-icons/fi';
import { bulkUpdateItems } from '../../../../../http/itemApi';
import './ItemImportModal.scss';

// Вспомогательная функция нормализации boolean значений из Excel
const parseBooleanValue = (val) => {
    if (val === undefined || val === null || val === '') return null;
    const str = String(val).toLowerCase().trim();
    if (['да', 'yes', 'true', '1', '+', 'в наличии', 'отображается', 'активен'].includes(str)) {
        return true;
    }
    if (['нет', 'no', 'false', '0', '-', 'нет в наличии', 'скрыт', 'не отображается'].includes(str)) {
        return false;
    }
    return null;
};

// Вспомогательная функция поиска ключа в строке объекта без учета регистра и пробелов
const findValueByKeys = (row, possibleKeys) => {
    const rowKeys = Object.keys(row);
    for (const key of possibleKeys) {
        const lowerKey = key.toLowerCase().replace(/[\s_\-()]/g, '');
        for (const rk of rowKeys) {
            const lowerRk = rk.toLowerCase().replace(/[\s_\-()]/g, '');
            if (lowerRk === lowerKey && row[rk] !== undefined && row[rk] !== '') {
                return row[rk];
            }
        }
    }
    return null;
};

const ItemImportModal = ({
    isOpen,
    onClose,
    catalogItems = [],
    onImportSuccess
}) => {
    const fileInputRef = useRef(null);
    const [fileName, setFileName] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [isApplying, setIsApplying] = useState(false);
    const [parseError, setParseError] = useState('');

    // Настройки импорта (что обновлять)
    const [updateStock, setUpdateStock] = useState(true);
    const [updateVisibility, setUpdateVisibility] = useState(true);
    const [updatePrice, setUpdatePrice] = useState(true);
    const [updateBarcode, setUpdateBarcode] = useState(true);

    // Статистика и сопоставление
    const [diffResults, setDiffResults] = useState(null);

    if (!isOpen) return null;

    // Сброс состояния
    const handleReset = () => {
        setFileName('');
        setDiffResults(null);
        setParseError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Скачивание файла-шаблона
    const handleDownloadTemplate = () => {
        const templateData = [
            {
                'ID': 1,
                'Штрихкод': '4810123456789',
                'Название (для справки)': 'Офисное кресло Comfort',
                'Цена (BYN)': 250,
                'В наличии (Да/Нет)': 'Да',
                'Отображается на сайте (Да/Нет)': 'Да'
            },
            {
                'ID': 2,
                'Штрихкод': '4810987654321',
                'Название (для справки)': 'Компьютерный стол Matrix',
                'Цена (BYN)': 340,
                'В наличии (Да/Нет)': 'Нет',
                'Отображается на сайте (Да/Нет)': 'Да'
            }
        ];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        worksheet['!cols'] = [
            { wch: 12 },
            { wch: 22 },
            { wch: 40 },
            { wch: 15 },
            { wch: 22 },
            { wch: 30 }
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Шаблон_импорта');
        XLSX.writeFile(workbook, 'Шаблон_импорта_товаров_ONX.xlsx');
    };

    // Чтение и парсинг файла
    const handleFileChange = (e) => {
        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        setFileName(selectedFile.name);
        setParseError('');
        setIsParsing(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

                if (rows.length === 0) {
                    setParseError('Файл пуст или не содержит строк с данными');
                    setIsParsing(false);
                    return;
                }

                analyzeAndBuildDiff(rows);
            } catch (err) {
                console.error('File parse error:', err);
                setParseError('Ошибка чтения файла. Убедитесь, что это корректный файл Excel (.xlsx, .xls) или .csv');
            } finally {
                setIsParsing(false);
            }
        };

        reader.onerror = () => {
            setParseError('Ошибка чтения файла с диска');
            setIsParsing(false);
        };

        reader.readAsArrayBuffer(selectedFile);
    };

    // Анализ строк и формирование сопоставления с каталогом
    const analyzeAndBuildDiff = (rows) => {
        // Создаем быстрый индекс поиска ТОЛЬКО по ID
        const catalogById = new Map();

        catalogItems.forEach(item => {
            catalogById.set(Number(item.id), item);
        });

        const matchedItems = [];
        const unmatchedRows = [];

        rows.forEach((row, index) => {
            const rawId = findValueByKeys(row, ['id', 'ид', 'id товара', 'ид товара', 'код товара', 'код', 'id (обязательно)']);
            const rawBarcode = findValueByKeys(row, ['штрихкод', 'штрих-код', 'штрих код', 'barcode', 'штрихкод товара']);
            const rawName = findValueByKeys(row, ['название', 'наименование', 'name', 'название товара', 'товар']);
            const rawPrice = findValueByKeys(row, ['цена', 'цена byn', 'price', 'стоимость', 'цена (byn)']);
            const rawStock = findValueByKeys(row, ['в наличии', 'наличие', 'в наличии (да/нет)', 'isexist', 'статус наличия']);
            const rawShowed = findValueByKeys(row, ['отображается на сайте', 'отображается', 'видимость', 'isshowed', 'показывать']);

            // Проверка обязательного поля ID
            if (rawId === null || rawId === undefined || String(rawId).trim() === '') {
                unmatchedRows.push({
                    rowIndex: index + 2,
                    rawId: '—',
                    rawName: rawName || 'Без названия',
                    rawPrice: rawPrice || '—',
                    reason: 'Не указан обязательный ID'
                });
                return;
            }

            const idNum = Number(rawId);
            if (isNaN(idNum) || idNum <= 0) {
                unmatchedRows.push({
                    rowIndex: index + 2,
                    rawId,
                    rawName: rawName || 'Без названия',
                    rawPrice: rawPrice || '—',
                    reason: `Некорректный номер ID: "${rawId}"`
                });
                return;
            }

            // Сверка строго по ID (не по названию, т.к. названия могут повторяться)
            const foundItem = catalogById.get(idNum);

            if (!foundItem) {
                unmatchedRows.push({
                    rowIndex: index + 2,
                    rawId,
                    rawName: rawName || 'Без названия',
                    rawPrice: rawPrice || '—',
                    reason: `Товар с ID ${idNum} не найден в каталоге`
                });
                return;
            }

            const matchType = 'ID';

            // Анализируем предлагаемые изменения
            const changes = {};
            let hasAnyChange = false;

            // 1. Цена
            if (rawPrice !== null && rawPrice !== '') {
                const newPriceNum = parseFloat(String(rawPrice).replace(',', '.'));
                if (!isNaN(newPriceNum)) {
                    const currentPriceNum = parseFloat(foundItem.price) || 0;
                    if (Math.abs(newPriceNum - currentPriceNum) > 0.001) {
                        changes.price = {
                            from: currentPriceNum,
                            to: newPriceNum
                        };
                        hasAnyChange = true;
                    }
                }
            }

            // 2. В наличии
            if (rawStock !== null) {
                const newStockBool = parseBooleanValue(rawStock);
                if (newStockBool !== null) {
                    const currentStockBool = Boolean(foundItem.isExist);
                    if (newStockBool !== currentStockBool) {
                        changes.isExist = {
                            from: currentStockBool,
                            to: newStockBool
                        };
                        hasAnyChange = true;
                    }
                }
            }

            // 3. Отображается на сайте
            if (rawShowed !== null) {
                const newShowedBool = parseBooleanValue(rawShowed);
                if (newShowedBool !== null) {
                    const currentShowedBool = Boolean(foundItem.isShowed);
                    if (newShowedBool !== currentShowedBool) {
                        changes.isShowed = {
                            from: currentShowedBool,
                            to: newShowedBool
                        };
                        hasAnyChange = true;
                    }
                }
            }

            // 4. Штрихкод
            if (rawBarcode !== null && String(rawBarcode).trim()) {
                const newBarcodeStr = String(rawBarcode).trim();
                const currentBarcodeStr = foundItem.barcode ? String(foundItem.barcode).trim() : '';
                if (newBarcodeStr !== currentBarcodeStr) {
                    changes.barcode = {
                        from: currentBarcodeStr || '—',
                        to: newBarcodeStr
                    };
                    hasAnyChange = true;
                }
            }

            matchedItems.push({
                item: foundItem,
                matchType,
                changes,
                hasAnyChange
            });
        });

        setDiffResults({
            totalRows: rows.length,
            matchedItems,
            unmatchedRows
        });
    };

    // Применение изменений
    const handleApplyImport = async () => {
        if (!diffResults || !diffResults.matchedItems) return;

        // Фильтруем элементы, у которых есть включенные изменения
        const payloadItems = [];

        diffResults.matchedItems.forEach(({ item, changes }) => {
            const itemUpdate = { id: item.id };
            let needsUpdate = false;

            if (updatePrice && changes.price) {
                itemUpdate.price = changes.price.to;
                needsUpdate = true;
            }
            if (updateStock && changes.isExist) {
                itemUpdate.isExist = changes.isExist.to;
                needsUpdate = true;
            }
            if (updateVisibility && changes.isShowed) {
                itemUpdate.isShowed = changes.isShowed.to;
                needsUpdate = true;
            }
            if (updateBarcode && changes.barcode) {
                itemUpdate.barcode = changes.barcode.to;
                needsUpdate = true;
            }

            if (needsUpdate) {
                payloadItems.push(itemUpdate);
            }
        });

        if (payloadItems.length === 0) {
            alert('Нет товаров с изменениями по выбранным параметрам!');
            return;
        }

        setIsApplying(true);
        try {
            const result = await bulkUpdateItems(payloadItems);
            if (result) {
                alert(`Импорт успешно завершен!\nОбновлено товаров: ${result.updatedCount || payloadItems.length}`);
                if (onImportSuccess) {
                    await onImportSuccess();
                }
                onClose();
            }
        } catch (error) {
            console.error('Import apply error:', error);
            alert('Произошла ошибка при сохранении изменений на сервере');
        } finally {
            setIsApplying(false);
        }
    };

    // Подсчет активных изменений с учетом галочек
    const activeChangesCount = diffResults?.matchedItems?.filter(({ changes }) => {
        if (updatePrice && changes.price) return true;
        if (updateStock && changes.isExist) return true;
        if (updateVisibility && changes.isShowed) return true;
        if (updateBarcode && changes.barcode) return true;
        return false;
    }).length || 0;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-import" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-icon-title">
                        <FiUpload className="header-icon" />
                        <div>
                            <h2>Импорт и массовое обновление товаров</h2>
                            <p className="modal-subtitle">
                                Загрузка прайс-листов Excel (.xlsx, .csv) с обновлением цен, наличия, видимости и штрихкодов
                            </p>
                        </div>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="import-body">
                    {/* Шаг 1: Загрузка файла или скачивание шаблона */}
                    {!diffResults && (
                        <div className="upload-stage">
                            <div className="template-download-card">
                                <div className="template-info">
                                    <FiFileText className="template-icon" />
                                    <div>
                                        <strong>Нужен образец для заполнения?</strong>
                                        <p>Скачайте готовый шаблон Excel с правильными заголовками колонок.</p>
                                    </div>
                                </div>
                                <button type="button" className="btn-template" onClick={handleDownloadTemplate}>
                                    <FiDownload />
                                    <span>Скачать шаблон Excel</span>
                                </button>
                            </div>

                            <div
                                className="dropzone-box"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".xlsx, .xls, .csv"
                                    style={{ display: 'none' }}
                                />
                                <div className="dropzone-content">
                                    <div className="upload-circle-icon">
                                        <FiUpload />
                                    </div>
                                    <span className="dropzone-title">Нажмите или перетащите файл Excel для импорта</span>
                                    <span className="dropzone-desc">Поддерживаются форматы .xlsx, .xls, .csv</span>
                                </div>
                            </div>

                            {isParsing && (
                                <div className="parsing-indicator">
                                    <FiRefreshCw className="spin-icon" />
                                    <span>Чтение и анализ строк файла...</span>
                                </div>
                            )}

                            {parseError && (
                                <div className="error-banner">
                                    <FiAlertTriangle />
                                    <span>{parseError}</span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Шаг 2: Результаты анализа и предварительный просмотр */}
                    {diffResults && (
                        <div className="preview-stage">
                            {/* Панель загруженного файла */}
                            <div className="file-status-bar">
                                <div className="file-info">
                                    <FiFileText className="file-icon" />
                                    <span className="file-name">{fileName}</span>
                                    <span className="file-rows">({diffResults.totalRows} строк)</span>
                                </div>
                                <button type="button" className="btn-change-file" onClick={handleReset}>
                                    Выбрать другой файл
                                </button>
                            </div>

                            {/* Карточки статистики */}
                            <div className="stats-row">
                                <div className="stat-card">
                                    <span className="stat-num">{diffResults.totalRows}</span>
                                    <span className="stat-label">Строк в файле</span>
                                </div>
                                <div className="stat-card success">
                                    <span className="stat-num">{diffResults.matchedItems.length}</span>
                                    <span className="stat-label">Найдено в каталоге</span>
                                </div>
                                <div className="stat-card warning">
                                    <span className="stat-num">{diffResults.unmatchedRows.length}</span>
                                    <span className="stat-label">Не сопоставлено</span>
                                </div>
                                <div className="stat-card highlight">
                                    <span className="stat-num">{activeChangesCount}</span>
                                    <span className="stat-label">Будет обновлено</span>
                                </div>
                            </div>

                            {/* Переключатели обновляемых параметров */}
                            <div className="options-panel">
                                <label className="panel-title">Выберите параметры для обновления:</label>
                                <div className="options-checkboxes">
                                    <label className={`option-pill ${updateStock ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={updateStock}
                                            onChange={e => setUpdateStock(e.target.checked)}
                                        />
                                        <span>Статус «В наличии»</span>
                                    </label>

                                    <label className={`option-pill ${updateVisibility ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={updateVisibility}
                                            onChange={e => setUpdateVisibility(e.target.checked)}
                                        />
                                        <span>Видимость «Отображается на сайте»</span>
                                    </label>

                                    <label className={`option-pill ${updatePrice ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={updatePrice}
                                            onChange={e => setUpdatePrice(e.target.checked)}
                                        />
                                        <span>Цены</span>
                                    </label>

                                    <label className={`option-pill ${updateBarcode ? 'active' : ''}`}>
                                        <input
                                            type="checkbox"
                                            checked={updateBarcode}
                                            onChange={e => setUpdateBarcode(e.target.checked)}
                                        />
                                        <span>Штрихкод (для прайсов/ИИ)</span>
                                    </label>
                                </div>
                            </div>

                            {/* Таблица предпросмотра изменений */}
                            <div className="diff-table-container">
                                <table className="diff-table">
                                    <thead>
                                        <tr>
                                            <th>Товар в каталоге</th>
                                            <th>Сопоставлен по</th>
                                            {updatePrice && <th>Цена</th>}
                                            {updateStock && <th>В наличии</th>}
                                            {updateVisibility && <th>Видимость</th>}
                                            {updateBarcode && <th>Штрихкод</th>}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {diffResults.matchedItems.slice(0, 100).map(({ item, matchType, changes }) => {
                                            return (
                                                <tr key={item.id}>
                                                    <td className="item-name-cell">
                                                        <div className="item-title">{item.name}</div>
                                                        <div className="item-meta">
                                                            <span>ID: {item.id}</span>
                                                            {item.barcode && <span> • ШК: {item.barcode}</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <span className="badge-match">{matchType}</span>
                                                    </td>

                                                    {/* Цена */}
                                                    {updatePrice && (
                                                        <td>
                                                            {changes.price ? (
                                                                <div className="change-badge price-change">
                                                                    <span className="val-old">{changes.price.from} ₽</span>
                                                                    <span className="arrow">➔</span>
                                                                    <span className="val-new">{changes.price.to} ₽</span>
                                                                </div>
                                                            ) : (
                                                                <span className="val-no-change">{item.price || 0} ₽</span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* В наличии */}
                                                    {updateStock && (
                                                        <td>
                                                            {changes.isExist ? (
                                                                <div className="change-badge stock-change">
                                                                    <span className={`status-tag ${changes.isExist.from ? 'yes' : 'no'}`}>
                                                                        {changes.isExist.from ? 'Да' : 'Нет'}
                                                                    </span>
                                                                    <span className="arrow">➔</span>
                                                                    <span className={`status-tag ${changes.isExist.to ? 'yes' : 'no'}`}>
                                                                        {changes.isExist.to ? 'Да' : 'Нет'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className={`status-tag ${item.isExist ? 'yes' : 'no'}`}>
                                                                    {item.isExist ? 'Да' : 'Нет'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Видимость */}
                                                    {updateVisibility && (
                                                        <td>
                                                            {changes.isShowed ? (
                                                                <div className="change-badge visibility-change">
                                                                    <span className={`status-tag ${changes.isShowed.from ? 'yes' : 'no'}`}>
                                                                        {changes.isShowed.from ? 'Виден' : 'Скрыт'}
                                                                    </span>
                                                                    <span className="arrow">➔</span>
                                                                    <span className={`status-tag ${changes.isShowed.to ? 'yes' : 'no'}`}>
                                                                        {changes.isShowed.to ? 'Виден' : 'Скрыт'}
                                                                    </span>
                                                                </div>
                                                            ) : (
                                                                <span className={`status-tag ${item.isShowed ? 'yes' : 'no'}`}>
                                                                    {item.isShowed ? 'Виден' : 'Скрыт'}
                                                                </span>
                                                            )}
                                                        </td>
                                                    )}

                                                    {/* Штрихкод */}
                                                    {updateBarcode && (
                                                        <td>
                                                            {changes.barcode ? (
                                                                <div className="change-badge barcode-change">
                                                                    <span className="val-old">{changes.barcode.from}</span>
                                                                    <span className="arrow">➔</span>
                                                                    <span className="val-new">{changes.barcode.to}</span>
                                                                </div>
                                                            ) : (
                                                                <span className="val-no-change">{item.barcode || '—'}</span>
                                                            )}
                                                        </td>
                                                    )}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                {diffResults.matchedItems.length > 100 && (
                                    <div className="table-more-hint">
                                        Показаны первые 100 товаров из {diffResults.matchedItems.length}. Все товары будут обновлены при нажатии кнопки.
                                    </div>
                                )}
                            </div>

                            {/* Несопоставленные строки */}
                            {diffResults.unmatchedRows.length > 0 && (
                                <div className="unmatched-notice">
                                    <FiAlertTriangle className="notice-icon" />
                                    <div>
                                        <strong>{diffResults.unmatchedRows.length} строк не найдено или без ID:</strong>
                                        <p>
                                            Сверка товаров производится строго по полю <code>ID</code>. Строки без корректного ID пропущены.
                                        </p>
                                        <div className="unmatched-list-details">
                                            {diffResults.unmatchedRows.slice(0, 8).map((r, i) => (
                                                <span key={i} className="unmatched-tag">
                                                    Строка {r.rowIndex}: {r.reason} {r.rawName ? `(«${r.rawName}»)` : ''}
                                                </span>
                                            ))}
                                            {diffResults.unmatchedRows.length > 8 && (
                                                <span className="unmatched-tag-more">
                                                    ... и еще {diffResults.unmatchedRows.length - 8}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Подвал */}
                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose} disabled={isApplying}>
                        Отмена
                    </button>
                    {diffResults && (
                        <button
                            type="button"
                            className="btn-apply-import"
                            onClick={handleApplyImport}
                            disabled={isApplying || activeChangesCount === 0}
                        >
                            <FiCheck />
                            <span>
                                {isApplying ? 'Сохранение...' : `Применить изменения (${activeChangesCount} товаров)`}
                            </span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ItemImportModal;
