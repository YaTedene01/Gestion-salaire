# Gestion Salaire - Salary Management System

Un système complet de gestion des salaires avec pointage automatique par QR code pour les entreprises.

## 🚀 Fonctionnalités

### 👥 Gestion des Utilisateurs
- **Super Admin** : Gestion globale du système
- **Admin** : Gestion des employés et salaires par entreprise
- **Caissier** : Gestion des paiements
- **Utilisateur** : Accès limité aux bulletins de salaire

### 🏢 Gestion des Entreprises
- Création et configuration d'entreprises
- Personnalisation des couleurs et logos
- Gestion des devises et périodes de paie

### 👨‍💼 Gestion des Employés
- Ajout, modification et suppression d'employés
- Gestion des contrats (journalier, fixe, honoraire)
- Attribution automatique de QR codes pour le pointage

### 📊 Gestion des Salaires
- Calcul automatique des bulletins de salaire
- Gestion des déductions et avantages
- Validation et approbation des bulletins
- Historique complet des paiements

### 📱 Pointage par QR Code
- **Génération automatique** de QR codes pour chaque employé
- **Scanner professionnel** avec caméra ou upload d'image
- **Détection automatique** des présences et retards
- **Interface moderne** avec guides visuels

### 💰 Gestion des Paiements
- Enregistrement des paiements multiples
- Génération automatique de reçus PDF
- Suivi des paiements partiels et complets
- Historique détaillé des transactions

### 📈 Tableaux de Bord
- Statistiques en temps réel
- Rapports de présence par employé
- Taux d'assiduité et performance
- Visualisations graphiques

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** avec **Express.js**
- **TypeScript** pour la sécurité des types
- **Prisma ORM** avec **PostgreSQL**
- **JWT** pour l'authentification
- **bcrypt** pour le hashage des mots de passe
- **PDFKit** pour la génération de reçus
- **QRCode** pour la génération de codes QR

### Frontend
- **React** avec **Vite**
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Lucide React** pour les icônes
- **html5-qrcode** pour le scanner QR
- **Axios** pour les requêtes HTTP

## 📋 Prérequis

- **Node.js** >= 18.0.0
- **PostgreSQL** >= 12.0
- **npm** ou **yarn**

## 🚀 Installation

### 1. Clonage du projet
```bash
git clone <repository-url>
cd gestion-salaire
```

### 2. Installation des dépendances

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd frontend
npm install
```

### 3. Configuration de la base de données

Créer un fichier `.env` dans le dossier `backend` :
```env
DATABASE_URL="postgresql://username:password@localhost:5432/gestion_salaire"
JWT_SECRET="your-super-secret-jwt-key"
PORT=5000
```

### 4. Initialisation de la base de données
```bash
cd backend
npx prisma migrate dev
npx prisma db seed
```

### 5. Démarrage de l'application

#### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

#### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

L'application sera accessible sur :
- **Frontend** : http://localhost:5177
- **Backend API** : http://localhost:5000

## 👤 Comptes de démonstration

Après le seeding, les comptes suivants sont disponibles :

### Super Admin
- **Email** : superadmin@demo.com
- **Mot de passe** : superadmin123

### Admin
- **Email** : admin@demo.com
- **Mot de passe** : 123

### Utilisateur
- **Email** : user@demo.com
- **Mot de passe** : user123

## 📖 Utilisation

### 1. Connexion
- Utilisez les comptes de démonstration ci-dessus
- Sélectionnez votre rôle approprié

### 2. Configuration d'entreprise (Super Admin)
- Créer une nouvelle entreprise
- Configurer les couleurs et paramètres

### 3. Gestion des employés (Admin)
- Ajouter des employés avec leurs informations
- Générer automatiquement des QR codes

### 4. Pointage des présences
- **Employés** : Montrer leur QR code le matin
- **Admins** : Scanner avec l'appareil ou uploader l'image
- **Suivi** : Voir les statistiques en temps réel

### 5. Gestion des salaires
- Créer des périodes de paie
- Calculer automatiquement les bulletins
- Approuver et valider les paiements

### 6. Paiements
- Enregistrer les paiements
- Générer automatiquement les reçus PDF
- Suivre l'historique des transactions

## 🔧 Structure du Projet

```
gestion-salaire/
├── backend/
│   ├── src/
│   │   ├── controllers/     # Logique métier
│   │   ├── services/        # Services métier
│   │   ├── routes/          # Routes API
│   │   ├── middlewares/     # Middlewares Express
│   │   ├── utils/           # Utilitaires (QR, PDF)
│   │   └── models/          # Modèles de données
│   ├── prisma/
│   │   ├── schema.prisma    # Schéma base de données
│   │   └── seed.ts          # Données de démonstration
│   └── uploads/             # Fichiers uploadés
├── frontend/
│   ├── src/
│   │   ├── components/      # Composants React
│   │   ├── pages/           # Pages de l'application
│   │   ├── utils/           # Utilitaires frontend
│   │   └── assets/          # Ressources statiques
│   └── public/              # Fichiers publics
└── README.md
```

## 🔐 Sécurité

- **Authentification JWT** avec expiration
- **Hashage des mots de passe** avec bcrypt
- **Validation des entrées** côté client et serveur
- **Contrôle d'accès** basé sur les rôles
- **Protection CSRF** et **CORS**

## 📊 API Endpoints

### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/register` - Inscription

### Entreprises
- `GET /api/companies` - Liste des entreprises
- `POST /api/companies` - Créer une entreprise

### Employés
- `GET /api/employees` - Liste des employés
- `POST /api/employees` - Ajouter un employé

### Présences
- `POST /api/attendance/scan` - Enregistrer une présence
- `GET /api/attendance/company` - Présences de l'entreprise
- `GET /api/attendance/employee/:id` - Présences d'un employé

### Salaires
- `GET /api/payslips` - Liste des bulletins
- `POST /api/payslips` - Créer un bulletin
- `PUT /api/payslips/:id/approve` - Approuver un bulletin

### Paiements
- `GET /api/payments` - Liste des paiements
- `POST /api/payments` - Enregistrer un paiement

## 🎨 Personnalisation

### Couleurs d'entreprise
Chaque entreprise peut personnaliser :
- Couleur principale
- Logo
- Devise
- Période de paie (mensuel, hebdomadaire, journalier)

### Thème
L'interface s'adapte automatiquement aux couleurs choisies par l'entreprise.

## 📱 Responsive Design

L'application est entièrement responsive et fonctionne sur :
- **Ordinateurs de bureau**
- **Tablettes**
- **Téléphones mobiles**

## 🐛 Dépannage

### Problèmes courants

#### Erreur de connexion à la base de données
```bash
# Vérifier que PostgreSQL est démarré
sudo systemctl status postgresql

# Vérifier la variable DATABASE_URL
cat backend/.env
```

#### Erreur de build frontend
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### Scanner QR ne fonctionne pas
- Vérifier les permissions caméra
- Essayer l'upload d'image comme alternative
- Vérifier la console pour les erreurs

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 📞 Support

Pour toute question ou problème :
- Créer une issue sur GitHub
- Contacter l'équipe de développement

---
Auteur Ya Tedene Faye

**Développé avec ❤️ pour simplifier la gestion des salaires et améliorer l'assiduité des employés.**