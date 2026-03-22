import "./CatalogItem.scss";
import { ITEM_MAIN_ROUTE } from "../../../pages/appRouter/Const";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";

export default function CatalogItem({ itemId, image, label, item_counter, featured }) {
    const endings = ['товар', 'товара', 'товаров'];

    function getWordEnding(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        return words[
            (number % 100 > 4 && number % 100 < 20)
                ? 2
                : cases[Math.min(number % 10, 5)]
        ];
    }

    const spanClass = featured ? `span-${featured}` : 'span-1';

    return (
        <NavLink
            to={{ pathname: ITEM_MAIN_ROUTE + "/" + itemId, state: { path: { name: label } } }}
            onClick={() => window.scrollTo(0, 0)}
            className={`cat-card ${spanClass}`}
        >
            <img
                className="cat-img"
                src={process.env.REACT_APP_API_URL + "static/images/" + image}
                alt={label}
                onError={(e) => { e.target.src = '/placeholder-category.jpg'; }}
            />

            <div className="cat-overlay">
                <div className="cat-title my_h2">{label}</div>
                <div className="cat-subtitle my_p">
                    {item_counter} {getWordEnding(item_counter, endings)}
                    <span className="arrow">→</span>
                </div>
            </div>
        </NavLink>
    );
}