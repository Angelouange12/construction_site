import { Link } from 'react-router-dom';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon, 
  InformationCircleIcon,
  XMarkIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';

const AlertCard = ({ 
  alert, 
  onDismiss, 
  showSuggestion = true,
  compact = false 
}) => {
  const severityConfig = {
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: ExclamationCircleIcon,
      iconColor: 'text-red-600',
      title: 'text-red-800',
      text: 'text-red-700'
    },
    high: {
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-orange-600',
      title: 'text-orange-800',
      text: 'text-orange-700'
    },
    medium: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
      title: 'text-yellow-800',
      text: 'text-yellow-700'
    },
    low: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: InformationCircleIcon,
      iconColor: 'text-blue-600',
      title: 'text-blue-800',
      text: 'text-blue-700'
    }
  };

  const config = severityConfig[alert.severity] || severityConfig.medium;
  const Icon = config.icon;

  if (compact) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg ${config.bg} ${config.border} border`}>
        <Icon className={`w-5 h-5 flex-shrink-0 ${config.iconColor}`} />
        <div className="flex-1 min-w-0">
          <p className={`text-sm font-medium ${config.title}`}>{alert.title}</p>
        </div>
        {alert.link && (
          <Link 
            to={alert.link}
            className="text-xs font-medium text-gray-600 hover:text-gray-800 whitespace-nowrap"
          >
            View →
          </Link>
        )}
      </div>
    );
  }

  return (
    <div className={`p-4 rounded-lg ${config.bg} ${config.border} border`}>
      <div className="flex items-start gap-3">
        <Icon className={`w-6 h-6 flex-shrink-0 ${config.iconColor}`} />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-semibold ${config.title}`}>{alert.title}</h4>
              <p className={`text-sm mt-1 ${config.text}`}>{alert.message}</p>
            </div>
            
            {onDismiss && (
              <button
                onClick={() => onDismiss(alert)}
                className="p-1 hover:bg-black/5 rounded transition-colors"
              >
                <XMarkIcon className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Suggestion */}
          {showSuggestion && alert.suggestion && (
            <div className="mt-3 flex items-start gap-2 p-2 bg-white/60 rounded-lg">
              <LightBulbIcon className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <p className="text-sm text-gray-700">{alert.suggestion}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 mt-3">
            {alert.link && (
              <Link 
                to={alert.link}
                className="text-sm font-medium text-gray-700 hover:text-gray-900 bg-white/80 
                           px-3 py-1.5 rounded-lg hover:bg-white transition-colors"
              >
                View Details
              </Link>
            )}
            {alert.entityType && alert.siteName && (
              <span className="text-xs text-gray-500">
                Site: {alert.siteName}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Alert list component
export const AlertList = ({ alerts = [], title, onDismiss, maxItems = 5, compact = false }) => {
  const displayedAlerts = alerts.slice(0, maxItems);

  if (alerts.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No alerts at this time</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          {alerts.length > maxItems && (
            <span className="text-sm text-gray-500">
              +{alerts.length - maxItems} more
            </span>
          )}
        </div>
      )}
      
      {displayedAlerts.map((alert, index) => (
        <AlertCard 
          key={alert.id || index} 
          alert={alert} 
          onDismiss={onDismiss}
          compact={compact}
        />
      ))}
    </div>
  );
};

export default AlertCard;

