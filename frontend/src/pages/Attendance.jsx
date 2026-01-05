import { useState, useEffect } from 'react';
import { attendanceAPI, sitesAPI, workersAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import StatusBadge from '../components/common/StatusBadge';
import Pagination from '../components/common/Pagination';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, UserCheck, Clock, LogIn, LogOut } from 'lucide-react';

const Attendance = () => {
  const { canManage } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [sites, setSites] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [checkInData, setCheckInData] = useState({
    workerId: '',
    siteId: '',
    checkIn: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, [page, siteFilter, dateFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (siteFilter) params.siteId = siteFilter;
      if (dateFilter) params.date = dateFilter;

      const [attendanceRes, sitesRes, workersRes] = await Promise.all([
        attendanceAPI.getAll(params),
        sitesAPI.getAll({ limit: 100 }),
        workersAPI.getAll({ limit: 100 })
      ]);

      setAttendance(attendanceRes.data.data);
      setPagination(attendanceRes.data.pagination);
      setSites(sitesRes.data.data);
      setWorkers(workersRes.data.data);
    } catch (err) {
      setError('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await attendanceAPI.checkIn({
        ...checkInData,
        date: dateFilter,
        checkIn: checkInData.checkIn || new Date().toTimeString().slice(0, 5)
      });
      setSuccess('Check-in recorded successfully');
      setShowCheckInModal(false);
      setCheckInData({ workerId: '', siteId: '', checkIn: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id) => {
    try {
      await attendanceAPI.checkOut(id);
      setSuccess('Check-out recorded');
      fetchData();
    } catch (err) {
      setError('Check-out failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Attendance</h1>
          <p className="text-slate-500 mt-1">Track worker attendance and hours</p>
        </div>
        {canManage() && (
          <button
            onClick={() => setShowCheckInModal(true)}
            className="btn-primary"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Check In Worker
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Filters */}
      <div className="card p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div>
            <input
              type="date"
              className="input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
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

      {/* Attendance Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : attendance.length === 0 ? (
        <EmptyState
          icon={UserCheck}
          title="No attendance records"
          message="No attendance records found for this date."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Site</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  {canManage() && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {attendance.map((record) => (
                  <tr key={record.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <UserCheck className="w-4 h-4 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{record.worker?.name}</p>
                          <p className="text-xs text-slate-500">{record.worker?.specialty}</p>
                        </div>
                      </div>
                    </td>
                    <td>{record.site?.name || '-'}</td>
                    <td>{record.date}</td>
                    <td>
                      <div className="flex items-center gap-1 text-emerald-600">
                        <LogIn className="w-4 h-4" />
                        {record.checkIn || '-'}
                      </div>
                    </td>
                    <td>
                      {record.checkOut ? (
                        <div className="flex items-center gap-1 text-slate-600">
                          <LogOut className="w-4 h-4" />
                          {record.checkOut}
                        </div>
                      ) : (
                        <span className="text-amber-500 text-sm">In progress</span>
                      )}
                    </td>
                    <td>
                      {record.hoursWorked ? (
                        <span className="font-medium">{parseFloat(record.hoursWorked).toFixed(1)}h</span>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td>
                      <StatusBadge status={record.status} />
                    </td>
                    {canManage() && (
                      <td className="text-right">
                        {!record.checkOut && (
                          <button
                            onClick={() => handleCheckOut(record.id)}
                            className="btn-secondary text-sm py-1 px-3"
                          >
                            <LogOut className="w-4 h-4 mr-1" />
                            Check Out
                          </button>
                        )}
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

      {/* Check In Modal */}
      <Modal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        title="Check In Worker"
        size="md"
      >
        <form onSubmit={handleCheckIn} className="space-y-4">
          <div>
            <label className="label">Worker *</label>
            <select
              className="input"
              value={checkInData.workerId}
              onChange={(e) => setCheckInData({ ...checkInData, workerId: e.target.value })}
              required
            >
              <option value="">Select worker...</option>
              {workers.map(worker => (
                <option key={worker.id} value={worker.id}>{worker.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Site *</label>
            <select
              className="input"
              value={checkInData.siteId}
              onChange={(e) => setCheckInData({ ...checkInData, siteId: e.target.value })}
              required
            >
              <option value="">Select site...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Check In Time</label>
            <input
              type="time"
              className="input"
              value={checkInData.checkIn}
              onChange={(e) => setCheckInData({ ...checkInData, checkIn: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Leave empty to use current time</p>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              value={checkInData.notes}
              onChange={(e) => setCheckInData({ ...checkInData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowCheckInModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Check In
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Attendance;

