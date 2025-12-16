// Header.jsx
import { useState, useEffect } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiTruck, FiPhone, FiList, FiUser } from 'react-icons/fi';
import './Header.scss';
import { MAIN_ROUTE, BUSKET_ROUTE, LOGIN_ROUTE } from "../../pages/appRouter/Const";
import ModalWindow from "../modalWindow/ModalWindow";
import CatalogInfoSlide from "../catalogInfoSlide/CatalogInfoSlide";
import jwt_decode from 'jwt-decode';

export default function Header({ isAdminHeader }) {
    const history = useHistory();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);


    const updateCartCount = () => {
        const basket = localStorage.getItem("basket") || "false";
        const items = JSON.parse(basket);
        setCartItemsCount(items.length);
    };

    const hasToken = () => {
        return !!localStorage.getItem('token');
    };

    const getUserLogin = () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                return 'Пользователь';
            }

            const decodedToken = jwt_decode(token);

            const currentTime = Date.now() / 1000;
            if (decodedToken.exp < currentTime) {
                localStorage.removeItem('token');
                return 'Пользователь';
            }

            return decodedToken.login || 'Пользователь';

        } catch (error) {
            console.error('Ошибка декодирования токена:', error);
            return 'Пользователь';
        }
    };
    // для обновленния корзины при добаавлении довара (в товаре вызывается window.dispatchEvent(new Event('cartUpdated'));)
    useEffect(() => {
        updateCartCount();
        const handleStorageChange = () => {
            updateCartCount();
        };
        window.addEventListener('storage', handleStorageChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // modal
    const [isModalActive, setIsModalActive] = useState(false);
    const [modalType, setModalType] = useState("");
    const [isCategotyActive, setIsCategoryActive] = useState(false);
    const [isBurgerOpen, setIsBurgerOpen] = useState(false);

    function openModal(type) {
        setIsModalActive(true);
        setModalType(type);
    }
    function openModalMobile(type) {
        setMobileMenuOpen(false)
        setIsModalActive(true);
        setModalType(type);
    }

    useEffect(() => {
        if (isModalActive || isCategotyActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isModalActive, isCategotyActive]);

    function handleBurgerClose(myFunck, value) {
        setIsBurgerOpen(false);
        myFunck(value);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userLogin');
        localStorage.removeItem('userMail');
        setIsUserMenuOpen(false);
        history.push('/login');
    };
    const handleBusket = () => {
        if (!localStorage.getItem('token')) {
            history.push(BUSKET_ROUTE);
        } else {
            const userToken = jwt_decode(localStorage.getItem('token'));
            history.push(BUSKET_ROUTE + "/" + userToken.id);
        }
    }
    // Закрываем меню пользователя при клике вне его
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isUserMenuOpen) {
                const userBtn = document.querySelector('.user-menu-trigger');
                if (userBtn && !userBtn.contains(event.target)) {
                    setIsUserMenuOpen(false);
                }
            }
        };

        document.addEventListener('click', handleClickOutside);
        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    return (
        <>
            <header className="main-header">
                <div className="container">
                    <div className="header-content">
                        <button className="categories-btn" onClick={() => setIsCategoryActive(true)}>
                            <FiList className="icon" />
                            <span className="my_p_small">Категории</span>
                        </button>

                        <NavLink to="/" className="logo">
                            <span>ONX</span>STORE
                        </NavLink>

                        <nav className="main-nav">
                            <div className="action-buttons">
                                <button className="action-btn" onClick={() => openModal("search")}>
                                    <FiSearch className="icon" />
                                    <span className="my_p_small">Поиск</span>
                                </button>
                                <button className="action-btn" onClick={() => openModal("delivery")}>
                                    <FiTruck className="icon" />
                                    <span className="my_p_small">Доставка</span>
                                </button>
                                <button className="action-btn" onClick={() => openModal("contacts")}>
                                    <FiPhone className="icon" />
                                    <span className="my_p_small">Контакты</span>
                                </button>
                                {!hasToken() && (
                                    <NavLink to={LOGIN_ROUTE}>
                                        <button className="action-btn">
                                            <FiUser className="icon" />
                                            <span>Войти</span>
                                        </button>
                                    </NavLink>
                                )}
                            </div>
                            {/* <NavLink to={BUSKET_ROUTE + userToken ? ("/" + userToken.id) : null} className="cart-btn"> */}
                            <div onClick={() => handleBusket()} className="cart-btn">
                                <FiShoppingCart className="icon" />
                                {cartItemsCount > 0 && (
                                    <span className="cart-count">{cartItemsCount}</span>
                                )}
                            </div>
                            {hasToken() && (
                                <div
                                    className="cart-btn user-menu-trigger"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIsUserMenuOpen(!isUserMenuOpen);
                                    }}
                                >
                                    <FiUser className="icon" />
                                </div>
                            )}
                        </nav>

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        >
                            {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                        </button>
                    </div>
                </div>
            </header>

            {/* Выпадающее меню пользователя */}
            {hasToken() && isUserMenuOpen && (
                <div className="user-dropdown">
                    <div className="user-dropdown-content">
                        <div className="user-info">
                            <FiUser className="user-icon" />
                            <span className="user-name">{getUserLogin()}</span>
                        </div>
                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >
                            Выйти
                        </button>
                    </div>
                </div>
            )}

            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <button className="mobile-menu-link">
                    <FiList className="icon" />
                    Категории
                </button>
                <button className="mobile-menu-link" onClick={() => openModalMobile("search")}>
                    <FiSearch className="icon" />
                    Поиск
                </button>
                <button className="mobile-menu-link" onClick={() => openModalMobile("delivery")}>
                    <FiTruck className="icon" />
                    Доставка
                </button>
                <button className="mobile-menu-link" onClick={() => openModalMobile("contacts")}>
                    <FiPhone className="icon" />
                    Контакты
                </button>
                <div
                    onClick={() => handleBusket()}
                    className="mobile-menu-link"
                >
                    <FiShoppingCart className="icon" />
                    Корзина
                    {cartItemsCount > 0 && (
                        <span className="cart-count">{cartItemsCount}</span>
                    )}
                </div>
                {hasToken() && (
                    <div className="mobile-user-section">
                        <div className="user-info-mobile">
                            <FiUser className="icon" />
                            <span>{getUserLogin()}</span>
                        </div>
                        <button
                            className="mobile-logout-btn"
                            onClick={handleLogout}
                        >
                            Выйти
                        </button>
                    </div>
                )}
                {!hasToken() && (
                    <NavLink to={LOGIN_ROUTE}>
                        <button className="mobile-menu-link">
                            <FiUser className="icon" />
                            <span>Войти</span>
                        </button>
                    </NavLink>
                )}
            </div>

            {isModalActive && <ModalWindow setIsModalActive={setIsModalActive} type={modalType} />}
            {isCategotyActive && <CatalogInfoSlide setIsCategoryActive={setIsCategoryActive} />}
        </>
    );
}