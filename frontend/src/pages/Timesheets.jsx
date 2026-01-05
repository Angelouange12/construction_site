import { useState, useEffect } from 'react';
import { timesheetsAPI, sitesAPI, workersAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import { 
  ClockIcon, 
  DocumentArrowDownIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const Timesheets = () => {
  const [timesheets, setTimesheets] = useState([]);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [filters, setFilters] = useState({ siteId: '', status: '', workerId: '' });
  const [generateModal, setGenerateModal] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [selectedTimesheet, setSelectedTimesheet] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    siteId: '',
    weekStartDate: getMonday(new Date()).toISOString().split('T')[0]
  });

  function getMonday(date) {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  useEffect(() => {
    fetchData();
  }, [pagination.page, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [timesheetsRes, sitesRes] = await Promise.all([
        timesheetsAPI.getAll({
          page: pagination.page,
          limit: pagination.limit,
          ...filters
        }),
        sitesAPI.getAll({ limit: 100 })
      ]);
      setTimesheets(timesheetsRes.data.data.timesheets || []);
      setPagination(prev => ({
        ...prev,
        total: timesheetsRes.data.data.pagination.total,
        totalPages: timesheetsRes.data.data.pagination.totalPages
      }));
      setSites(sitesRes.data.data?.sites || []);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load timesheets');
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkers = async (siteId) => {
    if (!siteId) {
      setWorkers([]);
      return;
    }
    try {
      const response = await workersAPI.getBySite(siteId);
      setWorkers(response.data.data || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
    }
  };

  const handleGenerateTimesheets = async () => {
    if (!generateForm.siteId || !generateForm.weekStartDate) return;
    
    try {
      setGenerating(true);
      const response = await timesheetsAPI.generateSiteTimesheets(
        generateForm.siteId,
        generateForm.weekStartDate
      );
      setSuccess(`Generated ${response.data.data.length} timesheets`);
      setGenerateModal(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to generate timesheets');
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await timesheetsAPI.approve(id);
      setSuccess('Timesheet approved');
      fetchData();
      setDetailModal(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to approve');
    }
  };

  const handleReject = async (id) => {
    if (!rejectReason.trim()) {
      setError('Please provide a reason for rejection');
      return;
    }
    try {
      await timesheetsAPI.reject(id, rejectReason);
      setSuccess('Timesheet rejected');
      setRejectReason('');
      fetchData();
      setDetailModal(false);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to reject');
    }
  };

  const handleSubmit = async (id) => {
    try {
      await timesheetsAPI.submit(id);
      setSuccess('Timesheet submitted for approval');
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to submit');
    }
  };

  const openDetails = (timesheet) => {
    setSelectedTimesheet(timesheet);
    setDetailModal(true);
  };

  const formatCurrency = (amount) => `€${parseFloat(amount || 0).toFixed(2)}`;
  const formatHours = (hours) => parseFloat(hours || 0).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Timesheets</h1>
          <p className="text-gray-600">Manage worker timesheets and payroll</p>
        </div>
        <button
          onClick={() => setGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                     hover:bg-blue-700 font-medium"
        >
          <PlusIcon className="w-5 h-5" />
          Generate Timesheets
        </button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess(null)} />}

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
        <select
          value={filters.siteId}
          onChange={(e) => setFilters(prev => ({ ...prev, siteId: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Sites</option>
          {sites.map(site => (
            <option key={site.id} value={site.id}>{site.name}</option>
          ))}
        </select>

        <select
          value={filters.status}
          onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
          className="px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Timesheets Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : timesheets.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm">
          <ClockIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-600">No timesheets found</p>
          <p className="text-gray-400 text-sm">Generate timesheets for workers</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Worker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Site</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Week</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pay</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {timesheets.map(timesheet => (
                <tr key={timesheet.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{timesheet.worker?.name}</p>
                    <p className="text-sm text-gray-500">{timesheet.worker?.specialty}</p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {timesheet.site?.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                    {new Date(timesheet.weekStartDate).toLocaleDateString()} - {new Date(timesheet.weekEndDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-medium text-gray-800">{formatHours(timesheet.totalHours)}h</p>
                    <p className="text-xs text-gray-500">
                      {formatHours(timesheet.regularHours)}h reg + {formatHours(timesheet.overtimeHours)}h OT
                    </p>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">
                    {formatCurrency(timesheet.totalPay)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={timesheet.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openDetails(timesheet)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </button>
                    {timesheet.status === 'draft' && (
                      <button
                        onClick={() => handleSubmit(timesheet.id)}
                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                      >
                        Submit
                      </button>
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

      {/* Generate Modal */}
      <Modal
        isOpen={generateModal}
        onClose={() => setGenerateModal(false)}
        title="Generate Timesheets"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Generate timesheets for all active workers on a site for the selected week.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site</label>
            <select
              value={generateForm.siteId}
              onChange={(e) => {
                setGenerateForm(prev => ({ ...prev, siteId: e.target.value }));
                fetchWorkers(e.target.value);
              }}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a site</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Week Starting</label>
            <input
              type="date"
              value={generateForm.weekStartDate}
              onChange={(e) => setGenerateForm(prev => ({ ...prev, weekStartDate: e.target.value }))}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Select a Monday for accurate weekly timesheets</p>
          </div>

          {workers.length > 0 && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {workers.length} workers will have timesheets generated:
              </p>
              <div className="flex flex-wrap gap-2">
                {workers.slice(0, 5).map(w => (
                  <span key={w.id} className="px-2 py-1 bg-white rounded text-sm text-gray-600">
                    {w.name}
                  </span>
                ))}
                {workers.length > 5 && (
                  <span className="px-2 py-1 bg-white rounded text-sm text-gray-500">
                    +{workers.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={() => setGenerateModal(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerateTimesheets}
              disabled={generating || !generateForm.siteId}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModal}
        onClose={() => setDetailModal(false)}
        title="Timesheet Details"
        size="lg"
      >
        {selectedTimesheet && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Regular Hours</p>
                <p className="text-xl font-bold text-gray-800">{formatHours(selectedTimesheet.regularHours)}h</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Overtime</p>
                <p className="text-xl font-bold text-orange-600">{formatHours(selectedTimesheet.overtimeHours)}h</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-xl font-bold text-gray-800">{formatHours(selectedTimesheet.totalHours)}h</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-600">Total Pay</p>
                <p className="text-xl font-bold text-blue-700">{formatCurrency(selectedTimesheet.totalPay)}</p>
              </div>
            </div>

            {/* Daily Breakdown */}
            {selectedTimesheet.dailyBreakdown && (
              <div>
                <h4 className="font-medium text-gray-800 mb-3">Daily Breakdown</h4>
                <div className="space-y-2">
                  {selectedTimesheet.dailyBreakdown.map((day, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{new Date(day.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-600">{day.checkIn} - {day.checkOut}</span>
                        <span className="font-medium">{formatHours(day.totalHours)}h</span>
                        {day.overtimeHours > 0 && (
                          <span className="text-orange-600">+{formatHours(day.overtimeHours)}h OT</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actions for submitted timesheets */}
            {selectedTimesheet.status === 'submitted' && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-800 mb-3">Approval Actions</h4>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleApprove(selectedTimesheet.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 
                               text-white rounded-lg hover:bg-green-700"
                  >
                    <CheckCircleIcon className="w-5 h-5" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(selectedTimesheet.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 
                               text-white rounded-lg hover:bg-red-700"
                  >
                    <XCircleIcon className="w-5 h-5" />
                    Reject
                  </button>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Reason for rejection (required if rejecting)"
                  className="w-full mt-3 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  rows={2}
                />
              </div>
            )}

            {/* Rejection reason if rejected */}
            {selectedTimesheet.status === 'rejected' && selectedTimesheet.rejectionReason && (
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="font-medium text-red-800">Rejection Reason:</p>
                <p className="text-red-700">{selectedTimesheet.rejectionReason}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Timesheets;

