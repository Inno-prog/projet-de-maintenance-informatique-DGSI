# 🚀 Maintenance DGSI - Intégration Keycloak

Ce guide explique comment démarrer l'application Maintenance DGSI avec Keycloak pour l'authentification.

## 📋 Prérequis

- **Java 21** (obligatoire pour Keycloak)
- **Maven 3.6+**
- **Node.js 18+**
- **curl** ou **wget** pour le téléchargement
- **unzip** pour l'extraction

## 🔐 Utilisateurs Keycloak

Le royaume "Maintenance DGSI" contient 3 utilisateurs pré-configurés :

| Email | Mot de passe | Rôle | Description |
|-------|-------------|------|-------------|
| `admin@gmail.com` | `admin123` | ADMINISTRATEUR | Accès complet à l'administration |
| `presta@gmail.com` | `presta123` | PRESTATAIRE | Gestion des prestations de service |
| `ci@gmail.com` | `ci1234` | CORRESPONDANT_INFORMATIQUE | Gestion informatique |

## 🚀 Démarrage Rapide (Sans Docker)

### Option 1 : Installation et démarrage complet automatique

```bash
# Rendre le script exécutable
chmod +x start-complete-local.sh

# Installer et démarrer tout automatiquement
./start-complete-local.sh
```

### Option 2 : Étape par étape

```bash
# 1. Installer Keycloak
./install-keycloak.sh

# 2. Démarrer Keycloak
./start-keycloak-local.sh

# 3. Démarrer l'application Spring Boot (dans un autre terminal)
cd backend && mvn spring-boot:run

# 4. Démarrer le frontend (dans un autre terminal)
cd frontend && npm start
```

## 🌐 URLs d'accès

Une fois démarré :

- **Application Frontend** : http://localhost:4200
- **Keycloak Admin Console** : http://localhost:8080
  - Utilisateur : `admin`
  - Mot de passe : `admin`
- **Application Backend** : http://localhost:8081
- **Base H2** : http://localhost:8081/h2-console

## 🔧 Configuration Keycloak

### Installation automatique

Le script `install-keycloak.sh` télécharge et installe Keycloak 23.0.4 automatiquement.

### Accès à la console d'administration

1. Aller sur http://localhost:8080
2. Se connecter avec `admin` / `admin`
3. Sélectionner le royaume "Maintenance-DGSI"

### Clients configurés

- **Client ID** : `maintenance-app`
- **Secret** : `maintenance-secret`
- **Type** : Confidential

### Rôles disponibles

- `ADMINISTRATEUR` : Accès complet
- `PRESTATAIRE` : Gestion des prestations
- `CORRESPONDANT_INFORMATIQUE` : Gestion informatique

## 🛠️ Dépannage

### Keycloak ne démarre pas

```bash
# Vérifier les logs
tail -f keycloak-23.0.4/keycloak.log

# Vérifier les processus
ps aux | grep keycloak

# Arrêter les processus existants
pkill -f keycloak
```

### Port 8080 déjà utilisé

Si le port 8080 est occupé :
```bash
# Modifier le port dans start-keycloak-local.sh
--http-port=8080  # Changez pour 8082 par exemple

# Et mettez à jour application.properties en conséquence
```

### Application Spring Boot ne peut pas se connecter à Keycloak

Vérifier que Keycloak est accessible :
```bash
curl http://localhost:8080/realms/Maintenance-DGSI
```

### Problèmes d'authentification

1. Vérifier que les URLs dans `application.properties` correspondent
2. Vérifier que le royaume "Maintenance-DGSI" existe
3. Vérifier que les utilisateurs sont actifs

## 🏗️ Architecture (Installation Locale)

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Keycloak      │
│   (Angular)     │◄──►│   (Spring Boot) │◄──►│   (Standalone)  │
│   Port: 4200    │    │   Port: 8081    │    │   Port: 8080    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              └────────────────────────┘
                                       H2 Database
                                       (Fichiers locaux)
```

## 🔄 Migration depuis JWT

L'application a été migrée de JWT personnalisé vers Keycloak :

- ✅ Suppression du système JWT maison
- ✅ Intégration OAuth2/OpenID Connect
- ✅ Gestion centralisée des utilisateurs
- ✅ Support des rôles et permissions
- ✅ Interface d'administration web
- ✅ Base de données H2 intégrée (pas de PostgreSQL requis)

## 📁 Structure des fichiers

```
project/
├── install-keycloak.sh          # Script d'installation de Keycloak
├── start-keycloak-local.sh      # Script de démarrage de Keycloak
├── start-complete-local.sh      # Script de démarrage complet
├── keycloak/
│   └── realm-export.json        # Configuration du royaume
├── backend/
│   ├── pom.xml                  # Dépendances Keycloak ajoutées
│   └── src/main/resources/
│       └── application.properties # Configuration Keycloak locale
└── frontend/
    └── proxy.conf.json          # Configuration proxy
```

## 📝 Notes importantes

- Keycloak utilise PostgreSQL comme base de données
- Le royaume est automatiquement importé au démarrage
- Les utilisateurs sont créés avec des mots de passe temporaires (non temporaires dans la config)
- L'application backend agit comme un Resource Server OAuth2