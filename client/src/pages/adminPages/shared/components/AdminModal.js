import React, { useEffect } from 'react';
import { FiX } from 'react-icons/fi';
import './AdminModal.scss';

export function AdminModal({
    isOpen,
    onClose,
    title,
    subtitle,
    children,
    footer,
    onSubmit,
    isSubmitting = false,
    submitText = "Сохранить",
    maxWidth = "680px"
}) {
    // Закрытие по Escape
    useEffect(() => {
        if (!isOpen) return;

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const handleFormSubmit = (e) => {
        if (onSubmit) {
            e.preventDefault();
            onSubmit(e);
        }
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div 
                className="admin-modal-container" 
                style={{ maxWidth }} 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="admin-modal-header">
                    <div className="modal-title-group">
                        <h2 className="modal-title">{title}</h2>
                        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
                    </div>
                    <button type="button" className="modal-close-btn" onClick={onClose} title="Закрыть (Esc)">
                        <FiX />
                    </button>
                </div>

                {onSubmit ? (
                    <form onSubmit={handleFormSubmit} className="admin-modal-form">
                        <div className="admin-modal-body">
                            {children}
                        </div>
                        <div className="admin-modal-footer">
                            {footer ? (
                                footer
                            ) : (
                                <>
                                    <button 
                                        type="button" 
                                        className="btn-modal-cancel" 
                                        onClick={onClose}
                                        disabled={isSubmitting}
                                    >
                                        Отмена
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="btn-modal-submit"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Сохранение...' : submitText}
                                    </button>
                                </>
                            )}
                        </div>
                    </form>
                ) : (
                    <>
                        <div className="admin-modal-body">
                            {children}
                        </div>
                        {footer && (
                            <div className="admin-modal-footer">
                                {footer}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
