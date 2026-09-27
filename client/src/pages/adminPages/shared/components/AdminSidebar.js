import React from 'react';
import { useHistory } from 'react-router-dom';
import {
    FiBarChart2,
    FiPackage,
    FiLayers,
    FiGrid,
    FiFilter,
    FiSliders,
    FiShoppingBag,
    FiMessageSquare,
    FiHelpCircle,
    FiImage,
    FiChevronLeft,
    FiChevronRight,
    FiExternalLink
} from 'react-icons/fi';
import './AdminSidebar.scss';

const NAV_GROUPS = [
    {
        title: "Обзор",
        items: [
            { id: 'summary', label: 'Сводка', icon: FiBarChart2 }
        ]
    },
    {
        title: "Каталог",
        items: [
            { id: 'products', label: 'Товары', icon: FiPackage },
            { id: 'mainCategories', label: 'Главные категории', icon: FiLayers },
            { id: 'categories', label: 'Категории', icon: FiGrid },
            { id: 'filters', label: 'Фильтры', icon: FiFilter },
            { id: 'itemGroup', label: 'Группы товаров', icon: FiSliders },
        ]
    },
    {
        title: "Продажи",
        items: [
            { id: 'orders', label: 'Заказы', icon: FiShoppingBag },
            { id: 'reviews', label: 'Отзывы', icon: FiMessageSquare },
        ]
    },
    {
        title: "Контент",
        items: [
            { id: 'sliders', label: 'Слайдеры', icon: FiImage },
            { id: 'qwestion', label: 'Вопросы / FAQ', icon: FiHelpCircle },
        ]
    }
];

export function AdminSidebar({
    activeComponent,
    onMenuClick,
    isCollapsed,
    onToggleCollapse
}) {
    const history = useHistory();

    const handleItemClick = (id) => {
        onMenuClick(id);
        history.push(`/admin/${id}`);
    };

    const handleGoToShop = () => {
        window.open('/', '_blank');
    };

    return (
        <aside className={`admin-modern-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            {/* Header / Logo */}
            <div className="sidebar-brand">
                <div className="brand-logo">
                    {!isCollapsed && <span className="logo-text">Панель управления</span>}
                </div>
                <button
                    type="button"
                    className="sidebar-collapse-btn"
                    onClick={onToggleCollapse}
                    title={isCollapsed ? "Развернуть меню" : "Свернуть меню"}
                >
                    {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
                </button>
            </div>

            {/* Navigation Groups */}
            <div className="sidebar-scrollable">
                {NAV_GROUPS.map((group, groupIdx) => (
                    <div key={groupIdx} className="nav-group">
                        {!isCollapsed && <div className="group-title">{group.title}</div>}
                        <ul className="group-list">
                            {group.items.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeComponent === item.id;

                                return (
                                    <li key={item.id} className="nav-item-wrapper">
                                        <button
                                            type="button"
                                            className={`nav-item-btn ${isActive ? 'active' : ''}`}
                                            onClick={() => handleItemClick(item.id)}
                                            title={isCollapsed ? item.label : undefined}
                                        >
                                            <Icon className="nav-icon" />
                                            {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                            {isActive && <div className="active-indicator" />}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div className="sidebar-footer">
                <button
                    type="button"
                    className="footer-btn"
                    onClick={handleGoToShop}
                    title={isCollapsed ? "Перейти в магазин" : undefined}
                >
                    <FiExternalLink className="footer-icon" />
                    {!isCollapsed && <span>Перейти в магазин</span>}
                </button>
            </div>
        </aside>
    );
}
