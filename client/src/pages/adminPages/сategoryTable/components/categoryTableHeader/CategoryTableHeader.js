import React from 'react';
import './CategoryTableHeader.scss';
import CustomSelectWIthInput from "../../../../../customUI/сustomSelectWithInput/CustomSelectWIthInput";

const CategoryTableHeader = ({
    searchTerm,
    handleSearch,
    openAddModal,
    mainCategories,
    selectedFilterMainCategory,
    handleFilterMainCategoryChange
}) => {
    return (
        <header className="admin-nav">
            <div className="nav-container">
                <div className="logo my_h2">Подкатегории</div>
                <div className="nav-actions">
                    <CustomSelectWIthInput
                        name="mainKategoryId"
                        options={mainCategories}
                        value={selectedFilterMainCategory}
                        onChange={handleFilterMainCategoryChange}
                        placeholder="Все главные категории"
                    />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="nav-search my_p"
                    />
                    <button type="button" className="add-btn my_p" onClick={openAddModal}>
                         Добавить
                    </button>
                </div>
            </div>
        </header>
    );
};

export default CategoryTableHeader;