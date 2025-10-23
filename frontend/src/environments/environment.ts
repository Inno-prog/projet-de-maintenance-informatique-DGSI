export const environment = {
  production: false,
  apiUrl: 'http://localhost:8082/api',  // URL directe du backend (correspondre au port du serveur backend)
  // En développement, activez ce flag pour permettre un contournement local lorsque Keycloak
  // n'est pas disponible. Ne PAS activer en production.
  devAuthBypass: true
};

// Configuration de l'environnement de production
export const environmentProd = {
  production: true,
  apiUrl: 'https://your-api-domain.com/api',  // Remplacer par votre domaine API de production
  keycloak: {
    issuer: 'https://your-keycloak-domain.com/realms/Maintenance-DGSI',
    clientId: 'maintenance-app',
    requireHttps: true,
    skipIssuerCheck: false,
    strictDiscoveryDocumentValidation: true,
    showDebugInformation: false
  }
};
