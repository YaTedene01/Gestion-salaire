import React, { useEffect, useState } from 'react';
import { UserPlus, Mail, Lock, Shield, Users } from 'lucide-react';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'ADMIN' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Récupérer la liste des utilisateurs
  useEffect(() => {
    fetch('http://localhost:5000/api/users', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  // Ajouter un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Erreur lors de la création');
      setUsers([data, ...users]);
      setForm({ email: '', password: '', role: 'ADMIN' });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return '👑';
      case 'ADMIN': return '👨‍💼';
      case 'CASHIER': return '💰';
      default: return '👤';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ADMIN': return 'bg-blue-100 text-blue-800';
      case 'CASHIER': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
  <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Add User Form */}
  <div className="bg-[#e6faef] rounded-xl shadow-lg border border-[#22c55e] overflow-hidden mb-8">
  <div className="bg-[#22c55e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <UserPlus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">Ajouter un utilisateur</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-white border border-[#22c55e] text-black px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div>
          <label className="block text-sm font-semibold text-[#22c55e] mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#22c55e]" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#22c55e] rounded-lg focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20 transition outline-none text-black"
                  placeholder="exemple@entreprise.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
          <label className="block text-sm font-semibold text-[#22c55e] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#22c55e]" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#22c55e] rounded-lg focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20 transition outline-none text-black"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
          <label className="block text-sm font-semibold text-[#22c55e] mb-2">
                Rôle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={18} className="text-[#22c55e]" />
                </div>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[#22c55e] rounded-lg focus:border-[#22c55e] focus:ring-4 focus:ring-[#22c55e]/20 transition outline-none text-black appearance-none bg-white"
                >
                  <option value="ADMIN">👨‍💼 Administrateur</option>
                  <option value="CASHIER">💰 Caissier</option>
                  <option value="SUPER_ADMIN">👑 Super-Admin</option>
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
                  Ajout en cours...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Ajouter l'utilisateur
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg border border-[#22c55e] overflow-hidden">
        <div className="bg-[#22c55e] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Users size={20} className="text-[#22c55e]" />
            </div>
            <h2 className="text-xl font-bold text-black">Liste des utilisateurs</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
  <table className="w-full bg-[#e6faef] border border-[#22c55e] rounded-lg overflow-hidden text-black">
            <thead className="bg-[#22c55e]/20 text-black">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#22c55e] bg-[#e6faef] text-black">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[#22c55e]/40 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#22c55e] rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.email[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-black">{user.email}</div>
                        <div className="text-xs text-black/60">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-[#22c55e] text-white border border-[#22c55e]">
                      <span>{getRoleIcon(user.role)}</span>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-[#22c55e] text-white">
                      Actif
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Aucun utilisateur trouvé</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserList;
