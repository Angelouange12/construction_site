import { useState, useEffect } from 'react';
import { tasksAPI, sitesAPI, workersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, ClipboardList, User, Building2 } from 'lucide-react';

const Tasks = () => {
  const { canManage } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    progress: 0,
    dueDate: '',
    siteId: '',
    workerId: ''
  });

  useEffect(() => {
    fetchData();
  }, [page, search, statusFilter, siteFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (siteFilter) params.siteId = siteFilter;

      const [tasksRes, sitesRes, workersRes] = await Promise.all([
        tasksAPI.getAll(params),
        sitesAPI.getAll({ limit: 100 }),
        workersAPI.getAll({ limit: 100 })
      ]);

      setTasks(tasksRes.data.data);
      setPagination(tasksRes.data.pagination);
      setSites(sitesRes.data.data);
      setWorkers(workersRes.data.data);
    } catch (err) {
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = { ...formData };
      if (!data.workerId) delete data.workerId;
      
      if (editingTask) {
        await tasksAPI.update(editingTask.id, data);
        setSuccess('Task updated successfully');
      } else {
        await tasksAPI.create(data);
        setSuccess('Task created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      progress: task.progress,
      dueDate: task.dueDate || '',
      siteId: task.siteId,
      workerId: task.workerId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await tasksAPI.delete(deletingId);
      setSuccess('Task deleted successfully');
      setShowDeleteDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete task');
    }
  };

  const resetForm = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      progress: 0,
      dueDate: '',
      siteId: '',
      workerId: ''
    });
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-slate-600',
      medium: 'text-amber-600',
      high: 'text-red-600'
    };
    return colors[priority] || 'text-slate-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Tasks</h1>
          <p className="text-slate-500 mt-1">Manage and track your construction tasks</p>
        </div>
        {canManage() && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Task
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full md:w-40"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            className="input w-full md:w-48"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
          >
            <option value="">All Sites</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No tasks found"
          message="Create your first task to start tracking progress."
          action={
            canManage() && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Add Task
              </button>
            )
          }
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Site</th>
                  <th>Assigned To</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Progress</th>
                  <th>Due Date</th>
                  {canManage() && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td>
                      <p className="font-medium text-slate-900">{task.title}</p>
                      {task.description && (
                        <p className="text-xs text-slate-500 truncate max-w-xs">{task.description}</p>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{task.site?.name || '-'}</span>
                      </div>
                    </td>
                    <td>
                      {task.worker ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-primary-600" />
                          </div>
                          <span>{task.worker.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td>
                      <span className={`font-medium capitalize ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={task.status} />
                    </td>
                    <td className="min-w-[120px]">
                      <ProgressBar value={task.progress} size="sm" color="auto" />
                    </td>
                    <td>
                      {task.dueDate || '-'}
                    </td>
                    {canManage() && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(task)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeletingId(task.id); setShowDeleteDialog(true); }}
                            className="p-1.5 rounded hover:bg-red-100 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Title *</label>
              <input
                type="text"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[80px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Site *</label>
              <select
                className="input"
                value={formData.siteId}
                onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
                required
              >
                <option value="">Select site...</option>
                {sites.map(site => (
                  <option key={site.id} value={site.id}>{site.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Assign To</label>
              <select
                className="input"
                value={formData.workerId}
                onChange={(e) => setFormData({ ...formData, workerId: e.target.value })}
              >
                <option value="">Unassigned</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>{worker.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Priority</label>
              <select
                className="input"
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="label">Progress (%)</label>
              <input
                type="number"
                className="input"
                value={formData.progress}
                onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value) || 0 })}
                min="0"
                max="100"
              />
            </div>

            <div>
              <label className="label">Due Date</label>
              <input
                type="date"
                className="input"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
      />
    </div>
  );
};

export default Tasks;

