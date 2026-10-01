import React, { useState } from 'react';
import { FiX, FiCheck, FiDollarSign, FiPercent } from 'react-icons/fi';
import './ItemBulkPriceModal.scss';

const ItemBulkPriceModal = ({
    isOpen,
    onClose,
    selectedItems = [],
    onApplyPrices
}) => {
    const [mode, setMode] = useState('percent'); // 'percent', 'amount', 'fixed'
    const [val, setVal] = useState('');
    const [rounding, setRounding] = useState('round'); // 'round', 'none', '99'

    if (!isOpen) return null;

    const calculateNewPrice = (oldPrice) => {
        const p = parseFloat(oldPrice) || 0;
        const numVal = parseFloat(val) || 0;
        let newP = p;

        if (mode === 'percent') {
            newP = p + (p * numVal / 100);
        } else if (mode === 'amount') {
            newP = p + numVal;
        } else if (mode === 'fixed') {
            newP = numVal;
        }

        if (newP < 0) newP = 0;

        if (rounding === 'round') {
            return Math.round(newP);
        } else if (rounding === '99') {
            return Math.max(0, Math.floor(newP) + 0.99);
        } else {
            return Math.round(newP * 100) / 100;
        }
    };

    const handleApply = () => {
        const numVal = parseFloat(val);
        if (isNaN(numVal) && mode !== 'fixed') {
            alert('Введите корректное числовое значение!');
            return;
        }

        const updates = {};
        selectedItems.forEach(item => {
            updates[item.id] = {
                price: String(calculateNewPrice(item.price))
            };
        });

        onApplyPrices(updates);
        onClose();
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content-bulk-price" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="header-icon-title">
                        <FiDollarSign className="header-icon" />
                        <div>
                            <h2>Массовое изменение цен</h2>
                            <p className="modal-subtitle">
                                Выбрано товаров: <strong>{selectedItems.length} шт.</strong>
                            </p>
                        </div>
                    </div>
                    <button type="button" className="close-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <div className="modal-body">
                    {/* Режим изменения */}
                    <div className="form-group">
                        <label className="field-label">Тип изменения цены:</label>
                        <div className="mode-tabs">
                            <button
                                type="button"
                                className={`mode-tab ${mode === 'percent' ? 'active' : ''}`}
                                onClick={() => setMode('percent')}
                            >
                                <FiPercent /> В процентах (%)
                            </button>
                            <button
                                type="button"
                                className={`mode-tab ${mode === 'amount' ? 'active' : ''}`}
                                onClick={() => setMode('amount')}
                            >
                                ± Сумма (₽)
                            </button>
                            <button
                                type="button"
                                className={`mode-tab ${mode === 'fixed' ? 'active' : ''}`}
                                onClick={() => setMode('fixed')}
                            >
                                Фиксированная цена
                            </button>
                        </div>
                    </div>

                    {/* Поле ввода значения */}
                    <div className="form-group">
                        <label className="field-label">
                            {mode === 'percent' && 'Процент изменения (например: 10 для повышения на 10%, или -5 для скидки):'}
                            {mode === 'amount' && 'Сумма изменения (например: 15 для повышения на 15 ₽, или -10):'}
                            {mode === 'fixed' && 'Новая цена для всех выбранных товаров (₽):'}
                        </label>
                        <div className="input-with-addon">
                            <input
                                type="number"
                                step="any"
                                value={val}
                                onChange={e => setVal(e.target.value)}
                                placeholder={mode === 'percent' ? '+10 или -10' : '100'}
                                className="price-num-input"
                                autoFocus
                            />
                            <span className="input-addon">
                                {mode === 'percent' ? '%' : '₽'}
                            </span>
                        </div>
                    </div>

                    {/* Округление */}
                    <div className="form-group">
                        <label className="field-label">Правило округления:</label>
                        <div className="rounding-options">
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="rounding"
                                    value="round"
                                    checked={rounding === 'round'}
                                    onChange={() => setRounding('round')}
                                />
                                <span>До целых (150 ₽)</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="rounding"
                                    value="99"
                                    checked={rounding === '99'}
                                    onChange={() => setRounding('99')}
                                />
                                <span>Маркетинговое (149.99 ₽)</span>
                            </label>
                            <label className="radio-label">
                                <input
                                    type="radio"
                                    name="rounding"
                                    value="none"
                                    checked={rounding === 'none'}
                                    onChange={() => setRounding('none')}
                                />
                                <span>Точное (до копеек)</span>
                            </label>
                        </div>
                    </div>

                    {/* Предпросмотр расчетов */}
                    {val !== '' && (
                        <div className="calc-preview">
                            <div className="calc-preview-title">Примеры перерасчета:</div>
                            <div className="calc-preview-list">
                                {selectedItems.slice(0, 4).map(item => {
                                    const oldP = parseFloat(item.price) || 0;
                                    const newP = calculateNewPrice(oldP);
                                    return (
                                        <div key={item.id} className="preview-row">
                                            <span className="preview-name">{item.name}</span>
                                            <div className="preview-prices">
                                                <span className="p-old">{oldP} ₽</span>
                                                <span className="p-arrow">➔</span>
                                                <span className="p-new">{newP} ₽</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button type="button" className="btn-cancel" onClick={onClose}>
                        Отмена
                    </button>
                    <button
                        type="button"
                        className="btn-apply-bulk"
                        onClick={handleApply}
                        disabled={val === ''}
                    >
                        <FiCheck />
                        <span>Применить к {selectedItems.length} товарам</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ItemBulkPriceModal;
