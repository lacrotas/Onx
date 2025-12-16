import "./ModalWindow.scss";
import Search from "./content/search/Search";
import Contacts from "./content/contacts/Contacts";
import Delivery from "./content/delivery/Delivery";
import Order from "./content/order/Order";
import AddCategory from "./content/addCategory/AddCategory";
import AddMainCategory from "./content/addMainCategory/AddMainCategory";
import AddAttributeValue from "./content/addAttributevalue/AddAttributeValue";
import ReductImage from "./content/reductImage/ReductImage";
import AddReview from "./content/addReview/AddReview";
import ViewImages from "./content/viewImages/ViewImages";
import { useEffect } from 'react'

function ModalWindow({ setIsModalActive, type, value, addImageToArray, itemsArr }) {
    useEffect(() => {
        document.body.classList.add('modal-open');
        return () => document.body.classList.remove('modal-open');
    }, []);

    return (
        <div className="modal">
            <div className="modal_content">
                {type === "search" ?
                    <Search setIsModalActive={setIsModalActive} />
                    : type === "contacts" ?
                        <Contacts closeModal={setIsModalActive} />
                        : type === "addMainCategory" ?
                            <AddMainCategory value={value} />
                            : type === "delivery" ?
                                <Delivery closeModal={setIsModalActive} />
                                : type === "order" ?
                                    <Order closeModal={setIsModalActive} value={value} itemsArr={itemsArr} />
                                    : type === "addCategory" ?
                                        <AddCategory value={value} />
                                        : type === "addAttributeValue" ?
                                            <AddAttributeValue value={value} />
                                            : type === "reductImage" ?
                                                <ReductImage value={value} addImageToArray={addImageToArray} setIsModalActive={setIsModalActive} />
                                                : type === "reviewAdd" ?
                                                    <AddReview itemId={value} />
                                                    : type === "viewImages" ?
                                                        <ViewImages images={value} setIsModalActive={setIsModalActive} />
                                                        :
                                                        <></>
                }
            </div>
            <div className="modal_back" onClick={() => setIsModalActive(false)}></div>
        </div >
    )
}

export default ModalWindow;