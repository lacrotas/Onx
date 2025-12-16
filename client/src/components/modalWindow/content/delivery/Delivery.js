import "./Delivery.scss";
import { FaTruck, FaWallet, FaCreditCard } from "react-icons/fa";
import { MdLocationOn } from "react-icons/md";
import { FiX } from "react-icons/fi"; // Импортируем иконку закрытия

function Delivery({ closeModal }) {
    return (
        <div className="delivery-compact">
            {/* Кнопка закрытия */}
            <button className="delivery-close-btn" onClick={() => closeModal(false)}>
                <FiX size={24} />
            </button>

            <div className="delivery-content">
                <div className="delivery-map">
                    <div className="map-header">
                        <MdLocationOn className="header-icon" />
                        <h3>Адрес пункта самовывоза</h3>
                    </div>
                    <p className="map-address common_reg">
                        г. Минск, ул. Стебенева 2А, офис 20<br />
                        Второй этаж
                    </p>
                    <div className="map-container">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7725.816701306804!2d27.560601230275942!3d53.83452120641616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dbd1dcc8bc1d4f%3A0x9342cf5d967c91ed!2sMaxistore.by!5e0!3m2!1sru!2sby!4v1728407129947!5m2!1sru!2sby"
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                        ></iframe>
                    </div>
                </div>

                <div className="delivery-info">
                    <div className="info-block">
                        <div className="block-header">
                            <FaTruck className="header-icon" />
                            <h3 className="title_bold">Доставка</h3>
                        </div>
                        <p className="common_reg">
                            Доставка по всей РБ нашей транспортной компанией или самовывоз после согласования времени.
                        </p>
                    </div>

                    <div className="info-block">
                        <div className="block-header">
                            <FaWallet className="header-icon" />
                            <h3 className="title_bold">Оплата</h3>
                        </div>
                        <p className="common_reg">
                            Оплата при получении после проверки качества. Наличный и безналичный расчет.
                        </p>
                    </div>

                    <div className="info-block payment-methods">
                        <div className="block-header">
                            <FaCreditCard className="header-icon" />
                            <h3 className="title_bold">Мы принимаем</h3>
                        </div>
                        <div className="payment-icons">
                            <div className="payment-icon visa"></div>
                            <div className="payment-icon mastercard"></div>
                            <div className="payment-icon mir"></div>
                            <div className="payment-icon maestro"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Delivery;