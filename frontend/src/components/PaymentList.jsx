import React, { useEffect, useState } from 'react';
import { CreditCard, User, DollarSign, Calendar, Plus, Receipt } from 'lucide-react';

const PaymentList = () => {
  const [payments, setPayments] = useState([]);
  const [form, setForm] = useState({ employeeId: '', amount: '', mode: 'ESPECES' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [employees, setEmployees] = useState([]);

  // Charger la liste des employés pour le select
  useEffect(() => {
    fetch('http://localhost:5000/api/employees', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setEmployees(data));
  }, []);

  // Charger la liste des paiements
  useEffect(() => {
    fetch('http://localhost:5000/api/payments', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setPayments(data));
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
        body: JSON.stringify({ ...form, amount: Number(form.amount) })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors du paiement');
      setPayments([data, ...payments]);
      setForm({ employeeId: '', amount: '', mode: 'ESPECES' });
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
      default: return '💵';
    }
  };

  const getPaymentModeColor = (mode) => {
    switch (mode) {
      case 'VIREMENT': return 'bg-blue-100 text-blue-800';
      case 'ORANGE_MONEY': return 'bg-orange-100 text-orange-800';
      case 'WAVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
  <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Payment Form */}
  <div className="bg-[#e6faef] rounded-xl shadow-lg border border-[#22c55e] overflow-hidden mb-8">
  <div className="bg-[#22c55e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Plus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">Enregistrer un paiement</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-white border border-[#22c55e] text-black px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Employee Selection */}
            <div>
              <label className="block text-sm font-semibold text-[#22c55e] mb-2">
                Employé
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-[#22c55e]" />
                </div>
                <select
                  value={form.employeeId}
                  onChange={e => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#22c55e] rounded-lg focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20 transition outline-none text-black appearance-none bg-white"
                  required
                >
                  <option value="">Sélectionner un employé</option>
                  {employees.map(emp => (
                    <option key={emp.id} value={emp.id}>{emp.fullName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-[#22c55e] mb-2">
                Montant (FCFA)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign size={18} className="text-[#22c55e]" />
                </div>
                <input
                  type="number"
                  value={form.amount}
                  onChange={e => setForm({ ...form, amount: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#22c55e] rounded-lg focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20 transition outline-none text-black"
                  placeholder="Ex: 500000"
                  required
                />
              </div>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="block text-sm font-semibold text-[#22c55e] mb-2">
                Mode de paiement
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <CreditCard size={18} className="text-[#22c55e]" />
                </div>
                <select
                  value={form.mode}
                  onChange={e => setForm({ ...form, mode: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#22c55e] rounded-lg focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20 transition outline-none text-black appearance-none bg-white"
                >
                  <option value="ESPECES">💵 Espèces</option>
                  <option value="VIREMENT">🏦 Virement</option>
                  <option value="ORANGE_MONEY">📱 Orange Money</option>
                  <option value="WAVE">💳 Wave</option>
                </select>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#22c55e] text-white py-3 rounded-lg font-semibold hover:bg-black transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Payments List */}
      <div className="bg-white rounded-xl shadow-lg border border-[#22c55e] overflow-hidden">
        <div className="bg-[#22c55e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Receipt size={20} className="text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-bold text-black">Historique des paiements</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
  <table className="w-full bg-[#e6faef] border border-[#22c55e] rounded-lg overflow-hidden text-black">
            <thead className="bg-[#22c55e]/20 text-black">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Employé</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Montant</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Mode</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22c55e] bg-[#e6faef] text-black">
              {payments.map(payment => (
                <tr key={payment.id} className="hover:bg-[#22c55e]/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#22c55e] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xs">
                          {(payment.employee?.fullName || '??').split(' ').map(n => n[0]).join('').toUpperCase()}
                        </span>
                      </div>
                      <span className="font-medium text-black">
                        {payment.employee?.fullName || 'Employé inconnu'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-[#22c55e]" />
                      <span className="font-semibold text-black">
                        {formatAmount(payment.amount)} FCFA
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#22c55e] text-white border border-[#22c55e]">
                      <span>{getPaymentModeIcon(payment.mode)}</span>
                      {payment.mode.replace('_', ' ')}
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
