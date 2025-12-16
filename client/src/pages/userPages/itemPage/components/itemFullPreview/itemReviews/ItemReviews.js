import "./ItemReviews.scss";
import { useState, useEffect } from "react";
import Rating from "../../../../../../components/rating/Rating";
import ProgressBar from "./progressBar/ProgressBar";
import CustomButton from "../../../../../../customUI/customButton/CustomButton";
import ModalWindow from "../../../../../../components/modalWindow/ModalWindow";
import { fetchReviewByItemIdAndIsShowed } from "../../../../../../http/reviewApi";

function ItemReviews({ itemId }) {
    const [ratingArr, setRaitingArr] = useState([1, 2, 3, 4, 5]);
    const [review, setReview] = useState([]);
    const [averageMark, setAverageMark] = useState(0);
    const [procentMark, setProcentMark] = useState(0);

    const [isModalActive, setIsModalActive] = useState(false);

    function setRaiting() {
        let sum = 0;
        if (review) {
            review.map((item) => {
                sum += Number(item.mark);
            })
        }
        return (sum / Number(review.length));
    }

    function setProcentRaiting() {
        let sum = 0;
        let oneMark = 0;
        let twoMark = 0;
        let threeMark = 0;
        let fourMark = 0;
        let fiveMark = 0;
        if (review) {
            review.map((item) => {
                if (item.mark == 1) {
                    oneMark += 1;
                } else if (item.mark == 2) {
                    twoMark += 1;
                } else if (item.mark == 3) {
                    threeMark += 1;
                } else if (item.mark == 4) {
                    fourMark += 1;
                } else if (item.mark == 5) {
                    fiveMark += 1;
                }
                if (item.mark >= 3) {
                    sum += 1;
                }
            })
        }
        let raitingArr = [
            { mark: fiveMark, procentMark: Math.round(((fiveMark / Number(review.length)) * 100)) },
            { mark: fourMark, procentMark: Math.round(((fourMark / Number(review.length)) * 100)) },
            { mark: threeMark, procentMark: Math.round(((threeMark / Number(review.length)) * 100)) },
            { mark: twoMark, procentMark: Math.round(((twoMark / Number(review.length)) * 100)) },
            { mark: oneMark, procentMark: Math.round(((oneMark / Number(review.length)) * 100)) },
        ];

        setRaitingArr(raitingArr)

        return (Math.round(((sum / Number(review.length)) * 100)));
    }

    useEffect(() => {
        fetchReviewByItemIdAndIsShowed(itemId).then((data) => setReview(data));
    }, []);

    useEffect(() => {
        setAverageMark(setRaiting);
        setProcentMark(setProcentRaiting);
    }, [review])

    const endings = ['отзыв', 'отзыва', 'отзывов'];

    function getWordEnding(number, words) {
        const cases = [2, 0, 1, 1, 1, 2];
        return words[
            (number % 100 > 4 && number % 100 < 20)
                ? 2
                : cases[Math.min(number % 10, 5)]
        ];
    }


    return (
        <>
            {isModalActive ? <ModalWindow type={"reviewAdd"} value={itemId} setIsModalActive={setIsModalActive} /> : <></>}
            <section className="review_section">
                <p className="section_paragraph medium_p">Отзывы</p>
                {review.length > 0 &&
                    (<>
                        <div className="section_header">
                            <div className="header_procent">
                                <p className="procent_paragraph super_large_p">{procentMark}%</p>
                                <p className="procent_paragraph tiny_p">Рекомендуют этот товар</p>
                            </div>
                            <div className="section_header_marks">
                                <p className="mark_paragragraph tiny_p">{review.length} {`${getWordEnding(review.length, endings)}`}</p>
                                <Rating rating={averageMark} />
                                <p className="mark_paragragraph tiny_p">{averageMark == Math.round(averageMark) ? averageMark + ".0" : averageMark}</p>
                            </div>
                            <div className="section_header_procentmarks">
                                {ratingArr.map((item, index) => (
                                    <div className="header_procentMarks" key={index}>
                                        <p className="tiny_p procentMarks_paragraph">{index + (5 - 2 * index)}</p>
                                        <svg
                                            key={index}
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 576 512"
                                            className={`star full`} // Определяем тип звезды (full, half, empty)
                                            width="20"
                                            height="20"
                                        >
                                            <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                                        </svg>
                                        <ProgressBar percentage={item.procentMark} />
                                        <p className="tiny_p procentMarks_paragraph">{item.mark} </p>
                                    </div>
                                ))}
                            </div>
                            <CustomButton text={"Написать отзыв"} dealOnClick={setIsModalActive} value={true} />
                        </div>
                        <div className="section_description">
                            {review.map((item, index) => (
                                <div className="section_description_container" key={index}>
                                    {/* <p className="description_paragraph medium_p">{item.label}</p> */}
                                    <div className="description_container">
                                        <Rating rating={item.mark} />
                                        <p className="container_paragraph tiny_p">Отзыв {item.Reviewdate}</p>
                                    </div>
                                    <p className="jura_semi-medium_p ">{item.description}</p>
                                </div>
                            ))}
                        </div>
                    </>)
                }
                {review.length === 0 &&
                    <div className="section_flex-none">
                        <p className="flex_paragraph description_p">Пока к этому товару нет отзывов. Помогите другим оценить этот товар написав свой отзыв</p>
                        <CustomButton text={"Написать отзыв"} dealOnClick={setIsModalActive} value={true} />
                    </div>
                }
            </section>
        </>
    )
}

export default ItemReviews;