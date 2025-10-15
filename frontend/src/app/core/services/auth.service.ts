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
    const authConfig: AuthConfig = {
      issuer: 'http://localhost:8080/realms/Maintenance-DGSI',
      redirectUri: window.location.origin + '/login',
      clientId: 'maintenance-app',
    responseType: 'code',
      scope: 'openid roles',
      showDebugInformation: true,
      requireHttps: false,
      skipIssuerCheck: true,
      strictDiscoveryDocumentValidation: false,
      oidc: true,
      useSilentRefresh: false,
      disableAtHashCheck: true,
      loginUrl: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/auth',
      logoutUrl: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/logout',
      tokenEndpoint: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token',
      userinfoEndpoint: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/userinfo',
      // Configuration spécifique pour client public
      dummyClientSecret: '', // Important pour les clients publics
      useHttpBasicAuth: false // Désactiver l'authentification HTTP Basic
    };

  // Some versions of angular-oauth2-oidc may not expose `usePkce` on the AuthConfig
  // type. Assign it defensively via a cast so TS doesn't fail while still enabling PKCE.
  (authConfig as any).usePkce = true;
  this.oauthService.configure(authConfig);

  // Persist tokens into localStorage so code verifier / PKCE state survives redirects
  try {
    this.oauthService.setStorage(localStorage);
  } catch (e) {
    // Some library versions may not expose setStorage; ignore if not available
    console.warn('oauthService.setStorage not available, falling back to default storage', e);
  }

    // Supprimer tous les event listeners automatiques pour éviter les erreurs
    // L'OAuth ne sera utilisé que de manière explicite
  }

  private initializeOAuth(): void {
    console.log('Initializing OAuth service...');
    console.log('Issuer URL:', 'http://localhost:8080/realms/Maintenance-DGSI');
    console.log('Client ID:', 'maintenance-app');

    // Clear any invalid tokens from previous sessions without triggering a logout redirect
    if (!this.oauthService.hasValidAccessToken() && (localStorage.getItem('access_token') || localStorage.getItem('id_token'))) {
      console.log('Clearing invalid tokens from local storage (no remote logout)');
      try {
        // don't call oauthService.logOut() here because it may redirect the browser.
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('id_token');
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
      } catch (e) {
        console.warn('Error clearing tokens from storage', e);
      }
      this.currentUserSubject.next(null);
    }

    // Load discovery document and try login if there are tokens
    console.log('Loading discovery document...');
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      console.log('Discovery document loaded successfully');
      if (this.oauthService.hasValidAccessToken()) {
        console.log('Valid access token found, updating user from token');
        this.updateUserFromToken();
      } else {
        console.log('No valid access token found');
      }
    }).catch(err => {
      console.error('OAuth initialization error:', err);
      console.error('Error details:', err.message);
      console.error('Check if Keycloak is running on http://localhost:8080');
    });
  }

  login(credentials?: LoginRequest): void {
    if (credentials) {
      // Use password grant for direct login. Some Keycloak setups require
      // the request body to be application/x-www-form-urlencoded and the
      // client to be configured for direct access grants. If the library
      // helper fails, fallback to a manual HTTP request to the token endpoint
      // with proper headers.
      console.log('Using password grant for login...');
      this.oauthService.fetchTokenUsingPasswordFlow(credentials.email, credentials.password).then(() => {
        console.log('Password login successful');
        this.updateUserFromToken();
      }).catch(err => {
        console.warn('fetchTokenUsingPasswordFlow failed, trying manual token request. Error:', err);

        // Manual token request fallback
        // Try to read configured token endpoint from the oauthService options, fallback to constant
        // The OAuthService type may expose the config under `options` or `_config`, so we defensively
        // check common properties. Otherwise use the known Keycloak token endpoint.
        const tokenUrl = (
          (this.oauthService as any).options?.tokenEndpoint ||
          (this.oauthService as any)._config?.tokenEndpoint ||
          'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token'
        );
        const body = new URLSearchParams();
        // Keycloak expects 'username' (not email) unless realm is set to loginWithEmail
        // We send both username and email as username if the input looks like an email.
        const username = credentials.email;
        body.set('grant_type', 'password');
        body.set('username', username);
        body.set('password', credentials.password);
        body.set('client_id', this.oauthService.clientId || 'maintenance-app');

        const headers = {
          'Content-Type': 'application/x-www-form-urlencoded'
        };

        this.http.post<any>(tokenUrl, body.toString(), { headers }).toPromise().then(response => {
          console.log('Manual token request successful', response);
          // The oauthService expects tokens in its storage; store them consistently
          if (response['access_token']) {
            this.oauthService.setStorage(localStorage);
            localStorage.setItem('access_token', response['access_token']);
            if (response['refresh_token']) localStorage.setItem('refresh_token', response['refresh_token']);
            if (response['id_token']) localStorage.setItem('id_token', response['id_token']);
            this.updateUserFromToken();
          } else {
            console.error('Token response did not contain access_token:', response);
          }
        }).catch(httpErr => {
          console.error(`Password login failed: ${httpErr.message || httpErr.statusText || httpErr}`);
          console.error('Full error response:', httpErr);
        }).finally(() => {
          this.loadingCleanup();
        });
      });
    } else {
      // The login is now initiated by redirecting to Keycloak.
      // The callback will be handled automatically by `loadDiscoveryDocumentAndTryLogin`.
      console.log('Initiating OAuth login flow (authorization code + PKCE)');
      console.log('Redirect URI:', window.location.origin + '/login');

      // Always ensure discovery document is loaded then start the code flow.
      const startCodeFlow = () => {
        try {
          this.oauthService.initCodeFlow();
          console.log('OAuth initCodeFlow called successfully');
        } catch (error) {
          console.error('Error initiating OAuth flow:', error);
        }
      };

      if (!this.oauthService.discoveryDocumentLoaded) {
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Discovery document loaded, starting code flow');
          startCodeFlow();
        }).catch(err => {
          console.error('Failed to load discovery document - cannot start code flow:', err);
        });
      } else {
        startCodeFlow();
      }
    }
  }

  private loadingCleanup(): void {
    // Placeholder for any cleanup like toggling loading state in UI; left empty
    // because AuthService doesn't own component loading flags. Components should
    // listen to auth state and update their own loading flags.
  }

  register(userData: RegisterRequest): Observable<any> {
    // L'inscription se fait via Keycloak admin ou interface dédiée
    // Pour l'instant, retourner une erreur
    return new Observable(observer => {
      observer.error('L\'inscription doit être faite via l\'interface d\'administration Keycloak');
    });
  }

  logout(): void {
    // Clear OAuth tokens and session
    try {
      this.oauthService.logOut();
    } catch (error) {
      console.warn('OAuth logout failed, continuing with local cleanup:', error);
    }

    // Clear all local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('id_token');

    // Clear current user
    this.currentUserSubject.next(null);

    // Force navigation to homepage instead of Keycloak
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
    // Try to get roles from access token first
    const accessToken = this.oauthService.getAccessToken();
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        console.log('Access token payload:', payload);

        const roles = payload['realm_access']?.['roles'] || [];
        console.log('Extracted roles from access token:', roles);

        let role = 'USER'; // rôle par défaut

        if (roles.includes('PRESTATAIRE')) {
          role = 'PRESTATAIRE';
        } else if (roles.includes('ADMINISTRATEUR')) {
          role = 'ADMINISTRATEUR';
        } else if (roles.includes('AGENT_DGSI')) {
          role = 'AGENT_DGSI';
        }

        console.log('Determined role:', role);

        return {
          id: payload['sub'] || '',
          nom: payload['name'] || payload['preferred_username'] || '',
          email: payload['email'] || '',
          role: role
        };
      } catch (error) {
        console.error('Error parsing access token:', error);
      }
    }

    // Fallback to ID token claims
    const claims = this.oauthService.getIdentityClaims();
    console.log('ID token claims:', claims);

    if (!claims) return null;

    const roles = claims['realm_access']?.['roles'] || [];
    console.log('Extracted roles from ID token:', roles);

    let role = 'USER'; // rôle par défaut

    if (roles.includes('PRESTATAIRE')) {
      role = 'PRESTATAIRE';
    } else if (roles.includes('ADMINISTRATEUR')) {
      role = 'ADMINISTRATEUR';
    } else if (roles.includes('AGENT_DGSI')) {
      role = 'AGENT_DGSI';
    }

    console.log('Determined role from ID token:', role);

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
    return this.oauthService.tryLoginCodeFlow().then(() => {
      if (this.oauthService.hasValidAccessToken()) {
        this.updateUserFromToken();
        return true;
      }
      return false;
    }).catch(err => {
      console.error('OAuth callback failed:', err);
      return false;
    });
  }
}
