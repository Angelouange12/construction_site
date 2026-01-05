import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { alertsAPI } from '../../api/services';
import { AlertList } from './AlertCard';
import { 
  ExclamationTriangleIcon, 
  ExclamationCircleIcon,
  ArrowPathIcon 
} from '@heroicons/react/24/outline';

const DashboardAlerts = ({ maxAlerts = 5 }) => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const response = await alertsAPI.getAll();
      setAlerts(response.data.data);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Alerts</h2>
        </div>
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="text-center text-red-600">
          <p>{error}</p>
          <button onClick={fetchAlerts} className="mt-2 text-blue-600 text-sm hover:underline">
            Retry
          </button>
        </div>
      </div>
    );
  }

  const hasCritical = alerts?.summary?.critical > 0;
  const hasHigh = alerts?.summary?.high > 0;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className={`px-6 py-4 flex items-center justify-between ${
        hasCritical ? 'bg-red-50' : hasHigh ? 'bg-orange-50' : 'bg-gray-50'
      }`}>
        <div className="flex items-center gap-3">
          {hasCritical ? (
            <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
          ) : hasHigh ? (
            <ExclamationTriangleIcon className="w-6 h-6 text-orange-600" />
          ) : (
            <ExclamationTriangleIcon className="w-6 h-6 text-gray-400" />
          )}
          <div>
            <h2 className="font-semibold text-gray-800">Active Alerts</h2>
            <p className="text-sm text-gray-500">
              {alerts?.summary?.total || 0} alerts requiring attention
            </p>
          </div>
        </div>
        <button
          onClick={fetchAlerts}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-white/50 rounded-lg transition-colors"
        >
          <ArrowPathIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Summary badges */}
      {alerts?.summary && (
        <div className="px-6 py-3 border-b flex items-center gap-4">
          {alerts.summary.critical > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-red-500 rounded-full" />
              {alerts.summary.critical} Critical
            </span>
          )}
          {alerts.summary.high > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-orange-500 rounded-full" />
              {alerts.summary.high} High
            </span>
          )}
          {alerts.summary.medium > 0 && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
              <span className="w-2 h-2 bg-yellow-500 rounded-full" />
              {alerts.summary.medium} Medium
            </span>
          )}
        </div>
      )}

      {/* Alerts list */}
      <div className="p-4">
        {alerts?.all?.length > 0 ? (
          <AlertList 
            alerts={alerts.all} 
            maxItems={maxAlerts} 
            compact={false}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            <ExclamationTriangleIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">All Clear!</p>
            <p className="text-sm">No active alerts at this time</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {alerts?.all?.length > maxAlerts && (
        <div className="px-6 py-3 border-t bg-gray-50 text-center">
          <Link
            to="/reports"
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View all {alerts.summary.total} alerts →
          </Link>
        </div>
      )}
    </div>
  );
};

export default DashboardAlerts;

