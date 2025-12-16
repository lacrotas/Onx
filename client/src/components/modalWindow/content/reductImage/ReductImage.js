import CustomButton from "../../../../customUI/customButton/CustomButton";
import "./ReductImage.scss";
import { useState } from "react";

function ReductImage({ value, addImageToArray, setIsModalActive }) {
    const [itemName, setItemName] = useState("");

    const handleImageChange = (event) => {
        const file = event.target.files[0];
        addImageToArray(file);
        setIsModalActive(false);
    };

    function updateItem() {
        addImageToArray("delete");
        setIsModalActive(false);
    }
    return (
        <div className="reduct_image">
            <input className="custom_input tiny_p" onChange={(e) => handleImageChange(e)} value={itemName} type="file" placeholder={"Значение аттрибута"} />
            <CustomButton dealOnClick={updateItem} text={"Удалить фото"} />
        </div>
    )
}

export default ReductImage;
