import React from 'react';
import CategoryCardSkeleton from './CategoryCardSkeleton';
import './Skeleton.scss';

export const CategoryPageSkeleton = ({ count = 8 }) => {
    return (
        <div className="item-page-main-kategory">
            <div className="breadcrumbs-skeleton">
                <div className="breadcrumb-item-skeleton skeleton-box"></div>
                <span className="breadcrumb-divider-skeleton">/</span>
                <div className="breadcrumb-item-skeleton skeleton-box"></div>
            </div>

            <div className="page-header" style={{ margin: '15px 0 30px' }}>
                <div className="skeleton-box" style={{ width: '240px', height: '36px', borderRadius: '10px' }}></div>
            </div>

            <section className="subcat-grid">
                {Array.from({ length: count }).map((_, idx) => (
                    <CategoryCardSkeleton key={idx} />
                ))}
            </section>
        </div>
    );
};

export default CategoryPageSkeleton;
