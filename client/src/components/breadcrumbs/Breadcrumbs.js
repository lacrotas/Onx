import { Link } from "react-router-dom";
import "./Breadcrumbs.scss";

function Breadcrumbs({ items }) {
  return (
    <div className="breadcrumbs">
      {items.map((item, index) => (
        <span key={index} className="breadcrumbs__item">
          {index > 0 && <span className="breadcrumbs__separator"> / </span>}
          {item.path ? (
            <Link to={item.path} className="breadcrumbs__link my_p_small">
              {item.title}
            </Link>
          ) : (
            <span className="breadcrumbs__current my_p_small">{item.title}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export default Breadcrumbs;