import "./FilterValue.scss";
import EmptyCheckBox from "../../../../../../assets/images/emptyCheck.png"
import FullCheckBox from "../../../../../../assets/images/fullCheck.png"
import { useState } from "react";

function FilterValue({ item, value, setNewCurrentFilter }) {
    const [isSelected, setIsSelected] = useState(false);

    function setSelectedValue() {
        setIsSelected(!isSelected);
        if (!isSelected) {
            setNewCurrentFilter({ attributeId: item.id, valueId: value.id }, false);
        } else {
            setNewCurrentFilter({ attributeId: item.id, valueId: value.id }, true);
        }
    }
    return (
        <div className="description_item" onClick={() => setSelectedValue()}>
            {isSelected ?
                <img className="item_image" src={FullCheckBox} alt="checkbox" /> :
                <img className="item_image" src={EmptyCheckBox} alt="checkbox" />
            }

            <p className="item_paragraph common_reg tiny_p">{value.name}</p>
        </div>
    )
}

export default FilterValue;