import ButtonImage from "../../assets/images/button.png";
import "./Catalog.scss";
import CatalogItem from "./catalogItem/CatalogItem";
import { fetchAllMainKategory } from "../../http/KategoryApi";
import { fetchAllItemByMainKategoryId } from "../../http/itemApi";
import { useState, useEffect } from "react";
import CatalogInfoSlide from "../catalogInfoSlide/CatalogInfoSlide";

export default function Catalog() {
    const [allKategory, setAllKategory] = useState([]);
    const [itemsCounter, setItemsCounter] = useState([]);
    const [isCategotyActive, setIsCategoryActive] = useState(false);

    useEffect(() => {
        fetchAllMainKategory().then(data => {
            const sortedCategories = data.sort((a, b) => {
                const indexA = a.gridItemIndex != null ? a.gridItemIndex : 9999;
                const indexB = b.gridItemIndex != null ? b.gridItemIndex : 9999;
                
                return indexA - indexB;
            });

            setAllKategory(sortedCategories);

            const counters = {};
            
            const fetchPromises = sortedCategories.map(item => {
                return fetchAllItemByMainKategoryId(item.id).then(items => {
                    counters[item.id] = items.length;
                });
            });

            Promise.all(fetchPromises).then(() => {
                setItemsCounter(counters);
            });
        });
    }, []);

    return (
        <>
            <section className="catalog_section">
                {allKategory.length > 0 && allKategory.map((item, index) => (
                    <CatalogItem
                        key={item.id}
                        counter={"0" + (index + 1)}
                        image={item.image}
                        label={item.name}
                        itemId={item.id}
                        item_counter={itemsCounter[item.id] || 0}
                        featured={item.gridSpace}
                    />
                ))}
            </section>
            {isCategotyActive ? <CatalogInfoSlide setIsCategoryActive={setIsCategoryActive} /> : <></>}
        </>
    );
}