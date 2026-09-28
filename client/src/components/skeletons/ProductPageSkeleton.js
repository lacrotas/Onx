import React from 'react';
import ItemCardSkeleton from './ItemCardSkeleton';
import './Skeleton.scss';

export const ProductPageSkeleton = ({ count = 6 }) => {
    return (
        <div className="category-page-wrapper">
            {/* Хлебные крошки */}
            <div className="breadcrumbs-skeleton">
                <div className="breadcrumb-item-skeleton skeleton-box"></div>
                <span className="breadcrumb-divider-skeleton">/</span>
                <div className="breadcrumb-item-skeleton skeleton-box"></div>
                <span className="breadcrumb-divider-skeleton">/</span>
                <div className="breadcrumb-item-skeleton skeleton-box"></div>
            </div>

            {/* Табы / пилюли подкатегорий */}
            <div className="controls-area-skeleton">
                <div className="pill-skeleton skeleton-box"></div>
                <div className="pill-skeleton skeleton-box"></div>
                <div className="pill-skeleton skeleton-box"></div>
                <div className="pill-skeleton skeleton-box"></div>
                <div className="pill-skeleton skeleton-box"></div>
            </div>

            {/* Основной контейнер с сайдбаром и товарами */}
            <div className="main-container">
                {/* Сайдбар фильтров */}
                <aside className="sidebar-skeleton">
                    <div className="filter-group-skeleton">
                        <div className="filter-group-title-skeleton skeleton-box"></div>
                        <div className="filter-input-row-skeleton">
                            <div className="filter-input-skeleton skeleton-box"></div>
                            <div className="filter-input-skeleton skeleton-box"></div>
                        </div>
                    </div>

                    <div className="filter-group-skeleton">
                        <div className="filter-group-title-skeleton skeleton-box"></div>
                        <div className="filter-checkbox-item-skeleton">
                            <div className="checkbox-box-skeleton skeleton-box"></div>
                            <div className="checkbox-label-skeleton skeleton-box"></div>
                        </div>
                        <div className="filter-checkbox-item-skeleton">
                            <div className="checkbox-box-skeleton skeleton-box"></div>
                            <div className="checkbox-label-skeleton skeleton-box"></div>
                        </div>
                        <div className="filter-checkbox-item-skeleton">
                            <div className="checkbox-box-skeleton skeleton-box"></div>
                            <div className="checkbox-label-skeleton skeleton-box"></div>
                        </div>
                    </div>

                    <div className="filter-group-skeleton">
                        <div className="filter-group-title-skeleton skeleton-box"></div>
                        <div className="filter-checkbox-item-skeleton">
                            <div className="checkbox-box-skeleton skeleton-box"></div>
                            <div className="checkbox-label-skeleton skeleton-box"></div>
                        </div>
                        <div className="filter-checkbox-item-skeleton">
                            <div className="checkbox-box-skeleton skeleton-box"></div>
                            <div className="checkbox-label-skeleton skeleton-box"></div>
                        </div>
                    </div>
                </aside>

                {/* Область контента */}
                <main className="content-area">
                    <div className="main-content_header" style={{ marginBottom: '24px' }}>
                        <div className="skeleton-box" style={{ width: '220px', height: '32px', borderRadius: '8px' }}></div>
                        <div className="skeleton-box" style={{ width: '160px', height: '38px', borderRadius: '10px' }}></div>
                    </div>

                    <div className="product-grid">
                        {Array.from({ length: count }).map((_, idx) => (
                            <ItemCardSkeleton key={idx} />
                        ))}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProductPageSkeleton;
