// src/components/admin/AccreditationManager.js
import React, { useState } from 'react';
import { Shield, CheckCircle, AlertCircle, Clock, Plus, Edit, Trash2 } from 'lucide-react';

const AccreditationManager = ({ establishment, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    isAccredited: establishment?.accreditation?.isAccredited || false,
    accreditationNumber: establishment?.accreditation?.accreditationNumber || '',
    accreditationDate: establishment?.accreditation?.accreditationDate 
      ? new Date(establishment.accreditation.accreditationDate).toISOString().split('T')[0] 
      : '',
    accreditationExpiry: establishment?.accreditation?.accreditationExpiry 
      ? new Date(establishment.accreditation.accreditationExpiry).toISOString().split('T')[0] 
      : '',
    accreditingBody: establishment?.accreditation?.accreditingBody || 'MESRIT Niger',
    accreditationLevel: establishment?.accreditation?.accreditationLevel || 'Provisoire',
    specializations: establishment?.accreditation?.specializations || []
  });
  const [newSpecialization, setNewSpecialization] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const accreditationData = {
      ...establishment,
      accreditation: {
        ...formData,
        accreditationDate: formData.accreditationDate ? new Date(formData.accreditationDate) : null,
        accreditationExpiry: formData.accreditationExpiry ? new Date(formData.accreditationExpiry) : null
      }
    };

    try {
      await onUpdate(accreditationData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur mise à jour accréditation:', error);
    }
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (index) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }));
  };

  const getAccreditationStatus = () => {
    if (!formData.isAccredited) {
      return {
        status: 'Non accrédité',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />
      };
    }

    const now = new Date();
    const expiry = new Date(formData.accreditationExpiry);
    const isExpired = expiry < now;
    const isExpiringSoon = (expiry - now) / (1000 * 60 * 60 * 24) < 90;

    if (isExpired) {
      return {
        status: 'Accréditation expirée',
        color: 'text-red-600',
        bgColor: 'bg-red-50 border-red-200',
        icon: <AlertCircle className="w-5 h-5 text-red-600" />
      };
    }

    if (isExpiringSoon) {
      return {
        status: 'Accréditation expire bientôt',
        color: 'text-orange-600',
        bgColor: 'bg-orange-50 border-orange-200',
        icon: <Clock className="w-5 h-5 text-orange-600" />
      };
    }

    return {
      status: 'Accrédité',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />
    };
  };

  const accreditationInfo = getAccreditationStatus();

  if (!isEditing) {
    return (
      <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light flex items-center">
            <Shield className="w-6 h-6 mr-3" />
            Informations d'accréditation
          </h3>
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-niger-orange text-white rounded-lg hover:bg-niger-orange-dark transition-colors"
          >
            <Edit className="w-4 h-4" />
            Modifier
          </button>
        </div>

        <div className={`p-4 rounded-xl border-2 ${accreditationInfo.bgColor} mb-6`}>
          <div className="flex items-center gap-3">
            {accreditationInfo.icon}
            <span className={`text-lg font-semibold ${accreditationInfo.color}`}>
              {accreditationInfo.status}
            </span>
          </div>
        </div>

        {formData.isAccredited && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                Numéro d'accréditation
              </h4>
              <p className="text-readable dark:text-foreground">
                {formData.accreditationNumber || 'Non spécifié'}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                Niveau d'accréditation
              </h4>
              <p className="text-readable dark:text-foreground">
                {formData.accreditationLevel}
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                Date d'accréditation
              </h4>
              <p className="text-readable dark:text-foreground">
                {formData.accreditationDate 
                  ? new Date(formData.accreditationDate).toLocaleDateString('fr-FR')
                  : 'Non spécifiée'
                }
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                Date d'expiration
              </h4>
              <p className="text-readable dark:text-foreground">
                {formData.accreditationExpiry 
                  ? new Date(formData.accreditationExpiry).toLocaleDateString('fr-FR')
                  : 'Non spécifiée'
                }
              </p>
            </div>
            
            <div className="md:col-span-2">
              <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-2">
                Organisme d'accréditation
              </h4>
              <p className="text-readable dark:text-foreground">
                {formData.accreditingBody}
              </p>
            </div>

            {formData.specializations.length > 0 && (
              <div className="md:col-span-2">
                <h4 className="font-semibold text-niger-green dark:text-niger-green-light mb-3">
                  Spécialisations accréditées
                </h4>
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-niger-orange/10 text-niger-orange-dark rounded-full text-sm font-medium border border-niger-orange/20"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-secondary-800 rounded-2xl shadow-lg p-6 border border-niger-orange/10">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-niger-green dark:text-niger-green-light flex items-center">
          <Shield className="w-6 h-6 mr-3" />
          Modifier l'accréditation
        </h3>
        <button
          onClick={() => setIsEditing(false)}
          className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
        >
          Annuler
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Statut d'accréditation */}
        <div>
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={formData.isAccredited}
              onChange={(e) => setFormData(prev => ({ ...prev, isAccredited: e.target.checked }))}
              className="w-5 h-5 text-niger-orange focus:ring-niger-orange border-gray-300 rounded"
            />
            <span className="text-lg font-medium text-niger-green dark:text-niger-green-light">
              Établissement accrédité
            </span>
          </label>
        </div>

        {formData.isAccredited && (
          <>
            {/* Informations de base */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                  Numéro d'accréditation
                </label>
                <input
                  type="text"
                  value={formData.accreditationNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, accreditationNumber: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300"
                  placeholder="Ex: ACC-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                  Niveau d'accréditation
                </label>
                <select
                  value={formData.accreditationLevel}
                  onChange={(e) => setFormData(prev => ({ ...prev, accreditationLevel: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300"
                >
                  <option value="Provisoire">Provisoire</option>
                  <option value="Définitive">Définitive</option>
                  <option value="Conditionnelle">Conditionnelle</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                  Date d'accréditation
                </label>
                <input
                  type="date"
                  value={formData.accreditationDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, accreditationDate: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                  Date d'expiration
                </label>
                <input
                  type="date"
                  value={formData.accreditationExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, accreditationExpiry: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300"
                />
              </div>
            </div>

            {/* Organisme d'accréditation */}
            <div>
              <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                Organisme d'accréditation
              </label>
              <input
                type="text"
                value={formData.accreditingBody}
                onChange={(e) => setFormData(prev => ({ ...prev, accreditingBody: e.target.value }))}
                className="w-full px-4 py-3 rounded-xl border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300"
                placeholder="Ex: MESRIT Niger"
              />
            </div>

            {/* Spécialisations */}
            <div>
              <label className="block text-sm font-medium text-niger-green dark:text-niger-green-light mb-2">
                Spécialisations accréditées
              </label>
              
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                  className="flex-1 px-4 py-2 rounded-lg border border-niger-orange/20 focus:ring-2 focus:ring-niger-orange focus:border-niger-orange transition-all duration-300"
                  placeholder="Ajouter une spécialisation"
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="px-4 py-2 bg-niger-green text-white rounded-lg hover:bg-niger-green-dark transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter
                </button>
              </div>

              {formData.specializations.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.specializations.map((spec, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-1 bg-niger-orange/10 text-niger-orange-dark rounded-full text-sm border border-niger-orange/20"
                    >
                      <span>{spec}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecialization(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex gap-4 pt-6 border-t border-niger-orange/20">
          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-niger-orange to-niger-green text-white rounded-xl hover:shadow-lg transition-all duration-300 font-medium"
          >
            Sauvegarder
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-colors font-medium"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
};

export default AccreditationManager;