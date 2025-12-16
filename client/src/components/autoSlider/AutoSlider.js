import React, { useState, useEffect } from 'react';
import Slide from "./slide/Slide";
import './AutoSlider.scss';
import { fetchAllSliders } from "../../http/SliderApi";


const AutoSlider = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sliders, setSliders] = useState([]);

    useEffect(() => {
        fetchAllSliders().then(data => {
            setSliders(data || []);
        });
    }, []);

    useEffect(() => {
        if (sliders.length > 0) {
            const interval = setInterval(() => {
                setCurrentIndex(prev => (prev + 1) % sliders.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [sliders]);

    return (
        <div className="auto-slider">
            {sliders.map((item, idx) => (
                <Slide
                    key={idx}
                    image={item.image}
                    label={item.label}
                    description={item.description}
                    link={item.link}
                    isActive={idx === currentIndex}
                />
            ))}
            <div className="slider-indicators">
                {sliders.map((_, idx) => (
                    <div
                        key={idx}
                        className={`indicator ${idx === currentIndex ? 'active' : ''}`}
                        onClick={() => setCurrentIndex(idx)}
                    />
                ))}
            </div>
        </div>
    );
};

export default AutoSlider;