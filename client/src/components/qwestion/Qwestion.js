import "./Qwestion.scss";
import ArrowImage from "../../assets/images/arrow.png";
import ArrowOpenImage from "../../assets/images/arrowOpen.png";
import { useState, useEffect } from "react";
import { fetchAllQwestion } from "../../http/qwestionApi";

export default function Qwestion() {

    const [qwestionData, setQwestionData] = useState([]);
    useEffect(() => {
        fetchAllQwestion().then(data => setQwestionData(data));
    }, []);

    const [activeIndex, setActiveIndex] = useState(null);
    const activeToggle = (index) => {
        setActiveIndex((prevIndex) => (prevIndex === index ? null : index));
    };

    return (
        <section className="qwestion" id="qwestion">
            <ul className="qwestion_list">
                {qwestionData.map((item, index) => (
                    <li key={index} className={`list_item ${activeIndex === index ? 'active' : 'unactive'}`} onClick={() => activeToggle(index)}>
                        <div className="qwestion_header">
                            <img className="header_image-closed" src={ArrowImage} alt="arrow" />
                            <img className="header_image-open" src={ArrowOpenImage} alt="arrow" />
                            <h3 className="header_label my_h3">{item.qwestion}</h3>
                        </div>
                        <div className="qwestion_description">
                            <p className="description_text my_p">{item.description}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section >
    )
}