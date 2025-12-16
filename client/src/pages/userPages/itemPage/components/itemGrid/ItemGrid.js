import "./ItemGrid.scss";
import GridItemPreview from "./gridItemPrewiev/GridItemPrewiev";
import { fetchAllItemByKategoryId, fetchAllItemByPodKategoryId } from "../../../../../http/itemApi";
import { useState, useEffect } from "react";

function ItemGrid({ itemPrice, currentFilter, kategryId, podKategryId }) {

    const [items, setItems] = useState([]);

    useEffect(() => {
        // if (podKategryId) {
        //     console.log(podKategryId)
        //     fetchAllItemByPodKategoryId(podKategryId).then(data => {
        //         setItems(data || []);
        //         console.log(data)
        //     })
        // } else {
        fetchAllItemByKategoryId(kategryId).then(data => {
            setItems(data || []);
        })
        // }
    }, [podKategryId, kategryId])

    return (
        <div className="item-grid">
            {/* <div className="item-grid__sorting">
                <p className="item-grid__sorting-label jura_semi-medium_p">Сортировать по:</p>
                <p className="item-grid__sorting-option jura_semi-medium_p">популярности</p>
                <p className="item-grid__sorting-option jura_semi-medium_p">цене</p>
                <p className="item-grid__sorting-option jura_semi-medium_p">рейтингу</p>
            </div> */}

            {items.length > 0 ? (
                <div className="item-grid__products">
                    {items.map((item) => (
                        <GridItemPreview
                            itemPrice={itemPrice}
                            item={item}
                            currentFilter={currentFilter}
                            key={item.id}
                        />
                    ))}
                </div>
            ) : (
                <p className="item-grid__empty tiny_p">
                    Товаров по вашим критериям пока нет
                </p>
            )}
        </div>
    )
}

export default ItemGrid;