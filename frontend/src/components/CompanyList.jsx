import React, { useEffect, useState } from 'react';
import { companyAPI } from '../utils/api';
import { validateCompanyData, hasErrors } from '../utils/validation';
import { useAsync } from '../utils/useAsync';

// Simple notification component
const Notification = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
      type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
    }`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white hover:text-gray-200">
          ×
        </button>
      </div>
    </div>
  );
};

const CompanyList = () => {
  const [companies, setCompanies] = useState([]);
  const [form, setForm] = useState({
    name: '', logo: '', color: '#22c55e', address: '', currency: 'FCFA', period: 'MENSUEL',
    adminEmail: '', adminPassword: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const { loading, error, execute } = useAsync();
  const userRole = localStorage.getItem('role');
  const userEmail = localStorage.getItem('email');
  const superAdminEmail = 'superadmin@demo.com'; // Default superadmin email - should match the actual superadmin

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const closeNotification = () => {
    setNotification(null);
  };

  // Récupérer la liste des entreprises
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        console.log('Chargement des entreprises...');
        console.log('User role:', userRole);
        console.log('User email:', userEmail);
        const response = await companyAPI.getAll();
        console.log('Entreprises reçues:', response.data);
        console.log('Checking invitedSuperAdmins for each company:');
        response.data.forEach(company => {
          console.log(`Company ${company.id} (${company.name}): invitedSuperAdmins =`, company.invitedSuperAdmins);
        });
        setCompanies(response.data);
        localStorage.setItem('companies', JSON.stringify(response.data));
      } catch (err) {
        console.error('Erreur lors du chargement des entreprises:', err);
      }
    };

    fetchCompanies();
  }, []);

  // Activer/Désactiver une entreprise
  const handleToggleActive = async (companyId, isActive) => {
    try {
      const response = await execute(companyAPI.setActive, companyId, isActive);
      const updatedCompany = response.data;

      // Mettre à jour la liste des entreprises
      setCompanies(companies.map(company =>
        company.id === companyId ? updatedCompany : company
      ));

      // Mettre à jour le localStorage
      const updatedCompanies = companies.map(company =>
        company.id === companyId ? updatedCompany : company
      );
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));

      // Si l'entreprise désactivée était sélectionnée, la désélectionner
      if (!isActive) {
        const selectedCompanyId = localStorage.getItem('selectedCompanyId');
        if (selectedCompanyId === companyId.toString()) {
          localStorage.removeItem('selectedCompanyId');
          window.dispatchEvent(new Event('storage'));
        }
      }

    } catch (err) {
      console.error('Erreur lors de la modification du statut de l\'entreprise:', err);
    }
  };

  // Supprimer une entreprise
  const handleDelete = async (companyId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.')) {
      return;
    }

    try {
      await execute(companyAPI.delete, companyId);
      setCompanies(companies.filter(company => company.id !== companyId));

      // Si l'entreprise supprimée était sélectionnée, la désélectionner
      const selectedCompanyId = localStorage.getItem('selectedCompanyId');
      if (selectedCompanyId === companyId.toString()) {
        localStorage.removeItem('selectedCompanyId');
        window.dispatchEvent(new Event('storage'));
      }

      // Mettre à jour le localStorage
      const updatedCompanies = companies.filter(company => company.id !== companyId);
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));

    } catch (err) {
      console.error('Erreur lors de la suppression de l\'entreprise:', err);
    }
  };

  // Inviter le super admin
  const handleInviteSuperAdmin = async (companyId) => {
    try {
      console.log('Inviting superadmin for company:', companyId, 'email:', superAdminEmail);

      await execute(companyAPI.inviteSuperAdmin, companyId, { superAdminEmail });

      // Mettre à jour la liste des entreprises pour refléter le changement
      setCompanies(prevCompanies => {
        const updatedCompanies = prevCompanies.map(company =>
          company.id === companyId
            ? { ...company, invitedSuperAdmins: [...(company.invitedSuperAdmins || []), superAdminEmail] }
            : company
        );
        console.log('Updated companies after invite:', updatedCompanies.find(c => c.id === companyId)?.invitedSuperAdmins);
        return updatedCompanies;
      });

      console.log('Super admin invité avec succès');
    } catch (err) {
      console.error('Erreur lors de l\'invitation du super admin:', err);
    }
  };

  // Retirer l'invitation du super admin
  const handleRemoveSuperAdminInvite = async (companyId) => {
    try {
      console.log('Removing superadmin invite for company:', companyId, 'email:', superAdminEmail);

      await execute(companyAPI.removeSuperAdminInvite, companyId, { superAdminEmail });

      // Mettre à jour la liste des entreprises
      setCompanies(prevCompanies => {
        const updatedCompanies = prevCompanies.map(company =>
          company.id === companyId
            ? { ...company, invitedSuperAdmins: (company.invitedSuperAdmins || []).filter(email => email !== superAdminEmail) }
            : company
        );
        console.log('Updated companies after remove:', updatedCompanies.find(c => c.id === companyId)?.invitedSuperAdmins);
        return updatedCompanies;
      });

      console.log('Invitation du super admin retirée');
    } catch (err) {
      console.error('Erreur lors du retrait de l\'invitation:', err);
    }
  };

  // Ajouter une entreprise
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des données
    const companyData = { ...form };
    const errors = validateCompanyData(companyData);

    // Vérification supplémentaire pour les champs requis
    if (!form.adminEmail?.trim()) {
      errors.adminEmail = 'L\'email de l\'administrateur est requis';
    }
    if (!form.adminPassword?.trim()) {
      errors.adminPassword = 'Le mot de passe administrateur est requis';
    }

    if (hasErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      console.log('Données du formulaire:', form);
      const formData = new FormData();
      // Pour les champs requis, on les ajoute toujours (même vides pour déclencher la validation backend)
      const requiredFields = ['name', 'adminEmail', 'adminPassword'];
      Object.entries(form).forEach(([key, value]) => {
        if (requiredFields.includes(key) || (value !== null && value !== undefined && value !== '')) {
          formData.append(key, value || '');
        }
      });
      if (logoFile) formData.append('logoFile', logoFile);

      console.log('FormData créé, envoi à l\'API...');
      const response = await execute(companyAPI.create, formData);
      console.log('Réponse reçue:', response.data);
      const newCompany = response.data.company;

      setCompanies([newCompany, ...companies]);
      setForm({
        name: '',
        logo: '',
        color: '#22c55e',
        address: '',
        currency: 'FCFA',
        period: 'MENSUEL',
        adminEmail: '',
        adminPassword: ''
      });
      setLogoFile(null);

      // Mettre à jour le localStorage
      const updatedCompanies = [newCompany, ...companies];
      localStorage.setItem('companies', JSON.stringify(updatedCompanies));

    } catch (err) {
      console.error('Erreur lors de la création de l\'entreprise:', err);
      // L'erreur sera affichée via le state error géré par useAsync
      // Ne pas vider la liste des entreprises
    }
  };

  return (
  <>
    {notification && (
      <Notification
        message={notification.message}
        type={notification.type}
        onClose={closeNotification}
      />
    )}
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-black mb-2">Gestion des Entreprises</h2>
        <p className="text-black">Créez et gérez les entreprises de votre plateforme</p>
      </div>

      {/* Formulaire de création */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden mb-8">
        <div className="px-6 py-4" style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Créer une nouvelle entreprise</h3>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(error || hasErrors(validationErrors)) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error || 'Veuillez corriger les erreurs ci-dessous'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nom de l'entreprise */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom de l'entreprise *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={e => {
                  setForm({ ...form, name: e.target.value });
                  if (validationErrors.name) {
                    setValidationErrors({ ...validationErrors, name: null });
                  }
                }}
                className={`w-full pl-4 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                  validationErrors.name
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                }`}
                placeholder="Ex: TechCorp SA"
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Adresse */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Adresse
              </label>
              <input
                type="text"
                value={form.address}
                onChange={e => setForm({ ...form, address: e.target.value })}
                className="w-full pl-4 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
                placeholder="Ex: Dakar, Sénégal"
              />
            </div>

            {/* Devise */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Devise
              </label>
              <select
                value={form.currency}
                onChange={e => setForm({ ...form, currency: e.target.value })}
                className="w-full pl-4 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800 appearance-none bg-white"
              >
                <option value="FCFA">FCFA (Franc CFA)</option>
                <option value="EUR">EUR (Euro)</option>
                <option value="USD">USD (Dollar)</option>
              </select>
            </div>

            {/* Période de paie */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Période de paie
              </label>
              <select
                value={form.period}
                onChange={e => setForm({ ...form, period: e.target.value })}
                className="w-full pl-4 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800 appearance-none bg-white"
              >
                <option value="MENSUEL">Mensuel</option>
                <option value="HEBDO">Hebdomadaire</option>
                <option value="JOURNALIER">Journalier</option>
              </select>
            </div>

            {/* Email admin */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Email de l'administrateur *
              </label>
              <input
                type="email"
                value={form.adminEmail}
                onChange={e => {
                  setForm({ ...form, adminEmail: e.target.value });
                  if (validationErrors.adminEmail) {
                    setValidationErrors({ ...validationErrors, adminEmail: null });
                  }
                }}
                className={`w-full pl-4 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                  validationErrors.adminEmail
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                }`}
                placeholder="admin@entreprise.com"
                required
              />
              {validationErrors.adminEmail && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.adminEmail}</p>
              )}
            </div>

            {/* Mot de passe admin */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Mot de passe administrateur *
              </label>
              <input
                type="password"
                value={form.adminPassword}
                onChange={e => {
                  setForm({ ...form, adminPassword: e.target.value });
                  if (validationErrors.adminPassword) {
                    setValidationErrors({ ...validationErrors, adminPassword: null });
                  }
                }}
                className={`w-full pl-4 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                  validationErrors.adminPassword
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                }`}
                placeholder="••••••••"
                required
              />
              {validationErrors.adminPassword && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.adminPassword}</p>
              )}
            </div>
          </div>

          {/* Logo et couleur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Logo de l'entreprise
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setLogoFile(e.target.files[0])}
                  className="w-full pl-4 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[var(--company-color-bg)] file:text-[var(--company-color)] hover:file:bg-[var(--company-color-light)]"
                />
              </div>
              {logoFile && (
                <div className="mt-2">
                  <p className="text-sm text-[var(--company-color)] font-medium">
                    Fichier sélectionné : {logoFile.name}
                  </p>
                  <img
                    src={URL.createObjectURL(logoFile)}
                    alt="Aperçu du logo"
                    className="mt-2 w-16 h-16 rounded-lg border-2 border-slate-200 object-cover"
                  />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Couleur principale
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={form.color}
                  onChange={e => setForm({ ...form, color: e.target.value })}
                  className="w-16 h-12 rounded-lg border-2 border-slate-300 cursor-pointer bg-white"
                  title="Choisir la couleur principale"
                />
                <div className="flex-1">
                  <div
                    className="w-full h-12 rounded-lg border-2 border-slate-300 flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: form.color }}
                  >
                    {form.color}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Création en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer l'entreprise
                </>
              )}
            </button>
          </div>
        </form>
      </div>
      {/* Liste des entreprises */}
      <div className="bg-[var(--company-color-bg)] rounded-xl shadow-lg border overflow-hidden" style={{ borderColor: 'var(--company-color)' }}>
        <div className="px-6 py-4" style={{ backgroundColor: 'var(--company-color)' }}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Entreprises enregistrées</h3>
          </div>
        </div>

        <div className="p-6">
          {companies.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <p className="text-slate-500 text-lg mb-2">Aucune entreprise trouvée</p>
              <p className="text-slate-400">Créez votre première entreprise ci-dessus</p>
            </div>
          ) : (
            <div className="space-y-4">
              {companies.map(company => (
                <div
                  key={company.id}
                  className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all border group ${
                    company.isActive
                      ? 'cursor-pointer border-slate-200 hover:border-[var(--company-color)]'
                      : 'cursor-not-allowed border-gray-200 opacity-60'
                  }`}
                  style={company.isActive ? { borderColor: 'var(--company-color-border)' } : {}}
                  onClick={async () => {
                    if (!company.isActive) return; // Ne rien faire si l'entreprise est inactive

                    if (userRole === 'SUPER_ADMIN') {
                      // Vérifier si le super admin a accès à cette entreprise
                      try {
                        const token = localStorage.getItem('token');
                        const response = await fetch(`http://localhost:5000/api/companies/${company.id}/check-super-admin-access?superAdminEmail=${userEmail}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          }
                        });
                        const data = await response.json();

                        if (data.hasAccess) {
                          localStorage.setItem('selectedCompanyId', company.id);
                          localStorage.setItem('originalRole', userRole); // Store original role
                          localStorage.setItem('role', 'ADMIN'); // Become admin for this company
                          window.dispatchEvent(new Event('storage'));
                          window.location.href = '/dashboard';
                        } else {
                          // Show notification instead of alert
                          showNotification('Vous n\'avez pas accès à cette entreprise. Demandez une invitation à l\'administrateur.', 'error');
                        }
                      } catch (error) {
                        console.error('Erreur lors de la vérification d\'accès:', error);
                        // No alert for errors either
                      }
                      return;
                    }

                    // Pour les autres rôles (ADMIN, CASHIER, USER)
                    localStorage.setItem('selectedCompanyId', company.id);
                    window.dispatchEvent(new Event('storage'));
                    // Redirection vers le dashboard après sélection
                    window.location.href = '/dashboard';
                  }}
                >
                  <div className="p-6">
                    <div className="flex items-center gap-4">
                      {/* Logo ou initiale */}
                      <div className="flex-shrink-0">
                        {company.logo ? (
                          <img
                            src={`http://localhost:5000${company.logo}`}
                            alt={`Logo ${company.name}`}
                            className="w-16 h-16 rounded-lg border-2 border-slate-200 transition-colors object-cover"
                            style={{ borderColor: 'var(--company-color-border)' }}
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-lg border-2 border-slate-200 flex items-center justify-center font-bold text-xl text-white"
                            style={{ backgroundColor: company.color || '#22c55e' }}
                          >
                            {company.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>

                      {/* Informations de l'entreprise */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className={`text-xl font-bold transition-colors ${
                            company.isActive
                              ? 'text-black group-hover:text-[var(--company-color)]'
                              : 'text-gray-400'
                          }`}>
                            {company.name}
                          </h4>
                          <div
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: company.color || '#22c55e' }}
                            title={`Couleur: ${company.color || '#22c55e'}`}
                          ></div>
                          {!company.isActive && (
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                              Désactivée
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="text-slate-600">{company.address || 'Adresse non spécifiée'}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                            <span className="text-slate-600">{company.currency}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-slate-600 capitalize">{company.period.toLowerCase()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        {/* Bouton de sélection */}
                        <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[var(--company-color)] group-hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        {/* Boutons d'action pour super admin */}
                        {userRole === 'SUPER_ADMIN' && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleActive(company.id, !company.isActive);
                              }}
                              className={`p-2 rounded-lg transition-colors ${
                                company.isActive
                                  ? 'text-yellow-500 hover:bg-yellow-50'
                                  : 'text-green-500 hover:bg-green-50'
                              }`}
                              title={company.isActive ? 'Désactiver l\'entreprise' : 'Activer l\'entreprise'}
                            >
                              {company.isActive ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(company.id);
                              }}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="Supprimer l'entreprise"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}

                        {/* Bouton d'invitation pour les admins de cette entreprise */}
                        {(() => {
                           const isInvited = (company.invitedSuperAdmins || []).includes(superAdminEmail);
                           console.log('Company:', company.id, 'superAdminEmail:', superAdminEmail, 'invitedSuperAdmins:', company.invitedSuperAdmins, 'isInvited:', isInvited);
                           return userRole === 'ADMIN' && (
                             <div className="flex items-center gap-1 transition-opacity">
                             {isInvited ? (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleRemoveSuperAdminInvite(company.id);
                                 }}
                                 className="p-2 text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                                 title="Retirer l'invitation du super admin"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6v1h12v-1a6 6 0 00-6-6zM21 12h-6" />
                                 </svg>
                               </button>
                             ) : (
                               <button
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   handleInviteSuperAdmin(company.id);
                                 }}
                                 className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                                 title="Inviter le super admin"
                               >
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                 </svg>
                               </button>
                             )}
                             </div>
                           );
                         })()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
};

export default CompanyList;
