import React from 'react';

const ItemGroupTableHeader = ({ searchTerm, setSearchTerm, openAddModal }) => {
    return (
        <header className="admin-nav">
            <div className="nav-container">
                <div className="logo my_h2">Группы товаров</div>
                <div className="nav-actions">
                    <input 
                        type="text"
                        placeholder="Поиск групп..."
                        className="nav-search my_p"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="add-btn my_p" onClick={openAddModal}>Создать группу</button>
                </div>
            </div>
        </header>
    );
};

export default ItemGroupTableHeader;