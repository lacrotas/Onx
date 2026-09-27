import React, { useRef } from 'react';
import { FiUploadCloud, FiTrash2, FiImage } from 'react-icons/fi';
import './ImageUploader.scss';

export function ImageUploader({
    value,              // File object or URL string
    onChange,           // (file, previewUrl) => void
    onRemove,           // () => void
    label = "Изображение",
    accept = "image/*",
    className = ""
}) {
    const inputRef = useRef(null);

    const previewUrl = React.useMemo(() => {
        if (!value) return null;
        if (typeof value === 'string') {
            if (value.startsWith('http') || value.startsWith('blob:') || value.startsWith('data:')) {
                return value;
            }
            return `${process.env.REACT_APP_API_URL || ''}static/images/${value}`;
        }
        if (value instanceof File) {
            return URL.createObjectURL(value);
        }
        return null;
    }, [value]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            onChange(file, url);
        }
    };

    const handleRemove = (e) => {
        e.stopPropagation();
        if (inputRef.current) inputRef.current.value = '';
        if (onRemove) onRemove();
    };

    return (
        <div className={`admin-image-uploader ${className}`}>
            {label && <label className="admin-form-label">{label}</label>}

            <div 
                className={`upload-dropzone ${previewUrl ? 'has-preview' : ''}`}
                onClick={() => inputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    accept={accept}
                    style={{ display: 'none' }}
                />

                {previewUrl ? (
                    <div className="preview-container">
                        <img src={previewUrl} alt="Preview" className="preview-img" />
                        <div className="preview-overlay">
                            <span className="overlay-text">Нажмите, чтобы заменить</span>
                            {onRemove && (
                                <button 
                                    type="button" 
                                    className="btn-remove-image" 
                                    onClick={handleRemove}
                                    title="Удалить картинку"
                                >
                                    <FiTrash2 />
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="empty-dropzone">
                        <FiUploadCloud className="upload-icon" />
                        <div className="upload-text">
                            <span className="upload-primary">Нажмите для выбора файла</span>
                            <span className="upload-secondary">PNG, JPG, WEBP до 10MB</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
