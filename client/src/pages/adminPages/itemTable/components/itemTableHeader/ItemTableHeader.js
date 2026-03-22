import React from 'react';
import './ItemTableHeader.scss';
import CustomSelectWIthInput from "../../../../../customUI/сustomSelectWithInput/CustomSelectWIthInput";

const ItemTableHeader = ({
    selectedFilterCategory,
    handleFilterCategoryChange,
    allCategories,
    searchTerm,
    handleSearch,
    openAddModal,
    hasChanges,
    isSaving,
    handleApplyChanges,
    cancelChanges
}) => {
    return (
        <header className="admin-nav">
            <div className="nav-container">
                <div className="logo my_h2">Товары</div>
                <div className="nav-actions">
                    <CustomSelectWIthInput
                        name="mainKategoryId"
                        options={allCategories}
                        value={selectedFilterCategory}
                        onChange={handleFilterCategoryChange}
                        placeholder="Все категории"
                    />
                    <input
                        type="text"
                        placeholder="Поиск по названию..."
                        value={searchTerm}
                        onChange={handleSearch}
                        className="nav-search my_p"
                    />
                    <button type="button" className="add-btn my_p" onClick={openAddModal}>Добавить</button>

                    {hasChanges && (
                        <>
                            <button
                                type="button"
                                className={`apply-btn my_p ${isSaving ? 'loading' : ''}`}
                                onClick={handleApplyChanges}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Сохранение...' : 'Применить изменения'}
                            </button>
                            <button
                                type="button"
                                className="cancel-btn my_p"
                                onClick={cancelChanges}
                                disabled={isSaving}
                            >
                                Отменить
                            </button>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default ItemTableHeader;