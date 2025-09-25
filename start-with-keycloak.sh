#!/bin/bash

echo "🚀 Démarrage de l'application Maintenance DGSI avec Keycloak..."

# Démarrer Keycloak en arrière-plan
echo "📦 Démarrage de Keycloak..."
docker-compose up -d keycloak postgres

# Attendre que Keycloak soit prêt
echo "⏳ Attente du démarrage de Keycloak..."
sleep 30

# Vérifier que Keycloak est accessible
echo "🔍 Vérification de Keycloak..."
curl -s http://localhost:8081/realms/Maintenance-DGSI > /dev/null
if [ $? -eq 0 ]; then
    echo "✅ Keycloak est prêt !"
else
    echo "❌ Keycloak n'est pas accessible. Vérifiez les logs avec: docker-compose logs keycloak"
    exit 1
fi

# Démarrer l'application Spring Boot
echo "🔧 Démarrage de l'application Spring Boot..."
cd backend && mvn spring-boot:run

echo "🎉 Application démarrée avec succès !"
echo "🔗 Keycloak Admin Console: http://localhost:8081"
echo "🔗 Application Frontend: http://localhost:4200"
echo "🔗 Application Backend: http://localhost:8080"