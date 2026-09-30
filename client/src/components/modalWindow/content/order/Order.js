import { useState } from "react";
import "./Order.scss";
import { FaUser, FaPhone, FaMapMarkerAlt, FaTruck, FaMoneyBillWave, FaComment, FaCheckCircle, FaCheck } from "react-icons/fa";
import { postOrder } from "../../../../http/orderApi";
import { updateBusket, updateBusketByUserId } from "../../../../http/busketApi";

function Order({ value, itemsArr, closeModal }) {
    const BASKET_LOCAL_STORAGE_KEY = 'basket';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        delivery: 'Самовывоз',
        payment: 'Банковской картой при получении',
        comment: ''
    });
    const [errors, setErrors] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);

    // --- Логика форматирования номера ---
    const formatPhoneNumber = (input) => {
        // Оставляем только цифры
        const digits = input.replace(/\D/g, '');

        if (!digits) return '';

        // Ограничиваем длину, чтобы не ломать верстку (макс 15 цифр)
        const limitedDigits = digits.substring(0, 15);
        let formatted = '';

        // Формат для 375 (Беларусь международный): 375 (XX) XXX-XX-XX
        if (limitedDigits.startsWith('375')) {
            formatted = '375';
            if (limitedDigits.length > 3) formatted += ' (' + limitedDigits.substring(3, 5);
            if (limitedDigits.length > 5) formatted += ') ' + limitedDigits.substring(5, 8);
            if (limitedDigits.length > 8) formatted += '-' + limitedDigits.substring(8, 10);
            if (limitedDigits.length > 10) formatted += '-' + limitedDigits.substring(10, 12);
        }
        // Формат для 80 (Беларусь внутренний): 80 (XX) XXX-XX-XX
        else if (limitedDigits.startsWith('80')) {
            formatted = '80';
            if (limitedDigits.length > 2) formatted += ' (' + limitedDigits.substring(2, 4);
            if (limitedDigits.length > 4) formatted += ') ' + limitedDigits.substring(4, 7);
            if (limitedDigits.length > 7) formatted += '-' + limitedDigits.substring(7, 9);
            if (limitedDigits.length > 9) formatted += '-' + limitedDigits.substring(9, 11);
        }
        // Для остальных номеров просто возвращаем цифры (или можно добавить +7 и т.д.)
        else {
            return limitedDigits;
        }

        return formatted;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === 'phone') {
            // При вводе телефона применяем форматирование
            // Если пользователь стирает символы, мы пересчитываем маску на основе оставшихся цифр
            const formatted = formatPhoneNumber(value);
            setFormData(prev => ({ ...prev, [name]: formatted }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }

        // Очищаем ошибку при изменении поля
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'delivery' && value === 'Самовывоз' && errors.address) {
            setErrors(prev => ({ ...prev, address: '' }));
        }
    };

    const validatePhoneNumber = (phone) => {
        // Удаляем все нецифровые символы для проверки длины
        const digits = phone.replace(/\D/g, '');

        // Проверка для конкретных префиксов
        if (digits.startsWith('375')) return digits.length === 12; // 375 29 111 22 33
        if (digits.startsWith('80')) return digits.length === 11;  // 80 29 111 22 33

        // Общая проверка для остальных
        return digits.length >= 10 && digits.length <= 15;
    };

    const validateStep = (currentStep) => {
        const newErrors = {};

        if (currentStep === 1) {
            if (!formData.name.trim()) newErrors.name = 'Пожалуйста, введите ФИО';

            // --- Проверка телефона ---
            if (!formData.phone.trim()) {
                newErrors.phone = 'Пожалуйста, введите телефон';
            } else if (!validatePhoneNumber(formData.phone)) {
                newErrors.phone = 'Некорректный номер телефона';
            }
        }

        if (currentStep === 2 && formData.delivery === 'Доставка' && !formData.address.trim()) {
            newErrors.address = 'Пожалуйста, введите адрес доставки';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const nextStep = () => {
        if (validateStep(step)) {
            setStep(step + 1);
        }
    };

    const prevStep = () => {
        setStep(step - 1);
    };

    const handleSubmit = async () => {
        let isValid = true;
        for (let i = 1; i <= 3; i++) {
            isValid = isValid && validateStep(i);
        }

        if (!isValid) {
            alert('Пожалуйста, заполните все обязательные поля');
            return;
        }

        try {
            const orderData = {
                userId: itemsArr.userId,
                itemsJsonb: JSON.stringify(itemsArr.items),
                name: formData.name,
                adress: formData.address == "" ? "самовывоз" : formData.address,
                comment: formData.comment,
                phone: formData.phone,
                payment: formData.payment,
                price: itemsArr.totalValue,
                orderStage: "start",
            };
            const data = await postOrder(orderData);
            if (data) {
                setIsSuccess(true);
                if (itemsArr.basketId) {
                    updateBusket(itemsArr.basketId, { itemsJsonb: [] }).catch(() => {});
                } else if (itemsArr.userId) {
                    updateBusketByUserId(itemsArr.userId, { itemsJsonb: [] }).catch(() => {});
                }

                // Если заказ оформлен без авторизации, сохраняем его ID в localStorage
                if (!itemsArr.userId && data.id) {
                    try {
                        const guestOrders = JSON.parse(localStorage.getItem('guest_orders') || '[]');
                        if (!guestOrders.includes(data.id)) {
                            guestOrders.push(data.id);
                            localStorage.setItem('guest_orders', JSON.stringify(guestOrders));
                        }
                    } catch (e) {}
                }

                localStorage.removeItem(BASKET_LOCAL_STORAGE_KEY);
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                alert('Не удалось оформить заказ. Пожалуйста, попробуйте еще раз.');
            }
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
        }
    };

    const closeSuccessModal = () => {
        setIsSuccess(false);
        closeModal();
        window.location.href = '/';
    };

    return (
        <div className="order-modal">
            {/* Success Modal */}
            {isSuccess && (
                <div className="success-modal-overlay">
                    <div className="success-modal">
                        <FaCheckCircle className="success-icon" />
                        <h2 className="success-title">Заказ успешно оформлен!</h2>
                        <p className="success-message">Спасибо за ваш заказ. Мы свяжемся с вами в ближайшее время.</p>
                        <button className="success-btn" onClick={closeSuccessModal}>
                            Закрыть
                        </button>
                    </div>
                </div>
            )}

            <div className="order-header">
                <h2 className="order-title title_bold">Оформление заказа</h2>
                <div className="order-steps">
                    <div className={`step ${step >= 1 ? 'active' : ''}`}>
                        <span className="step-number">1</span>
                        <span className="step-label common_reg">Контакты</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step ${step >= 2 ? 'active' : ''}`}>
                        <span className="step-number">2</span>
                        <span className="step-label common_reg">Доставка</span>
                    </div>
                    <div className="step-connector"></div>
                    <div className={`step ${step >= 3 ? 'active' : ''}`}>
                        <span className="step-number">3</span>
                        <span className="step-label common_reg">Оплата</span>
                    </div>
                </div>
            </div>

            <div className="order-body">
                {/* Шаг 1: Контактные данные */}
                {step === 1 && (
                    <div className="form-section">
                        <div className="input-group">
                            <label className="input-label">
                                <FaUser className="input-icon" />
                                <span className="title_bold">ФИО</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`form-input common_reg ${errors.name ? 'error' : ''}`}
                                placeholder="Иванов Иван Иванович"
                                required
                            />
                            {errors.name && <span className="error-message">{errors.name}</span>}
                        </div>

                        <div className="input-group">
                            <label className="input-label">
                                <FaPhone className="input-icon" />
                                <span className="title_bold">Телефон</span>
                            </label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`form-input common_reg ${errors.phone ? 'error' : ''}`}
                                placeholder="375 (__) ___ __ __"
                                required
                            />
                            {errors.phone && <span className="error-message">{errors.phone}</span>}
                        </div>
                    </div>
                )}

                {/* Шаг 2: Доставка */}
                {step === 2 && (
                    <div className="form-section">
                        <div className="select-group">
                            <label className="input-label">
                                <FaTruck className="input-icon" />
                                <span className="title_bold">Способ доставки</span>
                            </label>
                            <select
                                name="delivery"
                                value={formData.delivery}
                                onChange={handleChange}
                                className="form-select common_reg"
                            >
                                <option value="Самовывоз" className="common_reg">Самовывоз (ул. Стебенева 2А)</option>
                                <option value="Доставка" className="common_reg">Курьерская доставка</option>
                            </select>
                        </div>

                        {formData.delivery === 'Доставка' && (
                            <div className="input-group">
                                <label className="input-label">
                                    <FaMapMarkerAlt className="input-icon" />
                                    <span className="title_bold">Адрес доставки</span>
                                </label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className={`form-input common_reg ${errors.address ? 'error' : ''}`}
                                    placeholder="г. Минск, ул. Примерная, д. 1"
                                />
                                {errors.address && <span className="error-message">{errors.address}</span>}
                            </div>
                        )}

                        <div className="input-group">
                            <label className="input-label">
                                <FaComment className="input-icon" />
                                <span className="title_bold">Комментарий к заказу</span>
                            </label>
                            <textarea
                                name="comment"
                                value={formData.comment}
                                onChange={handleChange}
                                className="form-textarea"
                                placeholder="Укажите дополнительные пожелания..."
                                rows="3"
                            />
                        </div>
                    </div>
                )}

                {/* Шаг 3: Оплата */}
                {step === 3 && (
                    <div className="form-section">
                        <div className="payment-group">
                            <label className="input-label">
                                <FaMoneyBillWave className="input-icon" />
                                <span className="title_bold">Способ оплаты</span>
                            </label>
                            <div className="payment-options">
                                <label className={`payment-option ${formData.payment === 'Банковской картой при получении' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Банковской картой при получении"
                                        checked={formData.payment === 'Банковской картой при получении'}
                                        onChange={handleChange}
                                        className="payment-radio-input"
                                    />
                                    <span className="custom-checkbox-box">
                                        <FaCheck className="check-mark-icon" />
                                    </span>
                                    <span className="payment-option-text common_reg">Банковской картой при получении</span>
                                </label>

                                <label className={`payment-option ${formData.payment === 'Наличными при получении' ? 'selected' : ''}`}>
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="Наличными при получении"
                                        checked={formData.payment === 'Наличными при получении'}
                                        onChange={handleChange}
                                        className="payment-radio-input"
                                    />
                                    <span className="custom-checkbox-box">
                                        <FaCheck className="check-mark-icon" />
                                    </span>
                                    <span className="payment-option-text common_reg">Наличными при получении</span>
                                </label>
                            </div>
                        </div>

                        <div className="order-summary">
                            <div className="summary-row">
                                <span className="common_reg">Товаров: {itemsArr.totalCounter} шт</span>
                                <span className="common_reg">
                                    {itemsArr.totalValue} руб
                                </span>
                            </div>
                            <div className="summary-row">
                                <span className="common_reg">Доставка</span>
                                <span className="common_reg">{formData.delivery === 'Самовывоз' ? 'Бесплатно' : 'Уточняйте у менеджера'}</span>
                            </div>
                            <div className="summary-row total">
                                <span className="common_reg">Итого к оплате</span>
                                <span className="common_reg">
                                    {formData.delivery === 'Самовывоз' ? itemsArr.totalValue : itemsArr.totalValue + 30} руб
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="order-footer">
                {step > 1 && (
                    <button className="nav-btn prev-btn" onClick={prevStep}>
                        Назад
                    </button>
                )}

                {step < 3 ? (
                    <button className="nav-btn next-btn" onClick={nextStep}>
                        Далее
                    </button>
                ) : (
                    <button className="submit-btn" onClick={handleSubmit}>
                        Подтвердить заказ
                        <span className="btn-arrow">→</span>
                    </button>
                )}
            </div>
        </div>
    )
}

export default Order;