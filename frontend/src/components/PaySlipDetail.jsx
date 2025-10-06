import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { payslipAPI, payrunAPI } from '../utils/api';
import { useAsync } from '../utils/useAsync';
import { useSelectedCompany } from '../utils/useCompanyColor';

const PaySlipDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [payslip, setPayslip] = useState(null);
  const [payrun, setPayrun] = useState(null);
  const { loading, execute } = useAsync();
  const selectedCompany = useSelectedCompany();
  const userRole = localStorage.getItem('role');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const payslipRes = await payslipAPI.getById(id);
        setPayslip(payslipRes.data);

        // Get payrun info using centralized API
        const payrunRes = await payrunAPI.getById(payslipRes.data.payRunId);
        console.log('Payrun data:', payrunRes.data);
        setPayrun(payrunRes.data);
      } catch (err) {
        console.error('Erreur lors du chargement du bulletin:', err);
      }
    };
    fetchData();
  }, [id]);


  if (!payslip || !payrun) {
    return <div className="text-center py-8">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 text-white" style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedCompany?.logo && (
                <img src={`http://localhost:5000${selectedCompany.logo}`} alt="Logo" className="w-12 h-12 rounded" />
              )}
              <div>
                <h1 className="text-2xl font-bold">{selectedCompany?.name || 'Entreprise'}</h1>
                <p className="text-blue-100">{selectedCompany?.address}</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">BULLETIN DE SALAIRE</h2>
              <p className="text-blue-100">
                Période: {payrun && payrun.startDate && payrun.endDate
                  ? `${new Date(payrun.startDate).toLocaleDateString('fr-FR')} - ${new Date(payrun.endDate).toLocaleDateString('fr-FR')}`
                  : 'Période en cours de chargement...'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Employee Info */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--company-color-border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--company-color)' }}>Informations de l'employé</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm" style={{ color: 'var(--company-color)' }}>Nom complet</p>
              <p className="font-semibold">{payslip.employee?.fullName}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--company-color)' }}>Poste</p>
              <p className="font-semibold">{payslip.employee?.position}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--company-color)' }}>Matricule</p>
              <p className="font-semibold">{payslip.employee?.id}</p>
            </div>
            <div>
              <p className="text-sm" style={{ color: 'var(--company-color)' }}>Type de contrat</p>
              <p className="font-semibold">{payslip.employee?.contractType}</p>
            </div>
          </div>
        </div>

        {/* Salary Details */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--company-color-border)' }}>
          <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--company-color)' }}>Détails du salaire</h3>
          {payslip.status !== 'PENDING' && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">Ce bulletin est approuvé et ne peut plus être modifié.</p>
            </div>
          )}
          <div className="space-y-3">
            <div className="flex justify-between">
              <span style={{ color: 'var(--company-color)' }}>Salaire brut</span>
              <span className="font-semibold" style={{ color: 'var(--company-color)' }}>{payslip.grossSalary?.toLocaleString()} FCFA</span>
            </div>
            {payslip.employee?.contractType === 'JOURNALIER' && payslip.daysWorked && (
              <div className="flex justify-between text-sm" style={{ color: 'var(--company-color)' }}>
                <span>Jours travaillés</span>
                <span>{payslip.daysWorked} jours</span>
              </div>
            )}
            <div className="flex justify-between border-t pt-2" style={{ borderColor: 'var(--company-color-border)' }}>
              <span>Déductions</span>
              <span className="font-semibold text-black">-{payslip.deductions?.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between border-t pt-2 text-lg font-bold" style={{ borderColor: 'var(--company-color-border)' }}>
              <span style={{ color: 'var(--company-color)' }}>Net à payer</span>
              <span style={{ color: 'var(--company-color)' }}>{payslip.netSalary?.toLocaleString()} FCFA</span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        {payslip.payments && payslip.payments.length > 0 && (
          <div className="p-6 border-b" style={{ borderColor: 'var(--company-color-border)' }}>
            <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--company-color)' }}>Historique des paiements</h3>
            <div className="space-y-3">
              {payslip.payments.map(payment => (
                <div key={payment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-semibold">{payment.amount.toLocaleString()} FCFA</p>
                    <p className="text-sm text-gray-600">{payment.mode} - {new Date(payment.date).toLocaleDateString()}</p>
                    {payment.reference && <p className="text-sm text-gray-500">Réf: {payment.reference}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{payment.receiptNumber}</p>
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Télécharger reçu</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment Status */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--company-color-border)' }}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold" style={{ color: 'var(--company-color)' }}>Statut de paiement</h3>
              <p className="text-sm text-gray-600">
                Total payé: {payslip.payments?.reduce((sum, p) => sum + p.amount, 0)?.toLocaleString() || 0} FCFA / {payslip.netSalary?.toLocaleString()} FCFA
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              payslip.status === 'PAID' ? 'bg-green-100 text-green-800' :
              payslip.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
              payslip.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
              'bg-red-100 text-red-800'
            }`}>
              {payslip.status === 'PAID' ? '🟢 Payé' :
               payslip.status === 'PARTIAL' ? '🟡 Partiel' :
               payslip.status === 'APPROVED' ? '🔵 Approuvé' : '🔴 En attente'}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-600">Date d'émission</p>
              <p className="font-semibold">{new Date().toLocaleDateString()}</p>
            </div>
            <div>
              <button className="text-white px-4 py-2 rounded" style={{ backgroundColor: 'var(--company-color)' }}>
                Télécharger PDF
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PaySlipDetail;