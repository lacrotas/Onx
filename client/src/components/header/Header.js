import { useState, useEffect, useRef } from 'react';
import { NavLink, useHistory } from 'react-router-dom';
import { FiMenu, FiX, FiSearch, FiShoppingCart, FiTruck, FiPhone, FiList, FiUser } from 'react-icons/fi';
import './Header.scss';
import { MAIN_ROUTE, BUSKET_ROUTE, LOGIN_ROUTE, ITEM_SEARCH_ROUTE } from "../../pages/appRouter/Const";
import ModalWindow from "../modalWindow/ModalWindow";
import CatalogInfoSlide from "../catalogInfoSlide/CatalogInfoSlide";
import jwt_decode from 'jwt-decode';
import LogoImg from "../../assets/images/logoNew.png";

export default function Header({ isAdminHeader }) {
    const history = useHistory();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [cartItemsCount, setCartItemsCount] = useState(0);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    // --- ЛОГИКА ПОИСКА ---
    const [isSearchActive, setIsSearchActive] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const searchInputRef = useRef(null);

    const performSearch = () => {
        if (searchQuery.trim()) {
            const encodedQuery = encodeURIComponent(searchQuery.trim());
            // Редирект как в вашем примере Search.js
            history.push(`${ITEM_SEARCH_ROUTE}?q=${encodedQuery}`);

            // Опционально: закрываем поле поиска после перехода или оставляем
            setIsSearchActive(false);
            setSearchQuery("");
        }
    };

    const handleSearchClick = () => {
        if (isSearchActive) {
            // Если поле уже открыто, кнопка "Поиск" работает как submit
            performSearch();
        } else {
            // Если закрыто - открываем
            setIsSearchActive(true);
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 100);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
        if (e.key === 'Escape') {
            setIsSearchActive(false);
            setSearchQuery("");
        }
    };
    // ---------------------

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

    function openModal(type) {
        setIsModalActive(true);
        setModalType(type);
    }
    function openModalMobile(type) {
        setMobileMenuOpen(false)
        setIsModalActive(true);
        setModalType(type);
    }
    function openCategoryMobile() {
        setMobileMenuOpen(false)
        setIsCategoryActive(true)
    }

    // Закрытие поиска при клике вне хедера
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (isSearchActive && !event.target.closest('.main-header')) {
                setIsSearchActive(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isSearchActive]);


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
            <header className={`main-header ${isSearchActive ? 'search-active' : ''}`}>
                <div className="container">
                    <div className="header-content">
                        <button className="categories-btn" onClick={() => setIsCategoryActive(true)}>
                            <FiList className="icon" />
                            <span className="my_p_small">Категории</span>
                        </button>

                        {/* Логотип скрывается при поиске */}
                        {!isSearchActive && (
                            // <NavLink to="/">
                            //     <img className="logo" src={LogoImg} alt='logo' />
                            // </NavLink>
                            <NavLink to="/" className="logo">
                                <span>ON</span>X
                            </NavLink>
                        )}

                        {/* Поле поиска */}
                        {isSearchActive && (
                            <div className="desktop-search-container">
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    placeholder="Введите название товара..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                />
                                {/* Иконка лупы внутри инпута для запуска поиска */}
                                <FiSearch
                                    className="search-submit-icon"
                                    onClick={performSearch}
                                />
                            </div>
                        )}

                        <nav className="main-nav">
                            <div className="action-buttons">
                                {!isSearchActive &&
                                    (<button
                                        className={`action-btn ${isSearchActive ? 'active' : ''}`}
                                        onClick={handleSearchClick}
                                    >
                                        <FiSearch className="icon" />
                                        <span className="my_p_small">Поиск</span>
                                    </button>
                                    )
                                }

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

            {/* Остальной код без изменений */}
            {hasToken() && isUserMenuOpen && (
                <div className="user-dropdown">
                    <div className="user-dropdown-content">
                        <div className="user-info">
                            <FiUser className="user-icon" />
                            <span className="user-name">{getUserLogin()}</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>Выйти</button>
                    </div>
                </div>
            )}

            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <button className="mobile-menu-link" onClick={() => openCategoryMobile()}>
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
                <div onClick={() => handleBusket()} className="mobile-menu-link">
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
                        <button className="mobile-logout-btn" onClick={handleLogout}>Выйти</button>
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