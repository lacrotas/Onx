import React from "react";
import "./Privacy.scss";
import { FiX, FiExternalLink } from "react-icons/fi";
import { 
    FaShieldAlt, 
    FaUserCheck, 
    FaDatabase, 
    FaBullseye, 
    FaTruck, 
    FaLock, 
    FaPhoneAlt 
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export const PrivacyContent = ({ isStandalone = false }) => {
    return (
        <div className="privacy-body">
            <div className="privacy-header">
                <div className="title-icon">
                    <FaShieldAlt />
                </div>
                <div>
                    <h2 className="privacy-title">Политика конфиденциальности</h2>
                    <p className="privacy-subtitle">Защита и обработка персональных данных в интернет-магазине ONX.BY</p>
                </div>
            </div>

            <div className="privacy-sections">
                <div className="privacy-card">
                    <div className="card-header">
                        <FaUserCheck className="card-icon blue" />
                        <h3>1. Общие положения</h3>
                    </div>
                    <p className="common_reg">
                        Настоящая Политика определяет порядок обработки и защиты персональных данных пользователей интернет-магазина <strong>ONX.BY</strong> в соответствии с Законом Республики Беларусь от 07.05.2021 № 99-З «О защите персональных данных».
                    </p>
                    <p className="common_reg">
                        Используя сайт, оформляя заказ или оставляя свои контактные данные, пользователь выражает согласие с условиями настоящей Политики.
                    </p>
                </div>

                <div className="privacy-card">
                    <div className="card-header">
                        <FaDatabase className="card-icon purple" />
                        <h3>2. Собираемая информация</h3>
                    </div>
                    <p className="common_reg">
                        Мы собираем только те данные, которые необходимы для исполнения договора купли-продажи и качественного обслуживания:
                    </p>
                    <ul className="privacy-list common_reg">
                        <li>Фамилия, имя покупателя или получателя;</li>
                        <li>Контактный номер телефона;</li>
                        <li>Адрес доставки (город, улица, дом, квартира);</li>
                        <li>Адрес электронной почты (при указании для чеков и уведомлений);</li>
                        <li>Технические данные: файлы cookie, IP-адрес, тип браузера и данные аналитики (Google Analytics).</li>
                    </ul>
                </div>

                <div className="privacy-card">
                    <div className="card-header">
                        <FaBullseye className="card-icon green" />
                        <h3>3. Цели обработки данных</h3>
                    </div>
                    <p className="common_reg">
                        Персональные данные используются строго для:
                    </p>
                    <ul className="privacy-list common_reg">
                        <li>Обработки, подтверждения и выполнения ваших заказов;</li>
                        <li>Организации доставки товаров курьером или транспортной компанией;</li>
                        <li>Информирования покупателя о статусе заказа и деталях доставки;</li>
                        <li>Предоставления гарантийного обслуживания и обработки возвратов;</li>
                        <li>Улучшения качества работы сайта и удобства совершения покупок.</li>
                    </ul>
                </div>

                <div className="privacy-card">
                    <div className="card-header">
                        <FaTruck className="card-icon orange" />
                        <h3>4. Передача данных третьим лицам</h3>
                    </div>
                    <p className="common_reg">
                        Мы <strong>не продаем</strong> и не передаем ваши персональные данные третьим лицам в маркетинговых целях. Передача возможна исключительно:
                    </p>
                    <ul className="privacy-list common_reg">
                        <li>Службам доставки и курьерам — только в объеме, необходимом для вручения посылки;</li>
                        <li>Банкам и платежным системам — для безопасного проведения транзакций;</li>
                        <li>Государственным органам — только в случаях, прямо предусмотренных законодательством Республики Беларусь.</li>
                    </ul>
                </div>

                <div className="privacy-card">
                    <div className="card-header">
                        <FaLock className="card-icon blue" />
                        <h3>5. Безопасность и хранение</h3>
                    </div>
                    <p className="common_reg">
                        Все данные передаются по защищенному протоколу шифрования HTTPS/SSL. Доступ к персональной информации имеют только уполномоченные сотрудники, подписавшие обязательство о неразглашении.
                    </p>
                </div>

                <div className="privacy-card">
                    <div className="card-header">
                        <FaPhoneAlt className="card-icon green" />
                        <h3>6. Права пользователя и контакты</h3>
                    </div>
                    <p className="common_reg">
                        Вы имеете право в любой момент отозвать согласие на обработку персональных данных, запросить их изменение или удаление, обратившись к нам:
                    </p>
                    <p className="common_reg">
                        • Телефон: <strong>+375 (33) 677-92-60</strong>, <strong>+375 (29) 120-11-90</strong><br />
                        • E-mail: <strong>info@maxistore.by</strong><br />
                        • Адрес пункта самовывоза: г. Минск, ул. Стебенева 2А, офис 20
                    </p>
                </div>
            </div>
        </div>
    );
};

function Privacy({ closeModal }) {
    return (
        <div className="privacy-modal-wrapper">
            <button 
                className="privacy-close-btn" 
                onClick={() => closeModal && closeModal(false)}
                aria-label="Закрыть"
            >
                <FiX size={22} />
            </button>

            <div className="privacy-scrollable">
                <PrivacyContent />
            </div>

            <div className="privacy-footer">
                <NavLink 
                    to="/privacy" 
                    className="standalone-link"
                    onClick={() => closeModal && closeModal(false)}
                >
                    <span>Открыть на отдельной странице</span>
                    <FiExternalLink />
                </NavLink>
                <button 
                    className="modal-action-btn"
                    onClick={() => closeModal && closeModal(false)}
                >
                    Понятно
                </button>
            </div>
        </div>
    );
}

export default Privacy;

