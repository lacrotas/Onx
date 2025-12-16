import "./Contacts.scss";
import TelegramImage from "../../../../assets/images/socialLinks/logos_telegram.png";
import ViberImage from "../../../../assets/images/socialLinks/basil_viber-solid.png";
import VkImage from "../../../../assets/images/socialLinks/entypo-social_vk-with-circle.png";
import InstagramImage from "../../../../assets/images/socialLinks/skill-icons_instagram.png";
import { FaTelegram, FaVk, FaInstagram } from "react-icons/fa";
import { SiViber } from "react-icons/si";
import { IoClose } from "react-icons/io5";

function Contacts({ closeModal }) {
    return (
        <div className="contact_content">
            <div className="contacts-section">
                <h2 className="section-title title_bold">Свяжитесь с нами</h2>

                <div className="contacts-block">
                    <div className="contact-method">
                        <div className="contact-icon phone"></div>
                        <div className="contact-info">
                            <h3 className="title_bold">Телефоны</h3>
                            <a href="tel:+375336779260" className="common_reg">+375 (33) 677-92-60</a>
                            <a href="tel:+375291201190" className="common_reg">+375 (29) 120-11-90</a>
                        </div>
                    </div>

                    <div className="contact-method">
                        <div className="contact-icon address"></div>
                        <div className="contact-info">
                            <h3 className="title_bold">Адрес</h3>
                            <p className="common_reg">г. Минск, ул. Стебенева 2А, офис 20 <br></br> Второй этаж</p>
                            <p className="common_reg"></p>
                        </div>
                    </div>
                </div>

                <div className="social-links">
                    <a href="#" className="social-link tg">
                        <FaTelegram size={24} />
                    </a>
                    <a href="#" className="social-link vk">
                        <FaVk size={24} />
                    </a>
                    <a href="#" className="social-link inst">
                        <FaInstagram size={24} />
                    </a>
                    <a href="#" className="social-link viber">
                        <SiViber size={24} />
                    </a>
                </div>
            </div>

            <div className="map-section">
                <h2 className="section-title title_bold">Мы на карте</h2>
                <div className="map-container">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d7725.816701306804!2d27.560601230275942!3d53.83452120641616!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46dbd1dcc8bc1d4f%3A0x9342cf5d967c91ed!2sMaxistore.by!5e0!3m2!1sru!2sby!4v1728407129947!5m2!1sru!2sby"
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>
                <button className="faq-btn" onClick={() => {
                    closeModal(false);
                    document.getElementById('qwestion')?.scrollIntoView({ behavior: 'smooth' });
                }}>
                    Частые вопросы
                    <span className="arrow">→</span>
                </button>
            </div>
        </div >
    )
}

export default Contacts;