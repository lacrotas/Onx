import React from 'react';
import './AdminBadge.scss';

export function AdminBadge({
    variant = "default", // 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'neutral'
    children,
    dot = false,
    className = ""
}) {
    return (
        <span className={`admin-badge badge-${variant} ${className}`}>
            {dot && <span className="badge-dot" />}
            {children}
        </span>
    );
}
