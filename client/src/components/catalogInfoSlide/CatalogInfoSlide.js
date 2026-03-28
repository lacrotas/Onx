import "./CatalogInfoSlide.scss";
import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import { ITEM_KATEGOTY_ROUTE } from "../../pages/appRouter/Const";
import { fetchAllMainKategory, fetchAllKategoryByMainKategoryId } from "../../http/KategoryApi";
import { useHistory } from 'react-router-dom';
import { FiX } from "react-icons/fi";


function CatalogInfoSlide({ setIsCategoryActive }) {
    const history = useHistory();
    const [activeCategory, setActiveCategory] = useState(0);
    const [mainCategory, setMainCategory] = useState([]);
    const [category, setCategory] = useState([]);
    const [podCategory, setPodCategory] = useState([]);

    useEffect(() => {
        // Получаем все основные категории
        fetchAllMainKategory().then(data => {
            setMainCategory(data);

            // Для каждой основной категории получаем подкатегории
            Promise.all(
                data.map(mainCat => fetchAllKategoryByMainKategoryId(mainCat.id))
            ).then(subCategoryData => {
                setCategory(subCategoryData);

            });
        });
    }, []);
    const handleClick = (newPath) => {
        history.push({
            pathname: ITEM_KATEGOTY_ROUTE,
            state: { path: newPath },
        });
        setIsCategoryActive(false);
    };

    return (
        <div className="catalog-modal">
            <div className="catalog_modal-overlay" onClick={() => setIsCategoryActive(false)}></div>

            <div className="modal-container">
                <button className="close-button" onClick={() => setIsCategoryActive(false)}>
                    <FiX size={24} />
                </button>

                <div className="categories-container">
                    <div className="main-categories">
                        {mainCategory.map((mainCategoryItem, index) => (
                            <div
                                key={mainCategoryItem.id}
                                className={`main-category ${activeCategory === index ? 'active' : ''} my_p`}
                                onClick={() => setActiveCategory(index)}
                            >
                                {mainCategoryItem.name}
                            </div>
                        ))}
                    </div>

                    <div className="subcategories-container">
                        {category[activeCategory]?.map((categoryItem, categoryIndex) => {
                            const mainCategoryItem = mainCategory[activeCategory];
                            return (
                                <div key={categoryItem.id} className="subcategory-group">
                                    <NavLink
                                        className="subcategory-title"
                                        to={{
                                            pathname: `${ITEM_KATEGOTY_ROUTE}/${categoryItem.id}`,
                                            state: { path: [categoryItem] }
                                        }}
                                        onClick={() => handleClick([categoryItem])}
                                    >
                                        <p className="my_p">
                                            {categoryItem.name}
                                        </p>
                                    </NavLink>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div >
    )
}

export default CatalogInfoSlide;