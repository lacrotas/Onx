import React from 'react';

const ItemGroupTableRow = ({ group, onEdit, onDelete }) => {
    // group.itemInfo теперь массив: [{name, image}, {name, image}, ...]
    const itemsInfo = Array.isArray(group.itemInfo) ? group.itemInfo : [];
    const firstItem = itemsInfo[0];

    return (
        <tr>
            <td>
                <div className="table-img-box" style={{ position: 'relative' }}>
                    {firstItem?.image ? (
                        <>
                            <img 
                                src={`${process.env.REACT_APP_API_URL}static/images/${firstItem.image}`} 
                                alt="" 
                            />
                            {itemsInfo.length > 1 && (
                                <div className="my_p_small" style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    right: 0,
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    padding: '2px 4px',
                                    borderRadius: '4px'
                                }}>
                                    +{itemsInfo.length - 1}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="no-img">Нет</div>
                    )}
                </div>
            </td>
            <td className="my_p">
                <div style={{ fontWeight: 600 }} className="my_p">{group.name}</div>
                <div className="my_p_small" style={{ opacity: 0.6, fontSize: '12px' }}>
                    {itemsInfo.map(i => i.name).join(', ')}
                </div>
            </td>
            <td className="my_p">{group.itemIds?.length || 0} шт.</td>
            <td>
                <div className="action-buttons">
                    <button className="edit-btn my_p_small" onClick={() => onEdit(group)}>✏️ Ред.</button>
                    <button className="delete-btn my_p_small" onClick={() => onDelete(group.id)}>🗑️ Удал.</button>
                </div>
            </td>
        </tr>
    );
};

export default ItemGroupTableRow;