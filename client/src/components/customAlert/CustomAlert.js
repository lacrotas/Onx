import "./ModalWindow.scss";
import CustomButton from "../../customUI/customButton/CustomButton";
function CustomAlert({ setIsModalActive, text }) {
    return (
        <div className="alert">
            <div className="alert_content">
                <p className="tiny_p">{text}</p>
                <CustomButton dealOnClick={setIsModalActive} value={false} text={"Потвердить"} />
            </div>
            <div className="modal_back" onClick={() => setIsModalActive(false)}></div>
        </div >
    )
}

export default CustomAlert;