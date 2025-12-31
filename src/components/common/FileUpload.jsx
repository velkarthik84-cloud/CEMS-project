import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '../../utils/constants';

const FileUpload = ({
  label,
  accept = 'image/*',
  maxSize = MAX_FILE_SIZE,
  onChange,
  value,
  error,
  helperText,
  className = '',
  required = false,
  disabled = false,
  preview = true,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(value || null);
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    if (file.size > maxSize) {
      alert(`File size must be less than ${maxSize / 1024 / 1024}MB`);
      return;
    }

    // Create preview for images
    if (file.type.startsWith('image/') && preview) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }

    onChange?.(file);
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange?.(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const isImage = previewUrl?.startsWith('data:image') || previewUrl?.includes('firebasestorage');

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-1.5">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </label>
      )}

      {previewUrl ? (
        <div className="relative">
          {isImage ? (
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={previewUrl}
                alt="Preview"
                className="w-full h-48 object-cover"
              />
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-primary" />
                <span className="text-sm text-text-primary truncate">
                  {typeof value === 'object' ? value.name : 'Uploaded file'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-text-secondary" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-8
            transition-all duration-200 cursor-pointer
            ${dragActive
              ? 'border-primary bg-primary/5'
              : 'border-gray-200 hover:border-primary hover:bg-gray-50'
            }
            ${error ? 'border-error' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            onChange={handleChange}
            disabled={disabled}
            className="hidden"
          />

          <div className="flex flex-col items-center text-center">
            <div className="p-3 bg-primary/10 rounded-full mb-3">
              {accept.includes('image') ? (
                <ImageIcon className="w-6 h-6 text-primary" />
              ) : (
                <Upload className="w-6 h-6 text-primary" />
              )}
            </div>
            <p className="text-sm font-medium text-text-primary mb-1">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-text-secondary">
              {accept.includes('image')
                ? 'PNG, JPG, GIF or WEBP (max 5MB)'
                : 'PDF, PNG, JPG (max 5MB)'}
            </p>
          </div>
        </div>
      )}

      {(error || helperText) && (
        <div className={`flex items-center mt-1.5 text-sm ${error ? 'text-error' : 'text-text-secondary'}`}>
          {error && <AlertCircle className="w-4 h-4 mr-1" />}
          {error || helperText}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
