// Utilitaires de validation pour les formulaires

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'L\'email est requis';
  if (!emailRegex.test(email)) return 'Format d\'email invalide';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Le mot de passe est requis';
  if (password.length < 6) return 'Le mot de passe doit contenir au moins 6 caractères';
  return null;
};

export const validateRequired = (value, fieldName) => {
  if (!value || value.toString().trim() === '') {
    return `${fieldName} est requis`;
  }
  return null;
};

export const validatePositiveNumber = (value, fieldName) => {
  const num = Number(value);
  if (isNaN(num)) return `${fieldName} doit être un nombre`;
  if (num <= 0) return `${fieldName} doit être positif`;
  return null;
};

export const validatePhoneNumber = (phone) => {
  if (!phone) return null; // Optionnel
  const phoneRegex = /^(\+221|221)?[76|77|78|33|70|76|77|78]\d{7}$/;
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
    return 'Format de numéro de téléphone invalide (ex: +221 77 123 45 67)';
  }
  return null;
};

export const validateEmployeeData = (data) => {
  const errors = {};

  errors.fullName = validateRequired(data.fullName, 'Le nom complet');
  errors.position = validateRequired(data.position, 'Le poste');
  errors.contractType = validateRequired(data.contractType, 'Le type de contrat');
  errors.salary = validatePositiveNumber(data.salary, 'Le salaire');

  // Supprimer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });

  return errors;
};

export const validatePaymentData = (data) => {
  const errors = {};

  errors.employeeId = validateRequired(data.employeeId, 'L\'employé');
  errors.amount = validatePositiveNumber(data.amount, 'Le montant');
  errors.mode = validateRequired(data.mode, 'Le mode de paiement');

  // Supprimer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });

  return errors;
};

export const validateCompanyData = (data) => {
  const errors = {};

  errors.name = validateRequired(data.name, 'Le nom de l\'entreprise');
  errors.adminEmail = validateEmail(data.adminEmail);
  errors.adminPassword = validatePassword(data.adminPassword);

  // Supprimer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });

  return errors;
};

export const validateLoginData = (data) => {
  const errors = {};

  errors.email = validateEmail(data.email);
  errors.password = validateRequired(data.password, 'Le mot de passe');

  // Supprimer les erreurs null
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });

  return errors;
};

// Fonction utilitaire pour vérifier si un objet d'erreurs est vide
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};