import React from 'react';
import './Skeleton.scss';

export const CategoryCardSkeleton = () => {
    return (
        <div className="subcat-card-skeleton">
            <div className="subcat-img-skeleton skeleton-box"></div>
            <div className="subcat-content-skeleton">
                <div className="subcat-title-skeleton skeleton-box"></div>
                <div className="subcat-link-skeleton skeleton-box"></div>
            </div>
        </div>
    );
};

export default CategoryCardSkeleton;
