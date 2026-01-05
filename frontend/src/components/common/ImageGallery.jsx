import { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/outline';

const ImageGallery = ({ images, columns = 4 }) => {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No images to display
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-4',
    5: 'grid-cols-2 md:grid-cols-5'
  };

  return (
    <>
      {/* Thumbnail Grid */}
      <div className={`grid ${gridCols[columns] || 'grid-cols-4'} gap-3`}>
        {images.map((image, index) => (
          <div 
            key={image.id || index}
            onClick={() => openLightbox(index)}
            className="relative aspect-square cursor-pointer group overflow-hidden rounded-lg 
                       bg-gray-100 shadow-sm hover:shadow-md transition-shadow"
          >
            <img
              src={image.thumbnailUrl || image.url}
              alt={image.originalName || image.description || `Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
              <ArrowsPointingOutIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            {image.category && (
              <span className="absolute top-2 left-2 px-2 py-0.5 bg-black/60 text-white text-xs rounded">
                {image.category}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white transition-colors z-10"
          >
            <XMarkIcon className="w-8 h-8" />
          </button>

          {/* Navigation - Previous */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToPrevious(); }}
              className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/80 
                         hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ChevronLeftIcon className="w-10 h-10" />
            </button>
          )}

          {/* Navigation - Next */}
          {images.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); goToNext(); }}
              className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/80 
                         hover:text-white hover:bg-white/10 rounded-full transition-all"
            >
              <ChevronRightIcon className="w-10 h-10" />
            </button>
          )}

          {/* Image */}
          <div 
            className="max-w-[90vw] max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[currentIndex].url}
              alt={images[currentIndex].originalName || images[currentIndex].description || ''}
              className="max-w-full max-h-[80vh] object-contain"
            />
            
            {/* Caption */}
            <div className="mt-4 text-center text-white">
              <p className="text-sm opacity-60">
                {currentIndex + 1} / {images.length}
              </p>
              {images[currentIndex].description && (
                <p className="mt-1 text-sm">{images[currentIndex].description}</p>
              )}
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 max-w-[80vw] overflow-x-auto p-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentIndex(index); }}
                  className={`
                    w-16 h-16 flex-shrink-0 rounded overflow-hidden transition-all
                    ${index === currentIndex ? 'ring-2 ring-white scale-105' : 'opacity-50 hover:opacity-80'}
                  `}
                >
                  <img
                    src={image.thumbnailUrl || image.url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default ImageGallery;

