import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/services';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Alert from '../components/common/Alert';
import Modal from '../components/common/Modal';
import CitySelector from '../components/common/CitySelector';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Camera, 
  Lock,
  Building2,
  Calendar,
  Shield,
  Edit3,
  Check,
  X,
  Upload
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: 'Bujumbura',
    country: 'Burundi'
  });
  const [previewPhoto, setPreviewPhoto] = useState(null);
  
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      const profileData = response.data.data;
      setProfile(profileData);
      setFormData({
        name: profileData.name || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
        city: profileData.city || 'Bujumbura',
        country: profileData.country || 'Burundi'
      });
    } catch (err) {
      setError('Échec du chargement du profil');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await authAPI.updateProfile(formData);
      setSuccess('Profil mis à jour avec succès');
      setEditMode(false);
      fetchProfile();
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Échec de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Veuillez sélectionner une image');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('L\'image ne doit pas dépasser 5 Mo');
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewPhoto(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    try {
      setUploadingPhoto(true);
      setError('');
      const formData = new FormData();
      formData.append('photo', file);
      
      await authAPI.uploadProfilePhoto(formData);
      setSuccess('Photo de profil mise à jour');
      fetchProfile();
      if (refreshUser) refreshUser();
    } catch (err) {
      setError(err.response?.data?.message || 'Échec du téléchargement de la photo');
      setPreviewPhoto(null);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      setSaving(true);
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setSuccess('Mot de passe changé avec succès');
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Échec du changement de mot de passe');
    } finally {
      setSaving(false);
    }
  };

  const getRoleLabel = (role) => {
    const labels = {
      admin: 'Administrateur',
      chef_chantier: 'Chef de chantier',
      ouvrier: 'Ouvrier'
    };
    return labels[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      chef_chantier: 'bg-blue-100 text-blue-700',
      ouvrier: 'bg-green-100 text-green-700'
    };
    return colors[role] || 'bg-gray-100 text-gray-700';
  };

  const getPhotoUrl = () => {
    if (previewPhoto) return previewPhoto;
    if (profile?.profilePhoto) {
      // Handle both relative and absolute URLs
      if (profile.profilePhoto.startsWith('http')) {
        return profile.profilePhoto;
      }
      return `${API_URL}${profile.profilePhoto}`;
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mon Profil</h1>
          <p className="text-slate-500">Gérez vos informations personnelles</p>
        </div>
        {!editMode && (
          <button
            onClick={() => setEditMode(true)}
            className="btn btn-primary flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Modifier
          </button>
        )}
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}
      {success && <Alert type="success" message={success} onClose={() => setSuccess('')} />}

      {/* Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500" />
        
        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="absolute -top-16 left-6">
            <div className="relative">
              <div 
                className="w-32 h-32 rounded-2xl border-4 border-white bg-white shadow-lg overflow-hidden cursor-pointer group"
                onClick={handlePhotoClick}
              >
                {uploadingPhoto ? (
                  <div className="w-full h-full flex items-center justify-center bg-slate-100">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : getPhotoUrl() ? (
                  <img 
                    src={getPhotoUrl()} 
                    alt={profile?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '';
                      setPreviewPhoto(null);
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {profile?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center">
                  <Camera className="w-8 h-8 text-white" />
                  <span className="text-xs text-white mt-1">Changer</span>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>
          </div>

          {/* Name and Role */}
          <div className="pt-20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{profile?.name}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(profile?.role)}`}>
                  <Shield className="w-3 h-3 inline mr-1" />
                  {getRoleLabel(profile?.role)}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Calendar className="w-4 h-4" />
              <span>Membre depuis {new Date(profile?.createdAt).toLocaleDateString('fr-BI', { 
                year: 'numeric', 
                month: 'long',
                timeZone: 'Africa/Bujumbura'
              })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
          <User className="w-5 h-5 text-blue-600" />
          Informations Personnelles
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nom complet
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!editMode}
                className="input pl-10 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adresse e-mail
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!editMode}
                className="input pl-10 disabled:bg-slate-50 disabled:text-slate-500"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Téléphone
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="+257 79 XXX XXX"
                className="input pl-10 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Adresse
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!editMode}
                placeholder="Quartier, Avenue..."
                className="input pl-10 disabled:bg-slate-50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* City */}
          {editMode ? (
            <CitySelector
              value={formData.city}
              onChange={(city) => setFormData({ ...formData, city })}
              label="Ville"
              showIcon={true}
            />
          ) : (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Ville
              </label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.city}
                  disabled
                  className="input pl-10 bg-slate-50 text-slate-500"
                />
              </div>
            </div>
          )}

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Pays
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                name="country"
                value={formData.country}
                disabled
                className="input pl-10 bg-slate-50 text-slate-500"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {editMode && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setEditMode(false);
                fetchProfile();
              }}
              className="btn btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              Enregistrer
            </button>
          </div>
        )}
      </form>

      {/* Security Section */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-6">
          <Lock className="w-5 h-5 text-blue-600" />
          Sécurité
        </h3>

        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
          <div>
            <p className="font-medium text-slate-900">Mot de passe</p>
            <p className="text-sm text-slate-500">
              Dernière modification: il y a plus de 30 jours
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowPasswordModal(true)}
            className="btn btn-secondary"
          >
            Changer le mot de passe
          </button>
        </div>
      </div>

      {/* Password Change Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Changer le mot de passe"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Mot de passe actuel
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
              className="input"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Confirmer le nouveau mot de passe
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
              className="input"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowPasswordModal(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary"
            >
              {saving ? <LoadingSpinner size="sm" /> : 'Changer'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Profile;
