import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { payslipAPI } from '../utils/api';
import { useAsync } from '../utils/useAsync';
import { useToast } from '../utils/useToast';
import ToastContainer from './ToastContainer';

const PaySlipListCashier = () => {
  const [payslips, setPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { loading: asyncLoading, execute } = useAsync();
  const { toasts, removeToast, success, error: toastError } = useToast();

  console.log('PaySlipListCashier component rendered');
  console.log('User role:', localStorage.getItem('role'));
  console.log('User email:', localStorage.getItem('email'));
  console.log('Selected company ID:', localStorage.getItem('selectedCompanyId'));

  // Fetch only approved payslips
  useEffect(() => {
    const fetchApprovedPayslips = async () => {
      try {
        setLoading(true);
        setError('');
        console.log('🔍 Fetching approved payslips for cashier...');
        console.log('📡 API call to:', '/api/payslips?status=APPROVED');

        const response = await payslipAPI.getAllApproved();
        console.log('✅ API Response received:', response);
        console.log('📊 Response data:', response.data);
        console.log('🔢 Number of approved payslips:', response.data?.length || 0);

        if (response.data && response.data.length > 0) {
          console.log('📋 First payslip details:', response.data[0]);
          setPayslips(response.data);
        } else {
          console.log('⚠️ No approved payslips found');
          setPayslips([]);
        }
      } catch (err) {
        console.error('❌ Error loading approved payslips:', err);
        console.error('🔍 Error details:', err.response?.data || err.message);
        setError('Erreur lors du chargement des bulletins approuvés');
      } finally {
        setLoading(false);
        console.log('🏁 Loading completed');
      }
    };

    console.log('🚀 Starting to fetch approved payslips...');
    fetchApprovedPayslips();
  }, []);

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('fr-FR').format(salary);
  };

  const handleRecordPayment = async (payslip) => {
    try {
      // Enregistrer le paiement automatique du montant total
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          paySlipId: payslip.id,
          amount: payslip.netSalary,
          mode: 'ESPECES' // Mode par défaut
        })
      });

      if (!response.ok) {
        throw new Error('Erreur lors de l\'enregistrement du paiement');
      }

      // Rafraîchir la liste pour voir le statut mis à jour
      const updatedResponse = await payslipAPI.getAllApproved();
      setPayslips(updatedResponse.data);

      // Afficher un toast de succès
      if (toasts.length === 0) {
        success('Paiement enregistré avec succès');
      }
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du paiement:', err);
      toastError('Erreur lors de l\'enregistrement du paiement');
    }
  };

  return (
    <>
      <div className="max-w-6xl mx-auto py-8 px-4">
        <div className="mb-4 flex justify-center">
          <button
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour au dashboard
          </button>
        </div>
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-black mb-2">Bulletins de Salaire Approuvés</h2>
          <p className="text-black">Consultez les bulletins approuvés pour effectuer les paiements</p>
        </div>

        {/* List of approved payslips */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden max-w-4xl mx-auto">
          <div className="px-6 py-4 text-center" style={{ backgroundColor: 'var(--company-color)' }}>
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Bulletins approuvés</h3>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 m-6">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-slate-600">Chargement des bulletins...</span>
            </div>
          ) : (
            <div className="p-6">
              {payslips.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-slate-500 text-lg mb-2">Aucun bulletin approuvé trouvé</p>
                  <p className="text-slate-400">Les bulletins doivent être approuvés par l'administrateur</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {payslips.map(payslip => (
                    <div key={payslip.id} className="bg-slate-50 rounded-lg p-6 border border-slate-200 text-center">
                      <div className="mb-4">
                        <h4 className="text-xl font-bold text-black">{payslip.employee?.fullName}</h4>
                        <p className="text-slate-600">{payslip.employee?.position}</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-slate-500">Statut</p>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payslip.status === 'PAID' ? 'bg-green-100 text-green-800' :
                            payslip.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                            payslip.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {payslip.status === 'PAID' ? '🟢 Payé' :
                             payslip.status === 'PARTIAL' ? '🟡 Partiel' :
                             payslip.status === 'APPROVED' ? '🔵 Approuvé' : '🔴 En attente'}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Salaire brut</p>
                          <p className="text-lg font-bold text-[var(--company-color)]">{payslip.grossSalary?.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Déductions</p>
                          <p className="text-lg font-bold text-red-600">{payslip.deductions?.toLocaleString()} FCFA</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-500">Net à payer</p>
                          <p className="text-lg font-bold text-[var(--company-color)]">{payslip.netSalary?.toLocaleString()} FCFA</p>
                        </div>
                      </div>

                      {payslip.employee?.contractType === 'JOURNALIER' && (
                        <div className="mb-4">
                          <p className="text-sm text-slate-500">Jours travaillés</p>
                          <p className="text-lg font-bold">{payslip.daysWorked}</p>
                        </div>
                      )}

                      <div className="flex gap-2 justify-center">
                        <Link
                          to={`/payslips/${payslip.id}`}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition inline-block"
                        >
                          Voir détails
                        </Link>
                        {payslip.status !== 'PAID' && (
                          <button
                            onClick={() => handleRecordPayment(payslip)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                          >
                            Enregistrer paiement
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  );
};

export default PaySlipListCashier;