import React from 'react';
import { FiX } from "react-icons/fi";
import "./FilterSidebar.scss";
const FilterSidebar = ({
    mobileFilters,
    setMobileFilters,
    filters,
    selectedFilters,
    handleFilterChange,
    setSelectedFilters,
    items
}) => {

    const getFilterValues = (filter) => {
        if (!filter.name) return [];
        const values = new Set();
        items.forEach(item => {
            if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                values.add(item.specificationsJSONB[filter.name]);
            }
        });
        return Array.from(values);
    };

    const getNumberRange = (filter) => {
        if (!filter.name) return { min: 0, max: 0 };
        let min = Infinity;
        let max = -Infinity;
        let hasValues = false;

        items.forEach(item => {
            if (item.specificationsJSONB && item.specificationsJSONB[filter.name]) {
                const value = parseFloat(item.specificationsJSONB[filter.name]);
                if (!isNaN(value)) {
                    hasValues = true;
                    min = Math.min(min, value);
                    max = Math.max(max, value);
                }
            }
        });
        return hasValues ? { min, max } : { min: 0, max: 0 };
    };

    return (
        <aside className={`sidebar ${mobileFilters ? 'open' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-title">Фильтры</div>
                <div onClick={() => setMobileFilters(false)} className="filters-list_close">
                    <FiX size={20} />
                </div>
            </div>

            {[...filters]
                .sort((a, b) => (a.filterIndex || 0) - (b.filterIndex || 0))
                .map(filter => {
                    console.log(filter);

                    if (filter.buttonType === 'select') {
                        const filterValues = getFilterValues(filter);
                        const selectedValues = selectedFilters[filter.id] || [];

                        return (
                            <div key={filter.id} className="filter-group">
                                <div className="filter-title">{filter.name}</div>
                                {filterValues.map((value) => (
                                    <label key={value} className="checkbox-label">
                                        <input
                                            type="checkbox"
                                            checked={selectedValues.includes(value)}
                                            onChange={(e) => handleFilterChange(filter.id, value, e.target.checked)}
                                        />
                                        <span className="custom-check"></span>
                                        {value}
                                    </label>
                                ))}
                            </div>
                        );
                    }

                    if (filter.buttonType === 'number') {
                        const { min, max } = getNumberRange(filter);
                        const currentValues = selectedFilters[filter.id] || { min: '', max: '' };
                        return (
                            <div key={filter.id} className="filter-group">
                                <div className="filter-title">{`${filter.name}, ${filter.addition}`}</div>
                                <div className="number-range-modern">
                                    <input
                                        type="number"
                                        placeholder={`от ${min}`}
                                        value={currentValues.min}
                                        onChange={(e) => handleFilterChange(filter.id, 'min', e.target.value)}
                                    />
                                    <input
                                        type="number"
                                        placeholder={`до ${max}`}
                                        value={currentValues.max}
                                        onChange={(e) => handleFilterChange(filter.id, 'max', e.target.value)}
                                    />
                                </div>
                            </div>
                        );
                    }

                    // Рендер для CHECK (Одиночный флаг)
                    if (filter.buttonType === 'check') {
                        return (
                            <div key={filter.id} className="filter-group">
                                <label className="checkbox-label" style={{ fontWeight: 600 }}>
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters[filter.id] || false}
                                        onChange={(e) => handleFilterChange(filter.id, e.target.checked)}
                                    />
                                    <span className="custom-check"></span>
                                    {filter.name}
                                </label>
                            </div>
                        );
                    }

                    return null;
                })}

            <button className="btn-reset" onClick={() => setSelectedFilters({})}>
                Сбросить всё
            </button>
        </aside>
    );
};

export default FilterSidebar;