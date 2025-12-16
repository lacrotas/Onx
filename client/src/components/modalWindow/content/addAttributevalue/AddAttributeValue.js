import CustomButton from "../../../../customUI/customButton/CustomButton";
import "./AddAttributeValue.scss";
import { postAttribute } from "../../../../http/attributeValue";
import { useState } from "react";
import { LOGIN_ROUTE } from "../../../../pages/appRouter/Const";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function AddAttributeValue({ value }) {
    const [itemName, setItemName] = useState("");
    const history = useHistory();


    function updateItem() {
        postAttribute({ name: itemName, attributeId: value }).then(data => {
            if (data) {
                alert("Значение для аттрибута успешно отредактированна");
                window.location.reload();
            } else {
                alert("Ваша сессия завершена, авторизируйтесь повторно");
                history.push(LOGIN_ROUTE);
            }
        }
        )
    }
    return (
        <div className="modal_add_category">
            <input className="custom_input tiny_p" onChange={(e) => setItemName(e.target.value)} value={itemName} type="text" placeholder={"Значение аттрибута"} />
            <CustomButton dealOnClick={updateItem} text={"Применить"} />
        </div>
    )
}

export default AddAttributeValue;