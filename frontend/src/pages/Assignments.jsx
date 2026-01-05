import { useState, useEffect } from 'react';
import { assignmentsAPI, workersAPI, sitesAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Timeline from '../components/common/Timeline';
import { 
  UserGroupIcon, 
  PlusIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Assignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ assigneeType: '', entityType: '', status: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModal, setHistoryModal] = useState(false);
  const [reassignModal, setReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [assignmentHistory, setAssignmentHistory] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [formData, setFormData] = useState({
    assigneeType: 'worker',
    assigneeId: '',
    entityType: 'site',
    entityId: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    hoursPerDay: 8,
    notes: ''
  });
  const [reassignData, setReassignData] = useState({
    newAssigneeId: '',
    reason: ''
  });

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assignmentsRes, workersRes, sitesRes] = await Promise.all([
        assignmentsAPI.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        workersAPI.getAll({ limit: 100 }),
        sitesAPI.getAll({ limit: 100 })
      ]);
      setAssignments(assignmentsRes.data.data.assignments || []);
      setPagination(prev => ({
        ...prev,
        total: assignmentsRes.data.data.pagination.total,
        totalPages: assignmentsRes.data.data.pagination.totalPages
      }));
      setWorkers(workersRes.data.data?.workers || []);
      setSites(sitesRes.data.data?.sites || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const checkConflicts = async () => {
    try {
      const response = await assignmentsAPI.checkConflicts(formData);
      setConflicts(response.data.data.conflicts || []);
      return response.data.data.hasConflicts;
    } catch (err) {
      console.error('Error checking conflicts:', err);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const hasConflicts = await checkConflicts();
    if (hasConflicts) {
      setError('Assignment conflicts detected. Please resolve before creating.');
      return;
    }

    try {
      await assignmentsAPI.create(formData);
      setSuccess('Assignment created successfully');
      setIsModalOpen(false);
      setFormData({
        assigneeType: 'worker',
        assigneeId: '',
        entityType: 'site',
        entityId: '',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        hoursPerDay: 8,
        notes: ''
      });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create assignment');
    }
  };

  const handleComplete = async (id) => {
    try {
      await assignmentsAPI.complete(id);
      setSuccess('Assignment completed');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to complete');
    }
  };

  const handleCancel = async (id, reason) => {
    try {
      await assignmentsAPI.cancel(id, reason || 'Cancelled by user');
      setSuccess('Assignment cancelled');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to cancel');
    }
  };

  const handleReassign = async () => {
    if (!selectedAssignment || !reassignData.newAssigneeId) return;
    
    try {
      await assignmentsAPI.reassign(
        selectedAssignment.id,
        reassignData.newAssigneeId,
        reassignData.reason
      );
      setSuccess('Reassignment successful');
      setReassignModal(false);
      setReassignData({ newAssigneeId: '', reason: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reassign');
    }
  };

  const viewHistory = async (assignment) => {
    try {
      const response = await assignmentsAPI.getHistory(assignment.id);
      setAssignmentHistory(response.data.data || []);
      setSelectedAssignment(assignment);
      setHistoryModal(true);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load history');
    }
  };

  const getAssigneeName = (assignment) => {
    if (assignment.assigneeType === 'worker') {
      const worker = workers.find(w => w.id === assignment.assigneeId);
      return worker?.name || `Worker #${assignment.assigneeId}`;
    }
    return `${assignment.assigneeType} #${assignment.assigneeId}`;
  };

  const getEntityName = (assignment) => {
    if (assignment.entityType === 'site') {
      const site = sites.find(s => s.id === assignment.entityId);
      return site?.name || `Site #${assignment.entityId}`;
    }
    return `${assignment.entityType} #${assignment.entityId}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Assignments</h1>
          <p className="text-gray-600">Manage worker and resource assignments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 
                       bg-white border rounded-lg hover:bg-gray-50"
          >
            <ArrowPathIcon className="w-5 h-5" />
            Refresh
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                       hover:bg-blue-700 font-medium"
          >
            <PlusIcon className="w-5 h-5" />
            New Assignment
          </button>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <select
          value={filters.assigneeType}
          onChange={(e) => setFilters(prev => ({ ...prev, assigneeType: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Assignee Types</option>
          <option value="worker">Workers</option>
          <option value="material">Materials</option>
        </select>

        <select
          value={filters.entityType}
          onChange={(e) => setFilters(prev => ({ ...prev, entityType: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Entity Types</option>
          <option value="site">Sites</option>
          <option value="task">Tasks</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="reassigned">Reassigned</option>
        </select>
      </div>

      {/* Assignments Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <UserGroupIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No assignments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assignee</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours/Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {assignments.map(assignment => (
                <tr key={assignment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{getAssigneeName(assignment)}</p>
                    <p className="text-xs text-gray-500 capitalize">{assignment.assigneeType}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{getEntityName(assignment)}</p>
                    <p className="text-xs text-gray-500 capitalize">{assignment.entityType}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    <p>{new Date(assignment.startDate).toLocaleDateString()}</p>
                    {assignment.endDate && (
                      <p className="text-xs text-gray-500">to {new Date(assignment.endDate).toLocaleDateString()}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {assignment.hoursPerDay}h
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={assignment.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => viewHistory(assignment)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      History
                    </button>
                    {assignment.status === 'active' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedAssignment(assignment);
                            setReassignModal(true);
                          }}
                          className="text-orange-600 hover:text-orange-800 text-sm font-medium"
                        >
                          Reassign
                        </button>
                        <button
                          onClick={() => handleComplete(assignment.id)}
                          className="text-green-600 hover:text-green-800 text-sm font-medium"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => handleCancel(assignment.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Create Assignment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Assignment"
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee Type</label>
              <select
                value={formData.assigneeType}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeType: e.target.value, assigneeId: '' }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="worker">Worker</option>
                <option value="material">Material</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
              <select
                value={formData.assigneeId}
                onChange={(e) => setFormData(prev => ({ ...prev, assigneeId: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {formData.assigneeType === 'worker' && workers.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Entity Type</label>
              <select
                value={formData.entityType}
                onChange={(e) => setFormData(prev => ({ ...prev, entityType: e.target.value, entityId: '' }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="site">Site</option>
                <option value="task">Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              <select
                value={formData.entityId}
                onChange={(e) => setFormData(prev => ({ ...prev, entityId: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select...</option>
                {formData.entityType === 'site' && sites.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                required
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hours/Day</label>
              <input
                type="number"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursPerDay: e.target.value }))}
                min="1"
                max="24"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Conflicts Warning */}
          {conflicts.length > 0 && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                <div>
                  <p className="font-medium text-yellow-800">Conflicts Detected</p>
                  {conflicts.map((conflict, i) => (
                    <p key={i} className="text-sm text-yellow-700">{conflict.message}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={checkConflicts}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Check Conflicts
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create
            </button>
          </div>
        </form>
      </Modal>

      {/* History Modal */}
      <Modal
        isOpen={historyModal}
        onClose={() => setHistoryModal(false)}
        title="Assignment History"
        size="md"
      >
        {assignmentHistory.length > 0 ? (
          <Timeline
            items={assignmentHistory.map(h => ({
              id: h.id,
              title: h.action.charAt(0).toUpperCase() + h.action.slice(1),
              description: h.reason || `Status changed to ${h.newStatus}`,
              date: h.createdAt,
              status: h.newStatus === 'active' ? 'completed' : h.newStatus
            }))}
          />
        ) : (
          <p className="text-center py-8 text-gray-500">No history available</p>
        )}
      </Modal>

      {/* Reassign Modal */}
      <Modal
        isOpen={reassignModal}
        onClose={() => setReassignModal(false)}
        title="Reassign"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Worker</label>
            <select
              value={reassignData.newAssigneeId}
              onChange={(e) => setReassignData(prev => ({ ...prev, newAssigneeId: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select worker...</option>
              {workers.filter(w => w.id !== selectedAssignment?.assigneeId).map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
            <textarea
              value={reassignData.reason}
              onChange={(e) => setReassignData(prev => ({ ...prev, reason: e.target.value }))}
              rows={2}
              placeholder="Reason for reassignment..."
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setReassignModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleReassign}
              disabled={!reassignData.newAssigneeId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reassign
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Assignments;

