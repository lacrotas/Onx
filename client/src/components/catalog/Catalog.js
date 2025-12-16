import ButtonImage from "../../assets/images/button.png";
import "./Catalog.scss";
import CatalogItem from "./catalogItem/CatalogItem";
import { fetchAllMainKategory } from "../../http/KategoryApi";
import { fetchAllItemByMainKategoryId } from "../../http/itemApi"
import { useState, useEffect } from "react";
import CatalogInfoSlide from "../catalogInfoSlide/CatalogInfoSlide";

export default function Catalog() {
    const [allKategory, setAllKategory] = useState([]);
    const [itemsCounter, setItemsCounter] = useState([]);
    const [isCategotyActive, setIsCategoryActive] = useState(false);

    useEffect(() => {
        fetchAllMainKategory().then(data => {
            setAllKategory(data);

            const counters = {};

            const fetchPromises = data.map(item => {
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
                {/* <div className="catalog_container">
                    <h2 className="container_label medium_h title_bold">Каталог <br />товаров от Maxistore</h2>
                    <p className="container_paragraph medium_p common_reg">Наш интернет-магазин зарегистрирован в Торговом реестре РБ 18.07.2014г</p>
                    <div className="container_button" onClick={() => setIsCategoryActive(true)}>
                        <img className="button_image" src={ButtonImage} alt="button" />
                        <p className="button_text medium_p common_reg">В каталог</p>
                    </div>
                </div> */}
                {allKategory.length > 0 && allKategory.map((item, index) => (
                    <CatalogItem
                        key={item.id}
                        counter={"0" + (index + 1)}
                        image={item.image}
                        label={item.name}
                        itemId={item.id}
                        item_counter={itemsCounter[item.id] || 0}
                    />
                ))}
            </section>
            {isCategotyActive ? <CatalogInfoSlide setIsCategoryActive={setIsCategoryActive} /> : <></>}
        </>

    );
}