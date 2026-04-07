import "./CatalogInfoSlide.scss";
import { useState, useEffect } from "react";
import { useHistory } from 'react-router-dom';
import { ITEM_KATEGOTY_ROUTE } from "../../pages/appRouter/Const";
import { fetchAllMainKategory, fetchAllKategoryByMainKategoryId } from "../../http/KategoryApi";
import { FiX } from "react-icons/fi";

function CatalogInfoSlide({ setIsCategoryActive }) {
    const history = useHistory();
    const [activeIndex, setActiveIndex] = useState(0);
    const [catalogData, setCatalogData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadAllData = async () => {
            try {
                setIsLoading(true);
                const mains = await fetchAllMainKategory();
                const combined = await Promise.all(
                    mains.map(async (m) => {
                        const subs = await fetchAllKategoryByMainKategoryId(m.id);
                        return { ...m, subs: subs || [] };
                    })
                );
                setCatalogData(combined);
            } catch (e) {
                console.error("Ошибка загрузки:", e);
            } finally {
                setIsLoading(false);
            }
        };
        loadAllData();
    }, []);

    const navigateTo = (item) => {
        history.push({
            pathname: `${ITEM_KATEGOTY_ROUTE}/${item.id}`,
            state: { path: [item] },
        });
        setIsCategoryActive(false);
    };

    if (isLoading) return null;

    const activeGroup = catalogData[activeIndex];

    return (
        <div className="catalog-modal">
            <div className="catalog_modal-overlay" onClick={() => setIsCategoryActive(false)}></div>

            <div className="modal-container">
                <button className="close-button" onClick={() => setIsCategoryActive(false)}>
                    <FiX size={24} />
                </button>

                <div className="categories-container">
                    <div className="main-categories">
                        {catalogData.map((item, index) => (
                            <div
                                key={item.id}
                                className={`main-category ${activeIndex === index ? 'active' : ''} my_p`}
                                onClick={() => setActiveIndex(index)}
                            >
                                {item.name}
                            </div>
                        ))}
                    </div>

                    <div className="subcategories-container">
                        <div className="podcategories">
                            {activeGroup?.subs && activeGroup.subs.length > 0 ? (
                                activeGroup.subs.map((sub) => (
                                    <div 
                                        key={sub.id} 
                                        className="subcategory-group"
                                        onClick={() => navigateTo(sub)}
                                    >  
                                        <div className="my_p subcategory-title">
                                            {sub.name}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="my_p">Подкатегорий не найдено</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CatalogInfoSlide;