import { useState, useEffect } from 'react';
import { 
  PencilSquareIcon, 
  TrashIcon, 
  PlusCircleIcon, 
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import api from '../../api/axios';

const AuditHistory = ({ entityType, entityId, limit = 20 }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    if (entityType && entityId) {
      fetchHistory();
    }
  }, [entityType, entityId]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/audit-logs/entity/${entityType}/${entityId}`);
      setLogs(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      create: <PlusCircleIcon className="w-5 h-5 text-green-500" />,
      update: <PencilSquareIcon className="w-5 h-5 text-blue-500" />,
      delete: <TrashIcon className="w-5 h-5 text-red-500" />,
      login: <ArrowRightOnRectangleIcon className="w-5 h-5 text-purple-500" />,
      approve: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      reject: <XCircleIcon className="w-5 h-5 text-red-500" />,
      view: <EyeIcon className="w-5 h-5 text-gray-500" />
    };
    return icons[action] || <PencilSquareIcon className="w-5 h-5 text-gray-500" />;
  };

  const getActionLabel = (action) => {
    const labels = {
      create: 'Created',
      update: 'Updated',
      delete: 'Deleted',
      login: 'Logged in',
      approve: 'Approved',
      reject: 'Rejected',
      view: 'Viewed'
    };
    return labels[action] || action;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderChanges = (log) => {
    if (!log.oldValues && !log.newValues) return null;

    const changes = log.oldValues || log.newValues || {};
    
    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm">
        <p className="font-medium text-gray-700 mb-2">Changes:</p>
        <div className="space-y-1">
          {Object.entries(changes).map(([key, value]) => {
            if (typeof value === 'object' && value !== null) {
              return (
                <div key={key} className="flex gap-2">
                  <span className="font-medium text-gray-600 min-w-[100px]">{key}:</span>
                  <div className="flex-1">
                    {value.old !== undefined && (
                      <span className="text-red-600 line-through mr-2">{String(value.old)}</span>
                    )}
                    {value.new !== undefined && (
                      <span className="text-green-600">{String(value.new)}</span>
                    )}
                  </div>
                </div>
              );
            }
            return (
              <div key={key} className="flex gap-2">
                <span className="font-medium text-gray-600 min-w-[100px]">{key}:</span>
                <span className="text-gray-800">{String(value)}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-red-600">
        <p>{error}</p>
        <button 
          onClick={fetchHistory}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          Retry
        </button>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <PencilSquareIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>No history available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.slice(0, limit).map((log) => (
        <div 
          key={log.id}
          className="relative pb-4 last:pb-0"
        >
          {/* Connecting line */}
          <div className="absolute left-5 top-10 bottom-0 w-0.5 bg-gray-200 last:hidden" />
          
          <div className="flex gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 z-10">
              {getActionIcon(log.action)}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm">
                    <span className="font-medium text-gray-800">
                      {log.user?.name || log.userEmail || 'System'}
                    </span>
                    <span className="text-gray-600 ml-1">
                      {getActionLabel(log.action).toLowerCase()} this {log.entityType}
                    </span>
                  </p>
                  {log.description && log.description !== `${log.action} ${log.entityType}: ${log.entityName}` && (
                    <p className="text-sm text-gray-500 mt-0.5">{log.description}</p>
                  )}
                </div>
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {formatDate(log.createdAt)}
                </span>
              </div>

              {/* Show changes toggle */}
              {(log.oldValues || log.newValues) && (
                <button
                  onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  className="text-xs text-blue-600 hover:underline mt-1"
                >
                  {expandedLog === log.id ? 'Hide changes' : 'Show changes'}
                </button>
              )}

              {/* Expanded changes */}
              {expandedLog === log.id && renderChanges(log)}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AuditHistory;

