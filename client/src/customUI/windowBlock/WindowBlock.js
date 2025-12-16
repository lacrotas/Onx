import ArrowImage from "../../assets/images/arrow_button.png";
import "./WindowBlock.scss";

function WindowBlock({ label, description }) {
    return (
        <div className="windowBlock">
            <h3 className="super_large_p">{label}</h3>
            <p className="small_p">{description}</p>
            <img className="windowBlock_image" src={ArrowImage} alt="image"/>
        </div>
    )
}

export default WindowBlock;