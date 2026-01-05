import { useState, useEffect } from 'react';
import { attachmentsAPI } from '../../api/services';
import ImageGallery from './ImageGallery';
import BeforeAfter from './BeforeAfter';
import FileUpload from './FileUpload';
import LoadingSpinner from './LoadingSpinner';
import { PhotoIcon, ArrowsRightLeftIcon, PlusIcon } from '@heroicons/react/24/outline';

const SiteGallery = ({ siteId }) => {
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showUpload, setShowUpload] = useState(false);
  const [uploadCategory, setUploadCategory] = useState('progress');

  useEffect(() => {
    fetchGallery();
  }, [siteId]);

  const fetchGallery = async () => {
    try {
      setLoading(true);
      const response = await attachmentsAPI.getGallery(siteId);
      setGallery(response.data.data);
    } catch (error) {
      console.error('Error fetching gallery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadComplete = () => {
    setShowUpload(false);
    fetchGallery();
  };

  const tabs = [
    { id: 'all', label: 'All Photos', count: gallery?.before?.length + gallery?.after?.length + gallery?.progress?.length + gallery?.other?.length || 0 },
    { id: 'before-after', label: 'Before/After', icon: ArrowsRightLeftIcon },
    { id: 'progress', label: 'Progress', count: gallery?.progress?.length || 0 },
    { id: 'other', label: 'Other', count: gallery?.other?.length || 0 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const allImages = [
    ...(gallery?.before || []),
    ...(gallery?.after || []),
    ...(gallery?.progress || []),
    ...(gallery?.other || [])
  ];

  return (
    <div className="space-y-4">
      {/* Tabs and Upload Button */}
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2
                ${activeTab === tab.id 
                  ? 'bg-white shadow text-gray-800' 
                  : 'text-gray-600 hover:text-gray-800'
                }
              `}
            >
              {tab.icon && <tab.icon className="w-4 h-4" />}
              {tab.label}
              {tab.count !== undefined && (
                <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 font-medium text-sm"
        >
          <PlusIcon className="w-5 h-5" />
          Upload Photos
        </button>
      </div>

      {/* Upload Section */}
      {showUpload && (
        <div className="p-4 bg-gray-50 rounded-lg border">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Photo Category</label>
            <select
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="before">Before</option>
              <option value="after">After</option>
              <option value="progress">Progress</option>
              <option value="other">Other</option>
            </select>
          </div>
          <FileUpload
            entityType="site"
            entityId={siteId}
            category={uploadCategory}
            onUploadComplete={handleUploadComplete}
            accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] }}
          />
        </div>
      )}

      {/* Content */}
      {activeTab === 'all' && (
        allImages.length > 0 ? (
          <ImageGallery images={allImages} columns={4} />
        ) : (
          <EmptyGallery />
        )
      )}

      {activeTab === 'before-after' && (
        gallery?.before?.length > 0 && gallery?.after?.length > 0 ? (
          <BeforeAfter 
            beforeImage={gallery.before[0]} 
            afterImage={gallery.after[0]} 
            className="max-w-3xl mx-auto h-96"
          />
        ) : (
          <div className="text-center py-12 text-gray-500">
            <ArrowsRightLeftIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>Upload both "before" and "after" photos to see the comparison</p>
          </div>
        )
      )}

      {activeTab === 'progress' && (
        (gallery?.progress?.length || 0) > 0 ? (
          <ImageGallery images={gallery.progress} columns={4} />
        ) : (
          <EmptyGallery message="No progress photos yet" />
        )
      )}

      {activeTab === 'other' && (
        (gallery?.other?.length || 0) > 0 ? (
          <ImageGallery images={gallery.other} columns={4} />
        ) : (
          <EmptyGallery message="No other photos" />
        )
      )}
    </div>
  );
};

const EmptyGallery = ({ message = "No photos uploaded yet" }) => (
  <div className="text-center py-12 text-gray-500">
    <PhotoIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
    <p>{message}</p>
  </div>
);

export default SiteGallery;

