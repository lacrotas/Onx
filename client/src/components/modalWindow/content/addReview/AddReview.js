// AddReview.jsx
import CustomButton from "../../../../customUI/customButton/CustomButton";
import "./AddReview.scss";
import { useState } from "react";
import InteractiveRating from "../../../InteractiveRating/InteractiveRating";
import { postReview } from "../../../../http/reviewApi";
import CustomAlert from "../../../customAlert/CustomAlert";
import jwtDecode from "jwt-decode";
import { FiX } from "react-icons/fi"; // Импортируем иконку закрытия

function AddReview({ closeModal, itemId }) {
    const [itemDescription, setItemDescription] = useState("");
    const [itemRating, setItemRating] = useState(0);
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);

    const [isAlertActive, setIsAlertActive] = useState(false);
    const [alertText, setAlertText] = useState("");

    const getCurrentDate = () => {
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const closeAlert = () => {
        setIsAlertActive(false);
        window.location.reload();
    };

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files).slice(0, 5 - images.length);
        if (files.length === 0) return;

        setImages(prev => [...prev, ...files]);

        const previews = files.map(file => URL.createObjectURL(file));
        setImagePreviews(prev => [...prev, ...previews]);
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const postNewReview = async () => {
        if (!itemRating) {
            setIsAlertActive(true);
            setAlertText("Пожалуйста, поставьте оценку товару");
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert("Для написания отзыва войдите на сайт");
            return;
        }

        try {
            const user = jwtDecode(token);

            // Создаём FormData
            const formData = new FormData();

            // Добавляем текстовые поля (всё как строки!)
            formData.append('userId', user.id);
            formData.append('itemId', itemId);
            formData.append('mark', String(itemRating));
            formData.append('userName', user.login);
            formData.append('label', user.login);
            formData.append('description', itemDescription);
            formData.append('isShowed', 'true'); // boolean → строка

            // Добавляем файлы
            images.forEach(file => {
                formData.append('images', file); // ← именно так!
            });

            // Теперь отправляем через postReview, но postReview должен поддерживать FormData
            const data = await postReview(formData);

            if (data) {
                setIsAlertActive(true);
                setAlertText("Ваш отзыв добавлен на проверку");
            } else {
                setIsAlertActive(true);
                setAlertText("Мы пока не можем добавить ваш отзыв");
            }
        } catch (err) {
            console.error('Ошибка отправки отзыва:', err);
            setIsAlertActive(true);
            setAlertText("Произошла ошибка при отправке");
        }
        closeAlert();
    };

    return (
        <>
            {isAlertActive && (
                <CustomAlert text={alertText} setIsModalActive={closeAlert} />
            )}

            <div className="add-review-modal">
                <button className="review-modal-close-btn" onClick={() => closeModal(false)}>
                    <FiX size={24} />
                </button>

                <div className="add-review-form">
                    {/* Рейтинг */}
                    <div className="form-group">
                        <label className="form-label my_h3">Оценка товара</label>
                        <div className="rating-container">
                            <InteractiveRating setItemRating={setItemRating} />
                        </div>
                    </div>

                    {/* Текст */}
                    <div className="form-group">
                        <label className="form-label my_h3">Ваш отзыв</label>
                        <textarea
                            className="custom_input form-textarea my_p"
                            value={itemDescription}
                            onChange={(e) => setItemDescription(e.target.value)}
                            placeholder="Расскажите, что вам понравилось (или нет)..."
                            rows="4"
                        />
                    </div>

                    {/* Фото */}
                    <div className="form-group">
                        <label className="form-label my_h3">Фотографии (до 5)</label>
                        <div className="image-upload-area">
                            <label className="upload-button my_p">
                                + Добавить фото
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    className="upload-input"
                                />
                            </label>

                            {imagePreviews.length > 0 && (
                                <div className="image-preview-grid">
                                    {imagePreviews.map((src, index) => (
                                        <div key={index} className="preview-item">
                                            <img src={src} alt={`preview-${index}`} />
                                            <button
                                                type="button"
                                                className="remove-btn"
                                                onClick={() => removeImage(index)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Кнопка */}
                    <div className="form-actions">
                        <CustomButton
                            dealOnClick={postNewReview}
                            text="Отправить отзыв"
                        />
                    </div>
                </div>
            </div>
        </>
    );
}

export default AddReview;