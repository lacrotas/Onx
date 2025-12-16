import ImageUploadButton from "../../../../customUI/imageUploadButton/ImageUploadButton";
import CustomInput from "../../../../customUI/customInput/CustomInput";
import CustomButton from "../../../../customUI/customButton/CustomButton";
import CustomSelect from "../../../../customUI/customSelect/CustomSelect";
import "./AddCategory.scss";
import { updatePodKategory, fetchAllMainKategory } from "../../../../http/KategoryApi";
import React, { useState, useEffect } from 'react';
import { LOGIN_ROUTE } from "../../../../pages/appRouter/Const";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

function AddCategory({ value }) {
    const [itemName, setItemName] = useState(value.name);
    const [selectedImage, setSelectedImage] = useState(null);
    const history = useHistory();
    const [mainKategory, setMainKategory] = useState([]);
    const [mainKategoryId, setMainKategoryId] = useState([]);
    const [mainKategoryLabel, setMainKategoryLabel] = useState([]);

    useEffect(() => {
        fetchAllMainKategory().then(data => {
            setMainKategoryId(data.map(item => item.id));
            setMainKategoryLabel(data.map(item => item.name));
        });
    }, []);
    console.log(mainKategory);
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
            <CustomInput playceholder={"Название категории"} value={itemName} />
            <CustomSelect label={"Главная категория"} values={mainKategoryLabel} />
            <ImageUploadButton
                onImageSelect={handleImageSelect}
                buttonText="Фото"
                maxSize={2 * 1024 * 1024} // 2MB
            />
            <CustomButton ButtonClass={"category_button"} dealOnClick={updateItem} text={"Создать"} />
        </div>
    )
}

export default AddCategory;