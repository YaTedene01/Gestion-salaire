import React, { useState } from 'react';
import { payrunAPI } from '../utils/api';
import { useAsync } from '../utils/useAsync';

const PayRunForm = ({ onAdd }) => {
  const [form, setForm] = useState({
    name: '',
    startDate: '',
    endDate: '',
    periodType: 'MENSUEL',
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { loading, error, execute } = useAsync();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const errors = {};
    if (!form.name.trim()) errors.name = 'Le nom est requis';
    if (!form.startDate) errors.startDate = 'La date de début est requise';
    if (!form.endDate) errors.endDate = 'La date de fin est requise';
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      errors.endDate = 'La date de fin doit être après la date de début';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});

    try {
      const response = await execute(payrunAPI.create, form);
      const newPayrun = response.data;

      // Reset form
      setForm({
        name: '',
        startDate: '',
        endDate: '',
        periodType: 'MENSUEL',
      });

      if (onAdd) onAdd(newPayrun);
    } catch (err) {
      console.error('Erreur lors de la création du cycle de paie:', err);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mb-8">
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 text-center" style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white">Nouveau Cycle de Paie</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {(error || Object.keys(validationErrors).length > 0) && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error || 'Veuillez corriger les erreurs ci-dessous'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Nom du cycle *
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
                placeholder="Ex: Paie Septembre 2025"
                required
              />
              {validationErrors.name && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.name}</p>
              )}
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date de début *
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => {
                  setForm({ ...form, startDate: e.target.value });
                  if (validationErrors.startDate) {
                    setValidationErrors({ ...validationErrors, startDate: null });
                  }
                }}
                className={`w-full pl-4 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                  validationErrors.startDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                }`}
                required
              />
              {validationErrors.startDate && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.startDate}</p>
              )}
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Date de fin *
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => {
                  setForm({ ...form, endDate: e.target.value });
                  if (validationErrors.endDate) {
                    setValidationErrors({ ...validationErrors, endDate: null });
                  }
                }}
                className={`w-full pl-4 pr-4 py-3 border-2 rounded-lg focus:ring-4 transition outline-none text-slate-800 ${
                  validationErrors.endDate
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100'
                    : 'border-slate-200 focus:border-[var(--company-color)] focus:ring-[var(--company-color-bg)]'
                }`}
                required
              />
              {validationErrors.endDate && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.endDate}</p>
              )}
            </div>

            {/* Period Type */}
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Type de période
              </label>
              <select
                value={form.periodType}
                onChange={e => setForm({ ...form, periodType: e.target.value })}
                className="w-full pl-4 pr-4 py-3 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800 appearance-none bg-white"
              >
                <option value="MENSUEL">Mensuel</option>
                <option value="HEBDO">Hebdomadaire</option>
                <option value="JOURNALIER">Journalier</option>
              </select>
            </div>
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
                  Création en cours...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer le cycle
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayRunForm;