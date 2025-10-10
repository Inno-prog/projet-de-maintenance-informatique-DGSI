import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  template: `
    <div class="auth-container">
      <div class="auth-card">
        <div class="auth-header">
          <div class="logo">
            <span class="logo-icon">DG</span>
            <div>
              <h1>DGSI Maintenance</h1>
              <p>par Direction Générale</p>
            </div>
          </div>
          <h2>Connexion</h2>
          <p>Accédez à votre espace de gestion</p>
        </div>

  <form *ngIf="!loading" [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.error]="loginForm.get('email')?.invalid && loginForm.get('email')?.touched"
              placeholder="votre.email@example.com"
            />
            <div class="error-message" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
              <span *ngIf="loginForm.get('email')?.errors?.['required']">L'email est requis</span>
              <span *ngIf="loginForm.get('email')?.errors?.['email']">Format d'email invalide</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="password-input-container">
              <input
                [type]="passwordVisible ? 'text' : 'password'"
                id="password"
                formControlName="password"
                [class.error]="loginForm.get('password')?.invalid && loginForm.get('password')?.touched"
                placeholder="Votre mot de passe"
              />
              <button type="button" class="password-toggle" (click)="togglePasswordVisibility()" tabindex="-1">
                <span>{{ passwordVisible ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            <div class="error-message" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
              <span *ngIf="loginForm.get('password')?.errors?.['required']">Le mot de passe est requis</span>
            </div>
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div *ngIf="errorMessage" class="retry-actions">
            <button class="btn btn-outline" (click)="retryCallback()">Réessayer</button>
            <button class="btn" (click)="authService.login()">Se reconnecter</button>
          </div>

          <button
            type="submit"
            class="btn btn-primary btn-full"
            [disabled]="loginForm.invalid || loading"
          >
            <span *ngIf="loading" class="loading"></span>
            {{ loading ? 'Connexion...' : 'Se connecter' }}
          </button>

          <div *ngIf="loading" class="auth-redirecting">
            Redirection vers le serveur d'authentification…
          </div>

          <div class="auth-footer">
            <p>Pas encore de compte ? <a routerLink="/register">S'inscrire</a></p>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .auth-container {
      min-height: 100vh;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      padding: 2rem;
      padding-top: 6rem;
    }

    .auth-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(249, 115, 22, 0.15);
      padding: 2rem;
      width: 100%;
      max-width: 380px;
      transition: all 0.3s ease;
    }

    .auth-card:hover {
      box-shadow: 0 25px 50px rgba(249, 115, 22, 0.2);
      transform: translateY(-2px);
    }

    .auth-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .logo-icon {
      width: 3.5rem;
      height: 3.5rem;
      background: var(--primary);
      color: white;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
    }

    .logo h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }

    .logo p {
      font-size: 0.875rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .auth-header h2 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .auth-header p {
      color: var(--text-secondary);
      margin: 0;
    }

    .auth-form {
      width: 100%;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group input {
      width: 100%;
      padding: 1rem 1rem 1rem 1rem;
      font-size: 1rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
      background: white;
    }

    .form-group input.error {
      border-color: var(--error);
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }

    .password-input-container {
      position: relative;
      width: 100%;
    }

    .password-input-container input {
      padding-right: 3rem;
    }

    .password-toggle {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      color: var(--text-secondary);
      transition: color 0.2s ease;
      padding: 0.25rem;
      border-radius: 4px;
    }

    .password-toggle:hover {
      color: var(--primary);
      background: rgba(249, 115, 22, 0.1);
    }

    .password-toggle:focus {
      outline: none;
      box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.3);
    }

    .error-message {
      color: var(--error);
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }

    .btn-full {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .auth-footer {
      margin-top: 2rem;
      text-align: center;
    }

    .auth-footer a {
      color: var(--primary);
      text-decoration: none;
      font-weight: 600;
    }

    .auth-footer a:hover {
      text-decoration: underline;
    }

    @media (max-width: 480px) {
      .auth-container {
        padding: 1rem;
      }

      .auth-card {
        padding: 2rem;
      }

      .logo {
        flex-direction: column;
        gap: 0.5rem;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  errorMessage = '';
  passwordVisible = false;

  constructor(
  private formBuilder: FormBuilder,
  public authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    // Check if we have OAuth callback parameters in the URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('error')) {
      // Handle OAuth callback
      this.loading = true;
      this.errorMessage = '';

      // Try to process the OAuth callback. Add a timeout to avoid a persistent blank screen.
      let resolved = false;
      const timeout = setTimeout(() => {
        if (!resolved) {
          this.errorMessage = 'Le traitement du callback OAuth prend trop de temps. Cliquez sur Réessayer.';
          this.loading = false;
        }
      }, 8000);

      this.authService.handleOAuthCallback().then((success) => {
        resolved = true;
        clearTimeout(timeout);
        if (this.authService.isAuthenticated()) {
          this.redirectToDashboard();
        } else {
          this.errorMessage = 'Échec de l\'authentification OAuth.';
          this.loading = false;
        }
      }).catch(error => {
        resolved = true;
        clearTimeout(timeout);
        console.error('OAuth callback error:', error);
        this.errorMessage = 'Erreur lors du traitement du callback OAuth.';
        this.loading = false;
      });
    }

    // If the page was opened without OAuth callback params and the user is not
    // authenticated, immediately start the authorization code flow so the user
    // is redirected to Keycloak (no local login form shown first).
    if (!urlParams.has('code') && !urlParams.has('error') && !this.authService.isAuthenticated()) {
      console.log('No OAuth callback present and user not authenticated — redirecting to Keycloak');
      this.loading = true;
      this.authService.login();
      return;
    }
    // Listen for authentication state changes
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        console.log('User logged in, redirecting...');
        this.redirectToDashboard();
      }
    });
  }

  retryCallback(): void {
    this.errorMessage = '';
    this.loading = true;
    // Retry handling the OAuth callback - useful if the first try timed out
    this.authService.handleOAuthCallback().then((success) => {
      if (this.authService.isAuthenticated()) {
        this.redirectToDashboard();
      } else {
        this.errorMessage = 'Échec de l\'authentification OAuth après réessai.';
        this.loading = false;
      }
    }).catch(err => {
      console.error('Retry OAuth callback failed:', err);
      this.errorMessage = 'Réessai du callback OAuth échoué.';
      this.loading = false;
    });
  }

  private redirectToDashboard(): void {
    const user = this.authService.getCurrentUser();
    console.log('Redirecting user:', user);

    if (user) {
      console.log('User role:', user.role);
      switch (user.role) {
        case 'ADMINISTRATEUR':
          console.log('Redirecting to admin dashboard');
          this.router.navigate(['/dashboard/admin']);
          break;
        case 'PRESTATAIRE':
          console.log('Redirecting to prestataire dashboard');
          this.router.navigate(['/dashboard/prestataire']);
          break;
        case 'AGENT_DGSI':
          console.log('Redirecting to CI dashboard');
          this.router.navigate(['/dashboard/ci']);
          break;
        default:
          console.log('Redirecting to default dashboard, role:', user.role);
          this.router.navigate(['/dashboard']);
      }
    } else {
      console.log('No user found, cannot redirect');
    }
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      console.log('Initiating OAuth redirect login flow');
      // Use the authorization code flow (redirect to Keycloak) instead of
      // performing the resource-owner password credentials flow from the
      // browser (which may be rejected with 400 depending on Keycloak/client config).
      // The OAuth callback will be handled in ngOnInit when the URL contains code/error.
      this.authService.login();
    } else {
      this.errorMessage = 'Veuillez remplir tous les champs correctement';
    }
  }
}
