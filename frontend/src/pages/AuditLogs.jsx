import { useState, useEffect } from 'react';
import { auditLogsAPI, usersAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Pagination from '../components/common/Pagination';
import { 
  ClipboardDocumentListIcon,
  PencilSquareIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowRightOnRectangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [filters, setFilters] = useState({
    userId: '',
    entityType: '',
    action: '',
    search: ''
  });
  const [summary, setSummary] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [logsRes, usersRes, summaryRes] = await Promise.all([
        auditLogsAPI.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        usersAPI.getAll({ limit: 100 }),
        auditLogsAPI.getSummary(7)
      ]);
      setLogs(logsRes.data.data.logs || []);
      setPagination(prev => ({
        ...prev,
        total: logsRes.data.data.pagination.total,
        totalPages: logsRes.data.data.pagination.totalPages
      }));
      setUsers(usersRes.data.data?.users || []);
      setSummary(summaryRes.data.data);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
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
      logout: <ArrowRightOnRectangleIcon className="w-5 h-5 text-gray-500" />,
      approve: <CheckCircleIcon className="w-5 h-5 text-green-500" />,
      reject: <XCircleIcon className="w-5 h-5 text-red-500" />,
      view: <EyeIcon className="w-5 h-5 text-gray-500" />
    };
    return icons[action] || <ClipboardDocumentListIcon className="w-5 h-5 text-gray-500" />;
  };

  const getActionBadge = (action) => {
    const styles = {
      create: 'bg-green-100 text-green-700',
      update: 'bg-blue-100 text-blue-700',
      delete: 'bg-red-100 text-red-700',
      login: 'bg-purple-100 text-purple-700',
      logout: 'bg-gray-100 text-gray-700',
      approve: 'bg-green-100 text-green-700',
      reject: 'bg-red-100 text-red-700',
      view: 'bg-gray-100 text-gray-600'
    };
    return styles[action] || 'bg-gray-100 text-gray-700';
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
    const changes = log.oldValues || log.newValues;
    if (!changes) return null;

    return (
      <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm overflow-x-auto">
        <pre className="whitespace-pre-wrap text-xs text-gray-600">
          {JSON.stringify(changes, null, 2)}
        </pre>
      </div>
    );
  };

  const entityTypes = ['user', 'site', 'task', 'worker', 'expense', 'incident', 'material', 'budget'];
  const actions = ['create', 'update', 'delete', 'login', 'approve', 'reject'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Audit Logs</h1>
        <p className="text-gray-600">Track all system activity and changes</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500">Total Actions (7 days)</p>
            <p className="text-2xl font-bold text-gray-800">{summary.total}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-green-600">Creates</p>
            <p className="text-2xl font-bold text-green-700">{summary.byAction?.create || 0}</p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-blue-600">Updates</p>
            <p className="text-2xl font-bold text-blue-700">{summary.byAction?.update || 0}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg shadow-sm">
            <p className="text-sm text-red-600">Deletes</p>
            <p className="text-2xl font-bold text-red-700">{summary.byAction?.delete || 0}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <FunnelIcon className="w-5 h-5 text-gray-400" />
        
        <div className="relative flex-1 max-w-xs">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            placeholder="Search..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={filters.userId}
          onChange={(e) => setFilters(prev => ({ ...prev, userId: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Users</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>{user.name}</option>
          ))}
        </select>

        <select
          value={filters.entityType}
          onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Entities</option>
          {entityTypes.map(type => (
            <option key={type} value={type} className="capitalize">{type}</option>
          ))}
        </select>

        <select
          value={filters.action}
          onChange={(e) => setFilters(prev => ({ ...prev, action: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Actions</option>
          {actions.map(action => (
            <option key={action} value={action} className="capitalize">{action}</option>
          ))}
        </select>
      </div>

      {/* Logs Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <ClipboardDocumentListIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No audit logs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {logs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(log.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{log.user?.name || 'System'}</p>
                    <p className="text-xs text-gray-500">{log.userEmail}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${getActionBadge(log.action)}`}>
                      {getActionIcon(log.action)}
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-800 capitalize">{log.entityType}</p>
                    <p className="text-xs text-gray-500">ID: {log.entityId}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-gray-600 max-w-xs truncate">{log.entityName || log.description}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {(log.oldValues || log.newValues) && (
                      <button
                        onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {expandedLog === log.id ? 'Hide' : 'Show'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Expanded details */}
          {expandedLog && (
            <div className="px-6 py-4 bg-gray-50 border-t">
              {renderChanges(logs.find(l => l.id === expandedLog))}
            </div>
          )}
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

export default AuditLogs;

