import React from 'react';
import { Building2, Users, Settings, Shield } from 'lucide-react';

const SuperAdminPage = () => {
  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Espace Super-Administrateur</h1>
          <p className="text-black">Gérez toutes les entreprises et utilisateurs du système</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Companies Card */}
          <div className="bg-white rounded-xl shadow-lg border border-black p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-[#22c55e]/20 p-3 rounded-lg">
                <Building2 size={24} className="text-[#22c55e]" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Entreprises</h3>
                <p className="text-sm text-black">Gérer les entreprises</p>
              </div>
            </div>
            <a
              href="/companies"
              className="w-full bg-[#22c55e] text-white py-2 px-4 rounded-lg font-medium hover:bg-black transition-all text-center block"
            >
              Accéder
            </a>
          </div>

          {/* Users Card */}
          <div className="bg-white rounded-xl shadow-lg border border-black p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-black/10 p-3 rounded-lg">
                <Users size={24} className="text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Utilisateurs</h3>
                <p className="text-sm text-black">Gérer les utilisateurs</p>
              </div>
            </div>
            <a
              href="/users"
              className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-[#22c55e] transition-all text-center block"
            >
              Accéder
            </a>
          </div>

          {/* System Settings Card */}
          <div className="bg-white rounded-xl shadow-lg border border-black p-6 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="bg-black/10 p-3 rounded-lg">
                <Settings size={24} className="text-black" />
              </div>
              <div>
                <h3 className="font-semibold text-black">Paramètres</h3>
                <p className="text-sm text-black">Configuration système</p>
              </div>
            </div>
            <button
              className="w-full bg-black text-white py-2 px-4 rounded-lg font-medium hover:bg-[#22c55e] transition-all"
              disabled
            >
              Bientôt disponible
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6 border border-black">
            <div className="flex items-center gap-3">
              <div className="bg-[#22c55e]/20 p-2 rounded-lg">
                <Building2 size={20} className="text-[#22c55e]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">12</p>
                <p className="text-sm text-black">Entreprises</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-black">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-lg">
                <Users size={20} className="text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">48</p>
                <p className="text-sm text-black">Utilisateurs</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-black">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-lg">
                <Shield size={20} className="text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">3</p>
                <p className="text-sm text-black">Super-Admins</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-black">
            <div className="flex items-center gap-3">
              <div className="bg-black/10 p-2 rounded-lg">
                <Settings size={20} className="text-black" />
              </div>
              <div>
                <p className="text-2xl font-bold text-black">99.9%</p>
                <p className="text-sm text-black">Disponibilité</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;
