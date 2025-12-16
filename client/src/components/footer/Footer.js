import "./Footer.scss";
import LogoImage from "../../assets/images/logo.png";
import { useEffect, useState } from "react";
import ModalWindow from "../modalWindow/ModalWindow";
import IntstaImg from "../../assets/images/socialLinks/skill-icons_instagram.png"
import TelegaImg from "../../assets/images/socialLinks/logos_telegram.png"
import VkImg from "../../assets/images/socialLinks/entypo-social_vk-with-circle.png"

function Footer() {
    const [isModalActive, setIsModalActive] = useState(false);
    const [modalType, setModalType] = useState("");

    function openModal(type) {
        setIsModalActive(true);
        setModalType(type);
    }

    useEffect(() => {
        if (isModalActive) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        // Возвращаем функцию, которая будет выполняться при размонтировании компонента
        return () => {
            document.body.style.overflow = '';
        };
    }
    )
    return (
        <>
            {isModalActive ? <ModalWindow setIsModalActive={setIsModalActive} type={modalType} /> : <></>}

            <footer className="footer">
                <div className="footer_waves">
                    <div className="wave wave1"></div>
                    <div className="wave wave2"></div>
                </div>


                <div className="footer_container">
                    <div className="footer_column footer_logo">
                        <img src={LogoImage} alt="logo" className="logo_image" />
                    </div>
                    <div className="footer_column">
                        <h3 className="footer_title my_p">Меню</h3>
                        <ul className="footer_links">
                            <li className="footer_link" onClick={() => openModal("contacts")}>
                                <span className="link_hover my_p">Контакты</span>
                            </li>
                            <li className="footer_link" onClick={() => openModal("delivery")}>
                                <span className="link_hover my_p">Доставка</span>
                            </li>
                            <li className="footer_link" onClick={() => openModal("delivery")}>
                                <span className="link_hover my_p">Оплата</span>
                            </li>
                        </ul>
                    </div>



                    <div className="footer_column footer_column--left">
                        <h3 className="footer_title my_p">Контакты</h3>
                        <div className="contact_info">
                            <div className="contact_item">
                                {/* <i className="fas fa-phone"></i> */}
                                <span className="my_p">+375 33 677-92-60</span>
                            </div>
                            <div className="contact_item">
                                {/* <i className="fas fa-phone"></i> */}
                                <span className="my_p">+375 29 120-11-90</span>
                            </div>
                            <div className="contact_item">
                                {/* <i className="fas fa-envelope"></i> */}
                                <span className="my_p">info@maxistore.by</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="footer_bottom">
                    <p className="copyright my_p_small">© Maxistore 2024 | Все права защищены</p>
                    <p className="developer my_p_small">Разработано для вас</p>
                </div>
            </footer>
        </>
    );
}

export default Footer;
