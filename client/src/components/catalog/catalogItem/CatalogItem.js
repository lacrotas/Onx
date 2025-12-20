import "./CatalogItem.scss";
import { ITEM_MAIN_ROUTE } from "../../../pages/appRouter/Const";
import { NavLink } from "react-router-dom/cjs/react-router-dom.min";

export default function CatalogItem({ itemId, counter, image, label, item_counter }) {
    const endings = ['товар', 'товара', 'товаров'];

    function getWordEnding(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        return words[
            (number % 100 > 4 && number % 100 < 20)
                ? 2
                : cases[Math.min(number % 10, 5)]
        ];
    }

    return (
        <NavLink to={{ pathname: ITEM_MAIN_ROUTE + "/" + itemId, state: { path: { name: label } } }} onClick={() => window.scrollTo(0, 0)}>
            <div className="catalog_item">
                <img className="item_image" src={process.env.REACT_APP_API_URL + "static/images/" + image} alt="catalog" />
                <div className="item_text_container">
                    <p className="item_paragraph--counter my_p">{item_counter} {`${getWordEnding(item_counter, endings)}`}</p>
                    <p className="item_paragraph--name my_h3 card">{label}</p>
                </div>
            </div>
        </NavLink >
    );
}