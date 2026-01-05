import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { reportsAPI, alertsAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import ProgressBar from '../components/common/ProgressBar';
import { AlertList } from '../components/common/AlertCard';
import { 
  Building2, 
  Users, 
  ClipboardList, 
  DollarSign,
  AlertTriangle,
  Package,
  TrendingUp,
  Clock,
  ArrowRight,
  MapPin,
  Calendar,
  HardHat,
  Wrench
} from 'lucide-react';
import { 
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip
} from 'recharts';

// Construction site images (using placeholder services)
const heroImages = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&h=600&fit=crop'
];

const siteImages = [
  'https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop'
];

// Format date for Burundi locale
const formatBurundiDate = (date) => {
  return new Intl.DateTimeFormat('fr-BI', {
    dateStyle: 'full',
    timeStyle: 'short',
    timeZone: 'Africa/Bujumbura'
  }).format(date || new Date());
};

const formatBurundiTime = () => {
  return new Intl.DateTimeFormat('fr-BI', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Africa/Bujumbura'
  }).format(new Date());
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [alerts, setAlerts] = useState(null);
  const [smartAlerts, setSmartAlerts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentTime, setCurrentTime] = useState(formatBurundiTime());
  const [heroIndex, setHeroIndex] = useState(0);

  useEffect(() => {
    fetchData();
    
    // Update time every second
    const timeInterval = setInterval(() => {
      setCurrentTime(formatBurundiTime());
    }, 1000);

    // Rotate hero images every 5 seconds
    const heroInterval = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroImages.length);
    }, 5000);

    return () => {
      clearInterval(timeInterval);
      clearInterval(heroInterval);
    };
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, alertsRes, smartAlertsRes] = await Promise.all([
        reportsAPI.getDashboard(),
        reportsAPI.getAlerts(),
        alertsAPI.getAll().catch(() => ({ data: { data: null } }))
      ]);
      setStats(statsRes.data.data);
      setAlerts(alertsRes.data.data);
      setSmartAlerts(smartAlertsRes.data.data);
    } catch (err) {
      setError('Échec du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Chantiers Actifs',
      value: stats?.sites?.active || 0,
      total: stats?.sites?.total || 0,
      icon: Building2,
      color: 'from-blue-500 to-blue-600',
      link: '/sites'
    },
    {
      title: 'Total Ouvriers',
      value: stats?.workers?.total || 0,
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      link: '/workers'
    },
    {
      title: 'Tâches Terminées',
      value: stats?.tasks?.completed || 0,
      total: stats?.tasks?.total || 0,
      icon: ClipboardList,
      color: 'from-amber-500 to-amber-600',
      link: '/tasks'
    },
    {
      title: 'Dépenses Totales',
      value: `${(stats?.expenses?.total || 0).toLocaleString('fr-BI')} BIF`,
      icon: DollarSign,
      color: 'from-violet-500 to-violet-600',
      link: '/expenses'
    }
  ];

  const taskData = [
    { name: 'Terminées', value: stats?.tasks?.completed || 0, color: '#10b981' },
    { name: 'En Cours', value: (stats?.tasks?.total || 0) - (stats?.tasks?.completed || 0) - (stats?.tasks?.pending || 0), color: '#3b82f6' },
    { name: 'En Attente', value: stats?.tasks?.pending || 0, color: '#94a3b8' }
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section with Background Image */}
      <div className="relative rounded-2xl overflow-hidden h-64 md:h-80">
        {/* Background Images with Transition */}
        {heroImages.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === heroIndex ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              backgroundImage: `url(${img})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          />
        ))}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-transparent" />
        
        {/* Content */}
        <div className="relative h-full flex flex-col justify-center px-8 md:px-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border-2 border-white/20 overflow-hidden">
              {user?.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-2xl font-bold text-white">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Muraho, {user?.name?.split(' ')[0]} ! 👋
              </h1>
              <p className="text-white/70 text-sm md:text-base">
                Bienvenue sur votre tableau de bord
              </p>
            </div>
          </div>
          
          {/* Location and Time */}
          <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <MapPin className="w-4 h-4" />
              <span>Bujumbura, Burundi</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Clock className="w-4 h-4" />
              <span>{currentTime} (CAT)</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Calendar className="w-4 h-4" />
              <span>{formatBurundiDate(new Date()).split(' à ')[0]}</span>
            </div>
          </div>
        </div>

        {/* Image indicators */}
        <div className="absolute bottom-4 right-4 flex gap-2">
          {heroImages.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setHeroIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === heroIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => (
          <Link 
            key={idx}
            to={stat.link}
            className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all overflow-hidden"
          >
            {/* Background decoration */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />
            
            <div className="relative flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {stat.value}
                  {stat.total && (
                    <span className="text-sm font-normal text-slate-400 ml-1">
                      / {stat.total}
                    </span>
                  )}
                </p>
              </div>
              <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Featured Sites Section */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HardHat className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="font-semibold text-slate-900">Chantiers en Vedette</h2>
          </div>
          <Link to="/sites" className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
            Voir tous <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6">
          {siteImages.map((img, idx) => (
            <div key={idx} className="group relative rounded-xl overflow-hidden aspect-video cursor-pointer">
              <img 
                src={img} 
                alt={`Chantier ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white font-semibold">
                  {['Tour Montparnasse', 'Résidence Les Jardins', 'Centre Commercial'][idx]}
                </h3>
                <p className="text-white/70 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {['Bujumbura', 'Gitega', 'Ngozi'][idx]}, Burundi
                </p>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  idx === 0 ? 'bg-green-500 text-white' : 
                  idx === 1 ? 'bg-blue-500 text-white' : 'bg-amber-500 text-white'
                }`}>
                  {['En cours', 'En cours', 'Planification'][idx]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Smart Alerts */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-orange-50 to-white">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">Alertes Importantes</h2>
                  <p className="text-xs text-slate-500">
                    {smartAlerts?.summary?.total || 0} alertes nécessitent votre attention
                  </p>
                </div>
              </div>
            </div>
            <div className="p-4">
              {smartAlerts?.all?.length > 0 ? (
                <AlertList alerts={smartAlerts.all} maxItems={4} compact={false} />
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="font-medium">Tout va bien !</p>
                  <p className="text-sm">Aucune alerte active pour le moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Task Overview Pie Chart */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <ClipboardList className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="font-semibold text-slate-900">Aperçu des Tâches</h2>
            </div>
          </div>
          <div className="p-4">
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={taskData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats with Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            icon: Users, 
            label: 'Ouvriers Présents', 
            value: stats?.workers?.active || stats?.workers?.total || 0,
            color: 'emerald',
            img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=100&h=100&fit=crop'
          },
          { 
            icon: Package, 
            label: 'Matériaux en Stock', 
            value: stats?.materials?.total || 0,
            color: 'blue',
            img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=100&h=100&fit=crop'
          },
          { 
            icon: Wrench, 
            label: 'Tâches Aujourd\'hui', 
            value: stats?.tasks?.today || stats?.tasks?.inProgress || 0,
            color: 'amber',
            img: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=100&h=100&fit=crop'
          },
          { 
            icon: TrendingUp, 
            label: 'Incidents Ouverts', 
            value: stats?.incidents?.open || 0,
            color: 'red',
            img: 'https://images.unsplash.com/photo-1586864387634-2f33030a6e8d?w=100&h=100&fit=crop'
          }
        ].map((item, idx) => (
          <div key={idx} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
              <img src={item.img} alt="" className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className={`text-2xl font-bold text-${item.color}-600`}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-white/20 rounded-xl">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Gérez vos chantiers efficacement</h3>
            <p className="text-blue-100">Accédez aux rapports détaillés et statistiques</p>
          </div>
        </div>
        <Link 
          to="/reports" 
          className="px-6 py-3 bg-white text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          Voir les Rapports
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
};

export default Dashboard;
