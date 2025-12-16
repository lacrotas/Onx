import ImageUploadButton from "../../../../customUI/imageUploadButton/ImageUploadButton";
import CustomButton from "../../../../customUI/customButton/CustomButton";
import "./AddMainCategory.scss";
import { updatePodKategory } from "../../../../http/KategoryApi";
import { useState } from "react";
import { LOGIN_ROUTE } from "../../../../pages/appRouter/Const";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function AddMainCategory({ value }) {
    const [itemName, setItemName] = useState(value.name);
    const [selectedImage, setSelectedImage] = useState(null);
    const history = useHistory();
    const handleImageSelect = (file) => {
        console.log('Selected file:', file);
        setSelectedImage(file);

        // Здесь можно отправить файл на сервер
        if (file) {
            // uploadToServer(file);
        }
    };

    function updateItem() {
        updatePodKategory(value.id, { name: itemName, kategoryId: value.kategoryId }).then(data => {
            if (data) {
                alert("Подподкатегория успешно отредактированна");
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
            <input className="custom_input tiny_p" onChange={(e) => setItemName(e.target.value)} value={itemName} type="text" placeholder={"Название подкатегории"} />
            <input className="custom_input tiny_p" onChange={(e) => setItemName(e.target.value)} value={itemName} type="text" placeholder={"Главная категори"} />
            
            <ImageUploadButton
                onImageSelect={handleImageSelect}
                buttonText="Фото"
                maxSize={2 * 1024 * 1024} // 2MB
            />
            <CustomButton dealOnClick={updateItem} text={"Создать"} />
        </div>
    )
}

export default AddMainCategory;