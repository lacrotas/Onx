import React, { useState } from 'react';
import { useHistory, NavLink } from 'react-router-dom';
import { 
    FiMail, 
    FiLock, 
    FiUser, 
    FiEye, 
    FiEyeOff, 
    FiArrowLeft, 
    FiCheckCircle, 
    FiAlertCircle, 
    FiShield 
} from 'react-icons/fi';
import { registration, signIn } from '../../../http/userApi';
import './AuthPage.scss';

const AuthPage = () => {
    const history = useHistory();
    const [isLoginMode, setIsLoginMode] = useState(true);

    // Поля форм
    const [loginData, setLoginData] = useState({
        mail: '',
        password: '',
        rememberMe: true
    });

    const [registerData, setRegisterData] = useState({
        login: '',
        mail: '',
        password: '',
        confirmPassword: ''
    });

    // Видимость паролей
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    const [showRegisterPassword, setShowRegisterPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Переключение режимов
    const switchMode = (isLogin) => {
        setIsLoginMode(isLogin);
        setError('');
        setSuccessMessage('');
        // Переносим введённый email между формами для удобства
        if (isLogin && registerData.mail && !loginData.mail) {
            setLoginData(prev => ({ ...prev, mail: registerData.mail }));
        } else if (!isLogin && loginData.mail && !registerData.mail) {
            setRegisterData(prev => ({ ...prev, mail: loginData.mail }));
        }
    };

    const handleLoginChange = (e) => {
        const { name, value, type, checked } = e.target;
        setLoginData(prev => ({ 
            ...prev, 
            [name]: type === 'checkbox' ? checked : value 
        }));
        if (error) setError('');
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    // Оценка сложности пароля (для регистрации)
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { score: 0, label: '', color: '' };
        let score = 0;
        if (pwd.length >= 6) score += 1;
        if (pwd.length >= 8) score += 1;
        if (/[A-ZА-Я]/.test(pwd)) score += 1;
        if (/[0-9]/.test(pwd)) score += 1;
        if (/[^A-Za-z0-9А-Яа-я]/.test(pwd)) score += 1;

        if (score <= 1) return { score: 1, label: 'Слабый', color: '#ff3b30' };
        if (score <= 3) return { score: 2, label: 'Средний', color: '#ff9500' };
        return { score: 3, label: 'Надёжный', color: '#34c759' };
    };

    const passwordStrength = getPasswordStrength(registerData.password);

    // Валидация формы регистрации
    const validateRegisterForm = () => {
        if (!registerData.login.trim()) {
            setError('Введите имя или логин');
            return false;
        }
        if (!registerData.mail.trim()) {
            setError('Введите адрес электронной почты');
            return false;
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(registerData.mail.trim())) {
            setError('Пожалуйста, введите корректный email (например, user@mail.com)');
            return false;
        }
        if (registerData.password.length < 6) {
            setError('Пароль должен содержать не менее 6 символов');
            return false;
        }
        if (registerData.password !== registerData.confirmPassword) {
            setError('Введенные пароли не совпадают');
            return false;
        }
        return true;
    };

    // Валидация входа
    const validateLoginForm = () => {
        if (!loginData.mail.trim()) {
            setError('Введите email или логин');
            return false;
        }
        if (!loginData.password) {
            setError('Введите пароль');
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateLoginForm()) return;

        setLoading(true);
        try {
            await signIn(loginData.mail.trim(), loginData.password);
            window.location.href = '/';
        } catch (err) {
            const msg = err.response?.data?.message || 'Неверный email или пароль';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        if (!validateRegisterForm()) return;

        setLoading(true);
        try {
            const basket = localStorage.getItem("basket") || "false";
            let items = [];
            try {
                items = basket !== "false" ? JSON.parse(basket) : [];
            } catch (e) {
                items = [];
            }

            await registration({
                login: registerData.login.trim(),
                mail: registerData.mail.trim().toLowerCase(),
                password: registerData.password,
                itemsJsonb: items || [],
            });

            setSuccessMessage('Успешная регистрация! Выполняется вход...');

            // Автоматически авторизуем пользователя после создания аккаунта
            try {
                await signIn(registerData.mail.trim().toLowerCase(), registerData.password);
                setTimeout(() => {
                    window.location.href = '/';
                }, 600);
            } catch (loginErr) {
                // Если авто-вход не сработал, переключаем на вкладку логина
                setIsLoginMode(true);
                setLoginData(prev => ({
                    ...prev,
                    mail: registerData.mail.trim().toLowerCase()
                }));
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Ошибка при регистрации. Попробуйте еще раз.';
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modern-auth-page">
            {/* Декоративные световые пятна (Ambient Glow) */}
            <div className="auth-ambient-glow glow-top-left"></div>
            <div className="auth-ambient-glow glow-bottom-right"></div>

            {/* Верхняя панель навигации */}
            <div className="auth-top-nav">
                <button onClick={() => history.push('/')} className="back-link-btn">
                    <FiArrowLeft className="arrow-icon" />
                    <span>В магазин</span>
                </button>

                {/* <NavLink to="/" className="auth-brand-logo">
                    <span>ON</span>X
                </NavLink> */}

                <div className="nav-placeholder"></div>
            </div>

            {/* Основной контейнер с карточкой */}
            <div className="auth-main-wrapper">
                <div className="auth-card-modern">
                    {/* Заголовок и подзаголовок */}
                    <div className="auth-card-header">
                        <h1 className="auth-main-title">
                            {isLoginMode ? 'Добро пожаловать' : 'Создание аккаунта'}
                        </h1>
                        <p className="auth-subtitle">
                            {isLoginMode 
                                ? 'Войдите, чтобы отслеживать заказы и управлять профилем' 
                                : 'Зарегистрируйтесь для быстрых покупок в магазине ONX'}
                        </p>
                    </div>

                    {/* Сегментированный переключатель Вход / Регистрация */}
                    <div className="auth-mode-segmented">
                        <button
                            type="button"
                            className={`segmented-tab ${isLoginMode ? 'active' : ''}`}
                            onClick={() => switchMode(true)}
                        >
                            Вход
                        </button>
                        <button
                            type="button"
                            className={`segmented-tab ${!isLoginMode ? 'active' : ''}`}
                            onClick={() => switchMode(false)}
                        >
                            Регистрация
                        </button>
                    </div>

                    {/* Блок ошибок */}
                    {error && (
                        <div className="auth-notification error-banner">
                            <FiAlertCircle className="notification-icon" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Блок успеха */}
                    {successMessage && (
                        <div className="auth-notification success-banner">
                            <FiCheckCircle className="notification-icon" />
                            <span>{successMessage}</span>
                        </div>
                    )}

                    {/* ФОРМА ВХОДА */}
                    {isLoginMode ? (
                        <form onSubmit={handleLogin} className="modern-form" noValidate>
                            <div className="input-field-group">
                                <label htmlFor="login-email">Электронная почта или логин</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon left" />
                                    <input
                                        type="text"
                                        id="login-email"
                                        name="mail"
                                        value={loginData.mail}
                                        onChange={handleLoginChange}
                                        required
                                        autoComplete="username"
                                        className="styled-input"
                                        placeholder="name@example.com или логин"
                                    />
                                </div>
                            </div>

                            <div className="input-field-group">
                                <div className="label-with-action">
                                    <label htmlFor="login-password">Пароль</label>
                                </div>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon left" />
                                    <input
                                        type={showLoginPassword ? 'text' : 'password'}
                                        id="login-password"
                                        name="password"
                                        value={loginData.password}
                                        onChange={handleLoginChange}
                                        required
                                        autoComplete="current-password"
                                        className="styled-input with-toggle"
                                        placeholder="Ваш пароль"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                                        tabIndex="-1"
                                        title={showLoginPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showLoginPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <div className="form-extra-row">
                                <label className="remember-checkbox-label">
                                    <input
                                        type="checkbox"
                                        name="rememberMe"
                                        checked={loginData.rememberMe}
                                        onChange={handleLoginChange}
                                    />
                                    <span className="checkbox-text">Запомнить меня</span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                className="auth-primary-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading-state">
                                        <span className="spinner-dots"></span>
                                        <span>Выполняется вход...</span>
                                    </span>
                                ) : (
                                    'Войти в аккаунт'
                                )}
                            </button>
                        </form>
                    ) : (
                        /* ФОРМА РЕГИСТРАЦИИ */
                        <form onSubmit={handleRegister} className="modern-form" noValidate>
                            <div className="input-field-group">
                                <label htmlFor="register-login">Имя пользователя / Логин</label>
                                <div className="input-wrapper">
                                    <FiUser className="input-icon left" />
                                    <input
                                        type="text"
                                        id="register-login"
                                        name="login"
                                        value={registerData.login}
                                        onChange={handleRegisterChange}
                                        required
                                        autoComplete="username"
                                        className="styled-input"
                                        placeholder="Как к вам обращаться"
                                    />
                                </div>
                            </div>

                            <div className="input-field-group">
                                <label htmlFor="register-email">Электронная почта</label>
                                <div className="input-wrapper">
                                    <FiMail className="input-icon left" />
                                    <input
                                        type="email"
                                        id="register-email"
                                        name="mail"
                                        value={registerData.mail}
                                        onChange={handleRegisterChange}
                                        required
                                        autoComplete="email"
                                        className="styled-input"
                                        placeholder="name@example.com"
                                    />
                                </div>
                            </div>

                            <div className="input-field-group">
                                <label htmlFor="register-password">Придумайте пароль</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon left" />
                                    <input
                                        type={showRegisterPassword ? 'text' : 'password'}
                                        id="register-password"
                                        name="password"
                                        value={registerData.password}
                                        onChange={handleRegisterChange}
                                        required
                                        autoComplete="new-password"
                                        className="styled-input with-toggle"
                                        placeholder="Не менее 6 символов"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                        tabIndex="-1"
                                        title={showRegisterPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showRegisterPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>

                                {/* Индикатор надежности пароля */}
                                {registerData.password && (
                                    <div className="password-strength-container">
                                        <div className="strength-bars">
                                            <div 
                                                className={`bar ${passwordStrength.score >= 1 ? 'filled' : ''}`}
                                                style={{ backgroundColor: passwordStrength.score >= 1 ? passwordStrength.color : '' }}
                                            ></div>
                                            <div 
                                                className={`bar ${passwordStrength.score >= 2 ? 'filled' : ''}`}
                                                style={{ backgroundColor: passwordStrength.score >= 2 ? passwordStrength.color : '' }}
                                            ></div>
                                            <div 
                                                className={`bar ${passwordStrength.score >= 3 ? 'filled' : ''}`}
                                                style={{ backgroundColor: passwordStrength.score >= 3 ? passwordStrength.color : '' }}
                                            ></div>
                                        </div>
                                        <span className="strength-label" style={{ color: passwordStrength.color }}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="input-field-group">
                                <label htmlFor="register-confirm-password">Повторите пароль</label>
                                <div className="input-wrapper">
                                    <FiLock className="input-icon left" />
                                    <input
                                        type={showConfirmPassword ? 'text' : 'password'}
                                        id="register-confirm-password"
                                        name="confirmPassword"
                                        value={registerData.confirmPassword}
                                        onChange={handleRegisterChange}
                                        required
                                        autoComplete="new-password"
                                        className="styled-input with-toggle"
                                        placeholder="Повторите пароль"
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle-btn"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        tabIndex="-1"
                                        title={showConfirmPassword ? "Скрыть пароль" : "Показать пароль"}
                                    >
                                        {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                                    </button>
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-primary-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="btn-loading-state">
                                        <span className="spinner-dots"></span>
                                        <span>Создание аккаунта...</span>
                                    </span>
                                ) : (
                                    'Зарегистрироваться'
                                )}
                            </button>
                        </form>
                    )}

                    {/* Нижний переключатель режимов */}
                    <div className="auth-footer-prompt">
                        {isLoginMode ? (
                            <p>
                                Впервые в магазине ONX?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchMode(false)}
                                    className="switch-inline-btn"
                                >
                                    Создать аккаунт
                                </button>
                            </p>
                        ) : (
                            <p>
                                Уже зарегистрированы?{' '}
                                <button
                                    type="button"
                                    onClick={() => switchMode(true)}
                                    className="switch-inline-btn"
                                >
                                    Войти в профиль
                                </button>
                            </p>
                        )}
                    </div>

                    {/* Бейдж безопасности */}
                    {/* <div className="security-notice">
                        <FiShield className="shield-icon" />
                        <span>Все данные передаются в зашифрованном виде</span>
                    </div> */}
                </div>
            </div>
        </div>
    );
};

export default AuthPage;