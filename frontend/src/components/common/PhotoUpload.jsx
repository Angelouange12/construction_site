import { useState, useRef } from 'react';
import { Camera, Upload, X, Image } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const PhotoUpload = ({ 
  currentPhoto, 
  onUpload, 
  onRemove,
  size = 'md',
  shape = 'rounded',
  placeholder = null,
  label = 'Photo',
  accept = 'image/*',
  maxSize = 5, // MB
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const shapeClasses = {
    rounded: 'rounded-xl',
    circle: 'rounded-full',
    square: 'rounded-lg'
  };

  const getPhotoUrl = () => {
    if (preview) return preview;
    if (currentPhoto) {
      // If it's already a full URL, use it as is
      if (currentPhoto.startsWith('http')) return currentPhoto;
      // Otherwise, prepend API_URL
      return `${API_URL}${currentPhoto}`;
    }
    return null;
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Validate file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`L'image ne doit pas dépasser ${maxSize} Mo`);
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload if callback provided
    if (onUpload) {
      setLoading(true);
      try {
        await onUpload(file);
      } catch (err) {
        setError('Échec du téléchargement');
        setPreview(null);
      } finally {
        setLoading(false);
      }
    }

    // Reset input
    e.target.value = '';
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    setPreview(null);
    if (onRemove) {
      await onRemove();
    }
  };

  const photoUrl = getPhotoUrl();

  return (
    <div className="flex flex-col items-center gap-2">
      {label && (
        <label className="text-sm font-medium text-slate-700">{label}</label>
      )}
      
      <div 
        className={`
          relative ${sizeClasses[size]} ${shapeClasses[shape]} 
          overflow-hidden cursor-pointer group
          border-2 border-dashed border-slate-300 hover:border-blue-500
          transition-colors bg-slate-50
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onClick={handleClick}
      >
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <LoadingSpinner size="sm" />
          </div>
        ) : photoUrl ? (
          <>
            <img 
              src={photoUrl} 
              alt={label}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '';
                setPreview(null);
              }}
            />
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Camera className="w-6 h-6 text-white" />
            </div>
            {onRemove && (
              <button
                onClick={handleRemove}
                className="absolute top-1 right-1 p-1 bg-red-500 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 group-hover:text-blue-500 transition-colors">
            {placeholder || (
              <>
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Ajouter</span>
              </>
            )}
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />
      </div>

      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
    </div>
  );
};

export default PhotoUpload;

