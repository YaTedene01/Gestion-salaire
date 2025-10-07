import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { payrunAPI } from '../utils/api';
import { useAsync } from '../utils/useAsync';
import { useToast } from '../utils/useToast';
import ToastContainer from './ToastContainer';
import PayRunForm from './PayRunForm';

const PayRunList = () => {
  const [payruns, setPayruns] = useState([]);
  const { loading, execute } = useAsync();
  const { toasts, success, error, removeToast } = useToast();

  // Fetch payruns
  useEffect(() => {
    const fetchPayruns = async () => {
      try {
        const response = await payrunAPI.getAll();
        setPayruns(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des cycles de paie:', err);
      }
    };
    fetchPayruns();
  }, []);

  // Generate payslips
  const handleGeneratePaySlips = async (payrunId) => {
    try {
      await execute(payrunAPI.generatePaySlips, payrunId);
      // Refresh the payrun to show updated payslips
      const response = await payrunAPI.getById(payrunId);
      setPayruns(payruns.map(p => p.id === payrunId ? response.data : p));
      success('Bulletins générés avec succès');
    } catch (err) {
      console.error('Erreur lors de la génération des bulletins:', err);
      error('Erreur lors de la génération des bulletins');
    }
  };

  // Update status
  const handleUpdateStatus = async (payrunId, status) => {
    try {
      await execute(payrunAPI.updateStatus, payrunId, status);
      setPayruns(payruns.map(p => p.id === payrunId ? { ...p, status } : p));
      success(`Cycle ${status === 'APPROVED' ? 'approuvé' : 'clôturé'} avec succès`);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err);
      error('Erreur lors de la mise à jour du statut');
    }
  };

  // Delete payrun
  const handleDeletePayRun = async (payrunId) => {
    try {
      await execute(payrunAPI.delete, payrunId);
      setPayruns(payruns.filter(p => p.id !== payrunId));
      success('Cycle supprimé avec succès');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      error('Erreur lors de la suppression');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'DRAFT': return 'Brouillon';
      case 'APPROVED': return 'Approuvé';
      case 'CLOSED': return 'Clôturé';
      default: return status;
    }
  };

  const handleAddPayrun = (newPayrun) => {
    setPayruns([newPayrun, ...payruns]);
  };

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Cycles de Paie</h2>
          <p className="text-black">Gérez les cycles de paie et générez les bulletins de salaire</p>
        </div>

        {/* Form for creating new payrun */}
        <PayRunForm onAdd={handleAddPayrun} />

        {/* List of payruns */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-4 text-center" style={{ backgroundColor: 'var(--company-color)' }}>
            <div className="flex items-center justify-center gap-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Cycles de paie</h3>
            </div>
          </div>

          <div className="p-6">
            {payruns.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className="text-slate-500 text-lg mb-2">Aucun cycle de paie trouvé</p>
                <p className="text-slate-400">Créez votre premier cycle de paie</p>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="space-y-4 max-w-4xl w-full">
                  {payruns.map(payrun => (
                  <div key={payrun.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-center">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-black">{payrun.name}</h4>
                        <p className="text-slate-600">
                          {new Date(payrun.startDate).toLocaleDateString()} - {new Date(payrun.endDate).toLocaleDateString()}
                        </p>
                        <p className="text-slate-600 capitalize">{payrun.periodType.toLowerCase()}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(payrun.status)}`}>
                          {getStatusText(payrun.status)}
                        </span>
                        <span className="text-slate-600">
                          {payrun.paySlips?.length || 0} bulletins
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center">
                      {payrun.status === 'DRAFT' && (
                        <>
                          <button
                            onClick={() => handleGeneratePaySlips(payrun.id)}
                            disabled={loading}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            Générer bulletins
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(payrun.id, 'APPROVED')}
                            disabled={loading}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            Approuver
                          </button>
                        </>
                      )}
                      {payrun.status === 'APPROVED' && (
                        <button
                          onClick={() => handleUpdateStatus(payrun.id, 'CLOSED')}
                          disabled={loading}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                        >
                          Clôturer
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePayRun(payrun.id)}
                        disabled={loading}
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                      >
                        Supprimer
                      </button>
                      {payrun.paySlips && payrun.paySlips.length > 0 && (
                        <Link
                          to={`/payruns/${payrun.id}/payslips`}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition"
                        >
                          Voir bulletins
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default PayRunList;