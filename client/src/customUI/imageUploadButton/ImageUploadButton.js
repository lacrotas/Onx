import { useState, useRef } from 'react';
import './ImageUploadButton.scss';

const ImageUploadButton = ({
  onImageSelect,
  buttonText = "Загрузить изображение",
  acceptedTypes = "image/*",
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB
  className = "",
  disabled = false
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (files) => {
    const file = multiple ? files : files[0];
    
    if (!file) return;

    // Проверка типа файла
    if (!file.type.startsWith('image/')) {
      setError('Пожалуйста, выберите файл изображения');
      return;
    }

    // Проверка размера файла
    if (file.size > maxSize) {
      setError(`Файл слишком большой. Максимальный размер: ${maxSize / 1024 / 1024}MB`);
      return;
    }

    setError('');

    // Создание preview
    if (!multiple) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }

    // Передача файла в родительский компонент
    onImageSelect?.(file);
  };

  const handleInputChange = (e) => {
    handleFileSelect(Array.from(e.target.files));
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const removeImage = () => {
    setPreviewUrl(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onImageSelect?.(null);
  };

  return (
    <div className={`image-upload-container ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleInputChange}
        accept={acceptedTypes}
        multiple={multiple}
        style={{ display: 'none' }}
      />
      
      <div
        className={`image-upload-area ${isDragging ? 'dragging' : ''} ${previewUrl ? 'has-preview' : ''} ${disabled ? 'disabled' : ''}`}
        onClick={disabled ? undefined : handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {previewUrl ? (
          <div className="image-preview">
            <img src={previewUrl} alt="Preview" className="preview-image" />
            <div className="preview-overlay">
              <span className="change-text">Изменить фото</span>
            </div>
          </div>
        ) : (
          <div className="upload-placeholder">
            <div className="upload-icon">📁</div>
            <div className="upload-text">
              <span className="main-text">{buttonText}</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

    </div>
  );
};

export default ImageUploadButton;