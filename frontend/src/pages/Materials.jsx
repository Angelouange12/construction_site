import { useState, useEffect } from 'react';
import { materialsAPI, sitesAPI } from '../api/services';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import Modal from '../components/common/Modal';
import Alert from '../components/common/Alert';
import Pagination from '../components/common/Pagination';
import ConfirmDialog from '../components/common/ConfirmDialog';
import EmptyState from '../components/common/EmptyState';
import { Plus, Search, Edit2, Trash2, Package, AlertTriangle, PackagePlus, Camera, Image } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Materials = () => {
  const { isAdmin, canManage } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [showModal, setShowModal] = useState(false);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    unit: '',
    customUnit: '',
    unitPrice: '',
    stockQuantity: 0,
    alertThreshold: 10,
    supplier: '',
    customSupplier: ''
  });
  const [usageData, setUsageData] = useState({ siteId: '', quantity: '', notes: '' });
  const [stockData, setStockData] = useState({ quantity: '' });

  // Units list
  const units = [
    'sac (50kg)',
    'sac (25kg)',
    'mètre',
    'mètre carré',
    'mètre cube',
    'unité',
    'kg',
    'litre',
    'pot (20L)',
    'pot (10L)',
    'pot (5L)',
    'rouleau',
    'paquet'
  ];

  // Suppliers list
  const suppliers = [
    'BUCECO',
    'Electro Burundi',
    'Plomburundi',
    'Crown Paints',
    'Briqueterie de Bujumbura',
    'Quincaillerie Centrale',
    'Matériaux Plus',
    'BatiMarché'
  ];

  useEffect(() => {
    fetchData();
  }, [page, search, lowStockOnly]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { page, limit: 10 };
      if (search) params.search = search;
      if (lowStockOnly) params.lowStock = true;

      const [materialsRes, sitesRes] = await Promise.all([
        materialsAPI.getAll(params),
        sitesAPI.getAll({ limit: 100 })
      ]);

      setMaterials(materialsRes.data.data);
      setPagination(materialsRes.data.pagination);
      setSites(sitesRes.data.data);
    } catch (err) {
      setError('Échec du chargement des matériaux');
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
        unit: formData.unit === 'Autre' ? formData.customUnit : formData.unit,
        supplier: formData.supplier === 'Autre' ? formData.customSupplier : formData.supplier
      };
      delete data.customUnit;
      delete data.customSupplier;

      if (editingMaterial) {
        await materialsAPI.update(editingMaterial.id, data);
        setSuccess('Matériau mis à jour avec succès');
      } else {
        await materialsAPI.create(data);
        setSuccess('Matériau créé avec succès');
      }
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'L\'opération a échoué');
    }
  };

  const handleRecordUsage = async (e) => {
    e.preventDefault();
    try {
      await materialsAPI.recordUsage({
        materialId: selectedMaterial.id,
        ...usageData
      });
      setSuccess('Utilisation enregistrée');
      setShowUsageModal(false);
      setUsageData({ siteId: '', quantity: '', notes: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de l\'enregistrement');
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    try {
      await materialsAPI.addStock(selectedMaterial.id, stockData.quantity);
      setSuccess('Stock ajouté avec succès');
      setShowStockModal(false);
      setStockData({ quantity: '' });
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de l\'ajout de stock');
    }
  };

  const handlePhotoUpload = async (materialId, file) => {
    try {
      const formData = new FormData();
      formData.append('photo', file);
      await materialsAPI.uploadPhoto(materialId, formData);
      setSuccess('Photo mise à jour');
      fetchData();
    } catch (err) {
      setError('Échec du téléchargement de la photo');
    }
  };

  const handleEdit = (material) => {
    const isCustomUnit = material.unit && !units.includes(material.unit);
    const isCustomSupplier = material.supplier && !suppliers.includes(material.supplier);
    
    setEditingMaterial(material);
    setFormData({
      name: material.name,
      description: material.description || '',
      unit: isCustomUnit ? 'Autre' : material.unit,
      customUnit: isCustomUnit ? material.unit : '',
      unitPrice: material.unitPrice,
      stockQuantity: material.stockQuantity,
      alertThreshold: material.alertThreshold,
      supplier: isCustomSupplier ? 'Autre' : (material.supplier || ''),
      customSupplier: isCustomSupplier ? material.supplier : ''
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    try {
      await materialsAPI.delete(deletingId);
      setSuccess('Matériau supprimé avec succès');
      setShowDeleteDialog(false);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Échec de la suppression');
    }
  };

  const resetForm = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      unit: '',
      customUnit: '',
      unitPrice: '',
      stockQuantity: 0,
      alertThreshold: 10,
      supplier: '',
      customSupplier: ''
    });
  };

  const isLowStock = (material) => material.stockQuantity <= material.alertThreshold;

  const getPhotoUrl = (material) => {
    if (material?.photo) {
      return `${API_URL}${material.photo}`;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-slate-900">Matériaux</h1>
          <p className="text-slate-500 mt-1">Gérez l'inventaire de vos matériaux de construction</p>
        </div>
        {isAdmin() && (
          <button
            onClick={() => { resetForm(); setShowModal(true); }}
            className="btn-primary"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un Matériau
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
              placeholder="Rechercher des matériaux..."
              className="input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={lowStockOnly}
              onChange={(e) => setLowStockOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-slate-600">Stock bas uniquement</span>
          </label>
        </div>
      </div>

      {/* Materials Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Aucun matériau trouvé"
          message="Ajoutez des matériaux pour commencer à gérer votre inventaire."
          action={
            isAdmin() && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                <Plus className="w-5 h-5 mr-2" /> Ajouter un Matériau
              </button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {materials.map((material) => (
            <div key={material.id} className={`card overflow-hidden hover:shadow-lg transition-shadow ${
              isLowStock(material) ? 'ring-2 ring-red-200' : ''
            }`}>
              {/* Photo */}
              <div className="relative h-32 bg-slate-100 group">
                {getPhotoUrl(material) ? (
                  <img 
                    src={getPhotoUrl(material)} 
                    alt={material.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className={`w-12 h-12 ${isLowStock(material) ? 'text-red-300' : 'text-slate-300'}`} />
                  </div>
                )}
                
                {/* Photo upload overlay */}
                {isAdmin() && (
                  <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                    <div className="flex flex-col items-center text-white">
                      <Camera className="w-6 h-6 mb-1" />
                      <span className="text-xs">Ajouter photo</span>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handlePhotoUpload(material.id, file);
                      }}
                    />
                  </label>
                )}

                {/* Low stock badge */}
                {isLowStock(material) && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    Stock bas
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-semibold text-slate-900 mb-1">{material.name}</h3>
                {material.description && (
                  <p className="text-xs text-slate-500 mb-2 line-clamp-2">{material.description}</p>
                )}
                
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Prix:</span>
                    <span className="font-medium">{parseFloat(material.unitPrice).toLocaleString('fr-BI')} BIF/{material.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Stock:</span>
                    <span className={`font-medium ${isLowStock(material) ? 'text-red-600' : 'text-green-600'}`}>
                      {material.stockQuantity} {material.unit}
                    </span>
                  </div>
                  {material.supplier && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Fournisseur:</span>
                      <span className="text-slate-700 truncate max-w-[120px]">{material.supplier}</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <div className="flex gap-1">
                    {canManage() && (
                      <>
                        <button
                          onClick={() => { setSelectedMaterial(material); setShowUsageModal(true); }}
                          className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                          title="Enregistrer utilisation"
                        >
                          <Package className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setSelectedMaterial(material); setShowStockModal(true); }}
                          className="p-1.5 rounded hover:bg-emerald-100 text-emerald-600"
                          title="Ajouter stock"
                        >
                          <PackagePlus className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                  {isAdmin() && (
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(material)}
                        className="p-1.5 rounded hover:bg-slate-100 text-slate-600"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setDeletingId(material.id); setShowDeleteDialog(true); }}
                        className="p-1.5 rounded hover:bg-red-100 text-red-600"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
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
        title={editingMaterial ? 'Modifier le Matériau' : 'Ajouter un Nouveau Matériau'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="label">Nom *</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Ciment Portland 42.5"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Description</label>
              <textarea
                className="input min-h-[60px]"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Description du matériau..."
              />
            </div>

            <div>
              <label className="label">Unité *</label>
              <select
                className="input"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                required={formData.unit !== 'Autre'}
              >
                <option value="">Sélectionner...</option>
                {units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
                <option value="Autre">── Autre (saisir) ──</option>
              </select>
              {formData.unit === 'Autre' && (
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Ex: palette, camion..."
                  value={formData.customUnit}
                  onChange={(e) => setFormData({ ...formData, customUnit: e.target.value })}
                  required
                />
              )}
            </div>

            <div>
              <label className="label">Prix unitaire (BIF) *</label>
              <input
                type="number"
                className="input"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                min="0"
                step="100"
                required
              />
            </div>

            <div>
              <label className="label">Stock initial</label>
              <input
                type="number"
                className="input"
                value={formData.stockQuantity}
                onChange={(e) => setFormData({ ...formData, stockQuantity: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div>
              <label className="label">Seuil d'alerte</label>
              <input
                type="number"
                className="input"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>

            <div className="md:col-span-2">
              <label className="label">Fournisseur</label>
              <select
                className="input"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
              >
                <option value="">Sélectionner...</option>
                {suppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
                <option value="Autre">── Autre (saisir) ──</option>
              </select>
              {formData.supplier === 'Autre' && (
                <input
                  type="text"
                  className="input mt-2"
                  placeholder="Nom du fournisseur..."
                  value={formData.customSupplier}
                  onChange={(e) => setFormData({ ...formData, customSupplier: e.target.value })}
                />
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              {editingMaterial ? 'Mettre à jour' : 'Ajouter'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Record Usage Modal */}
      <Modal
        isOpen={showUsageModal}
        onClose={() => { setShowUsageModal(false); setUsageData({ siteId: '', quantity: '', notes: '' }); }}
        title={`Enregistrer Utilisation - ${selectedMaterial?.name}`}
        size="md"
      >
        <form onSubmit={handleRecordUsage} className="space-y-4">
          <div>
            <label className="label">Chantier *</label>
            <select
              className="input"
              value={usageData.siteId}
              onChange={(e) => setUsageData({ ...usageData, siteId: e.target.value })}
              required
            >
              <option value="">Sélectionner un chantier...</option>
              {sites.map(site => (
                <option key={site.id} value={site.id}>{site.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Quantité ({selectedMaterial?.unit}) *</label>
            <input
              type="number"
              className="input"
              value={usageData.quantity}
              onChange={(e) => setUsageData({ ...usageData, quantity: e.target.value })}
              min="1"
              max={selectedMaterial?.stockQuantity}
              required
            />
            <p className="text-xs text-slate-500 mt-1">Disponible: {selectedMaterial?.stockQuantity}</p>
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea
              className="input"
              value={usageData.notes}
              onChange={(e) => setUsageData({ ...usageData, notes: e.target.value })}
              placeholder="Notes sur l'utilisation..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowUsageModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Stock Modal */}
      <Modal
        isOpen={showStockModal}
        onClose={() => { setShowStockModal(false); setStockData({ quantity: '' }); }}
        title={`Ajouter Stock - ${selectedMaterial?.name}`}
        size="sm"
      >
        <form onSubmit={handleAddStock} className="space-y-4">
          <div>
            <label className="label">Quantité à ajouter ({selectedMaterial?.unit}) *</label>
            <input
              type="number"
              className="input"
              value={stockData.quantity}
              onChange={(e) => setStockData({ ...stockData, quantity: e.target.value })}
              min="1"
              required
            />
            <p className="text-xs text-slate-500 mt-1">Stock actuel: {selectedMaterial?.stockQuantity}</p>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={() => setShowStockModal(false)} className="btn-secondary">
              Annuler
            </button>
            <button type="submit" className="btn-success">
              Ajouter
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleDelete}
        title="Supprimer le Matériau"
        message="Êtes-vous sûr de vouloir supprimer ce matériau? Cette action est irréversible."
      />
    </div>
  );
};

export default Materials;
