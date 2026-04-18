import "./ModalWindow.scss";
import CustomButton from "../../customUI/customButton/CustomButton";

function CustomAlert({ setIsModalActive, text, onConfirm }) {
    // Функция для обработки подтверждения
    const handleConfirm = () => {
        if (onConfirm) onConfirm();
        setIsModalActive(false);
    };

    return (
        <div className="apple-alert-overlay">
            <div className="apple-alert-container">
                <div className="apple-alert-body">
                    <p className="my_p">{text}</p>
                </div>
                <div className="apple-alert-actions">
                    {onConfirm && <button
                        className="apple-alert-btn cancel"
                        onClick={() => setIsModalActive(false)}
                    >
                        Отмена
                    </button>
                    }
                    <button
                        className="apple-alert-btn confirm"
                        onClick={handleConfirm}
                    >
                        ОК
                    </button>
                </div>
            </div>
            <div className="apple-alert-blur" onClick={() => setIsModalActive(false)}></div>
        </div>
    );
}

export default CustomAlert;