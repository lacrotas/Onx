import { useState, useEffect } from 'react';
import './AdminHeader.scss';

export default function AdminHeader({ isAdminHeader, isVisible, onToggle, onMenuClick, activeComponent }) {
    const [activeDropdown, setActiveDropdown] = useState(null);

    const buttons = [
        { id: 'summary', text: "Сводка" },
        {
            id: 'store',
            text: "Управление магазином",
            dropdown: [
                { id: 'products', text: "Товары" },
                { id: 'mainCategories', text: "Главные категории" },
                { id: 'categories', text: "Категории" },
                { id: 'filters', text: "Фильтры" },
                { id: 'itemGroup', text: "Группы товаров" },
            ]
        },
        {
            id: 'services',
            text: "Служебное",
            dropdown: [
                { id: 'qwestion', text: "Вопросы" },
                { id: 'sliders', text: "Слайдер" },
            ]
        },
        {
            id: 'orders',
            text: "Заказы",
            dropdown: [
                { id: 'start', text: "Начатые" },
                { id: 'inProcess', text: "В процессе" },
                { id: 'finished', text: "Завершенные" },
            ]
        },
        { id: 'reviews', text: "Отзывы" },
        { id: 'complaints', text: "Жалобы" },
    ];

    // Определяем, к какому родительскому меню принадлежит активный компонент
    const getParentForActiveComponent = () => {
        if (['products', 'mainCategories', 'categories', 'filters'].includes(activeComponent)) {
            return 'store';
        }
        if (['start', 'inProcess', 'finished'].includes(activeComponent)) {
            return 'orders';
        }
        return null;
    };

    // Автоматически открываем dropdown если активный компонент в нем находится
    useEffect(() => {
        const parent = getParentForActiveComponent();
        if (parent) {
            setActiveDropdown(parent);
        }
    }, [activeComponent]);

    const toggleVisibility = () => {
        onToggle(!isVisible);
        setActiveDropdown(null);
    };

    const toggleDropdown = (buttonId) => {
        if (activeDropdown === buttonId) {
            setActiveDropdown(null);
        } else {
            setActiveDropdown(buttonId);
        }
    };

    const handleButtonClick = (button) => {
        if (button.dropdown) {
            toggleDropdown(button.id);
        } else {
            console.log(`Clicked: ${button.text}`);
            onMenuClick(button.id);
            setActiveDropdown(null);
        }
    };

    const handleDropdownItemClick = (parentButton, item) => {
        console.log(`Clicked: ${parentButton.text} -> ${item.text}`);
        onMenuClick(item.id);
        setActiveDropdown(null);
    };

    // Функция для проверки, активен ли пункт меню
    const isButtonActive = (button) => {
        if (button.id === activeComponent) {
            return true;
        }
        if (button.dropdown) {
            return button.dropdown.some(item => item.id === activeComponent);
        }
        return false;
    };

    if (!isAdminHeader) return null;

    return (
        <>
            <header className={`main-adminHeader ${isVisible ? 'visible' : 'hidden'}`}>
                <div className="admin-header-content">
                    <div className="admin-header-title">
                        <h3>Maxistore Admin</h3>
                    </div>

                    <div className="admin-header-buttons">
                        {buttons.map((button) => (
                            <div key={button.id} className="button-wrapper">
                                <button
                                    className={`admin-header-button ${isButtonActive(button) ? 'active' : ''} ${activeDropdown === button.id ? 'dropdown-open' : ''}`}
                                    onClick={() => handleButtonClick(button)}
                                >
                                    {button.text}
                                    {button.dropdown && (
                                        <span className={`dropdown-arrow ${activeDropdown === button.id ? 'rotated' : ''}`}>
                                            ▼
                                        </span>
                                    )}
                                </button>

                                {button.dropdown && activeDropdown === button.id && (
                                    <div className="dropdown-menu">
                                        {button.dropdown.map((item) => (
                                            <button
                                                key={item.id}
                                                className={`dropdown-item ${activeComponent === item.id ? 'active' : ''}`}
                                                onClick={() => handleDropdownItemClick(button, item)}
                                            >
                                                {item.text}
                                                {activeComponent === item.id && (
                                                    <span style={{marginLeft: 'auto', fontSize: '12px'}}>✓</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <button
                        className="admin-header-toggle"
                        onClick={toggleVisibility}
                    >
                        {isVisible ? '◀ Скрыть' : '▶ Показать'}
                    </button>
                </div>
            </header>

            {!isVisible && (
                <button
                    className="admin-header-collapsed"
                    onClick={() => onToggle(true)}
                    title="Открыть панель управления"
                >
                    ☰
                </button>
            )}
        </>
    );
}