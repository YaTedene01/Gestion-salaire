import React, { useEffect, useState } from 'react';
import { getSelectedCompany } from '../utils/company';
import { useSelectedCompany } from '../utils/useCompanyColor';
import { Link, useLocation } from 'react-router-dom';

const getMenuItems = (userRole) => {
  switch (userRole) {
    case 'SUPER_ADMIN':
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/companies', label: 'Entreprises' },
      ];
    case 'ADMIN':
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/users', label: 'Utilisateurs' },
        { path: '/employees', label: 'Employés' },
        { path: '/attendance', label: 'Présences' },
        { path: '/payruns', label: 'Cycles de Paie' },
      ];
    case 'CASHIER':
      return [
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/payslips', label: 'Bulletins' },
        { path: '/payments', label: 'Paiements' },
      ];
    default:
      return [
        { path: '/dashboard', label: 'Dashboard' },
      ];
  }
};


import { LogOut } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const userRole = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('selectedCompanyId');
    window.location.href = '/';
  };

  const selectedCompany = useSelectedCompany();

  const menuItems = getMenuItems(userRole);

  return (
    <aside className="w-60 h-screen flex flex-col bg-white shadow-xl overflow-hidden fixed top-0 left-0 z-30">
      {/* Logo/Header dynamique */}
      <div className="flex items-center gap-3 px-8 py-10">
        {selectedCompany && selectedCompany.logo ? (
          <img src={`http://localhost:5000${selectedCompany.logo}`} alt="logo" className="w-10 h-10 rounded-full border-2" style={{ borderColor: selectedCompany.color || '#22c55e' }} />
        ) : (
          <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-2xl" style={{ background: selectedCompany?.color || '#22c55e' }}>
            {selectedCompany?.name ? selectedCompany.name[0].toUpperCase() : 'P'}
          </div>
        )}
        <span className="text-2xl font-bold text-black tracking-tight">
          {selectedCompany?.name || 'Psalaire'}
        </span>
      </div>
      {/* Navigation */}
   <nav className="flex-1 px-6 py-8 space-y-2">
        {menuItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-lg transition-all
              ${location.pathname.startsWith(item.path)
                ? 'bg-[var(--company-color)] text-white shadow'
                : 'text-black hover:bg-black/5 hover:text-[var(--company-color)]'}
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      {/* Logout */}
  <div className="px-8 py-8 mt-auto">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-black hover:bg-[#22c55e] hover:text-white rounded-lg transition font-semibold">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
