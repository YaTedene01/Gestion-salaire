 import React, { useState } from 'react';
import { User, Briefcase, FileText, DollarSign, CreditCard, CheckCircle, Plus } from 'lucide-react';
import { employeeAPI } from '../utils/api';
import { validateEmployeeData, hasErrors } from '../utils/validation';
import { useAsync } from '../utils/useAsync';

const EmployeeForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    fullName: '',
    position: '',
    contractType: 'FIXE',
    salary: '',
    bankDetails: '',
    isActive: true
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { loading, error, execute } = useAsync();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation des données
    const employeeData = { ...form, salary: Number(form.salary) };
    const errors = validateEmployeeData(employeeData);

    if (hasErrors(errors)) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      console.log('Creating employee with data:', employeeData);
      const response = await execute(employeeAPI.create, employeeData);
      const newEmployee = response.data;
      console.log('Employee created successfully:', newEmployee);

      // Réinitialiser le formulaire
      setForm({
        fullName: '',
        position: '',
        contractType: 'FIXE',
        salary: '',
        bankDetails: '',
        isActive: true
      });

      // Notifier le parent
      if (onAdd) {
        console.log('Calling onAdd with new employee:', newEmployee);
        onAdd(newEmployee);
      }
    } catch (err) {
      // L'erreur est déjà gérée par useAsync
      console.error('Erreur lors de la création de l\'employé:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-6 py-4" style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}>
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Plus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">Ajouter un employé</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(error || hasErrors(validationErrors)) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error || 'Veuillez corriger les erreurs ci-dessous'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom complet
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={form.fullName}
                  onChange={e => {
                    setForm({ ...form, fullName: e.target.value });
                    if (validationErrors.fullName) {
                      setValidationErrors({ ...validationErrors, fullName: null });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                    validationErrors.fullName
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                  }`}
                  placeholder="Ex: Jean Dupont"
                  required
                />
              </div>
              {validationErrors.fullName && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.fullName}</p>
              )}
            </div>

            {/* Position */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Poste
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase size={18} className="text-slate-400" />
                </div>
                <input
                  type="text"
                  value={form.position}
                  onChange={e => setForm({ ...form, position: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
                  placeholder="Ex: Développeur"
                  required
                />
              </div>
            </div>

            {/* Contract Type */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Type de contrat
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FileText size={18} className="text-slate-400" />
                </div>
                <select
                  value={form.contractType}
                  onChange={e => setForm({ ...form, contractType: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800 appearance-none bg-white"
                >
                  <option value="FIXE">Fixe</option>
                  <option value="JOURNALIER">Journalier</option>
                  <option value="HONORAIRE">Honoraire</option>
                </select>
              </div>
            </div>

            {/* Salary */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Salaire (FCFA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-slate-400" />
                </div>
                <input
                  type="number"
                  value={form.salary}
                  onChange={e => {
                    setForm({ ...form, salary: e.target.value });
                    if (validationErrors.salary) {
                      setValidationErrors({ ...validationErrors, salary: null });
                    }
                  }}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                    validationErrors.salary
                      ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                      : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                  }`}
                  placeholder="Ex: 500000"
                  required
                />
              </div>
              {validationErrors.salary && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.salary}</p>
              )}
            </div>
          </div>

          {/* Bank Details */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Coordonnées bancaires
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CreditCard size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                value={form.bankDetails}
                onChange={e => setForm({ ...form, bankDetails: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
                placeholder="Ex: IBAN ou numéro de compte"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive}
              onChange={e => setForm({ ...form, isActive: e.target.checked })}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
              <CheckCircle size={16} className="text-green-500" />
              Employé actif
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Ajouter l'employé
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EmployeeForm;
