import { useState, useEffect } from 'react';
import { workersAPI, sitesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import PhotoUpload from '../components/common/PhotoUpload';
import CitySelector from '../components/common/CitySelector';
import { Plus, Search, Edit2, Trash2, Users, Phone, Mail, Building2, MapPin, Camera } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Workers = () => {
  const { canManage } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingWorker, setEditingWorker] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    specialty: '',
    customSpecialty: '',
    hourlyRate: '',
    address: '',
    city: 'Bujumbura',
    siteId: ''
  });

  // Specialties list
  const specialties = [
    'Maçon',
    'Électricien',
    'Plombier',
    'Charpentier',
    'Peintre',
    'Soudeur',
    'Manœuvre',
    'Chef d\'équipe',
    'Conducteur',
    'Carreleur',
    'Menuisier',
    'Ferronnier'
  ];

  useEffect(() => {
    fetchData();
  }, [page, search, siteFilter]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (siteFilter) params.siteId = siteFilter;

      const [workersRes, sitesRes] = await Promise.all([
        workersAPI.getAll(params),
        sitesAPI.getAll({ limit: 100 })
      ]);

      setWorkers(workersRes.data.data);
      setPagination(workersRes.data.pagination);
      setSites(sitesRes.data.data);
    } catch (err) {
      setError('Échec du chargement des ouvriers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = { 
        ...formData,
        specialty: formData.specialty === 'Autre' ? formData.customSpecialty : formData.specialty
      };
      delete data.customSpecialty;
      if (!data.siteId) delete data.siteId;
      if (!data.email) delete data.email;
      
      if (editingWorker) {
        await workersAPI.update(editingWorker.id, data);
        setSuccess('Ouvrier mis à jour avec succès');
      } else {
        await workersAPI.create(data);
        setSuccess('Ouvrier créé avec succès');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'L\'opération a échoué');
    }
  };

  const handleEdit = (worker) => {
    const isCustomSpecialty = worker.specialty && !specialties.includes(worker.specialty);
    setEditingWorker(worker);
    setFormData({
      name: worker.name,
      phone: worker.phone || '',
      email: worker.email || '',
      specialty: isCustomSpecialty ? 'Autre' : (worker.specialty || ''),
      customSpecialty: isCustomSpecialty ? worker.specialty : '',
      hourlyRate: worker.hourlyRate || '',
      address: worker.address || '',
      city: worker.city || 'Bujumbura',
      siteId: worker.siteId || ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await workersAPI.delete(deletingId);
      setSuccess('Ouvrier supprimé avec succès');
      setShowDeleteDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de la suppression');
    }
  };

  const handlePhotoUpload = async (workerId, file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await workersAPI.uploadPhoto(workerId, formData);
      setSuccess('Photo mise à jour');
      fetchData();
    } catch (err) {
      setError('Échec du téléchargement de la photo');
    }
  };

  const resetForm = () => {
    setEditingWorker(null);
    setFormData({
      name: '',
      phone: '',
      email: '',
      specialty: '',
      customSpecialty: '',
      hourlyRate: '',
      address: '',
      city: 'Bujumbura',
      siteId: ''
    });
  };

  const getProfilePhotoUrl = (worker) => {
    if (worker?.profilePhoto) {
      return `${API_URL}${worker.profilePhoto}`;
    }
    return null;
  };

  const getSpecialtyColor = (specialty) => {
    const colors = {
      'Maçon': 'bg-orange-100 text-orange-700',
      'Électricien': 'bg-yellow-100 text-yellow-700',
      'Plombier': 'bg-blue-100 text-blue-700',
      'Charpentier': 'bg-amber-100 text-amber-700',
      'Peintre': 'bg-purple-100 text-purple-700',
      'Soudeur': 'bg-red-100 text-red-700',
      'Manœuvre': 'bg-slate-100 text-slate-700',
      'Chef d\'équipe': 'bg-emerald-100 text-emerald-700',
      'Conducteur': 'bg-cyan-100 text-cyan-700'
    };
    return colors[specialty] || 'bg-green-100 text-green-700';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Ouvriers</h1>
          <p className="text-slate-500 mt-1">Gérez votre équipe de construction</p>
        </div>
        {canManage() && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un Ouvrier
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
              placeholder="Rechercher des ouvriers..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full md:w-48"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
          >
            <option value="">Tous les Chantiers</option>
            {sites.map(site => (
              <option key={site.id} value={site.id}>{site.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Workers Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : workers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Aucun ouvrier trouvé"
          message="Ajoutez des ouvriers pour commencer à gérer votre équipe."
          action={
            canManage() && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Ajouter un Ouvrier
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workers.map((worker) => (
            <div key={worker.id} className="card p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* Photo with upload overlay */}
                  <div className="relative group">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-100 flex-shrink-0">
                      {getProfilePhotoUrl(worker) ? (
                        <img 
                          src={getProfilePhotoUrl(worker)} 
                          alt={worker.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center">
                          <span className="text-lg font-bold text-white">
                            {worker.name?.charAt(0)?.toUpperCase() || 'O'}
                          </span>
                        </div>
                      )}
                    </div>
                    {canManage() && (
                      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                        <Camera className="w-5 h-5 text-white" />
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(worker.id, file);
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">{worker.name}</h3>
                    {worker.specialty && (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${getSpecialtyColor(worker.specialty)}`}>
                        {worker.specialty}
                      </span>
                    )}
                  </div>
                </div>
                {canManage() && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(worker)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setDeletingId(worker.id); setShowDeleteDialog(true); }}
                      className="p-1.5 rounded hover:bg-red-100 text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                {worker.phone && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Phone className="w-4 h-4 text-slate-400" />
                    {worker.phone}
                  </div>
                )}
                {worker.email && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="w-4 h-4 text-slate-400" />
                    {worker.email}
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-600">
                  <MapPin className="w-4 h-4 text-slate-400" />
                  {worker.city || 'Bujumbura'}, Burundi
                </div>
                {worker.site && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    {worker.site.name}
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-500">
                    Taux horaire: <span className="font-semibold text-slate-900">{parseFloat(worker.hourlyRate || 0).toLocaleString('fr-BI')} BIF</span>
                  </p>
                </div>
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
        title={editingWorker ? 'Modifier l\'Ouvrier' : 'Ajouter un Nouvel Ouvrier'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Nom complet *</label>
            <input
              type="text"
              className="input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Téléphone</label>
              <input
                type="tel"
                className="input"
                placeholder="+257 79 XXX XXX"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                className="input"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Spécialité</label>
              <select
                className="input"
                value={formData.specialty}
                onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                {specialties.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
                <option value="Autre">── Autre (saisir) ──</option>
              </select>
              {formData.specialty === 'Autre' && (
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Entrer la spécialité..."
                  value={formData.customSpecialty}
                  onChange={(e) => setFormData({ ...formData, customSpecialty: e.target.value })}
                  required
                />
              )}
            </div>
            <div>
              <label className="label">Taux horaire (BIF)</label>
              <input
                type="number"
                className="input"
                value={formData.hourlyRate}
                onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                min="0"
                step="100"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Adresse</label>
              <input
                type="text"
                className="input"
                placeholder="Quartier, Avenue..."
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <CitySelector
              value={formData.city}
              onChange={(city) => setFormData({ ...formData, city })}
              label="Ville"
              showIcon={false}
            />
          </div>

          <div>
            <label className="label">Chantier Assigné</label>
            <select
              className="input"
              value={formData.siteId}
              onChange={(e) => setFormData({ ...formData, siteId: e.target.value })}
            >
              <option value="">Non assigné</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingWorker ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'Ouvrier"
        message="Êtes-vous sûr de vouloir supprimer cet ouvrier? Cette action est irréversible."
      />
    </div>
  );
};

export default Workers;
