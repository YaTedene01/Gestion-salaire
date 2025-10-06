import React, { useEffect, useState } from 'react';
import { UserPlus, Mail, Lock, Shield, Users, Power, PowerOff, Trash2 } from 'lucide-react';
import { userAPI } from '../utils/api';
import { useAsync } from '../utils/useAsync';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ email: '', password: '', role: 'ADMIN' });
  const { loading, error, execute } = useAsync();

  // Récupérer la liste des utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await userAPI.getAll();
        setUsers(response.data);
      } catch (err) {
        console.error('Erreur lors du chargement des utilisateurs:', err);
      }
    };
    fetchUsers();
  }, []);

  // Ajouter un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await execute(userAPI.create, form);
      setUsers([response.data.user, ...users]);
      setForm({ email: '', password: '', role: 'ADMIN' });
    } catch (err) {
      console.error('Erreur lors de la création de l\'utilisateur:', err);
      // L'erreur sera affichée via le state error géré par useAsync
    }
  };

  // Activer/Désactiver un utilisateur
  const handleToggleActive = async (userId, isActive) => {
    try {
      await execute(userAPI.setActive, userId, isActive);
      setUsers(users.map(user =>
        user.id === userId ? { ...user, isActive } : user
      ));
    } catch (err) {
      console.error('Erreur lors de la modification du statut:', err);
    }
  };

  // Supprimer un utilisateur
  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      return;
    }
    try {
      await execute(userAPI.delete, userId);
      setUsers(users.filter(user => user.id !== userId));
    } catch (err) {
      console.error('Erreur lors de la suppression:', err);
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
  <div className="bg-[var(--company-color-bg)] rounded-xl shadow-lg border border-[var(--company-color)] overflow-hidden mb-8">
  <div className="bg-[var(--company-color)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <UserPlus size={20} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-black">Ajouter un utilisateur</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-6">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Email */}
            <div>
          <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Adresse email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[var(--company-color)]" />
                </div>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black"
                  placeholder="exemple@entreprise.com"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
          <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[var(--company-color)]" />
                </div>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role */}
            <div>
          <label className="block text-sm font-semibold text-[var(--company-color)] mb-2">
                Rôle
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Shield size={18} className="text-[var(--company-color)]" />
                </div>
                <select
                  value={form.role}
                  onChange={e => setForm({ ...form, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 border-2 border-[var(--company-color)] rounded-lg focus:border-[var(--company-color)] focus:ring-4 focus:ring-[var(--company-color-bg)] transition outline-none text-black appearance-none bg-white"
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
                  <UserPlus size={20} />
                  Ajouter l'utilisateur
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-xl shadow-lg border border-[var(--company-color)] overflow-hidden">
        <div className="bg-[var(--company-color)] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-lg">
              <Users size={20} className="text-[var(--company-color)]" />
            </div>
            <h2 className="text-xl font-bold text-black">Liste des utilisateurs</h2>
          </div>
        </div>

        <div className="overflow-x-auto">
  <table className="w-full bg-[var(--company-color-bg)] border border-[var(--company-color)] rounded-lg overflow-hidden text-black">
            <thead className="bg-[var(--company-color-light)] text-black">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Utilisateur</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Rôle</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Statut</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-black">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--company-color)] bg-[var(--company-color-bg)] text-black">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-[var(--company-color-light)] transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--company-color)' }}>
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
                    <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full text-white border" style={{ backgroundColor: 'var(--company-color)', borderColor: 'var(--company-color)' }}>
                      <span>{getRoleIcon(user.role)}</span>
                      {user.role.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.isActive
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(user.id, !user.isActive)}
                        className={`p-2 rounded-lg transition-all hover:scale-110 ${
                          user.isActive
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        }`}
                        title={user.isActive ? 'Désactiver' : 'Activer'}
                      >
                        {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all hover:scale-110"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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
