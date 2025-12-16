import "./CustomSelect.scss";

function CustomSelect({ label, values }) {
    return (
        <select className="custom_select tiny_p" name="select">
            <option value="" disabled hidden selected>{label}</option>
            {values.map((name) =>
                <option value="name">{name}</option>)}
        </select>
    )
}

export default CustomSelect;