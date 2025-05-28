
# Guide de Démarrage - Application Gestion Manutentionnaires sur Replit

## Vue d'ensemble
Cette application est une solution complète de gestion des manutentionnaires développée avec React, Vite, et Supabase. Elle permet de gérer les sites clients, suivre les envois, et générer des rapports mensuels.

## Prérequis
- Un compte Replit actif
- Un projet Supabase configuré avec les tables nécessaires

## Étapes de Démarrage

### 1. Configuration Initiale sur Replit

1. **Forker ou Importer le Projet**
   - Si vous avez le code sur GitHub : Utilisez "Import from GitHub"
   - Sinon, créez un nouveau Repl React/Vite

2. **Structure du Projet**
   ```
   ├── src/
   │   ├── components/     # Composants réutilisables
   │   ├── pages/         # Pages principales
   │   ├── lib/           # Configuration et utilitaires
   │   ├── contexts/      # Contextes React
   │   └── hooks/         # Hooks personnalisés
   ├── public/            # Fichiers statiques
   └── supabase/         # Migrations de base de données
   ```

### 2. Installation des Dépendances

L'application utilise les packages suivants :
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.x",
    "@supabase/supabase-js": "^2.x",
    "framer-motion": "^10.x",
    "lucide-react": "^0.x",
    "chart.js": "^4.x",
    "react-chartjs-2": "^5.x",
    "html2canvas": "^1.x",
    "jspdf": "^2.x",
    "tailwindcss": "^3.x"
  }
}
```

### 3. Configuration de Supabase

1. **Variables d'Environnement**
   - Allez dans l'onglet "Secrets" de Replit
   - Ajoutez ces variables :
     ```
     VITE_SUPABASE_URL=votre_url_supabase
     VITE_SUPABASE_ANON_KEY=votre_clé_anonyme_supabase
     ```

2. **Structure de Base de Données**
   Votre projet Supabase doit contenir ces tables :
   - `client_sites` : Sites clients
   - `dispatches` : Envois de manutentionnaires
   - `user_settings` : Paramètres utilisateur
   - `profiles` : Profils utilisateurs

### 4. Démarrage de l'Application

1. **Installer les dépendances** (automatique sur Replit)
   ```bash
   npm install
   ```

2. **Lancer l'application**
   - Cliquez sur le bouton "Run" dans Replit
   - Ou utilisez la commande : `npm run dev`

3. **Accès à l'application**
   - L'application sera accessible via l'URL fournie par Replit
   - Par défaut sur le port 5173 (configuré dans vite.config.js)

### 5. Configuration du Workflow Replit

Le fichier `.replit` est configuré pour :
```
run = "npm run dev"
entrypoint = "src/main.jsx"
```

### 6. Fonctionnalités Principales

#### Dashboard
- Vue d'ensemble des statistiques
- Graphiques d'activité mensuelle
- Cartes de métriques clés

#### Gestion des Sites Clients
- Ajout/modification/suppression de sites
- Liste paginée et recherche

#### Envois de Manutentionnaires
- Enregistrement des envois
- Historique complet
- Filtrage par période

#### Rapports Mensuels
- Graphiques par site client
- Export PDF automatique
- Statistiques détaillées

### 7. Architecture Technique

#### Frontend
- **React 18** avec hooks modernes
- **React Router** pour la navigation
- **Tailwind CSS** pour le styling
- **Framer Motion** pour les animations
- **Chart.js** pour les graphiques

#### Backend
- **Supabase** pour la base de données
- **Authentification** Supabase intégrée
- **Row Level Security** activée

#### Styling
- Design system cohérent avec shadcn/ui
- Thème sombre/clair adaptatif
- Composants réutilisables

### 8. Déploiement sur Replit

1. **Configuration du Déploiement**
   - Allez dans l'onglet "Deploy"
   - Sélectionnez "Autoscale deployment"
   - Configuration recommandée :
     - Build command : `npm run build`
     - Run command : `npm run preview`

2. **Variables d'environnement pour la production**
   - Assurez-vous que les secrets Supabase sont configurés
   - L'application sera accessible via votre domaine Replit

### 9. Dépannage Courant

#### Problème de connexion Supabase
- Vérifiez vos variables d'environnement dans "Secrets"
- Assurez-vous que l'URL et la clé sont correctes

#### Erreurs de compilation
- Redémarrez l'application avec le bouton "Run"
- Vérifiez la console pour les erreurs spécifiques

#### Problèmes de graphiques
- Les données Chart.js nécessitent un délai de chargement
- Vérifiez que les données Supabase sont correctement formatées

### 10. Maintenance et Mises à Jour

#### Sauvegarde
- Le code est automatiquement sauvegardé sur Replit
- Utilisez Git pour versioning si nécessaire

#### Monitoring
- Surveillez les logs dans la console Replit
- Utilisez les outils de débogage du navigateur

## Support
Pour toute question technique, consultez :
- Documentation Replit
- Documentation Supabase
- Logs de l'application dans la console

## Conclusion
Cette application est prête à l'emploi sur Replit avec une configuration minimale. Suivez ce guide étape par étape pour un démarrage réussi.
