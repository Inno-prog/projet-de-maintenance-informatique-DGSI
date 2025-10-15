# TODO: Fix Spring Boot Port Binding Issue and Start Complete Setup

- [x] Update backend/src/main/resources/application.properties to set server.port=8082
- [x] Update frontend/proxy.conf.json to change /api target to http://localhost:8082
- [x] Update start-complete-local.sh to use port 8082
- [x] Run start-complete-local.sh to start Keycloak and Spring Boot
