import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

const BeforeAfter = ({ beforeImage, afterImage, className = '' }) => {
  if (!beforeImage || !afterImage) {
    return (
      <div className={`flex gap-4 ${className}`}>
        {beforeImage && (
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">Before</p>
            <img 
              src={beforeImage.url || beforeImage} 
              alt="Before" 
              className="w-full rounded-lg"
            />
          </div>
        )}
        {afterImage && (
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600 mb-2">After</p>
            <img 
              src={afterImage.url || afterImage} 
              alt="After" 
              className="w-full rounded-lg"
            />
          </div>
        )}
        {!beforeImage && !afterImage && (
          <div className="text-center py-8 text-gray-500">
            No before/after images available
          </div>
        )}
      </div>
    );
  }

  const beforeUrl = typeof beforeImage === 'string' ? beforeImage : beforeImage.url;
  const afterUrl = typeof afterImage === 'string' ? afterImage : afterImage.url;

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      <ReactCompareSlider
        itemOne={
          <ReactCompareSliderImage
            src={beforeUrl}
            alt="Before"
            style={{ objectFit: 'cover' }}
          />
        }
        itemTwo={
          <ReactCompareSliderImage
            src={afterUrl}
            alt="After"
            style={{ objectFit: 'cover' }}
          />
        }
        handle={
          <div className="w-1 h-full bg-white shadow-lg flex items-center justify-center cursor-ew-resize">
            <div className="w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
              </svg>
            </div>
          </div>
        }
      />
      
      {/* Labels */}
      <div className="absolute top-4 left-4 px-3 py-1 bg-black/60 text-white text-sm rounded">
        Before
      </div>
      <div className="absolute top-4 right-4 px-3 py-1 bg-black/60 text-white text-sm rounded">
        After
      </div>
    </div>
  );
};

export default BeforeAfter;

