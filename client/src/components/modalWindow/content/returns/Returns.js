import React from "react";
import "./Returns.scss";
import { FiX, FiRefreshCw, FiExternalLink } from "react-icons/fi";
import { 
    FaUndo, 
    FaCheckCircle, 
    FaBan, 
    FaExclamationTriangle, 
    FaFileAlt, 
    FaMoneyBillWave 
} from "react-icons/fa";
import { NavLink } from "react-router-dom";

export const ReturnsContent = ({ isStandalone = false }) => {
    return (
        <div className="returns-body">
            <div className="returns-header">
                <div className="title-icon">
                    <FaUndo />
                </div>
                <div>
                    <h2 className="returns-title">Правила возврата и обмена товаров</h2>
                    <p className="returns-subtitle">Интернет-магазин ONX.BY в соответствии с Законом РБ «О защите прав потребителей»</p>
                </div>
            </div>

            <div className="returns-sections">
                <div className="return-card">
                    <div className="card-header">
                        <FaUndo className="card-icon blue" />
                        <h3>Отказ до получения</h3>
                    </div>
                    <p className="common_reg">
                        Вы можете отказаться от заказа в любой момент до его передачи. Если отказ происходит в момент доставки качественного товара, оплачиваются фактические расходы на доставку.
                    </p>
                </div>

                <div className="return-card">
                    <div className="card-header">
                        <FaCheckCircle className="card-icon green" />
                        <h3>Возврат качественного товара</h3>
                    </div>
                    <p className="common_reg">
                        Вернуть или обменять непродовольственный товар надлежащего качества можно в течение <strong>14 дней</strong> с момента получения.
                    </p>
                    <p className="common_reg">
                        Возврат возможен, если товар не был в употреблении, сохранены его товарный вид, потребительские свойства, фабричные ярлыки, пломбы, оригинальная упаковка и документ, подтверждающий покупку. Доставка товара надлежащего качества продавцу оплачивается покупателем.
                    </p>
                </div>

                <div className="return-card">
                    <div className="card-header">
                        <FaBan className="card-icon red" />
                        <h3>Товары, не подлежащие обмену и возврату</h3>
                    </div>
                    <p className="common_reg">
                        По закону качественные технически сложные товары с гарантией, нательное белье, предметы личной гигиены, парфюмерия и косметика, бытовая химия, игрушки и посуда без невскрытой герметичной упаковки возврату и обмену не подлежат.
                    </p>
                </div>

                <div className="return-card">
                    <div className="card-header">
                        <FaExclamationTriangle className="card-icon orange" />
                        <h3>Возврат товара с браком</h3>
                    </div>
                    <p className="common_reg">
                        При обнаружении дефекта в течение гарантийного срока вы вправе потребовать замену, соразмерное уменьшение цены, бесплатный гарантийный ремонт или возврат денег.
                    </p>
                    <p className="common_reg">
                        Для технически сложных товаров замена или возврат возможны в течение <strong>30 дней</strong> с момента покупки, а после этого срока — только при существенном недостатке или нарушении сроков ремонта. Крупногабаритный товар или товар тяжелее 5 кг доставляется за счет продавца.
                    </p>
                </div>

                <div className="return-card">
                    <div className="card-header">
                        <FaFileAlt className="card-icon purple" />
                        <h3>Как оформить возврат</h3>
                    </div>
                    <p className="common_reg">
                        1. Свяжитесь с нами по телефону <strong>+375 (33) 677-92-60</strong>, <strong>+375 (29) 120-11-90</strong> или по e-mail <strong>info@maxistore.by</strong>.<br />
                        2. Согласуйте удобный способ передачи товара.<br />
                        3. Заполните простое заявление на возврат.
                    </p>
                </div>

                <div className="return-card">
                    <div className="card-header">
                        <FaMoneyBillWave className="card-icon green" />
                        <h3>Возврат денежных средств</h3>
                    </div>
                    <p className="common_reg">
                        Деньги возвращаются тем же способом, которым была совершена оплата. Срок возврата со стороны продавца составляет <strong>до 7 дней</strong>, а срок зачисления банком на карту — от 3 до 30 рабочих дней в зависимости от банка-эмитента.
                    </p>
                </div>
            </div>
        </div>
    );
};

function Returns({ closeModal }) {
    return (
        <div className="returns-modal-wrapper">
            <button 
                className="returns-close-btn" 
                onClick={() => closeModal && closeModal(false)}
                aria-label="Закрыть"
            >
                <FiX size={22} />
            </button>

            <div className="returns-scrollable">
                <ReturnsContent />
            </div>

            <div className="returns-footer">
                <NavLink 
                    to="/returns" 
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

export default Returns;

