import "./Slide.scss";

export default function Slide({ image, isActive, label, description, link }) {
    const handleClick = () => {
        if (link) {
            window.open(link, '_blank');
        }
    };

    return (
        <div className={`slider_item ${isActive ? 'current' : 'next'}`}>
            <img 
                src={`${process.env.REACT_APP_API_URL}static/images/${image}`} 
                alt="slider" 
                className="slider_bg"
            />
            
            <div className="slider_content">
                <h1 className="slider_title my_h1">{label}</h1>
                <p className="slider_desc my_p">{description}</p>
                
                {link && (
                    <button 
                        className="btn-hero my_p" 
                        onClick={handleClick}
                    >
                        Подробнее
                    </button>
                )}
            </div>
        </div>
    );
}