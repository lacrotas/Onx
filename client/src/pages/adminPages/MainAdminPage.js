import { useState, useEffect } from 'react';
import AdminHeader from "../adminPages/adminHeader/AdminHeader";
import "./MainAdminPage.scss";
import MainCategoryTable from "./mainCategoryTable/MainCategoryTable";
import CategoryTable from "./сategoryTable/CategoryTable";
import FilterTable from "./filterTable/FilterTable";
import ItemTable from "./itemTable/ItemTable";
import ItemGroupTable from "./itemGroupTable/ItemGroupTable";
import QuestionTable from "./qwestionTable/QuestionTable";
import SliderTable from "./sliderTable/SliderTable";

function MainAdminPage() {
    // Инициализируем состояния с значениями из localStorage
    const [isHeaderVisible, setIsHeaderVisible] = useState(() => {
        const saved = localStorage.getItem('adminHeaderVisible');
        return saved !== null ? JSON.parse(saved) : true;
    });

    const [activeComponent, setActiveComponent] = useState(() => {
        const saved = localStorage.getItem('adminActiveComponent');
        return saved || 'products';
    });

    // Сохранение состояния при изменении
    useEffect(() => {
        localStorage.setItem('adminActiveComponent', activeComponent);
    }, [activeComponent]);

    useEffect(() => {
        localStorage.setItem('adminHeaderVisible', JSON.stringify(isHeaderVisible));
    }, [isHeaderVisible]);

    const handleHeaderToggle = (visible) => {
        console.log('Header toggle to:', visible);
        setIsHeaderVisible(visible);
    };

    const handleMenuClick = (componentId) => {
        console.log('Setting active component:', componentId);
        setActiveComponent(componentId);
    };

    // Функция для рендеринга активного компонента
    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'products':
                return <ItemTable />;
            case 'mainCategories':
                return <MainCategoryTable />;
            case 'categories':
                return <CategoryTable />;
            case 'filters':
                return <FilterTable />;
            case 'itemGroup':
                return <ItemGroupTable />;
            case 'qwestion':
                return <QuestionTable />;
            case 'sliders':
                return <SliderTable />;
            case 'summary':
                return <div className="placeholder-component">
                    <h2>Сводка</h2>
                    <p>Здесь будет общая статистика и аналитика магазина</p>
                </div>;
            case 'start':
                return <div className="placeholder-component">
                    <h2>Начатые заказы</h2>
                    <p>Список заказов, которые только начаты</p>
                </div>;
            case 'inProcess':
                return <div className="placeholder-component">
                    <h2>Заказы в процессе</h2>
                    <p>Список заказов в процессе выполнения</p>
                </div>;
            case 'finished':
                return <div className="placeholder-component">
                    <h2>Завершенные заказы</h2>
                    <p>Список завершенных заказов</p>
                </div>;
            case 'reviews':
                return <div className="placeholder-component">
                    <h2>Отзывы</h2>
                    <p>Управление отзывами покупателей</p>
                </div>;
            case 'complaints':
                return <div className="placeholder-component">
                    <h2>Жалобы</h2>
                    <p>Обработка жалоб от пользователей</p>
                </div>;
            default:
                return <ItemTable />;
        }
    };

    return (
        <div className={`mainAdminPage ${isHeaderVisible ? 'header-active' : 'header-hidden'}`}>
            <AdminHeader
                isAdminHeader={true}
                isVisible={isHeaderVisible}
                onToggle={handleHeaderToggle}
                onMenuClick={handleMenuClick}
                activeComponent={activeComponent}
            />
            <div className="main-content">
                {renderActiveComponent()}
            </div>
        </div>
    )
}

export default MainAdminPage;