import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, XMarkIcon, PhotoIcon, DocumentIcon } from '@heroicons/react/24/outline';
import api from '../../api/axios';

const FileUpload = ({ 
  entityType, 
  entityId, 
  category = 'other', 
  onUploadComplete, 
  maxFiles = 10,
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
  }
}) => {
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [error, setError] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    setFiles(prev => [
      ...prev, 
      ...acceptedFiles.map(file => Object.assign(file, {
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
      }))
    ]);
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles,
    maxSize: 10 * 1024 * 1024 // 10MB
  });

  const removeFile = (index) => {
    setFiles(prev => {
      const newFiles = [...prev];
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const uploadFiles = async () => {
    if (files.length === 0) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    formData.append('category', category);

    try {
      const response = await api.post(`/attachments/${entityType}/${entityId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress({ percent: percentCompleted });
        }
      });

      setFiles([]);
      setUploadProgress({});
      
      if (onUploadComplete) {
        onUploadComplete(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const getFileIcon = (file) => {
    if (file.type.startsWith('image/')) {
      return file.preview ? (
        <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded" />
      ) : (
        <PhotoIcon className="w-8 h-8 text-gray-400" />
      );
    }
    return <DocumentIcon className="w-8 h-8 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={`
          border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${isDragActive 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400 bg-gray-50'
          }
        `}
      >
        <input {...getInputProps()} />
        <CloudArrowUpIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
        {isDragActive ? (
          <p className="text-blue-600 font-medium">Drop files here...</p>
        ) : (
          <>
            <p className="text-gray-600 font-medium">Drag & drop files here</p>
            <p className="text-gray-400 text-sm mt-1">or click to browse</p>
            <p className="text-gray-400 text-xs mt-2">Max 10MB per file. Images and documents accepted.</p>
          </>
        )}
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">{files.length} file(s) selected</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {files.map((file, index) => (
              <div 
                key={index} 
                className="relative bg-white border rounded-lg p-2 flex items-center gap-2"
              >
                <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center bg-gray-100 rounded">
                  {getFileIcon(file)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-gray-700 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="absolute -top-1 -right-1 p-1 bg-red-100 rounded-full text-red-600 hover:bg-red-200"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
      )}

      {/* Upload Progress */}
      {uploading && uploadProgress.percent !== undefined && (
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Uploading...</span>
            <span>{uploadProgress.percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all" 
              style={{ width: `${uploadProgress.percent}%` }}
            />
          </div>
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && (
        <button
          onClick={uploadFiles}
          disabled={uploading}
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg font-medium 
                     hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {uploading ? 'Uploading...' : `Upload ${files.length} file(s)`}
        </button>
      )}
    </div>
  );
};

export default FileUpload;

