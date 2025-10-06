import React, { useEffect, useState } from 'react';
import { CreditCard, User, DollarSign, Calendar, Plus, Receipt } from 'lucide-react';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ paySlipId: '', amount: '', mode: 'ESPECES', reference: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [approvedPaySlips, setApprovedPaySlips] = useState([]);
  const userRole = localStorage.getItem('role');

  // Charger la liste des bulletins approuvés pour le select
  useEffect(() => {
    fetch('http://localhost:5000/api/payslips?status=APPROVED', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setApprovedPaySlips(data));
  }, []);

  // Charger la liste des paiements
  useEffect(() => {
    console.log('🔍 Loading payments...');
    fetch('http://localhost:5000/api/payments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => {
        console.log('📊 Payments data received:', data);
        console.log('👥 First payment employee data:', data[0]?.paySlip?.employee);
        console.log('🏷️ Employee name from first payment:', data[0]?.paySlip?.employee?.fullName);
        setPayments(data);
      })
      .catch(err => {
        console.error('❌ Error loading payments:', err);
      });
  }, []);

  // Ajouter un paiement
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          paySlipId: Number(form.paySlipId),
          amount: Number(form.amount),
          mode: form.mode,
          reference: form.reference || undefined,
          notes: form.notes || undefined
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du paiement');
      setPayments([data, ...payments]);
      setForm({ paySlipId: '', amount: '', mode: 'ESPECES', reference: '', notes: '' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  const getPaymentModeIcon = (mode) => {
    switch (mode) {
      case 'VIREMENT': return '🏦';
      case 'ORANGE_MONEY': return '📱';
      case 'WAVE': return '💳';
      case 'FREE_MONEY': return '💰';
      default: return '💵';
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'VIREMENT': return 'bg-blue-100 text-blue-800';
      case 'ORANGE_MONEY': return 'bg-orange-100 text-orange-800';
      case 'WAVE': return 'bg-purple-100 text-purple-800';
      case 'FREE_MONEY': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
  <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Payment Form - Only for non-cashier users */}
      {userRole !== 'CASHIER' && (
  <div className="bg-[var(--company-color-bg)] rounded-xl shadow-lg border border-[var(--company-color)] overflow-hidden mb-8">
  <div className="bg-[var(--company-color)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Plus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">Enregistrer un paiement</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* PaySlip Selection */}
            <div>
              <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Bulletin de salaire
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Receipt size={18} className="text-[var(--company-color)]" />
                </div>
                <select
                  value={form.paySlipId}
                  onChange={e => {
                    const selectedSlip = approvedPaySlips.find(slip => slip.id.toString() === e.target.value);
                    setForm({
                      ...form,
                      paySlipId: e.target.value,
                      amount: selectedSlip ? selectedSlip.netSalary.toString() : ''
                    });
                  }}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black appearance-none bg-white"
                  required
                >
                  <option value="">Sélectionner un bulletin</option>
                  {approvedPaySlips.map(slip => (
                    <option key={slip.id} value={slip.id}>
                      {slip.employee?.fullName} - {slip.netSalary?.toLocaleString()} FCFA
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Montant (FCFA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-[var(--company-color)]" />
                </div>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black"
                  placeholder="Ex: 500000"
                  required
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Mode de paiement
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-[var(--company-color)]" />
                </div>
                <select
                  value={form.mode}
                  onChange={e => setForm({ ...form, mode: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black appearance-none bg-white"
                >
                  <option value="ESPECES">💵 Espèces</option>
                  <option value="VIREMENT">🏦 Virement</option>
                  <option value="ORANGE_MONEY">📱 Orange Money</option>
                  <option value="WAVE">💳 Wave</option>
                  <option value="FREE_MONEY">💰 Free Money</option>
                </select>
              </div>
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Référence de transaction (facultatif)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[var(--company-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={form.reference}
                  onChange={e => setForm({ ...form, reference: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black"
                  placeholder="Ex: TXN-001234"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Notes (facultatif)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-[var(--company-color)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black resize-none"
                  placeholder="Notes sur le paiement..."
                  rows="3"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: `linear-gradient(to right, var(--company-color), var(--company-color-dark))` }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Enregistrement...
                </>
              ) : (
                <>
                  <Receipt size={20} />
                  Enregistrer le paiement
                </>
              )}
            </button>
          </div>
        </form>
      </div>
     )}

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-lg border border-[var(--company-color)] overflow-hidden">
        <div className="bg-[var(--company-color)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Receipt size={20} className="text-[var(--company-color)]" />
            </div>
            <h2 className="text-xl font-bold text-black">
              {userRole === 'CASHIER' ? 'Historique des paiements effectués' : 'Historique des paiements'}
            </h2>
          </div>
        </div>

        <div className="overflow-x-auto">
  <table className="w-full bg-[var(--company-color-bg)] border border-[var(--company-color)] rounded-lg overflow-hidden text-black">
            <thead className="bg-[var(--company-color-light)] text-black">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Employé</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Montant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Mode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Date</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Reçu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--company-color)] bg-[var(--company-color-bg)] text-black">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-[var(--company-color-light)] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--company-color)' }}>
                        <span className="text-white font-semibold text-xs">
                          {(payment.paySlip?.employee?.fullName || '??').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-black">
                          {payment.paySlip?.employee?.fullName || 'Employé inconnu'}
                        </span>
                        <span className="text-xs text-gray-500 block">
                          Matricule: {payment.paySlip?.employee?.id || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[var(--company-color)]" />
                      <span className="font-semibold text-black">
                        {formatAmount(payment.amount)} FCFA
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full text-white border" style={{ backgroundColor: 'var(--company-color)', borderColor: 'var(--company-color)' }}>
                      <span>{getPaymentModeIcon(payment.mode)}</span>
                      {payment.mode.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                      🟢 Payé
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-black/60" />
                      <span className="text-black/60">
                        {new Date(payment.date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {payment.receiptUrl ? (
                      <a
                        href={`http://localhost:5000${payment.receiptUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full text-white border transition-all hover:shadow-md"
                        style={{ backgroundColor: 'var(--company-color)', borderColor: 'var(--company-color)' }}
                      >
                        <Receipt size={14} />
                        Télécharger
                      </a>
                    ) : (
                      <span className="text-gray-400 text-xs">Non généré</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {payments.length === 0 && (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Aucun paiement enregistré</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentList;
