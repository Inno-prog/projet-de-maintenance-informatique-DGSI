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
    // Configuration minimale - pas d'initialisation automatique
    const authConfig: AuthConfig = {
      issuer: 'http://localhost:8080/realms/Maintenance-DGSI',
      redirectUri: window.location.origin + '/login',
      clientId: 'maintenance-app',
      responseType: 'code',
      scope: 'roles',
      showDebugInformation: false,
      requireHttps: false,
      skipIssuerCheck: true,
      strictDiscoveryDocumentValidation: false,
      oidc: true,
      useSilentRefresh: false,
      loginUrl: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/auth',
      logoutUrl: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/logout',
      tokenEndpoint: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/token',
      userinfoEndpoint: 'http://localhost:8080/realms/Maintenance-DGSI/protocol/openid-connect/userinfo'
    };

    this.oauthService.configure(authConfig);

    // Supprimer tous les event listeners automatiques pour éviter les erreurs
    // L'OAuth ne sera utilisé que de manière explicite
  }

  private initializeOAuth(): void {
    console.log('Initializing OAuth service...');
    console.log('Issuer URL:', 'http://localhost:8080/realms/Maintenance-DGSI');
    console.log('Client ID:', 'maintenance-app');

    // Clear any invalid tokens from previous sessions
    if (!this.oauthService.hasValidAccessToken() && (localStorage.getItem('access_token') || localStorage.getItem('id_token'))) {
      console.log('Clearing invalid tokens from local storage...');
      this.oauthService.logOut();
      localStorage.removeItem('token');
      localStorage.removeItem('currentUser');
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
      // Use password grant for direct login
      console.log('Using password grant for login...');
      this.oauthService.fetchTokenUsingPasswordFlow(credentials.email, credentials.password).then(() => {
        console.log('Password login successful');
        this.updateUserFromToken();
      }).catch(err => {
        console.error('Password login failed:', err);
      });
    } else {
      // The login is now initiated by redirecting to Keycloak.
      // The callback will be handled automatically by `loadDiscoveryDocumentAndTryLogin`.
      console.log('Initiating OAuth login flow...');
      console.log('Current location:', window.location.href);
      console.log('Redirect URI:', window.location.origin + '/login');
      console.log('Has discovery document:', !!this.oauthService.discoveryDocumentLoaded);

      if (!this.oauthService.discoveryDocumentLoaded) {
        console.log('Discovery document not loaded yet, loading...');
        this.oauthService.loadDiscoveryDocument().then(() => {
          console.log('Discovery document loaded, now initiating code flow');
          try {
            this.oauthService.initCodeFlow();
            console.log('OAuth initCodeFlow called successfully');
          } catch (error) {
            console.error('Error initiating OAuth flow:', error);
            console.error('Error details:', error instanceof Error ? error.message : String(error));
          }
        }).catch(err => {
          console.error('Failed to load discovery document:', err);
        });
      } else {
        try {
          this.oauthService.initCodeFlow();
          console.log('OAuth initCodeFlow called successfully');
        } catch (error) {
          console.error('Error initiating OAuth flow:', error);
          console.error('Error details:', error instanceof Error ? error.message : String(error));
        }
      }
    }
  }

  register(userData: RegisterRequest): Observable<any> {
    // L'inscription se fait via Keycloak admin ou interface dédiée
    // Pour l'instant, retourner une erreur
    return new Observable(observer => {
      observer.error('L\'inscription doit être faite via l\'interface d\'administration Keycloak');
    });
  }

  logout(): void {
    // Get the id_token for OIDC logout
    const idToken = this.oauthService.getIdToken();

    // Log out with id_token_hint for proper OIDC logout (if available)
    if (idToken) {
      this.oauthService.logOut({
        id_token_hint: idToken
      });
    } else {
      // Fallback logout without id_token_hint
      this.oauthService.logOut();
    }

    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.currentUserSubject.next(null);
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
