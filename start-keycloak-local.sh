#!/bin/bash

echo "🚀 Démarrage de Keycloak en mode développement local..."

# Variables
KEYCLOAK_VERSION="23.0.4"
KEYCLOAK_DIR="keycloak-${KEYCLOAK_VERSION}"

# Vérifier si Keycloak est installé
if [ ! -d "$KEYCLOAK_DIR" ]; then
    echo "❌ Keycloak n'est pas installé. Exécutez d'abord : ./install-keycloak.sh"
    exit 1
fi

# Vérifier si Keycloak est déjà en cours d'exécution sur le port 8080
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "⚠️  Quelque chose écoute déjà sur le port 8080"
    echo "🔍 Vérifiez avec : netstat -tlnp | grep :8080"
    echo "🛑 Arrêtez le processus avec : fuser -k 8080/tcp"
    exit 1
fi

# Se déplacer dans le répertoire Keycloak
cd "$KEYCLOAK_DIR"

echo "📁 Démarrage depuis : $(pwd)"
echo "🔧 Configuration :"
echo "   - Mode développement"
echo "   - Port HTTP : 8080"
echo "   - Import royaume : ../keycloak/realm-export.json"
echo "   - Base de données : H2 (fichier)"
echo ""

# Démarrer Keycloak en arrière-plan
echo "🚀 Démarrage de Keycloak..."
REALM_FILE="$(pwd)/../keycloak/realm-export.json"
echo "📄 Import du royaume depuis : $REALM_FILE"
./bin/kc.sh start-dev \
    --import-realm \
    --http-port=8080 \
    --http-enabled=true \
    --hostname-strict=false \
    --hostname-strict-https=false \
    --spi-import-realm-enabled=true \
    --spi-import-realm-provider=file \
    --spi-import-realm-file="$REALM_FILE" \
    > keycloak.log 2>&1 &

# Attendre que Keycloak démarre
echo "⏳ Attente du démarrage de Keycloak..."
sleep 10

# Vérifier si Keycloak fonctionne
if curl -s http://localhost:8080/realms/Maintenance-DGSI > /dev/null 2>&1; then
    echo "✅ Keycloak démarré avec succès !"
    echo ""
    echo "🌐 URLs d'accès :"
    echo "   🔗 Keycloak Admin Console : http://localhost:8080"
    echo "   👤 Utilisateur admin : admin / admin"
    echo "   🔗 Application Frontend : http://localhost:4200"
    echo "   🔗 Application Backend : http://localhost:8081"
    echo ""
    echo "📝 Comptes utilisateurs :"
    echo "   👨‍💼 Admin : admin@gmail.com / admin123"
    echo "   👷 Prestataire : presta@gmail.com / presta123"
    echo "   👨‍💻 CI : ci@gmail.com / ci1234"
    echo ""
    echo "🛑 Pour arrêter Keycloak : pkill -f keycloak"
else
    echo "❌ Échec du démarrage de Keycloak"
    echo "📋 Consultez les logs : tail -f $KEYCLOAK_DIR/keycloak.log"
    exit 1
fi