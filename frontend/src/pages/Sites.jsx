import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sitesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import StatusBadge from '../components/common/StatusBadge';
import ProgressBar from '../components/common/ProgressBar';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import LocationPicker from '../components/common/LocationPicker';
import { Plus, Search, MapPin, Calendar, Edit2, Trash2, Eye, Building2, DollarSign, ExternalLink, Navigation } from 'lucide-react';

// Construction site placeholder images
const siteImages = [
  'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1590595906931-81f04f0ccebb?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1565008447742-97f6f38c985c?w=400&h=250&fit=crop',
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop'
];

// City coordinates for Burundi
const CITY_COORDINATES = {
  'Bujumbura': { lat: -3.3731, lng: 29.3644 },
  'Gitega': { lat: -3.4264, lng: 29.9246 },
  'Ngozi': { lat: -2.9075, lng: 29.8306 },
  'Rumonge': { lat: -3.9736, lng: 29.4386 },
  'Makamba': { lat: -4.1347, lng: 29.8039 },
  'Bururi': { lat: -3.9489, lng: 29.6244 },
  'Rutana': { lat: -3.9308, lng: 29.9919 },
  'Ruyigi': { lat: -3.4764, lng: 30.2486 },
  'Cankuzo': { lat: -3.2194, lng: 30.5528 },
  'Kayanza': { lat: -2.9222, lng: 29.6292 },
  'Kirundo': { lat: -2.5847, lng: 30.0969 },
  'Muyinga': { lat: -2.8453, lng: 30.3372 },
  'Muramvya': { lat: -3.2669, lng: 29.6078 },
  'Mwaro': { lat: -3.5167, lng: 29.7000 },
  'Cibitoke': { lat: -2.8869, lng: 29.1244 },
  'Bubanza': { lat: -3.0833, lng: 29.3833 },
  'Karuzi': { lat: -3.1000, lng: 30.1667 }
};

// Get status label in French
const getStatusLabel = (status) => {
  const labels = {
    planning: 'Planification',
    in_progress: 'En cours',
    paused: 'En pause',
    completed: 'Terminé'
  };
  return labels[status] || status;
};

