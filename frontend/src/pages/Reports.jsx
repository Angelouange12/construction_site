import { useState, useEffect } from 'react';
import { reportsAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import ProgressBar from '../components/common/ProgressBar';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  AlertTriangle,
  Building2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line
} from 'recharts';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('progress');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progressData, setProgressData] = useState([]);
  const [budgetData, setBudgetData] = useState([]);
  const [productivityData, setProductivityData] = useState([]);
  const [safetyData, setSafetyData] = useState(null);

  useEffect(() => {
    fetchReportData();
  }, [activeTab]);

  const fetchReportData = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'progress':
          const progressRes = await reportsAPI.getSiteProgress();
          setProgressData(progressRes.data.data);
          break;
        case 'budget':
          const budgetRes = await reportsAPI.getBudgetVsActual();
          setBudgetData(budgetRes.data.data);
          break;
        case 'productivity':
          const prodRes = await reportsAPI.getWorkerProductivity({});
          setProductivityData(prodRes.data.data);
          break;
        case 'safety':
          const safetyRes = await reportsAPI.getSafety({});
          setSafetyData(safetyRes.data.data);
          break;
      }
    } catch (err) {
      setError('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'progress', label: 'Site Progress', icon: Building2 },
    { id: 'budget', label: 'Budget Analysis', icon: DollarSign },
    { id: 'productivity', label: 'Worker Productivity', icon: Users },
    { id: 'safety', label: 'Safety Report', icon: AlertTriangle }
  ];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  const renderProgressReport = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-slate-900">Site Progress Overview</h3>
        </div>
        <div className="card-body">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={progressData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {progressData.map((site, idx) => (
          <div key={idx} className="card p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-slate-900">{site.name}</h4>
              <span className={`badge ${site.status === 'in_progress' ? 'badge-primary' : 'badge-gray'}`}>
                {site.status}
              </span>
            </div>
            <ProgressBar value={site.progress} color="auto" />
            <div className="mt-3 flex justify-between text-sm text-slate-500">
              <span>Tasks: {site.completedTasks}/{site.totalTasks}</span>
              <span>Budget: €{site.budget?.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderBudgetReport = () => (
    <div className="space-y-6">
      <div className="card">
        <div className="card-header">
          <h3 className="font-semibold text-slate-900">Budget vs Actual Spending</h3>
        </div>
        <div className="card-body">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={budgetData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="siteName" type="category" width={150} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `€${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="plannedBudget" name="Budget" fill="#3b82f6" />
                <Bar dataKey="actualSpent" name="Spent" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {budgetData.map((site, idx) => (
          <div key={idx} className={`card p-4 ${site.isOverBudget ? 'border-red-300 bg-red-50' : ''}`}>
            <h4 className="font-medium text-slate-900 mb-3">{site.siteName}</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Planned:</span>
                <span className="font-medium">€{site.plannedBudget?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Spent:</span>
                <span className={`font-medium ${site.isOverBudget ? 'text-red-600' : 'text-emerald-600'}`}>
                  €{site.actualSpent?.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Variance:</span>
                <span className={`font-medium ${site.variance < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                  {site.variance >= 0 ? '+' : ''}€{site.variance?.toLocaleString()}
                </span>
              </div>
            </div>
            {site.isOverBudget && (
              <div className="mt-3 p-2 bg-red-100 rounded text-red-700 text-xs font-medium">
                ⚠️ Over budget by {Math.abs(site.variancePercent)}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderProductivityReport = () => (
    <div className="space-y-6">
      <div className="card overflow-hidden">
        <div className="card-header">
          <h3 className="font-semibold text-slate-900">Worker Productivity</h3>
        </div>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Worker</th>
                <th>Specialty</th>
                <th>Days Worked</th>
                <th>Hours</th>
                <th>Tasks</th>
                <th>Productivity</th>
                <th>Labor Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {productivityData.map((worker, idx) => (
                <tr key={idx}>
                  <td className="font-medium text-slate-900">{worker.name}</td>
                  <td>{worker.specialty || '-'}</td>
                  <td>{worker.daysWorked}</td>
                  <td>{worker.totalHours.toFixed(1)}h</td>
                  <td>{worker.tasksCompleted}/{worker.tasksAssigned}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-16">
                        <ProgressBar value={worker.productivity} size="sm" showLabel={false} color="auto" />
                      </div>
                      <span className="text-sm">{worker.productivity}%</span>
                    </div>
                  </td>
                  <td className="font-medium">€{worker.laborCost.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderSafetyReport = () => {
    if (!safetyData) return null;

    const severityData = Object.entries(safetyData.summary.bySeverity).map(([key, value]) => ({
      name: key,
      value
    }));

    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card p-4">
            <p className="text-sm text-slate-500">Total Incidents</p>
            <p className="text-3xl font-display font-bold text-slate-900">{safetyData.summary.total}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Critical</p>
            <p className="text-3xl font-display font-bold text-red-600">
              {safetyData.summary.bySeverity.critical || 0}
            </p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Total Injuries</p>
            <p className="text-3xl font-display font-bold text-amber-600">{safetyData.summary.totalInjuries}</p>
          </div>
          <div className="card p-4">
            <p className="text-sm text-slate-500">Open Cases</p>
            <p className="text-3xl font-display font-bold text-primary-600">
              {(safetyData.summary.byStatus.reported || 0) + (safetyData.summary.byStatus.investigating || 0)}
            </p>
          </div>
        </div>

        {/* Severity Chart */}
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-900">Incidents by Severity</h3>
          </div>
          <div className="card-body">
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="card overflow-hidden">
          <div className="card-header">
            <h3 className="font-semibold text-slate-900">Recent Incidents</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Site</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {safetyData.incidents.slice(0, 10).map((incident, idx) => (
                  <tr key={idx}>
                    <td className="font-medium text-slate-900">{incident.title}</td>
                    <td>{incident.site?.name || '-'}</td>
                    <td>
                      <span className={`badge ${incident.severity === 'critical' ? 'bg-red-600 text-white' : 'badge-warning'}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      <span className="badge-gray">{incident.status}</span>
                    </td>
                    <td>{incident.incidentDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold text-slate-900">Reports</h1>
        <p className="text-slate-500 mt-1">Analytics and insights for your construction projects</p>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === tab.id 
                ? 'bg-primary-600 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : (
        <>
          {activeTab === 'progress' && renderProgressReport()}
          {activeTab === 'budget' && renderBudgetReport()}
          {activeTab === 'productivity' && renderProductivityReport()}
          {activeTab === 'safety' && renderSafetyReport()}
        </>
      )}
    </div>
  );
};

export default Reports;

