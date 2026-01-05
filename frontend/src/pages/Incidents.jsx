import { useState, useEffect } from 'react';
import { incidentsAPI, sitesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, AlertTriangle, Building2 } from 'lucide-react';

const Incidents = () => {
  const { canManage } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingIncident, setEditingIncident] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    severity: 'medium',
    status: 'reported',
    siteId: '',
    incidentDate: new Date().toISOString().split('T')[0],
    injuriesCount: 0,
    actionTaken: ''
  });

  useEffect(() => {
    fetchData();
  }, [page, siteFilter, severityFilter, statusFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (siteFilter) params.siteId = siteFilter;
      if (severityFilter) params.severity = severityFilter;
      if (statusFilter) params.status = statusFilter;

      const [incidentsRes, sitesRes] = await Promise.all([
        incidentsAPI.getAll(params),
        sitesAPI.getAll({ limit: 100 })
      ]);

      setIncidents(incidentsRes.data.data);
      setPagination(incidentsRes.data.pagination);
      setSites(sitesRes.data.data);
    } catch (err) {
      setError('Failed to load incidents');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingIncident) {
        await incidentsAPI.update(editingIncident.id, formData);
        setSuccess('Incident updated successfully');
      } else {
        await incidentsAPI.create(formData);
        setSuccess('Incident reported successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleEdit = (incident) => {
    setEditingIncident(incident);
    setFormData({
      title: incident.title,
      description: incident.description,
      severity: incident.severity,
      status: incident.status,
      siteId: incident.siteId,
      incidentDate: incident.incidentDate,
      injuriesCount: incident.injuriesCount || 0,
      actionTaken: incident.actionTaken || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await incidentsAPI.delete(deletingId);
      setSuccess('Incident deleted successfully');
      setShowDeleteDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete incident');
    }
  };

  const resetForm = () => {
    setEditingIncident(null);
    setFormData({
      title: '',
      description: '',
      severity: 'medium',
      status: 'reported',
      siteId: '',
      incidentDate: new Date().toISOString().split('T')[0],
      injuriesCount: 0,
      actionTaken: ''
    });
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'bg-slate-100 text-slate-800',
      medium: 'bg-amber-100 text-amber-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-600 text-white'
    };
    return colors[severity] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Incidents</h1>
          <p className="text-slate-500 mt-1">Track and manage safety incidents</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-danger"
        >
          <AlertTriangle className="w-5 h-5 mr-2" />
          Report Incident
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
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
          <select
            className="input w-full md:w-36"
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
          <select
            className="input w-full md:w-36"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="reported">Reported</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Incidents Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : incidents.length === 0 ? (
        <EmptyState
          icon={AlertTriangle}
          title="No incidents found"
          message="Report incidents to track safety on your sites."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Incident</th>
                  <th>Site</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Injuries</th>
                  {canManage() && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {incidents.map((incident) => (
                  <tr key={incident.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          incident.severity === 'critical' ? 'bg-red-100' : 'bg-amber-100'
                        }`}>
                          <AlertTriangle className={`w-5 h-5 ${
                            incident.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                          }`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{incident.title}</p>
                          <p className="text-xs text-slate-500 truncate max-w-xs">{incident.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{incident.site?.name || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      <StatusBadge status={incident.status} />
                    </td>
                    <td>{incident.incidentDate}</td>
                    <td>
                      {incident.injuriesCount > 0 ? (
                        <span className="text-red-600 font-medium">{incident.injuriesCount}</span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>
                    {canManage() && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(incident)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeletingId(incident.id); setShowDeleteDialog(true); }}
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
        title={editingIncident ? 'Edit Incident' : 'Report Incident'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Title *</label>
            <input
              type="text"
              className="input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea
              className="input min-h-[100px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Severity *</label>
              <select
                className="input"
                value={formData.severity}
                onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="reported">Reported</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <label className="label">Date</label>
              <input
                type="date"
                className="input"
                value={formData.incidentDate}
                onChange={(e) => setFormData({ ...formData, incidentDate: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Number of Injuries</label>
            <input
              type="number"
              className="input"
              value={formData.injuriesCount}
              onChange={(e) => setFormData({ ...formData, injuriesCount: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>

          <div>
            <label className="label">Action Taken</label>
            <textarea
              className="input min-h-[80px]"
              value={formData.actionTaken}
              onChange={(e) => setFormData({ ...formData, actionTaken: e.target.value })}
              placeholder="Describe any actions taken to resolve or mitigate the incident..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingIncident ? 'Update Incident' : 'Report Incident'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Incident"
        message="Are you sure you want to delete this incident record?"
      />
    </div>
  );
};

export default Incidents;

