import React from 'react';
import './FilterTableHeader.scss';
import CustomSelectWIthInput from "../../../../../customUI/сustomSelectWithInput/CustomSelectWIthInput";

const FilterTableHeader = ({
    searchTerm,
    handleSearch,
    openAddModal,
    categories,
    selectedFilterCategory,
    handleFilterCategoryChange
}) => {
    return (
        <header className="admin-nav">
            <div className="nav-container">
                <div className="logo my_h2">Фильтры</div>
                <div className="nav-actions">
                    <CustomSelectWIthInput
                        name="mainKategoryId"
                        options={categories}
                        value={selectedFilterCategory}
                        onChange={handleFilterCategoryChange}
                        placeholder="Все категории"
                    />
                    <input
                        type="text"
                        placeholder="Найти фильтр..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="nav-search my_p"
                    />
                    <button type="button" className="add-btn my_p" onClick={openAddModal}>
                       добавить
                    </button>
                </div>
            </div>
        </header>
    );
};

export default FilterTableHeader;