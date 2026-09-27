import React, { useState, useEffect } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AdminSidebar } from "./shared/components/AdminSidebar";
import AdminSummary from "./summary/AdminSummary";
import "./MainAdminPage.scss";
import MainCategoryTable from "./mainCategoryTable/MainCategoryTable";
import CategoryTable from "./сategoryTable/CategoryTable";
import FilterTable from "./filterTable/FilterTable";
import ItemTable from "./itemTable/ItemTable";
import ItemGroupTable from "./itemGroupTable/ItemGroupTable";
import QuestionTable from "./qwestionTable/QuestionTable";
import SliderTable from "./sliderTable/SliderTable";
import ReviewTable from './reviewTable/ReviewTable';
import OrderTable from './orderTable/OrderTable';

function MainAdminPage() {
    const { tab } = useParams();
    const history = useHistory();

    // Состояние сворачивания бокового меню
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
        const saved = localStorage.getItem('adminSidebarCollapsed');
        return saved !== null ? JSON.parse(saved) : false;
    });

    // Определение активного компонента: приоритет у URL параметра, затем localStorage, затем 'summary'
    const [activeComponent, setActiveComponent] = useState(() => {
        if (tab) return tab;
        const saved = localStorage.getItem('adminActiveComponent');
        return saved || 'summary';
    });

    // Синхронизация при изменении URL параметра
    useEffect(() => {
        if (tab && tab !== activeComponent) {
            setActiveComponent(tab);
            localStorage.setItem('adminActiveComponent', tab);
        } else if (!tab) {
            // Если зашли просто на /admin — перенаправляем на сохраненный таб или summary
            const target = localStorage.getItem('adminActiveComponent') || 'summary';
            history.replace(`/admin/${target}`);
        }
    }, [tab]);

    // Сохранение состояния сворачивания сайдбара
    useEffect(() => {
        localStorage.setItem('adminSidebarCollapsed', JSON.stringify(isSidebarCollapsed));
    }, [isSidebarCollapsed]);

    const handleToggleCollapse = () => {
        setIsSidebarCollapsed(prev => !prev);
    };

    const handleMenuClick = (componentId) => {
        setActiveComponent(componentId);
        localStorage.setItem('adminActiveComponent', componentId);
    };

    // Рендер активной вкладки
    const renderActiveComponent = () => {
        switch (activeComponent) {
            case 'summary':
                return <AdminSummary onNavigate={(t) => {
                    handleMenuClick(t);
                    history.push(`/admin/${t}`);
                }} />;
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
            case 'questions':
                return <QuestionTable />;
            case 'sliders':
                return <SliderTable />;
            case 'orders':
                return <OrderTable />;
            case 'reviews':
                return <ReviewTable />;
            default:
                return <AdminSummary onNavigate={(t) => {
                    handleMenuClick(t);
                    history.push(`/admin/${t}`);
                }} />;
        }
    };

    return (
        <div className="admin-root-layout">
            <AdminSidebar
                activeComponent={activeComponent}
                onMenuClick={handleMenuClick}
                isCollapsed={isSidebarCollapsed}
                onToggleCollapse={handleToggleCollapse}
            />
            <main className="admin-main-viewport">
                {renderActiveComponent()}
            </main>
        </div>
    );
}

export default MainAdminPage;