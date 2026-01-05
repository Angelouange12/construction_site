import { CheckCircleIcon, ClockIcon, ExclamationCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const Timeline = ({ items = [], orientation = 'vertical' }) => {
  const getStatusIcon = (status) => {
    const icons = {
      completed: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
      in_progress: <ClockIcon className="w-6 h-6 text-blue-500" />,
      pending: <ClockIcon className="w-6 h-6 text-gray-400" />,
      delayed: <ExclamationCircleIcon className="w-6 h-6 text-orange-500" />,
      cancelled: <XCircleIcon className="w-6 h-6 text-red-500" />,
      default: <div className="w-3 h-3 bg-gray-400 rounded-full" />
    };
    return icons[status] || icons.default;
  };

  const getStatusColor = (status) => {
    const colors = {
      completed: 'bg-green-500',
      in_progress: 'bg-blue-500',
      pending: 'bg-gray-300',
      delayed: 'bg-orange-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-400';
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (orientation === 'horizontal') {
    return (
      <div className="relative">
        {/* Horizontal line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200" />
        
        <div className="flex justify-between relative">
          {items.map((item, index) => (
            <div key={item.id || index} className="flex flex-col items-center flex-1">
              {/* Node */}
              <div className={`w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 ${
                item.status === 'completed' ? 'border-green-500' :
                item.status === 'in_progress' ? 'border-blue-500' :
                'border-gray-300'
              } z-10`}>
                {getStatusIcon(item.status)}
              </div>
              
              {/* Content */}
              <div className="mt-3 text-center max-w-[120px]">
                <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                {item.date && (
                  <p className="text-xs text-gray-500 mt-0.5">{formatDate(item.date)}</p>
                )}
                {item.description && (
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Vertical timeline
  return (
    <div className="relative">
      {items.map((item, index) => (
        <div key={item.id || index} className="relative pb-8 last:pb-0">
          {/* Connecting line */}
          {index < items.length - 1 && (
            <div 
              className={`absolute left-5 top-10 bottom-0 w-0.5 ${getStatusColor(items[index + 1]?.status || 'pending')}`} 
            />
          )}
          
          <div className="flex gap-4">
            {/* Icon */}
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
              bg-white border-2 z-10
              ${item.status === 'completed' ? 'border-green-500' :
                item.status === 'in_progress' ? 'border-blue-500' :
                item.status === 'delayed' ? 'border-orange-500' :
                'border-gray-300'}
            `}>
              {getStatusIcon(item.status)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0 pt-1.5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800">{item.title}</h4>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-0.5">{item.description}</p>
                  )}
                </div>
                {item.date && (
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {formatDate(item.date)}
                  </span>
                )}
              </div>
              
              {/* Additional details */}
              {item.details && (
                <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                  {typeof item.details === 'string' ? (
                    <p className="text-sm text-gray-600">{item.details}</p>
                  ) : (
                    item.details
                  )}
                </div>
              )}

              {/* Tags */}
              {item.tags && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Timeline;

