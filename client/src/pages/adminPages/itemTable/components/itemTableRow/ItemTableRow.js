import React from 'react';
import './ItemTableRow.scss';

const ItemTableRow = ({
    item,
    modifiedItem,
    isSelected = false,
    onToggleSelect,
    getMainCategoryName,
    getCategoryName,
    handleQuickEdit,
    openEditModal,
    openDuplicateModal,
    handleDelete
}) => {
    const currentPrice = modifiedItem?.price !== undefined ? modifiedItem.price : item.price;
    const currentIsExist = modifiedItem?.isExist !== undefined ? modifiedItem.isExist : item.isExist;
    const currentIsShowed = modifiedItem?.isShowed !== undefined ? modifiedItem.isShowed : item.isShowed;

    return (
        <tr className={`${modifiedItem ? 'modified-row' : ''} ${isSelected ? 'selected-row' : ''}`}>
            <td className="checkbox-cell" onClick={e => e.stopPropagation()}>
                <input 
                    type="checkbox" 
                    className="row-checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect && onToggleSelect(item.id)}
                />
            </td>
            <td>{getCategoryName(item.categoryId || item.kategoryId)}</td>
            <td>
                <div className="table-img-box">
                    {item.images && item.images.length > 0 ? (
                        <img src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`} alt="Item" />
                    ) : (
                        <div className="no-img">Нет</div>
                    )}
                </div>
            </td>
            <td className="item-title-col">
                <div className="item-main-name" title={item.name}>{item.name}</div>
                {item.barcode && (
                    <div className="item-barcode-tag" title="Артикул товара">
                        Арт: <span>{item.barcode}</span>
                    </div>
                )}
            </td>
            <td>
                <div className="price-input-wrapper">
                    <input 
                        type="number"
                        className="quick-price-input"
                        value={currentPrice}
                        onChange={(e) => handleQuickEdit(item.id, 'price', e.target.value)}
                    />
                    <span>₽</span>
                </div>
            </td>
            <td>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={Boolean(currentIsExist)} 
                        onChange={() => handleQuickEdit(item.id, 'isExist', !currentIsExist)} 
                    />
                    <span className="slider"></span>
                </label>
            </td>
            <td>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={Boolean(currentIsShowed)} 
                        onChange={() => handleQuickEdit(item.id, 'isShowed', !currentIsShowed)} 
                    />
                    <span className="slider"></span>
                </label>
            </td>
            <td>
                <div className="action-buttons">
                    <button type="button" onClick={() => openEditModal(item)} className="edit-btn" title="Редактировать">✏️ Ред.</button>
                    <button type="button" onClick={() => openDuplicateModal(item)} className="copy-btn" title="Сделать копию">📋 Копия</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn" title="Удалить">🗑️ Удал.</button>
                </div>
            </td>
        </tr>
    );
};

export default ItemTableRow;