
import "./ItemFilter.scss";
import { useState, useEffect } from "react";
import { fetchAllAttributeValuesByAttributeId } from "../../../../../http/attributeValue";
import FilterValue from "./fiterValue/FilterValue";
function ItemFilter({ setNewCurrentFilter, item }) {
    const [isOpen, setIsOpen] = useState(false);
    const [attributeValues, setAttributeValues] = useState([]);

    useEffect(() => {
        fetchAllAttributeValuesByAttributeId(item.id)
            .then(data => {
                setAttributeValues(data);
            })
    }, [item.id]);


    return (
        <div className="filter-item">
            <div className="filter-item-header" onClick={() => setIsOpen(!isOpen)}>
                <span className="filter-item-title common_reg tiny_p">{item.name}</span>
                <span className="filter-item-toggle">
                    {isOpen ? '−' : '+'}
                </span>
            </div>

            {isOpen && (
                <div className="filter-item-values">
                    {attributeValues.length > 0 ? (
                        attributeValues.map((value, index) => (
                            <FilterValue
                                setNewCurrentFilter={setNewCurrentFilter}
                                value={value}
                                item={item}
                                key={index}
                            />
                        ))
                    ) : (
                        <div className="no-values">Нет доступных значений</div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ItemFilter;
