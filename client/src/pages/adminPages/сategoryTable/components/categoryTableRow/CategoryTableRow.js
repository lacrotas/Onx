import React from 'react';
import './CategoryTableRow.scss';

const CategoryTableRow = ({
    category,
    getMainCategoryName,
    openEditModal,
    handleDelete
}) => {
    return (
        <tr>
            <td className="my_p truncate-text" title={category.name}>{category.name}</td>
            <td>
                <div className="table-img-box">
                    {category.image ? (
                        <img src={`${process.env.REACT_APP_API_URL}static/images/${category.image}`} alt="Category" />
                    ) : (
                        <div className="no-img my_p_small">Нет</div>
                    )}
                </div>
            </td>
            <td className="my_p">{getMainCategoryName(category.mainKategoryId)}</td>
            <td>
                <div className="action-buttons">
                    <button 
                        type="button" 
                        onClick={() => openEditModal(category)} 
                        className="edit-btn my_p_small" 
                        title="Редактировать"
                    >
                        ✏️ Ред.
                    </button>
                    <button 
                        type="button" 
                        onClick={() => handleDelete(category.id)} 
                        className="delete-btn my_p_small" 
                        title="Удалить"
                    >
                        🗑️ Удал.
                    </button>
                </div>
            </td>
        </tr>
    );
};

export default CategoryTableRow;