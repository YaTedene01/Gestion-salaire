// Hook React pour obtenir la couleur dynamique de l'entreprise sélectionnée
import { useEffect, useState } from 'react';
import { getSelectedCompany } from './company';

export function useCompanyColor() {
  const [color, setColor] = useState('#22c55e');
  useEffect(() => {
    const update = () => {
      const company = getSelectedCompany();
      // Superadmin uses default app colors, not company colors
      const userRole = localStorage.getItem('role');
      if (userRole === 'SUPER_ADMIN') {
        setColor('#22c55e'); // Default app color
      } else {
        setColor(company?.color || '#22c55e');
      }
    };
    window.addEventListener('storage', update);
    update();
    return () => window.removeEventListener('storage', update);
  }, []);
  return color;
}

// Hook pour obtenir l'entreprise sélectionnée complète
export function useSelectedCompany() {
  const [company, setCompany] = useState(getSelectedCompany());
  useEffect(() => {
    const update = () => {
      setCompany(getSelectedCompany());
    };
    window.addEventListener('storage', update);
    update();
    return () => window.removeEventListener('storage', update);
  }, []);
  return company;
}
