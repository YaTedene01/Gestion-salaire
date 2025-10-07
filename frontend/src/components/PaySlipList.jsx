import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { payslipAPI, payrunAPI } from '../utils/api';
import { useAsync } from '../utils/useAsync';
import { useToast } from '../utils/useToast';
import ToastContainer from './ToastContainer';

const PaySlipList = () => {
  const { id } = useParams();
  const [payslips, setPayslips] = useState([]);
  const [payrun, setPayrun] = useState(null);
  const [editing, setEditing] = useState(null);
  const [editData, setEditData] = useState({});
  const { loading, execute } = useAsync();
  const { toasts, success, error, removeToast } = useToast();

  // Fetch payrun and payslips
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching data for payrun', id);
        const [payrunRes, payslipsRes] = await Promise.all([
          payrunAPI.getById(id),
          payslipAPI.getByPayRun(id)
        ]);
        console.log('Payrun:', payrunRes.data);
        console.log('Payslips:', payslipsRes.data);
        setPayrun(payrunRes.data);
        setPayslips(payslipsRes.data);
      } catch (err) {
        console.error('Erreur lors du chargement:', err);
      }
    };
    fetchData();
  }, [id]);

  // Update payslip status when payrun status changes to APPROVED
  useEffect(() => {
    if (payrun?.status === 'APPROVED') {
      setPayslips(prevPayslips =>
        prevPayslips.map(payslip =>
          payslip.status === 'PENDING' ? { ...payslip, status: 'APPROVED' } : payslip
        )
      );
    }
  }, [payrun?.status]);

  const handleEdit = (payslip) => {
    setEditing(payslip.id);
    setEditData({
      grossSalary: payslip.grossSalary,
      deductions: payslip.deductions,
      daysWorked: payslip.daysWorked,
    });
  };

  const handleSave = async (payslipId) => {
    try {
      const netSalary = editData.grossSalary - editData.deductions;
      await execute(payslipAPI.update, payslipId, { ...editData, netSalary });
      setPayslips(payslips.map(p => p.id === payslipId ? { ...p, ...editData, netSalary } : p));
      setEditing(null);
      success('Bulletin mis à jour');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      error('Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    setEditing(null);
    setEditData({});
  };

  const handleDelete = async (payslipId) => {
    try {
      await execute(payslipAPI.delete, payslipId);
      setPayslips(payslips.filter(p => p.id !== payslipId));
      success('Bulletin supprimé');
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
      error('Erreur lors de la suppression');
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
          Retour aux cycles de paie
        </button>
      </div>
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-black mb-2">Bulletins de Salaire</h2>
        <p className="text-black">Gérez les bulletins de salaire du cycle</p>
      </div>

      {/* List of payslips */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 text-center" style={{ backgroundColor: 'var(--company-color)' }}>
          <div className="flex items-center justify-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-white">Bulletins de salaire</h3>
          </div>
        </div>

        <div className="p-6">
          {payslips.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-slate-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-slate-500 text-lg mb-2">Aucun bulletin trouvé</p>
              <p className="text-slate-400">Générez les bulletins depuis le cycle de paie</p>
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
                        payslip.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' :
                        payslip.status === 'PAID' ? 'bg-green-100 text-green-800' :
                        payslip.status === 'PARTIAL' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payslip.status === 'APPROVED' ? 'Approuvé' :
                         payslip.status === 'PAID' ? 'Payé' :
                         payslip.status === 'PARTIAL' ? 'Partiel' : 'Brouillon'}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Salaire brut</p>
                      {editing === payslip.id ? (
                        <input
                          type="number"
                          value={editData.grossSalary || 0}
                          onChange={e => setEditData({ ...editData, grossSalary: Number(e.target.value) })}
                          className="w-full pl-4 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
                        />
                      ) : (
                        <p className="text-lg font-bold text-[var(--company-color)]">{payslip.grossSalary?.toLocaleString()} FCFA</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Déductions</p>
                      {editing === payslip.id ? (
                        <input
                          type="number"
                          value={editData.deductions || 0}
                          onChange={e => setEditData({ ...editData, deductions: Number(e.target.value) })}
                          className="w-full pl-4 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
                        />
                      ) : (
                        <p className="text-lg font-bold text-red-600">{payslip.deductions?.toLocaleString()} FCFA</p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Net à payer</p>
                      <p className="text-lg font-bold text-[var(--company-color)]">{(editing === payslip.id ? (editData.grossSalary - editData.deductions) : payslip.netSalary)?.toLocaleString()} FCFA</p>
                    </div>
                  </div>

                  {payslip.employee?.contractType === 'JOURNALIER' && (
                    <div className="mb-4">
                      <p className="text-sm text-slate-500">Jours travaillés</p>
                      {editing === payslip.id ? (
                        <input
                          type="number"
                          value={editData.daysWorked || 0}
                          onChange={e => setEditData({ ...editData, daysWorked: Number(e.target.value) })}
                          className="w-full pl-4 pr-4 py-2 border-2 border-slate-200 rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-slate-800"
                        />
                      ) : (
                        <p className="text-lg font-bold">{payslip.daysWorked}</p>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 justify-center">
                    {editing === payslip.id ? (
                      <>
                        <button
                          onClick={() => handleSave(payslip.id)}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                        >
                          Sauvegarder
                        </button>
                        <button
                          onClick={handleCancel}
                          className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
                        >
                          Annuler
                        </button>
                      </>
                    ) : (
                      <>
                        {payrun?.status === 'DRAFT' && payslip.status === 'PENDING' && (
                          <button
                            onClick={() => handleEdit(payslip)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                          >
                            Modifier
                          </button>
                        )}
                        {payrun?.status === 'DRAFT' && (
                          <button
                            onClick={() => handleDelete(payslip.id)}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
                          >
                            Supprimer
                          </button>
                        )}
                        <Link
                          to={`/payslips/${payslip.id}`}
                          className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition inline-block"
                        >
                          Voir détails
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              ))}
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

export default PaySlipList;