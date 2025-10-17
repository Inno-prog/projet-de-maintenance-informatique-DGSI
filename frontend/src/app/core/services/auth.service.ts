import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, filter } from 'rxjs/operators';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';

import { AuthResponse, LoginRequest, RegisterRequest, User } from '../models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private API_URL = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private oauthService: OAuthService
  ) {
    this.configureOAuth();
    this.initializeOAuth();
    this.loadCurrentUser();
  }

  private configureOAuth(): void {
    // Configuration pour client public - pas d'initialisation automatique
    const isProduction = window.location.protocol === 'https:';
    const authConfig: AuthConfig = {
      issuer: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI'
        : 'http://localhost:8080/realms/Maintenance-DGSI',
      redirectUri: window.location.origin + '/login',
      clientId: 'maintenance-app',
      responseType: 'code',
      scope: 'openid roles',
      showDebugInformation: !isProduction, // Désactiver les informations de débogage en production
      requireHttps: isProduction, // Exiger HTTPS en production
      skipIssuerCheck: !isProduction, // Vérification stricte de l'émetteur en production
      strictDiscoveryDocumentValidation: isProduction, // Validation stricte en production
      oidc: true,
      useSilentRefresh: false,
      disableAtHashCheck: false, // Activer la vérification de hachage pour la sécurité
      loginUrl: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/auth'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/auth',
      logoutUrl: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/logout'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/logout',
      tokenEndpoint: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/token'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token',
      userinfoEndpoint: isProduction
        ? 'https://your-keycloak-domain.com/realms/Maintenance-DGSI/protocol/openid-connect/userinfo'
        : 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/userinfo',
      // Configuration spécifique pour client public
      dummyClientSecret: '', // Important pour les clients publics
      useHttpBasicAuth: false // Désactiver l'authentification HTTP Basic
    };

  // Certaines versions de angular-oauth2-oidc peuvent ne pas exposer `usePkce` sur le type AuthConfig
  // L'assigner défensivement via un cast pour que TS ne échoue pas tout en activant PKCE.
  (authConfig as any).usePkce = true;
  this.oauthService.configure(authConfig);

  // Persister les tokens dans localStorage pour que le vérificateur de code / état PKCE survive aux redirections
  try {
    this.oauthService.setStorage(localStorage);
  } catch (e) {
    // Certaines versions de bibliothèque peuvent ne pas exposer setStorage ; ignorer si non disponible
    console.warn('oauthService.setStorage not available, falling back to default storage', e);
  }

    // Supprimer tous les event listeners automatiques pour éviter les erreurs
    // L'OAuth ne sera utilisé que de manière explicite
  }

  private initializeOAuth(): void {
    console.log('Initialisation du service OAuth...');
    console.log('URL de l\'émetteur:', 'http://localhost:8080/realms/Maintenance-DGSI');
    console.log('ID client:', 'maintenance-app');

    // Effacer les tokens invalides des sessions précédentes sans déclencher une redirection de déconnexion
    if (!this.oauthService.hasValidAccessToken() && (localStorage.getItem('access_token') || localStorage.getItem('id_token'))) {
      console.log('Effacement des tokens invalides du stockage local (pas de déconnexion distante)');
      try {
        // ne pas appeler oauthService.logOut() ici car cela peut rediriger le navigateur.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } catch (e) {
        console.warn('Erreur lors de l\'effacement des tokens du stockage', e);
      }
      this.currentUserSubject.next(null);
    }

    // Charger le document de découverte et essayer de se connecter s'il y a des tokens
    console.log('Chargement du document de découverte...');
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      console.log('Document de découverte chargé avec succès');
      if (this.oauthService.hasValidAccessToken()) {
        console.log('Token d\'accès valide trouvé, mise à jour de l\'utilisateur depuis le token');
        this.updateUserFromToken();
      } else {
        console.log('Aucun token d\'accès valide trouvé');
      }
    }).catch(err => {
      console.error('Erreur d\'initialisation OAuth:', err);
      console.error('Détails de l\'erreur:', err.message);
      console.error('Vérifiez si Keycloak fonctionne sur http://localhost:8080');
    });
  }

  login(credentials?: LoginRequest): void {
    if (credentials) {
      // Utiliser le flux de mot de passe pour la connexion directe. Certaines configurations Keycloak nécessitent
      // que le corps de la requête soit application/x-www-form-urlencoded et que
      // le client soit configuré pour les subventions d'accès direct. Si l'aide de bibliothèque
      // échoue, revenir à une requête HTTP manuelle vers le point de terminaison du token
      // avec les en-têtes appropriés.
      console.log('Utilisation du flux de mot de passe pour la connexion...');
      this.oauthService.fetchTokenUsingPasswordFlow(credentials.email, credentials.password).then(() => {
        console.log('Connexion par mot de passe réussie');
        this.updateUserFromToken();
      }).catch(err => {
        console.warn('fetchTokenUsingPasswordFlow a échoué, tentative de requête de token manuelle. Erreur:', err);

        // Requête de token manuelle de secours
        // Essayer de lire le point de terminaison du token configuré depuis les options oauthService, revenir à la constante
        // Le type OAuthService peut exposer la config sous `options` ou `_config`, donc nous vérifions défensivement
        // les propriétés communes. Sinon, utiliser le point de terminaison Keycloak connu.
        const tokenUrl = (
          (this.oauthService as any).options?.tokenEndpoint ||
          (this.oauthService as any)._config?.tokenEndpoint ||
          'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token'
        );
        const body = new URLSearchParams();
        // Keycloak attend 'username' (pas email) sauf si le realm est configuré pour loginWithEmail
        // Nous envoyons à la fois username et email comme username si l'entrée ressemble à un email.
        const username = credentials.email;
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', credentials.password);
        body.set('client_id', this.oauthService.clientId || 'maintenance-app');

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };

        this.http.post<any>(tokenUrl, body.toString(), { headers }).toPromise().then(response => {
          console.log('Requête de token manuelle réussie', response);
          // L'oauthService attend les tokens dans son stockage ; les stocker de manière cohérente
          if (response['access_token']) {
            this.oauthService.setStorage(localStorage);
            localStorage.setItem('access_token', response['access_token']);
            if (response['refresh_token']) localStorage.setItem('refresh_token', response['refresh_token']);
            if (response['id_token']) localStorage.setItem('id_token', response['id_token']);
            this.updateUserFromToken();
          } else {
            console.error('La réponse du token ne contenait pas access_token:', response);
          }
        }).catch(httpErr => {
          console.error(`Connexion par mot de passe échouée: ${httpErr.message || httpErr.statusText || httpErr}`);
          console.error('Réponse d\'erreur complète:', httpErr);
        }).finally(() => {
          this.loadingCleanup();
        });
      });
    } else {
      // La connexion est maintenant initiée en redirigeant vers Keycloak.
      // Le callback sera géré automatiquement par `loadDiscoveryDocumentAndTryLogin`.
      console.log('Initiation du flux de connexion OAuth (code d\'autorisation + PKCE)');
      console.log('URI de redirection:', window.location.origin + '/login');

      // S'assurer toujours que le document de découverte est chargé puis démarrer le flux de code.
      const startCodeFlow = () => {
        try {
          this.oauthService.initCodeFlow();
          console.log('OAuth initCodeFlow appelé avec succès');
        } catch (error) {
          console.error('Erreur lors de l\'initiation du flux OAuth:', error);
        }
      };

      if (!this.oauthService.discoveryDocumentLoaded) {
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Document de découverte chargé, démarrage du flux de code');
          startCodeFlow();
        }).catch(err => {
          console.error('Échec du chargement du document de découverte - impossible de démarrer le flux de code:', err);
        });
      } else {
        startCodeFlow();
      }
    }
  }

  private loadingCleanup(): void {
    // Espace réservé pour tout nettoyage comme basculer l'état de chargement dans l'UI ; laissé vide
    // car AuthService ne possède pas les indicateurs de chargement des composants. Les composants doivent
    // écouter l'état d'authentification et mettre à jour leurs propres indicateurs de chargement.
  }

  register(userData: RegisterRequest): Observable<any> {
    return this.http.post(`${this.API_URL}/register`, userData);
  }

  logout(): void {
    // Effacer les tokens OAuth et la session
    try {
      this.oauthService.logOut();
    } catch (error) {
      console.warn('Échec de la déconnexion OAuth, continuation avec le nettoyage local:', error);
    }

    // Effacer tout le stockage local
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');

    // Effacer l'utilisateur actuel
    this.currentUserSubject.next(null);

    // Forcer la navigation vers la page d'accueil au lieu de Keycloak
    window.location.href = '/';
  }

  private setSession(authResult: AuthResponse): void {
    localStorage.setItem('token', authResult.token);

    // Normaliser le rôle (supprimer "ROLE_" si présent)
    let role = authResult.role;
    if (role && role.startsWith('ROLE_')) {
      role = role.substring(5);
    }

    const user: User = {
      id: authResult.id,
      nom: authResult.nom,
      email: authResult.email,
      role: role
    };

    localStorage.setItem('currentUser', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private loadCurrentUser(): void {
    const userStr = localStorage.getItem('currentUser');
    if (userStr) {
      const user = JSON.parse(userStr);
      this.currentUserSubject.next(user);
    } else if (this.oauthService.hasValidAccessToken()) {
      this.updateUserFromToken();
    }
  }

  private updateUserFromToken(): void {
    const user = this.getUserFromToken();
    if (user) {
      this.currentUserSubject.next(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  private getUserFromToken(): User | null {
    // Essayer d'obtenir les rôles depuis le token d'accès en premier
    const accessToken = this.oauthService.getAccessToken();
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Charge utile du token d\'accès:', payload);

        const roles = payload['realm_access']?.['roles'] || [];
        console.log('Rôles extraits du token d\'accès:', roles);

        let role = 'USER'; // rôle par défaut

        if (roles.includes('PRESTATAIRE')) {
          role = 'PRESTATAIRE';
        } else if (roles.includes('ADMINISTRATEUR')) {
          role = 'ADMINISTRATEUR';
        } else if (roles.includes('AGENT_DGSI')) {
          role = 'AGENT_DGSI';
        }

        console.log('Rôle déterminé:', role);

        return {
          id: payload['sub'] || '',
          nom: payload['name'] || payload['preferred_username'] || '',
          email: payload['email'] || '',
          role: role
        };
      } catch (error) {
        console.error('Erreur lors de l\'analyse du token d\'accès:', error);
      }
    }

    // Revenir aux claims du token ID
    const claims = this.oauthService.getIdentityClaims();
    console.log('Claims du token ID:', claims);

    if (!claims) return null;

    const roles = claims['realm_access']?.['roles'] || [];
    console.log('Rôles extraits du token ID:', roles);

    let role = 'USER'; // rôle par défaut

    if (roles.includes('PRESTATAIRE')) {
      role = 'PRESTATAIRE';
    } else if (roles.includes('ADMINISTRATEUR')) {
      role = 'ADMINISTRATEUR';
    } else if (roles.includes('AGENT_DGSI')) {
      role = 'AGENT_DGSI';
    }

    console.log('Rôle déterminé depuis le token ID:', role);

    return {
      id: claims['sub'] || '',
      nom: claims['name'] || claims['preferred_username'] || '',
      email: claims['email'] || '',
      role: role
    };
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return this.oauthService.getAccessToken();
  }

  isAuthenticated(): boolean {
    return this.oauthService.hasValidAccessToken() && !!this.getCurrentUser();
  }

  hasRole(role: string): boolean {
    const currentUser = this.getCurrentUser();
    return currentUser ? currentUser.role === role : false;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMINISTRATEUR');
  }

  isPrestataire(): boolean {
    return this.hasRole('PRESTATAIRE');
  }

  isAgentDGSI(): boolean {
    return this.hasRole('AGENT_DGSI');
  }

  isAdminOrPrestataire(): boolean {
    return this.isAdmin() || this.isPrestataire();
  }

  updateUserProfile(user: User): Observable<User> {
    return this.http.put<User>(`${environment.apiUrl}/users/profile`, user).pipe(
      map(updatedUser => {
        this.currentUserSubject.next(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        return updatedUser;
      })
    );
  }

  // Méthodes pour gérer le flow OAuth2
  initLoginFlow(): void {
    this.oauthService.initCodeFlow();
  }

  handleLoginCallback(): void {
    this.oauthService.tryLoginCodeFlow();
  }

  handleOAuthCallback(): Promise<boolean> {
    if (this.oauthService.hasValidAccessToken()) {
      this.updateUserFromToken();
      return Promise.resolve(true);
    }
    return this.oauthService.tryLoginCodeFlow().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.updateUserFromToken();
        return true;
      }
      return false;
    }).catch(err => {
      console.error('Échec du callback OAuth:', err);
      return false;
    });
  }
}
