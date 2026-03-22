import React from 'react';
import './ItemTableRow.scss';

const ItemTableRow = ({
    item,
    modifiedItem,
    getMainCategoryName,
    getCategoryName,
    handleQuickEdit,
    openEditModal,
    openDuplicateModal,
    handleDelete
}) => {
    return (
        <tr className={modifiedItem ? 'modified-row' : ''}>
            <td className="my_p">{getCategoryName(item.kategoryId)}</td>
            <td>
                <div className="table-img-box">
                    {item.images && item.images.length > 0 ? (
                        <img src={`${process.env.REACT_APP_API_URL}static/images/${item.images[0]}`} alt="Item" />
                    ) : (
                        <div className="no-img my_p_small">Нет</div>
                    )}
                </div>
            </td>
            <td className="my_p truncate-text" title={item.name}>{item.name}</td>
            <td>
                <div className="price-input-wrapper">
                    <input 
                        type="number"
                        className="quick-price-input my_p"
                        value={modifiedItem?.price !== undefined ? modifiedItem.price : item.price}
                        onChange={(e) => handleQuickEdit(item.id, 'price', e.target.value)}
                    />
                    <span className="my_p">₽</span>
                </div>
            </td>
            <td>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={item.isExist} 
                        onChange={() => handleQuickEdit(item.id, 'isExist', !item.isExist)} 
                    />
                    <span className="slider"></span>
                </label>
            </td>
            <td>
                <label className="toggle-switch">
                    <input 
                        type="checkbox" 
                        checked={item.isShowed} 
                        onChange={() => handleQuickEdit(item.id, 'isShowed', !item.isShowed)} 
                    />
                    <span className="slider"></span>
                </label>
            </td>
            <td>
                <div className="action-buttons">
                    <button type="button" onClick={() => openEditModal(item)} className="edit-btn my_p_small" title="Редактировать">✏️ Ред.</button>
                    <button type="button" onClick={() => openDuplicateModal(item)} className="copy-btn my_p_small" title="Сделать копию">📋 Копия</button>
                    <button type="button" onClick={() => handleDelete(item.id)} className="delete-btn my_p_small" title="Удалить">🗑️ Удал.</button>
                </div>
            </td>
        </tr>
    );
};

export default ItemTableRow;