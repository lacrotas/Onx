import { useState } from "react";
import "./Order.scss";
import { FaUser, FaPhone, FaMapMarkerAlt, FaTruck, FaMoneyBillWave, FaComment, FaCheckCircle } from "react-icons/fa";
import { postOrder } from "../../../../http/orderApi";
import { updateBusket } from "../../../../http/busketApi";

function Order({ value, itemsArr, closeModal }) {
    const BASKET_LOCAL_STORAGE_KEY = 'basket';

    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        address: '',
        delivery: 'Самовывоз',
        payment: 'Картой',
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
            console.log(orderData.itemsJsonb)
            const data = await postOrder(orderData);
            if (data) {
                setIsSuccess(true);
                updateBusket(itemsArr.basketId, { itemsJsonb: [] });
                localStorage.removeItem(BASKET_LOCAL_STORAGE_KEY);
                // Отправка в Telegram
                await sendTelegramNotification(orderData, JSON.parse(orderData.itemsJsonb));
                // Отправка на почту
                // await sendEmailNotification(formData, value);
                window.location.reload();
            }
        } catch (error) {
            console.error('Ошибка при оформлении заказа:', error);
            alert('Произошла ошибка при оформлении заказа');
        }
    };

    function generateEmailHtml(orderData, items) {
        const itemsHtml = items.map(item =>
            `<tr>
                <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity} шт.</td>
                <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">${item.price * item.quantity} руб</td>
            </tr>`
        ).join('');

        const total = items.reduce((sum, item) => sum + (Number(item.price) * item.quantity), 0);
        const deliveryCost = orderData.delivery === 'Доставка' ? 10 : 0;
        const totalWithDelivery = total + deliveryCost;

        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                <h1 style="color: #2c3e50; text-align: center;">📦 Новый заказ!</h1>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2c3e50; margin-top: 0;">Информация о клиенте</h2>
                    <p><strong>👤 Клиент:</strong> ${orderData.name}</p>
                    <p><strong>📞 Телефон:</strong> ${orderData.phone}</p>
                    <p><strong>📍 Адрес:</strong> ${orderData.delivery === 'Самовывоз' ? 'Самовывоз' : orderData.address}</p>
                    <p><strong>🚚 Способ доставки:</strong> ${orderData.delivery}</p>
                    <p><strong>💳 Способ оплаты:</strong> ${orderData.payment}</p>
                    <p><strong>📝 Комментарий:</strong> ${orderData.comment || 'нет'}</p>
                </div>
                
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2c3e50; margin-top: 0;">🛒 Товары</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                        <thead>
                            <tr style="border-bottom: 1px solid #ddd;">
                                <th style="text-align: left; padding: 8px;">Название</th>
                                <th style="text-align: center; padding: 8px;">Количество</th>
                                <th style="text-align: right; padding: 8px;">Сумма</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                </div>
                
                <div style="background: #e8f4fd; padding: 15px; border-radius: 8px; border: 1px solid #d1e7ff;">
                    <h3 style="color: #2c3e50; margin-top: 0;">💰 Итого к оплате</h3>
                    <p><strong>Товары:</strong> ${total} руб</p>
                    <p><strong>Доставка:</strong> ${deliveryCost} руб</p>
                    <p style="font-size: 1.1em;"><strong>Всего:</strong> ${totalWithDelivery} руб</p>
                </div>
                
                <p style="font-size: 0.9em; color: #7f8c8d; text-align: center; margin-top: 20px;">
                    Это письмо сформировано автоматически, пожалуйста, не отвечайте на него
                </p>
            </div>
        `;
    }

    async function sendEmailNotification(orderData, items) {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}api/order/send-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    orderData,
                    items,
                    subject: `Новый заказ от ${orderData.name}`,
                    html: generateEmailHtml(orderData, items)
                })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Ошибка сервера при отправке заказа');
            }

            return result;
        } catch (error) {
            console.error('Ошибка отправки email:', {
                message: error.message,
                stack: error.stack
            });
            throw error;
        }
    }

    async function sendTelegramNotification(orderData, items) {
        const botToken = '8268778878:AAGJFFLFOjoyFtsAcKw1LRI7FM6ZcCi6NFs';
        const chatId = '-4990488355';
        const itemsText = items.map(item => {
            return `- ${item.name} (${item.count} шт.): ${item.price * item.count} руб`;
        }).join('\n');

        const total = items.reduce((sum, item) => {
            return sum + (Number(item.price) * item.count);
        }, 0);

        const message = `
            📦 *Новый заказ!*
            
            👤 *Клиент*: ${orderData.name}
            📞 *Телефон*: ${orderData.phone}
            📍 *Адрес*: ${orderData.adress}
            💳 *Способ оплаты*: ${orderData.payment}
            📝 *Комментарий*: ${orderData.comment || 'нет'}

            🛒 *Товары*:
            ${itemsText}

            💰 *Итого*: ${total} руб
        `;

        try {
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'Markdown'
                })
            });
        } catch (error) {
            console.log('Ошибка отправки в Telegram:', error);
        }
    }

    const closeSuccessModal = () => {
        setIsSuccess(false);
        closeModal();
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
                                <span className="title_bold title_bold">Способ доставки</span>
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
                        <div className="select-group">
                            <label className="input-label">
                                <FaMoneyBillWave className="input-icon" />
                                <span className="title_bold">Способ оплаты</span>
                            </label>
                            <select
                                name="payment"
                                value={formData.payment}
                                onChange={handleChange}
                                className="form-select common_reg"
                            >
                                <option value="Картой">Картой онлайн</option>
                                <option value="Наличными">Наличными при получении</option>
                            </select>
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