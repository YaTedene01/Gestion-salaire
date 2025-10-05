import React, { createContext, useContext, useEffect } from 'react';
import { useSelectedCompany } from '../utils/useCompanyColor';

// Contexte pour le thème
const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const selectedCompany = useSelectedCompany();

  // Couleur par défaut
  const defaultColor = '#22c55e';

  // Couleur actuelle de l'entreprise
  const currentColor = selectedCompany?.color || defaultColor;

  useEffect(() => {
    // Appliquer les variables CSS dynamiques
    const root = document.documentElement;

    // Couleur principale
    root.style.setProperty('--company-color', currentColor);

    // Générer des variantes de couleur
    root.style.setProperty('--company-color-light', adjustColor(currentColor, 20));
    root.style.setProperty('--company-color-dark', adjustColor(currentColor, -20));
    root.style.setProperty('--company-color-bg', currentColor + '10'); // 10% opacity
    root.style.setProperty('--company-color-border', currentColor + '30'); // 30% opacity

    // Mettre à jour le thème dans le localStorage pour la persistance
    localStorage.setItem('company-theme-color', currentColor);

  }, [currentColor]);

  const value = {
    currentColor,
    selectedCompany,
    defaultColor
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Fonction utilitaire pour ajuster la luminosité d'une couleur
function adjustColor(color, amount) {
  // Convertir hex vers RGB
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Ajuster la luminosité
  const newR = Math.max(0, Math.min(255, r + amount));
  const newG = Math.max(0, Math.min(255, g + amount));
  const newB = Math.max(0, Math.min(255, b + amount));

  // Convertir RGB vers hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
}