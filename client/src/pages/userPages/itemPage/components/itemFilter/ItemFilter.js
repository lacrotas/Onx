// import PlusImage from "../../../../../assets/images/plus.png";
// import MinusImage from "../../../../../assets/images/minus.png";
// import "./ItemFilter.scss";
// import { useState, useEffect } from "react";
// import { fetchAllAttributeValuesByAttributeId } from "../../../../../http/attributeValue";
// import FilterValue from "./fiterValue/FilterValue";
// function ItemFilter({ setNewCurrentFilter, item }) {
//     const [isOpen, setIsOpen] = useState(false);
//     const [attributeValues, setAttributeValues] = useState([]);

//     useEffect(() => {
//         fetchAllAttributeValuesByAttributeId(item.id)
//             .then(data => {
//                 setAttributeValues(data);
//             })
//     }, [item.id]);

//     return (
//         <div className="itemPage_filter">
//             <div className="itemPage_filter-header" onClick={() => setIsOpen(!isOpen)}>
//                 {isOpen ? <img className="filter_image" src={MinusImage} alt="minus" />
//                     : <img className="filter_image" src={PlusImage} alt="plus" />}
//                 <p className="filter_paragraph jura_semi-medium_p">{item.name}</p>
//             </div>
//             <div className={`itemPage_filter-description ${isOpen ? "active" : "unactive"}`}>
//                 {attributeValues && attributeValues.length > 0
//                     ? attributeValues.map((value, index) => (
//                         <FilterValue setNewCurrentFilter={setNewCurrentFilter} value={value} item={item} key={index} />
//                     ))
//                     : <p>No attributes found</p>}
//             </div>
//         </div>
//     );
// }

// export default ItemFilter;

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
