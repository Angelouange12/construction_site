import { useState, useEffect } from 'react';
import { expensesAPI, sitesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, DollarSign, Check, Building2 } from 'lucide-react';

const Expenses = () => {
  const { canManage } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'material',
    siteId: '',
    expenseDate: new Date().toISOString().split('T')[0]
  });

  const categories = [
    { value: 'material', label: 'Material' },
    { value: 'labor', label: 'Labor' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'transport', label: 'Transport' },
    { value: 'other', label: 'Other' }
  ];

  useEffect(() => {
    fetchData();
  }, [page, siteFilter, categoryFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (siteFilter) params.siteId = siteFilter;
      if (categoryFilter) params.category = categoryFilter;

      const [expensesRes, sitesRes] = await Promise.all([
        expensesAPI.getAll(params),
        sitesAPI.getAll({ limit: 100 })
      ]);

      setExpenses(expensesRes.data.data);
      setPagination(expensesRes.data.pagination);
      setSites(sitesRes.data.data);
    } catch (err) {
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingExpense) {
        await expensesAPI.update(editingExpense.id, formData);
        setSuccess('Expense updated successfully');
      } else {
        await expensesAPI.create(formData);
        setSuccess('Expense created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Operation failed');
    }
  };

  const handleApprove = async (id) => {
    try {
      await expensesAPI.approve(id);
      setSuccess('Expense approved');
      fetchData();
    } catch (err) {
      setError('Failed to approve expense');
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      siteId: expense.siteId,
      expenseDate: expense.expenseDate
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await expensesAPI.delete(deletingId);
      setSuccess('Expense deleted successfully');
      setShowDeleteDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to delete expense');
    }
  };

  const resetForm = () => {
    setEditingExpense(null);
    setFormData({
      description: '',
      amount: '',
      category: 'material',
      siteId: '',
      expenseDate: new Date().toISOString().split('T')[0]
    });
  };

  const getCategoryBadge = (category) => {
    const colors = {
      material: 'bg-blue-100 text-blue-800',
      labor: 'bg-green-100 text-green-800',
      equipment: 'bg-purple-100 text-purple-800',
      transport: 'bg-amber-100 text-amber-800',
      other: 'bg-slate-100 text-slate-800'
    };
    return colors[category] || 'bg-slate-100 text-slate-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Expenses</h1>
          <p className="text-slate-500 mt-1">Track and manage construction costs</p>
        </div>
        {canManage() && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Expense
          </button>
        )}
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
            className="input w-full md:w-40"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : expenses.length === 0 ? (
        <EmptyState
          icon={DollarSign}
          title="No expenses found"
          message="Start tracking your construction costs."
          action={
            canManage() && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Add Expense
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
                  <th>Description</th>
                  <th>Site</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                  {canManage() && <th className="text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {expenses.map((expense) => (
                  <tr key={expense.id}>
                    <td>
                      <p className="font-medium text-slate-900">{expense.description}</p>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <Building2 className="w-4 h-4 text-slate-400" />
                        <span>{expense.site?.name || '-'}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getCategoryBadge(expense.category)}`}>
                        {expense.category}
                      </span>
                    </td>
                    <td className="font-semibold text-slate-900">
                      €{parseFloat(expense.amount).toLocaleString()}
                    </td>
                    <td>{expense.expenseDate}</td>
                    <td>
                      {expense.isApproved ? (
                        <span className="badge-success">Approved</span>
                      ) : (
                        <span className="badge-warning">Pending</span>
                      )}
                    </td>
                    {canManage() && (
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!expense.isApproved && (
                            <button
                              onClick={() => handleApprove(expense.id)}
                              className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleEdit(expense)}
                            className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => { setDeletingId(expense.id); setShowDeleteDialog(true); }}
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
        title={editingExpense ? 'Edit Expense' : 'Add New Expense'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Description *</label>
            <input
              type="text"
              className="input"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount (€) *</label>
              <input
                type="number"
                className="input"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="label">Category *</label>
              <select
                className="input"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
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
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editingExpense ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Delete Expense"
        message="Are you sure you want to delete this expense? This action cannot be undone."
      />
    </div>
  );
};

export default Expenses;

