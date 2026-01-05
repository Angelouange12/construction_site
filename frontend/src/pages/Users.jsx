import { useState, useEffect } from 'react';
import { usersAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, Users as UsersIcon, Shield, User, MapPin, Phone } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Cities in Burundi
const burundiCities = [
  'Bujumbura', 'Gitega', 'Ngozi', 'Rumonge', 'Makamba', 
  'Bururi', 'Rutana', 'Ruyigi', 'Cankuzo', 'Kayanza',
  'Kirundo', 'Muyinga', 'Muramvya', 'Mwaro', 'Cibitoke', 'Bubanza', 'Karuzi'
];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: 'Bujumbura',
    role: 'ouvrier',
    isActive: true
  });

  useEffect(() => {
    fetchUsers();
  }, [page, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const response = await usersAPI.getAll(params);
      setUsers(response.data.data);
      setPagination(response.data.pagination);
    } catch (err) {
      setError('Échec du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingUser) {
        const updateData = { ...formData };
        if (!updateData.password) delete updateData.password;
        await usersAPI.update(editingUser.id, updateData);
        setSuccess('Utilisateur mis à jour avec succès');
      } else {
        await usersAPI.create(formData);
        setSuccess('Utilisateur créé avec succès');
      }
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'L\'opération a échoué');
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '',
      phone: user.phone || '',
      city: user.city || 'Bujumbura',
      role: user.role,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await usersAPI.delete(deletingId);
      setSuccess('Utilisateur supprimé avec succès');
      setShowDeleteDialog(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de la suppression');
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      city: 'Bujumbura',
      role: 'ouvrier',
      isActive: true
    });
  };

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-purple-100 text-purple-800',
      chef_chantier: 'bg-blue-100 text-blue-800',
      ouvrier: 'bg-green-100 text-green-800'
    };
    const labels = {
      admin: 'Administrateur',
      chef_chantier: 'Chef de chantier',
      ouvrier: 'Ouvrier'
    };
    return { style: styles[role] || 'bg-slate-100 text-slate-800', label: labels[role] || role };
  };

  const getProfilePhotoUrl = (user) => {
    if (user?.profilePhoto) {
      return `${API_URL}${user.profilePhoto}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-slate-500 mt-1">Gérez les comptes utilisateurs et les rôles</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Ajouter un Utilisateur
        </button>
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
              placeholder="Rechercher des utilisateurs..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input w-full md:w-48"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">Tous les Rôles</option>
            <option value="admin">Administrateur</option>
            <option value="chef_chantier">Chef de chantier</option>
            <option value="ouvrier">Ouvrier</option>
          </select>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          icon={UsersIcon}
          title="Aucun utilisateur trouvé"
          message="Ajoutez des utilisateurs pour gérer votre équipe."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((user) => {
            const roleBadge = getRoleBadge(user.role);
            return (
              <div key={user.id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-slate-100 flex-shrink-0">
                      {getProfilePhotoUrl(user) ? (
                        <img 
                          src={getProfilePhotoUrl(user)} 
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className={`w-full h-full flex items-center justify-center ${
                          user.role === 'admin' 
                            ? 'bg-gradient-to-br from-purple-500 to-purple-600' 
                            : user.role === 'chef_chantier'
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                            : 'bg-gradient-to-br from-green-500 to-green-600'
                        }`}>
                          {user.role === 'admin' ? (
                            <Shield className="w-6 h-6 text-white" />
                          ) : (
                            <span className="text-lg font-bold text-white">
                              {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900">{user.name}</h3>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${roleBadge.style}`}>
                        {roleBadge.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(user)}
                      className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => { setDeletingId(user.id); setShowDeleteDialog(true); }}
                      className="p-1.5 rounded hover:bg-red-100 text-red-600"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-600">
                    <User className="w-4 h-4 text-slate-400" />
                    {user.email}
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="w-4 h-4 text-slate-400" />
                      {user.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-slate-600">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    {user.city || 'Bujumbura'}, Burundi
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-slate-500">Statut:</span>
                    {user.isActive ? (
                      <span className="badge-success">Actif</span>
                    ) : (
                      <span className="badge-danger">Inactif</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={pagination.totalPages} onPageChange={setPage} />

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); resetForm(); }}
        title={editingUser ? 'Modifier l\'Utilisateur' : 'Ajouter un Nouvel Utilisateur'}
        size="md"
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

          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              className="input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <label className="label">Ville</label>
              <select
                className="input"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              >
                {burundiCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">{editingUser ? 'Nouveau mot de passe (laisser vide pour conserver l\'actuel)' : 'Mot de passe *'}</label>
            <input
              type="password"
              className="input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required={!editingUser}
              minLength={6}
            />
          </div>

          <div>
            <label className="label">Rôle *</label>
            <select
              className="input"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              required
            >
              <option value="admin">Administrateur</option>
              <option value="chef_chantier">Chef de chantier</option>
              <option value="ouvrier">Ouvrier</option>
            </select>
          </div>

          {editingUser && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700">Compte actif</label>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingUser ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer l'Utilisateur"
        message="Êtes-vous sûr de vouloir supprimer cet utilisateur? Cette action est irréversible."
      />
    </div>
  );
};

export default Users;
