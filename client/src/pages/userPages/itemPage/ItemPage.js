import Headers from "../../../components/header/Header";
import { useParams } from 'react-router-dom';
import { useState, useEffect } from "react";
import "./ItemPage.scss";
import ItemFilter from "./components/itemFilter/ItemFilter";
import { fetchAllAttributeByKategoryId, fetchAllAttributeByPodKategoryId } from "../../../http/filterApi";
import { fetchMainKategoryById, fetchKategoryById } from "../../../http/KategoryApi";
import ItemGrid from "./components/itemGrid/ItemGrid";
import Footer from "../../../components/footer/Footer";
import PriceItem from "./components/itemFilter/priceItem/PriceItem";
import Breadcrumbs from "../../../components/breadcrumbs/Breadcrumbs";


function ItemPage() {
    const { maincategory, category, subcategory } = useParams();

    const [filter, setFilter] = useState([]);
    const [mainKategryName, setMainKategoryName] = useState(false);
    const [podKategryName, setPodKategryName] = useState(false);
    const [itemPrice, setItemPrice] = useState({ min: 0, max: 5000 });
    const [currentFilter, setCurrentFilter] = useState([]);

    const breadcrumbsItems = [
        { title: "Главная", path: "/" },
        { title: mainKategryName, path: "/itemMain/" + maincategory },
        { title: podKategryName, path: "" }
    ];

    useEffect(() => {
        if (subcategory) {
            fetchMainKategoryById(maincategory).then(mainKategoryItem => {
                setMainKategoryName(mainKategoryItem.name);
            })
            fetchKategoryById(subcategory).then(subKategoryItem => {
                setPodKategryName(subKategoryItem.name);
            })
            fetchAllAttributeByKategoryId(category).then(dataKategory => {
                setFilter(dataKategory);
                fetchAllAttributeByPodKategoryId(subcategory).then(data => {
                    if (data.length > 0) {
                        data.map(item => {
                            const newElement = item;
                            setFilter(prevState => [...prevState, newElement]);
                        })
                    }
                })
            })
        } else {
            fetchMainKategoryById(maincategory).then(mainKategoryItem => {
                setMainKategoryName(mainKategoryItem.name);
            })
            fetchKategoryById(category).then(subKategoryItem => {
                setPodKategryName(subKategoryItem.name);
            })
            fetchAllAttributeByKategoryId(category).then(data => {
                setFilter(data);
            })
        }
    }, []);

    function setNewCurrentFilter(newFilter, isChoosen) {
        if (isChoosen) {
            const index = currentFilter.findIndex(item => {
                return Number(item.attributeId) === Number(newFilter.attributeId) && Number(item.valueId) === Number(newFilter.valueId)
            });
            if (index != -1) {
                const newFilterArray = [...currentFilter];
                newFilterArray.splice(index, 1);
                setCurrentFilter(newFilterArray);
            }
        } else {
            setCurrentFilter(prevState => [...prevState, newFilter]);
        }
    }

    return (
        <div className="itemPage">
            <Headers />
            <Breadcrumbs items={breadcrumbsItems} />
            <div className="page-content-container">
                <div className="filter-section">
                    <div className="filter-header">
                        <h3>Фильтры</h3>
                    </div>

                    <PriceItem setItemPrice={setItemPrice} />

                    <div className="filter-items-container">
                        {filter.map((item, index) => (
                            <ItemFilter setNewCurrentFilter={setNewCurrentFilter} item={item} key={index} />
                        ))}
                    </div>
                </div>
                <div className="products-section">
                    {category || subcategory ?
                        <ItemGrid kategryId={category} itemPrice={itemPrice}
                            currentFilter={currentFilter} podKategryId={subcategory} />
                        : <div className="loading-message">Загрузка товаров...</div>
                    }
                </div>
            </div>

            <Footer />
        </div>
    );
}

export default ItemPage;