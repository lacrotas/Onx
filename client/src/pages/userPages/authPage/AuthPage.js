import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { registration, signIn } from '../../../http/userApi';
import './AuthPage.scss';

const AuthPage = () => {
    const history = useHistory();
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [loginData, setLoginData] = useState({
        mail: '',
        password: ''
    });
    const [registerData, setRegisterData] = useState({
        login: '',
        mail: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterData(prev => ({ ...prev, [name]: value }));
    };

    const validateRegisterForm = () => {
        console.log(registerData)

        if (!registerData.login.trim()) {
            setError('Введите логин');
            return false;
        }
        if (!registerData.mail.trim()) {
            setError('Введите email');
            return false;
        }
        if (!/\S+@\S+\.\S+/.test(registerData.mail)) {
            setError('Неверный формат email');
            return false;
        }
        if (registerData.password.length < 6) {
            setError('Пароль должен содержать не менее 6 символов');
            return false;
        }
        if (registerData.password !== registerData.confirmPassword) {
            setError('Пароли не совпадают');
            return false;
        }
        return true;
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signIn(loginData.mail, loginData.password);
            localStorage.removeItem("basket");
            history.push('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка авторизации');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (!validateRegisterForm()) {
            return;
        }

        setLoading(true);
        try {
            const basket = localStorage.getItem("basket") || "false";
            const items = JSON.parse(basket);
            await registration({
                login: registerData.login,
                mail: registerData.mail,
                password: registerData.password,
                itemsJsonb: items || [],
            });
            history.push('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Ошибка регистрации');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-card">
                    <h2 className="auth-title">
                        {isLoginMode ? 'Вход в аккаунт' : 'Регистрация'}
                    </h2>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    {isLoginMode ? (
                        <form onSubmit={handleLogin} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="login-email">Email</label>
                                <input
                                    type="email"
                                    id="login-email"
                                    name="mail"
                                    value={loginData.mail}
                                    onChange={handleLoginChange}
                                    required
                                    className="form-input"
                                    placeholder="Введите ваш email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="login-password">Пароль</label>
                                <input
                                    type="password"
                                    id="login-password"
                                    name="password"
                                    value={loginData.password}
                                    onChange={handleLoginChange}
                                    required
                                    className="form-input"
                                    placeholder="Введите ваш пароль"
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Вход...' : 'Войти'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleRegister} className="auth-form">
                            <div className="form-group">
                                <label htmlFor="register-login">Логин</label>
                                <input
                                    type="text"
                                    id="register-login"
                                    name="login"
                                    value={registerData.login}
                                    onChange={handleRegisterChange}
                                    required
                                    className="form-input"
                                    placeholder="Введите логин"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-email">Email</label>
                                <input
                                    type="email"
                                    id="register-email"
                                    name="mail"
                                    value={registerData.mail}
                                    onChange={handleRegisterChange}
                                    required
                                    className="form-input"
                                    placeholder="Введите ваш email"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-password">Пароль</label>
                                <input
                                    type="password"
                                    id="register-password"
                                    name="password"
                                    value={registerData.password}
                                    onChange={handleRegisterChange}
                                    required
                                    className="form-input"
                                    placeholder="Введите пароль"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="register-confirm-password">Подтвердите пароль</label>
                                <input
                                    type="password"
                                    id="register-confirm-password"
                                    name="confirmPassword"
                                    value={registerData.confirmPassword}
                                    onChange={handleRegisterChange}
                                    required
                                    className="form-input"
                                    placeholder="Повторите пароль"
                                />
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </button>
                        </form>
                    )}

                    <div className="auth-toggle">
                        {isLoginMode ? (
                            <p>
                                Нет учетной записи?{' '}
                                <button
                                    type="button"
                                    onClick={() => setIsLoginMode(false)}
                                    className="auth-toggle-btn"
                                >
                                    Зарегистрироваться
                                </button>
                            </p>
                        ) : (
                            <p>
                                Уже есть учетная запись?{' '}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setIsLoginMode(true);
                                        setError('');
                                    }}
                                    className="auth-toggle-btn"
                                >
                                    Войти
                                </button>
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;