import { useState, useEffect } from 'react';
import { notificationsAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { 
  BellIcon, 
  CheckIcon, 
  TrashIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [filter, setFilter] = useState('all'); // all, unread

  useEffect(() => {
    fetchNotifications();
  }, [pagination.page, filter]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationsAPI.getAll({
        page: pagination.page,
        limit: pagination.limit,
        unreadOnly: filter === 'unread'
      });
      setNotifications(response.data.data.notifications);
      setPagination(prev => ({
        ...prev,
        total: response.data.data.pagination.total,
        totalPages: response.data.data.pagination.totalPages
      }));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationsAPI.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await notificationsAPI.delete(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getTypeStyles = (type) => {
    const styles = {
      task_assigned: { bg: 'bg-blue-100', text: 'text-blue-700' },
      task_completed: { bg: 'bg-green-100', text: 'text-green-700' },
      incident_reported: { bg: 'bg-red-100', text: 'text-red-700' },
      incident_resolved: { bg: 'bg-green-100', text: 'text-green-700' },
      low_stock: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
      expense_pending: { bg: 'bg-purple-100', text: 'text-purple-700' },
      expense_approved: { bg: 'bg-green-100', text: 'text-green-700' },
      site_delayed: { bg: 'bg-orange-100', text: 'text-orange-700' },
      budget_exceeded: { bg: 'bg-red-100', text: 'text-red-700' }
    };
    return styles[type] || { bg: 'bg-gray-100', text: 'text-gray-700' };
  };

  const getPriorityDot = (priority) => {
    const colors = {
      urgent: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-green-500'
    };
    return colors[priority] || 'bg-gray-400';
  };

  const formatTime = (date) => {
    const now = new Date();
    const then = new Date(date);
    const diff = Math.floor((now - then) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return then.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 
                       rounded-lg transition-colors"
          >
            <CheckIcon className="w-5 h-5" />
            Mark all as read
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        <div className="flex gap-2">
          {['all', 'unread'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={BellIcon}
          title="No notifications"
          description={filter === 'unread' ? 'No unread notifications' : 'You have no notifications yet'}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-sm divide-y">
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`p-4 hover:bg-gray-50 transition-colors ${
                !notification.isRead ? 'bg-blue-50/50' : ''
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Priority indicator */}
                <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${getPriorityDot(notification.priority)}`} />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded ${
                        getTypeStyles(notification.type).bg
                      } ${getTypeStyles(notification.type).text}`}>
                        {notification.type.replace(/_/g, ' ')}
                      </span>
                      <h3 className="font-semibold text-gray-800 mt-1">{notification.title}</h3>
                      <p className="text-gray-600 mt-0.5">{notification.message}</p>
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-3">
                    {notification.link && (
                      <Link
                        to={notification.link}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        View details →
                      </Link>
                    )}
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                      >
                        <CheckIcon className="w-4 h-4" />
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                    >
                      <TrashIcon className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination(prev => ({ ...prev, page }))}
        />
      )}
    </div>
  );
};

export default Notifications;

