import "./ItemReviews.scss";
import { useState, useEffect } from "react";
import Rating from "../../../../components/rating/Rating";
import ProgressBar from "./progressBar/ProgressBar";
import CustomButton from "../../../../customUI/customButton/CustomButton";
import ModalWindow from "../../../../components/modalWindow/ModalWindow";
import { fetchReviewByItemIdAndIsShowed } from "../../../../http/reviewApi";

function ItemReviews({ itemId }) {
    const [reviews, setReviews] = useState([]);
    const [visibleCount, setVisibleCount] = useState(3);
    const [ratingStats, setRatingStats] = useState([
        { mark: 0, procentMark: 0 },
        { mark: 0, procentMark: 0 },
        { mark: 0, procentMark: 0 },
        { mark: 0, procentMark: 0 },
        { mark: 0, procentMark: 0 },
    ]);
    const [averageMark, setAverageMark] = useState(0);
    const [recommendationPercent, setRecommendationPercent] = useState(0);
    const [isModalActive, setIsModalActive] = useState(false);
    const [modalReviewPreview, setModalReviewPreview] = useState(false);

    // Форматирование даты
    const formatDate = (isoString) => {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    // Склонение слова "отзыв"
    const endings = ['отзыв', 'отзыва', 'отзывов'];
    const getWordEnding = (number) => {
        const cases = [2, 0, 1, 1, 1, 2];
        return endings[
            number % 100 > 4 && number % 100 < 20
                ? 2
                : cases[Math.min(number % 10, 5)]
        ];
    };

    // Загрузка отзывов
    useEffect(() => {
        fetchReviewByItemIdAndIsShowed(itemId).then(data => {
            setReviews(data || []);
            console.log(data);
        });
    }, [itemId]);

    // Расчёт статистики
    useEffect(() => {
        if (reviews.length === 0) {
            setAverageMark(0);
            setRecommendationPercent(0);
            setRatingStats(Array(5).fill().map(() => ({ mark: 0, procentMark: 0 })));
            return;
        }

        // Средний рейтинг
        const total = reviews.reduce((sum, r) => sum + Number(r.mark), 0);
        const avg = total / reviews.length;
        setAverageMark(Number(avg.toFixed(1)));

        // Процент рекомендаций (оценка ≥ 3)
        const recommended = reviews.filter(r => Number(r.mark) >= 3).length;
        setRecommendationPercent(Math.round((recommended / reviews.length) * 100));

        // Распределение по звёздам
        const counts = [0, 0, 0, 0, 0]; // 1–5
        reviews.forEach(r => {
            const mark = Number(r.mark);
            if (mark >= 1 && mark <= 5) counts[mark - 1]++;
        });

        const newStats = counts.map((count, i) => ({
            mark: count,
            procentMark: Math.round((count / reviews.length) * 100)
        })).reverse(); // 5★ → 1★

        setRatingStats(newStats);
    }, [reviews]);

    return (
        <>
            {isModalActive && (
                <ModalWindow
                    type="reviewAdd"
                    value={itemId}
                    setIsModalActive={setModalReviewPreview}
                />
            )}
            {modalReviewPreview && (
                <ModalWindow
                    type="viewImages"
                    value={modalReviewPreview}
                    setIsModalActive={setModalReviewPreview}
                />
            )}

            <section className="review_section">
                {reviews.length > 0 ? (
                    <>
                        <div className="section_header">
                            {/* Процент рекомендаций */}
                            {/* <div className="header_procent">
                                <p className="procent_paragraph super_ my_p">{recommendationPercent}%</p>
                                <p className="procent_paragraph my_p">Рекомендуют этот товар</p>
                            </div> */}

                            {/* Средний рейтинг */}
                            <div className="section_header_marks">
                                <p className="section_header_marks_label my_h3">
                                    Оценка пользователей
                                </p>
                                <p className="mark_paragragraph my_h1">
                                    {Number.isInteger(averageMark) ? `${averageMark}.0` : averageMark}
                                </p>
                                <Rating rating={averageMark} />
                                <p className="mark_paragragraph my_p">
                                    основанна на {reviews.length} отзывах
                                </p>
                                {/* <div className="flex_review_button" onClick={() => setIsModalActive(true)}>
                                    <p className="my_p_small">Написать отзыв</p>
                                </div> */}
                            </div>

                            {/* Гистограмма */}
                            <div className="section_header_procentmarks">
                                {ratingStats.map((stat, index) => (
                                    <div className="header_procentMarks" key={index}>
                                        <p className="my_p procentMarks_paragraph-left">{5 - index}</p>
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 576 512"
                                            className="star full"
                                            width="20"
                                            height="20"
                                        >
                                            <path d="M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z" />
                                        </svg>
                                        <ProgressBar percentage={stat.procentMark} />
                                        <p className="my_p procentMarks_paragraph-right">{stat.mark}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Кнопка */}
                            <div className="flex_review_button" onClick={() => setIsModalActive(true)}>
                                <p className="my_p_small">Написать отзыв</p>
                            </div>
                        </div>

                        {/* Список отзывов */}
                        <div className="section_description">
                            {reviews.slice(0, visibleCount).map((review, index) => (
                                <div className="section_description_container" key={review.id || index}>
                                    <p className="description_paragraph my_h3">
                                        {review.label || 'Без названия'}
                                    </p>
                                    <div className="description_container">
                                        <Rating rating={Number(review.mark)} />
                                        <p className="container_paragraph my_p_small">
                                            Отзыв от {formatDate(review.createdAt)}
                                        </p>
                                    </div>
                                    <p className="my_p">{review.description}</p>

                                    {/* Блок с фото */}
                                    {review.images && review.images.length > 0 && (
                                        <div className="review-images" onClick={() => setModalReviewPreview(review.images)}>
                                            {review.images.map((image, imgIndex) => (
                                                <img
                                                    key={imgIndex}
                                                    src={`${process.env.REACT_APP_API_URL}static/images/${image}`}
                                                    alt={`К фото отзыва ${imgIndex + 1}`}
                                                    className="review-image"
                                                    onError={(e) => {
                                                        e.target.src = '/placeholder-image.jpg';
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Кнопка "Загрузить ещё" */}
                            {visibleCount < reviews.length && (
                                <div
                                    className="flex_review_button load-more-button"
                                    onClick={() => setVisibleCount(prev => Math.min(prev + 10, reviews.length))}
                                >
                                    <p className="my_p_small">Загрузить ещё</p>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="section_flex-none">
                        <p className="flex_paragraph my_p">
                            Пока к этому товару нет отзывов. Помогите другим оценить этот товар, написав свой отзыв.
                        </p>
                        <div className="flex_review_button" onClick={() => setIsModalActive(true)}>
                            <p className="my_p_small">Написать отзыв</p>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}

export default ItemReviews;