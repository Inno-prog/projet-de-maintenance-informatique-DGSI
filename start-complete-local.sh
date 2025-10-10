#!/bin/bash

echo "🚀 Démarrage complet de l'application Maintenance DGSI (sans Docker)"
echo "================================================================="

# Étape 1 : Installer Keycloak si nécessaire
echo ""
echo "📦 Étape 1 : Vérification/Installation de Keycloak"
if [ ! -d "keycloak-23.0.4" ]; then
    echo "🔧 Keycloak n'est pas installé. Installation en cours..."
    chmod +x install-keycloak.sh
    ./install-keycloak.sh
    if [ $? -ne 0 ]; then
        echo "❌ Échec de l'installation de Keycloak"
        exit 1
    fi
else
    echo "✅ Keycloak est déjà installé"
fi

# Étape 2 : Démarrer Keycloak
echo ""
echo "🔐 Étape 2 : Démarrage de Keycloak"
chmod +x start-keycloak-local.sh
./start-keycloak-local.sh
if [ $? -ne 0 ]; then
    echo "❌ Échec du démarrage de Keycloak"
    exit 1
fi

# Étape 3 : Attendre que Keycloak soit complètement prêt
echo ""
echo "⏳ Étape 3 : Attente de l'initialisation complète de Keycloak..."
sleep 15

# Étape 4 : Démarrer l'application Spring Boot
echo ""
echo "🔧 Étape 4 : Démarrage de l'application Spring Boot"
cd backend
echo "📁 Démarrage depuis : $(pwd)"
echo "🚀 Lancement de Spring Boot sur le port 8082..."
mvn spring-boot:run > spring-boot.log 2>&1 &
SPRING_PID=$!

# Attendre que Spring Boot démarre
echo "⏳ Attente du démarrage de Spring Boot..."
sleep 20

# Vérifier que Spring Boot fonctionne
if curl -s http://localhost:8082/api/test > /dev/null 2>&1; then
    echo "✅ Application Spring Boot démarrée avec succès !"
else
    echo "⚠️  Spring Boot en cours de démarrage... (cette étape peut prendre plus de temps)"
fi

# Étape 5 : Informations finales
echo ""
echo "🎉 DÉMARRAGE TERMINÉ !"
echo "======================"
echo ""
echo "🌐 URLs d'accès :"
echo "   🔗 Keycloak Admin Console : http://localhost:8080"
echo "   👤 Utilisateur admin : admin / admin"
echo "   🔗 Application Frontend : http://localhost:4200"
echo "   🔗 Application Backend : http://localhost:8082"
echo ""
echo "📝 Comptes utilisateurs :"
echo "   👨‍💼 Admin : admin@gmail.com / admin123"
echo "   👷 Prestataire : presta@gmail.com / presta123"
echo "   👨‍💻 CI : ci@gmail.com / ci1234"
echo ""
echo "🛑 Commandes d'arrêt :"
echo "   🔴 Arrêter tout : pkill -f 'keycloak\|spring-boot'"
echo "   🔴 Arrêter Keycloak seulement : pkill -f keycloak"
echo "   🔴 Arrêter Spring Boot seulement : pkill -f 'spring-boot:run'"
echo ""
echo "📋 Logs :"
echo "   📄 Keycloak : tail -f keycloak-23.0.4/keycloak.log"
echo "   📄 Spring Boot : tail -f backend/spring-boot.log"
echo ""
echo "✨ Prêt à utiliser ! Ouvrez http://localhost:4200 dans votre navigateur."