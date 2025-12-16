import "./CustomLabel.scss";

function CustomLabel({text}){
    return(
        <div className="custom_label">
            <p className="jura_medium_bold">{text}</p>
        </div>
    )
}

export default CustomLabel;