const Sites = () => {
  const { canManage } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingSite, setEditingSite] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedSiteForMap, setSelectedSiteForMap] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: 'Bujumbura, Burundi',
    status: 'planning',
    startDate: '',
    endDate: '',
    plannedBudget: ''
  });

  useEffect(() => {
    fetchSites();
  }, [page, search, status]);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (status) params.status = status;
      
      const response = await sitesAPI.getAll(params);
      setSites(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Échec du chargement des chantiers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = { ...formData };
      
      if (editingSite) {
        await sitesAPI.update(editingSite.id, data);
        setSuccess('Chantier mis à jour avec succès');
      } else {
        await sitesAPI.create(data);
        setSuccess('Chantier créé avec succès');
      }
      setShowModal(false);
      resetForm();
      fetchSites();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'L\'opération a échoué');
    }
  };

  const handleEdit = (site) => {
    setEditingSite(site);
    setFormData({
      name: site.name,
      description: site.description || '',
      location: site.location || 'Bujumbura, Burundi',
      status: site.status,
      startDate: site.startDate || '',
      endDate: site.endDate || '',
      plannedBudget: site.budget?.plannedAmount || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await sitesAPI.delete(deletingId);
      setSuccess('Chantier supprimé avec succès');
      setShowDeleteDialog(false);
      fetchSites();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de la suppression');
    }
  };

  const resetForm = () => {
    setEditingSite(null);
    setFormData({
      name: '',
      description: '',
      location: 'Bujumbura, Burundi',
      status: 'planning',
      startDate: '',
      endDate: '',
      plannedBudget: ''
    });
  };

  const getSiteImage = (index) => {
    return siteImages[index % siteImages.length];
  };

  const formatBurundiDate = (dateString) => {
    if (!dateString) return 'À définir';
    return new Date(dateString).toLocaleDateString('fr-BI', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      timeZone: 'Africa/Bujumbura'
    });
  };

  const getCoordsFromLocation = (location) => {
    if (!location) return CITY_COORDINATES['Bujumbura'];
    const city = Object.keys(CITY_COORDINATES).find(c => 
      location.toLowerCase().includes(c.toLowerCase())
    );
    return city ? CITY_COORDINATES[city] : CITY_COORDINATES['Bujumbura'];
  };

  const openInGoogleMaps = (location) => {
    const coords = getCoordsFromLocation(location);
    window.open(`https://www.google.com/maps?q=${coords.lat},${coords.lng}`, '_blank');
  };

  const openDirections = (location) => {
    const coords = getCoordsFromLocation(location);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Chantiers</h1>
          <p className="text-slate-500 mt-1">Gérez vos sites de construction</p>
        </div>
        {canManage() && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un Chantier
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
              placeholder="Rechercher des chantiers..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full md:w-48"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Tous les Statuts</option>
            <option value="planning">Planification</option>
            <option value="in_progress">En cours</option>
            <option value="paused">En pause</option>
            <option value="completed">Terminé</option>
          </select>
        </div>
      </div>

      {/* Sites Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : sites.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Aucun chantier trouvé"
          message="Créez votre premier chantier de construction pour commencer."
          action={
            canManage() && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Ajouter un Chantier
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sites.map((site, index) => (
            <div key={site.id} className="card hover:shadow-lg transition-shadow overflow-hidden group">
              {/* Site Image */}
              <div className="relative h-40 overflow-hidden">
                <img 
                  src={getSiteImage(index)} 
                  alt={site.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute top-3 right-3">
                  <StatusBadge status={site.status} />
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="font-semibold text-white text-lg">{site.name}</h3>
                  <button 
                    onClick={() => openInGoogleMaps(site.location)}
                    className="flex items-center gap-1 text-sm text-white/80 mt-0.5 hover:text-white transition-colors"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {site.location || 'Bujumbura, Burundi'}
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                  {site.description || 'Aucune description fournie'}
                </p>

                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-500">Avancement</span>
                      <span className="font-medium">{site.progress}%</span>
                    </div>
                    <ProgressBar value={site.progress} showLabel={false} color="auto" />
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <Calendar className="w-4 h-4" />
                      {formatBurundiDate(site.startDate)}
                    </div>
                    {site.budget && (
                      <div className="flex items-center gap-1 text-slate-700 font-medium">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        {parseFloat(site.budget.plannedAmount).toLocaleString('fr-BI')} BIF
                      </div>
                    )}
                  </div>

                  {/* Map Actions */}
                  <div className="flex items-center gap-2 pt-2">
                    <button
                      onClick={() => openInGoogleMaps(site.location)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      Voir sur la carte
                    </button>
                    <button
                      onClick={() => openDirections(site.location)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                    >
                      <Navigation className="w-3.5 h-3.5" />
                      Itinéraire
                    </button>
                  </div>
                </div>
              </div>

              <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <Link 
                  to={`/sites/${site.id}`}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" /> Voir Détails
                </Link>
                {canManage() && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(site)}
                      className="p-1.5 rounded hover:bg-slate-200 text-slate-600"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setDeletingId(site.id); setShowDeleteDialog(true); }}
                      className="p-1.5 rounded hover:bg-red-100 text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingSite ? 'Modifier le Chantier' : 'Créer un Nouveau Chantier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nom du Chantier *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ex: Tour Bujumbura City"
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input min-h-[80px]"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Décrivez le projet de construction..."
            />
          </div>

          {/* Location Picker with Map */}
          <LocationPicker
            value={formData.location}
            onChange={(location) => setFormData({ ...formData, location })}
            label="Localisation"
            required
            showMap={true}
            height="180px"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">Statut</label>
              <select
                className="input"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="planning">Planification</option>
                <option value="in_progress">En cours</option>
                <option value="paused">En pause</option>
                <option value="completed">Terminé</option>
              </select>
            </div>

            <div>
              <label className="label">Budget Prévu (BIF)</label>
              <input
                type="number"
                className="input"
                value={formData.plannedBudget}
                onChange={(e) => setFormData({ ...formData, plannedBudget: e.target.value })}
                min="0"
                step="1000000"
                placeholder="Ex: 50000000"
              />
            </div>

            <div>
              <label className="label">Date de Début</label>
              <input
                type="date"
                className="input"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Date de Fin</label>
              <input
                type="date"
                className="input"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingSite ? 'Mettre à jour' : 'Créer'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le Chantier"
        message="Êtes-vous sûr de vouloir supprimer ce chantier? Cette action est irréversible."
      />
    </div>
  );
};

export default Sites;
