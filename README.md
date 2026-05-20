<div align="center">

# 🐾 Vetocare

**La santé animale simplifiée**

Une plateforme vétérinaire complète connectant propriétaires d'animaux et vétérinaires à travers l'Algérie — avec réservation en temps réel, gestion de dossiers médicaux numériques et notifications automatisées.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## 📋 Table des Matières

- [Présentation](#présentation)
- [Fonctionnalités](#fonctionnalités)
- [Stack Technique](#stack-technique)
- [Structure du Projet](#structure-du-projet)
- [Architecture des Routes](#architecture-des-routes)
- [Base de Données](#base-de-données)
- [Sécurité & RLS](#sécurité--rls)
- [Installation](#installation)
- [Déploiement](#déploiement)
- [Scripts Disponibles](#scripts-disponibles)
- [Contribuer](#contribuer)
- [Licence](#licence)

---

## Présentation

### La Problématique

Les propriétaires d'animaux en Algérie font face à des obstacles majeurs pour accéder aux soins vétérinaires :

- Aucun annuaire centralisé pour trouver et vérifier les vétérinaires
- Absence de système de prise de rendez-vous en ligne
- Pas de dossiers médicaux numériques pour les animaux
- Communication limitée entre propriétaires et vétérinaires

De leur côté, les vétérinaires manquent d'outils numériques pour gérer leur activité, présenter leurs services et maintenir des dossiers patients.

### La Solution

**Vetocare** comble ce vide avec une plateforme web à double rôle offrant :

| Pour les Propriétaires (`user`) | Pour les Vétérinaires (`doctor`) |
|---|---|
| Recherche de vétérinaires par wilaya | Tableau de bord professionnel |
| Réservation et suivi des rendez-vous | Gestion des rendez-vous et dossiers patients |
| Gestion des profils d'animaux | Notifications en temps réel |
| Dossiers médicaux numériques | Suivi des vaccinations et historiques |

La plateforme intègre également un **chatbot IA (VetoBot)**, un système de **notifications in-app**, et une **authentification à double rôle** avec validation admin pour les vétérinaires.

---

## 🎯 Fonctionnalités

### Pour les Propriétaires

| Module | Fonctionnalités |
|---|---|
| **Authentification** | Inscription par email/mot de passe, connexion sécurisée via Supabase Auth, gestion du profil |
| **Gestion des Animaux** | Création et gestion de multiples profils (nom, espèce, race, date de naissance, genre), historique médical, upload de documents PDF |
| **Annuaire des Vétérinaires** | Recherche parmi les 58 wilayas algériennes, consultation des profils avec notes et avis, filtrage par spécialité |
| **Réservation** | Prise de rendez-vous, sélection de date et créneau horaire, ajout du motif et de l'animal concerné |
| **Suivi des Rendez-vous** | Visualisation des statuts (`en attente`, `confirmé`, `annulé`, `terminé`), annulation avec notification |
| **Notifications In-App** | Alertes pour nouveaux rendez-vous, confirmations, rappels |

### Pour les Vétérinaires

| Module | Fonctionnalités |
|---|---|
| **Inscription & Vérification** | Enregistrement avec informations professionnelles, workflow d'approbation admin (`en attente` → `approuvé`) |
| **Tableau de Bord** | Vue d'ensemble des rendez-vous, statistiques clés (RDV du jour, demandes en attente, total patients) |
| **Gestion des Rendez-vous** | Consultation par statut, confirmation, refus, marquage comme terminé, annulation, ajout de notes cliniques |
| **Dossiers Patients** | Liste des patients, historique médical détaillé, historique des consultations, dossiers numériques |
| **Profil** | Mise à jour des informations professionnelles, gestion des détails du cabinet, consultation des notes et avis |
| **Gestion des Vaccinations** | Suivi des vaccins administrés, planning des rappels |
| **Analyse des Données** | Métriques de performance et visualisations |

---

## 🛠 Stack Technique

### Frontend

| Technologie | Version | Rôle |
|---|---|---|
| React | 19.2.4 | Framework UI |
| Vite | 8.0.4 | Build tool & serveur de développement |
| React Router DOM | 7.14.1 | Routage côté client |
| Tailwind CSS | 3.4.1 | Styling utility-first |
| Framer Motion | 12.38.0 | Animations et transitions |
| Lucide React | 1.8.0 | Icônes |
| React Hot Toast | 2.6.0 | Notifications in-app |

### Backend & Services

| Service | Rôle |
|---|---|
| Supabase | Auth, PostgreSQL, Storage, Realtime |
| PostgreSQL | Base de données relationnelle |

### Outils de Développement

| Outil | Version |
|---|---|
| ESLint | 9.39.4 |
| PostCSS | 8.5.14 |
| Autoprefixer | 10.5.0 |

---

## 📁 Structure du Projet

```
vetocare/
├── public/                      # Assets statiques
├── src/
│   ├── assets/                  # Images et médias
│   ├── components/
│   │   ├── common/              # Composants réutilisables
│   │   │   ├── Button.jsx
│   │   │   ├── PetCard.jsx
│   │   │   ├── Skeleton.jsx
│   │   │   ├── StatCard.jsx
│   │   │   ├── StatusBadge.jsx
│   │   │   └── ...
│   │   ├── doctor/              # Composants vétérinaires
│   │   │   ├── AppointmentCard.jsx
│   │   │   ├── AppointmentDetailsModal.jsx
│   │   │   └── AppointmentEmptyState.jsx
│   │   └── user/                # Composants propriétaires
│   │       └── BookingModal.jsx
│   ├── context/
│   │   └── AuthContext.jsx      # Contexte d'authentification
│   ├── core/
│   │   ├── router/
│   │   │   └── AppRouter.jsx    # Configuration des routes
│   │   └── theme/
│   │       ├── colors.js
│   │       └── theme.js
│   ├── hooks/                   # Hooks personnalisés
│   │   ├── useAuth.js
│   │   ├── usePets.js
│   │   ├── useAppointments.js
│   │   ├── usePatients.js
│   │   ├── useDoctorDashboard.js
│   │   └── useNotifications.js
│   ├── layouts/
│   │   ├── DashboardLayout.jsx
│   │   ├── Sidebar.jsx
│   │   └── Navbar.jsx
│   ├── lib/
│   │   └── supabase.js          # Client Supabase
│   ├── pages/
│   │   ├── Landing.jsx          # Page d'accueil
│   │   ├── auth/
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── user/
│   │   │   ├── UserDashboard.jsx
│   │   │   ├── MyPets.jsx
│   │   │   ├── Appointments.jsx
│   │   │   └── DoctorsList.jsx
│   │   └── doctor/
│   │       ├── DoctorDashboard.jsx
│   │       ├── DoctorAppointments.jsx
│   │       ├── Patients.jsx
│   │       ├── PetOwners.jsx
│   │       ├── Vaccinations.jsx
│   │       ├── MedicalRecords.jsx
│   │       ├── Analytics.jsx
│   │       └── DoctorProfile.jsx
│   ├── services/                # Couche d'accès aux données
│   │   ├── appointmentService.js
│   │   ├── petService.js
│   │   ├── medicalService.js
│   │   └── profileService.js
│   ├── styles/                  # Fichiers CSS modulaires
│   │   ├── layout/
│   │   ├── pages/
│   │   └── components/
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── .env.example
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── eslint.config.js
├── supabase_schema.sql
├── notifications_schema.sql
└── README.md
```

---

## 🗺 Architecture des Routes

### Routes Publiques

| Route | Composant | Description |
|---|---|---|
| `/` | `Landing` | Page d'accueil avec présentation |
| `/login` | `Login` | Connexion (propriétaire ou vétérinaire) |
| `/register` | `Register` | Inscription utilisateur |
| `/vet/login` | `VetLogin` | Connexion vétérinaire (optionnel) |
| `/vet/register` | `VetRegister` | Inscription vétérinaire |

### Routes Propriétaire (`user`)

| Route | Composant | Description |
|---|---|---|
| `/dashboard` | `UserDashboard` | Vue d'ensemble |
| `/dashboard/pets` | `MyPets` | Gestion des animaux |
| `/dashboard/appointments` | `Appointments` | Rendez-vous |
| `/dashboard/doctors` | `DoctorsList` | Annuaire vétérinaires |

### Routes Vétérinaire (`doctor`)

| Route | Composant | Description |
|---|---|---|
| `/doctor-dashboard` | `DoctorDashboard` | Vue d'ensemble |
| `/doctor-dashboard/appointments` | `DoctorAppointments` | Gestion des RDV |
| `/doctor-dashboard/patients` | `Patients` | Liste des patients |
| `/doctor-dashboard/owners` | `PetOwners` | Propriétaires |
| `/doctor-dashboard/vaccinations` | `Vaccinations` | Suivi des vaccins |
| `/doctor-dashboard/records` | `MedicalRecords` | Dossiers médicaux |
| `/doctor-dashboard/analytics` | `Analytics` | Statistiques |
| `/doctor-dashboard/profile` | `DoctorProfile` | Profil professionnel |

---

## 🗄 Base de Données

### Schéma Relationnel

```sql
profiles (id, full_name, role, avatar_url, specialty, bio, experience_years, clinic_address, created_at)
    ↓ 1:N
pets (id, owner_id, name, type, breed, age, status, image_url, created_at)
    ↓ 1:N
appointments (id, pet_id, owner_id, doctor_id, date, status, notes, diagnosis, treatment_details, files, created_at, updated_at)
    ↓ 1:N
medical_records (id, pet_id, diagnosis, treatment, date, created_at)
```

### Tables Principales

| Table | Description | Clés Étrangères |
|---|---|---|
| `profiles` | Profils utilisateurs (propriétaires et vétérinaires) | `id` → `auth.users.id` |
| `pets` | Profils des animaux | `owner_id` → `profiles.id` |
| `appointments` | Rendez-vous et leur cycle de vie | `pet_id` → `pets.id`, `owner_id` → `profiles.id`, `doctor_id` → `profiles.id` |
| `medical_records` | Dossiers médicaux | `pet_id` → `pets.id` |
| `notifications` | Notifications in-app | `user_id` → `profiles.id` |

---

## 🔐 Sécurité & RLS

### Row Level Security (RLS)

Toutes les tables sont protégées par **Row Level Security** via Supabase. Chaque opération est filtrée par l'identité de l'utilisateur via `auth.uid()`.

#### Politiques RLS

**Profiles:**
```sql
-- Lecture autorisée pour tous les utilisateurs authentifiés
CREATE POLICY "Anyone can read profiles" ON profiles FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Modification uniquement de son propre profil
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE 
  USING (auth.uid() = id);
```

**Pets:**
```sql
-- Propriétaires: gestion complète de leurs animaux
CREATE POLICY "Users can manage own pets" ON pets FOR ALL 
  USING (auth.uid() = owner_id);

-- Vétérinaires: lecture seule des animaux de leurs patients
CREATE POLICY "Doctors can view pets of their patients" ON pets FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.pet_id = pets.id 
      AND appointments.doctor_id = auth.uid()
    )
  );
```

**Appointments:**
```sql
-- Propriétaires: gestion de leurs rendez-vous
CREATE POLICY "Users can manage own appointments" ON appointments FOR ALL 
  USING (auth.uid() = owner_id);

-- Vétérinaires: gestion des rendez-vous qui leur sont assignés
CREATE POLICY "Doctors can manage their assigned appointments" ON appointments FOR ALL 
  USING (doctor_id = auth.uid());
```

**Medical Records:**
```sql
-- Propriétaires: lecture des dossiers de leurs animaux
CREATE POLICY "Users can view own pets records" ON medical_records FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM pets 
      WHERE id = medical_records.pet_id 
      AND owner_id = auth.uid()
    )
  );

-- Vétérinaires: gestion complète des dossiers de leurs patients
CREATE POLICY "Doctors can manage records of their patients" ON medical_records FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM appointments 
      WHERE appointments.pet_id = medical_records.pet_id 
      AND appointments.doctor_id = auth.uid()
    )
  );
```

### Sécurité des Storage

Les buckets S3 de Supabase Storage ont également des politiques RLS:
- `pets/` bucket:upload/lecture selon owner_id ou doctor_id
- `carnets/` bucket: upload de documents médicaux

---

## 🚀 Installation

### Prérequis

- Node.js ≥ 18.x
- npm ou yarn
- Compte Supabase (gratuit)
- Git

### Cloner le projet

```bash
git clone https://github.com/votre-username/vetocare.git
cd vetocare
```

### Installer les dépendances

```bash
npm install
```

### Configurer les variables d'environnement

Copier le fichier `.env.example` vers `.env`:

```bash
cp .env.example .env
```

Éditer `.env` avec vos identifiants Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://votre-projet.supabase.co
VITE_SUPABASE_ANON_KEY=votre-cle-anon-publique
```

> ⚠️ **Important**: La clé `anon` est publique côté client. Ne jamais exposer la `service_role` key.

### Initialiser la base de données

1. Aller sur [Supabase Dashboard](https://app.supabase.com)
2. Ouvrir l'éditeur SQL
3. Exécuter le contenu de `supabase_schema.sql`
4. Exécuter le contenu de `notifications_schema.sql`

### Lancer le serveur de développement

```bash
npm run dev
```

L'application sera disponible sur **[http://localhost:5173](http://localhost:5173)**

---

## 🏗 Déploiement

### Build de Production

```bash
npm run build
```

Les fichiers de production seront générés dans `dist/`.

### Prévisualisation

```bash
npm run preview
```

### Déploiement sur Vercel / Netlify

```bash
# Vercel (recommandé)
npm i -g vercel
vercel --prod

# Netlify
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

### Variables d'environnement en Production

Ajouter les mêmes variables d'environnement dans votre hébergeur (Vercel/Netlify):

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## 📜 Scripts Disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement (hot reload) |
| `npm run build` | Build de production (optimisé) |
| `npm run preview` | Prévisualise le build localement |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run lint:fix` | Corrige automatiquement les erreurs ESLint |

---

## 🧪 Tests

Aucune suite de tests n'est actuellement implémentée. Pour ajouter des tests:

```bash
# Installer les dépendances de test
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom

# Exécuter les tests
npm test
```

---

## 📚 Documentation API

### Services

Chaque service (`src/services/`) fournit une couche d'abstraction pour les opérations CRUD.

**Example - appointmentService:**

```javascript
import { appointmentService } from './services/appointmentService';

// Récupérer les rendez-vous d'un propriétaire
const appointments = await appointmentService.getAppointments();

// Créer un rendez-vous
const newAppointment = await appointmentService.createAppointment({
  pet_id: 'uuid',
  doctor_id: 'uuid',
  date: '2024-12-25T10:00:00Z',
  service_type: 'consultation',
  reason: 'Checkup annuel'
});
```

### Hooks

Les hooks personnalisés encapsulent la logique d'état et de side-effects.

```javascript
import { useAppointments } from './hooks/useAppointments';

function MyComponent() {
  const { appointments, loading, error, refetch } = useAppointments();
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  
  return (
    <ul>
      {appointments.map(apt => <li key={apt.id}>{apt.date}</li>)}
    </ul>
  );
}
```

---

## 🎨 Personnalisation

### Couleurs du Thème

Les couleurs sont définies dans `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      emerald: {
        50: '#ecfdf5',
        100: '#d1fae5',
        500: '#10b981',   // Primaire
        600: '#059669',   // Primaire-dark
        700: '#047857',   // Secondaire
      },
      zinc: { ... }
    }
  }
}
```

### Variables CSS

Les variables CSS globales sont dans `src/index.css`:

```css
:root {
  --primary: #10b981;
  --primary-dark: #059669;
  --primary-light: #d1fae5;
  --text-main: #18181b;
  --text-muted: #71717a;
  --surface: #ffffff;
  --border: #e4e4e7;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --shadow-soft: 0 1px 3px rgba(0,0,0,0.1);
}
```

---

## 🤝 Contribuer

Les contributions sont les bienvenues ! Veuillez lire [CONTRIBUTING.md](CONTRIBUTING.md) pour les détails.

### Workflow de Développement

1. **Fork** le dépôt
2. **Créer une branche** (`git checkout -b feature/amazing-feature`)
3. **Commit** vos changements (`git commit -m 'Add amazing feature'`)
4. **Push** vers la branche (`git push origin feature/amazing-feature`)
5. **Ouvrir une Pull Request**

### Standards de Code

- ESLint configuration: `.eslintrc.js`
- Formatage: Utiliser Prettier (à configurer)
- Commits: Conventional Commits recommandé (`feat:`, `fix:`, `docs:`...)

### Rapport de Bugs

Veuillez ouvrir une issue sur GitHub avec:
- Étapes pour reproduire
- Comportement attendu vs réel
- Screenshots si applicable
- Environnement (OS, navigateur, version)

---

## 📄 Licence

Ce projet est sous licence **MIT**.

Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2024 Vetocare

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

[...]
```

---

## ❓ Support

Pour toute question ou aide:
- 📧 Email: support@vetocare.dz
- 🐛 Issues: [GitHub Issues](https://github.com/votre-username/vetocare/issues)
- 📖 Documentation: À venir

---

<div align="center">

**© 2026 Vetocare — La santé animale simplifiée.**

[![GitHub stars](https://img.shields.io/github/stars/votre-username/vetocare?style=social)](https://github.com/votre-username/vetocare/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/votre-username/vetocare?style=social)](https://github.com/votre-username/vetocare/network)

</div>
