// Utilitaire pour récupérer l'entreprise sélectionnée depuis le localStorage
export function getSelectedCompany() {
  const id = localStorage.getItem('selectedCompanyId');
  if (!id) return null;
  const companies = JSON.parse(localStorage.getItem('companies') || '[]');
  return companies.find((c) => String(c.id) === String(id)) || null;
}
