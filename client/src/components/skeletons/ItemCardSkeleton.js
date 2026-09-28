import React from 'react';
import './Skeleton.scss';

export const ItemCardSkeleton = () => {
    return (
        <div className="item-card-skeleton">
            <div className="item-img-skeleton skeleton-box"></div>
            <div className="item-status-skeleton skeleton-box"></div>
            <div className="item-tag-skeleton skeleton-box"></div>
            <div className="item-title-skeleton skeleton-box"></div>
            <div className="item-title-skeleton second-line skeleton-box"></div>
            <div className="item-price-skeleton skeleton-box"></div>
            <div className="item-btn-skeleton skeleton-box"></div>
        </div>
    );
};

export default ItemCardSkeleton;
