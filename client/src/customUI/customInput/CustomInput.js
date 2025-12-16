import "./CustomInput.scss";

function CustomInput({ playceholder, value }) {
    return (
        <input className="custom_input tiny_p" value={value} type="text" placeholder={playceholder} />
    )
}

export default CustomInput;