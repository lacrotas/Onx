import React from 'react';
import './Skeleton.scss';

export const ProductDetailSkeleton = () => {
    return (
        <div className="apple-main-container">
            {/* Хлебные крошки */}
            <div className="apple-breadcrumbs" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="skeleton-box" style={{ width: '60px', height: '14px', borderRadius: '4px' }}></div>
                <span style={{ color: '#86868b', fontSize: '13px' }}>/</span>
                <div className="skeleton-box" style={{ width: '150px', height: '14px', borderRadius: '4px' }}></div>
                <span style={{ color: '#86868b', fontSize: '13px' }}>/</span>
                <div className="skeleton-box" style={{ width: '80px', height: '14px', borderRadius: '4px' }}></div>
                <span style={{ color: '#86868b', fontSize: '13px' }}>/</span>
                <div className="skeleton-box" style={{ width: '220px', height: '14px', borderRadius: '4px' }}></div>
            </div>

            {/* Главная сетка: галерея 1.3fr и информация 1fr */}
            <div className="apple-grid-layout">
                {/* Левая колонка: фото 1:1 в стиле Apple */}
                <div className="apple-gallery-col">
                    <div 
                        className="skeleton-box" 
                        style={{ 
                            width: '100%', 
                            aspectRatio: '1 / 1', 
                            borderRadius: '22px' 
                        }}
                    ></div>
                </div>

                {/* Правая колонка: информация */}
                <div className="apple-info-col">
                    {/* Заголовок товара (3-4 строки как на реальной странице) */}
                    <div style={{ marginBottom: '20px' }}>
                        <div className="skeleton-box" style={{ width: '95%', height: '36px', borderRadius: '8px', marginBottom: '8px' }}></div>
                        <div className="skeleton-box" style={{ width: '88%', height: '36px', borderRadius: '8px', marginBottom: '8px' }}></div>
                        <div className="skeleton-box" style={{ width: '65%', height: '36px', borderRadius: '8px' }}></div>
                    </div>

                    {/* Строка цены и бейджа наличия */}
                    <div className="apple-price-row" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px' }}>
                        <div className="skeleton-box" style={{ width: '140px', height: '36px', borderRadius: '8px' }}></div>
                        <div className="skeleton-box" style={{ width: '110px', height: '30px', borderRadius: '20px' }}></div>
                    </div>

                    {/* Две полноразмерные кнопки: «В корзину» и «Купить сейчас» */}
                    <div className="apple-btn-group" style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '40px' }}>
                        <div className="skeleton-box" style={{ width: '100%', height: '56px', borderRadius: '16px' }}></div>
                        <div className="skeleton-box" style={{ width: '100%', height: '56px', borderRadius: '16px' }}></div>
                    </div>

                    {/* Блок характеристик с точками */}
                    <div className="apple-preview-specs">
                        <div className="skeleton-box" style={{ width: '160px', height: '22px', borderRadius: '6px', marginBottom: '18px' }}></div>

                        <div className="apple-mini-spec">
                            <div className="skeleton-box" style={{ width: '70px', height: '16px', borderRadius: '4px' }}></div>
                            <span className="dots"></span>
                            <div className="skeleton-box" style={{ width: '40px', height: '16px', borderRadius: '4px' }}></div>
                        </div>

                        <div className="apple-mini-spec">
                            <div className="skeleton-box" style={{ width: '85px', height: '16px', borderRadius: '4px' }}></div>
                            <span className="dots"></span>
                            <div className="skeleton-box" style={{ width: '75px', height: '16px', borderRadius: '4px' }}></div>
                        </div>

                        <div className="apple-mini-spec">
                            <div className="skeleton-box" style={{ width: '80px', height: '16px', borderRadius: '4px' }}></div>
                            <span className="dots"></span>
                            <div className="skeleton-box" style={{ width: '55px', height: '16px', borderRadius: '4px' }}></div>
                        </div>

                        <div className="skeleton-box" style={{ width: '150px', height: '18px', borderRadius: '4px', marginTop: '12px' }}></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailSkeleton;
