import "./HistoryCatalog.scss";
import { NavLink } from "react-router-dom";

function HistoryCatalog({ path }) {
    console.log(path)
    return (
        <div className="history_catalog">
            <nav className="history_catalog__nav">
                {path.map((item, index) => (
                    <span key={item.id || index} className="history_catalog__item">
                        {index === path.length - 1 ? (
                            <span className="history_catalog__current tiny_p common_reg">
                                {item.name}
                            </span>
                        ) : (
                            <NavLink 
                                to={"/itemMain/"+item.id} 
                                className="history_catalog__link tiny_p common_reg"
                                end
                            >
                                {item.name}
                                <span className="history_catalog__separator"> › </span>
                            </NavLink>
                        )}
                    </span>
                ))}
            </nav>
        </div>
    );
}

export default HistoryCatalog;