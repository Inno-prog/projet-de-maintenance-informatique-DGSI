import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-register',
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
          <h2>Inscription</h2>
          <p>Créez votre compte utilisateur</p>
        </div>

        <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
          <div class="form-group">
            <label for="nom">Nom complet</label>
            <input
              type="text"
              id="nom"
              formControlName="nom"
              [class.error]="registerForm.get('nom')?.invalid && registerForm.get('nom')?.touched"
              placeholder="Votre nom complet"
            />
            <div class="error-message" *ngIf="registerForm.get('nom')?.invalid && registerForm.get('nom')?.touched">
              <span *ngIf="registerForm.get('nom')?.errors?.['required']">Le nom est requis</span>
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              formControlName="email"
              [class.error]="registerForm.get('email')?.invalid && registerForm.get('email')?.touched"
              placeholder="votre.email@example.com"
            />
            <div class="error-message" *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched">
              <span *ngIf="registerForm.get('email')?.errors?.['required']">L'email est requis</span>
              <span *ngIf="registerForm.get('email')?.errors?.['email']">Format d'email invalide</span>
            </div>
          </div>

          <div class="form-group">
            <label for="password">Mot de passe</label>
            <div class="password-input-container">
              <input
                [type]="passwordVisible ? 'text' : 'password'"
                id="password"
                formControlName="password"
                [class.error]="registerForm.get('password')?.invalid && registerForm.get('password')?.touched"
                placeholder="Minimum 6 caractères"
              />
              <button type="button" class="password-toggle" (click)="togglePasswordVisibility()" tabindex="-1">
                <span>{{ passwordVisible ? '🙈' : '👁️' }}</span>
              </button>
            </div>
            <div class="error-message" *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched">
              <span *ngIf="registerForm.get('password')?.errors?.['required']">Le mot de passe est requis</span>
              <span *ngIf="registerForm.get('password')?.errors?.['minlength']">Minimum 6 caractères requis</span>
            </div>
          </div>

          <div class="form-group">
            <label for="role">Rôle</label>
            <select id="role" formControlName="role" [class.error]="registerForm.get('role')?.invalid && registerForm.get('role')?.touched">
              <option value="">Sélectionnez un rôle</option>
              <option value="ADMINISTRATEUR">Administrateur</option>
              <option value="PRESTATAIRE">Prestataire</option>
              <option value="AGENT_DGSI">Agent DGSI</option>
            </select>
            <div class="error-message" *ngIf="registerForm.get('role')?.invalid && registerForm.get('role')?.touched">
              <span *ngIf="registerForm.get('role')?.errors?.['required']">Le rôle est requis</span>
            </div>
          </div>

          <div class="form-group" *ngIf="registerForm.get('role')?.value === 'ADMINISTRATEUR'">
            <label for="poste">Poste</label>
            <input
              type="text"
              id="poste"
              formControlName="poste"
              placeholder="Votre poste"
            />
          </div>

          <div class="form-group" *ngIf="registerForm.get('role')?.value === 'AGENT_DGSI'">
            <label for="structure">Structure</label>
            <input
              type="text"
              id="structure"
              formControlName="structure"
              placeholder="Votre structure"
            />
          </div>
          <div class="form-group">
            <label for="contact">Contact (optionnel)</label>
            <input
              type="number"
              id="contact"
              formControlName="contact"
              placeholder="Numéro de téléphone"
            />
          </div>

          <div class="form-group">
            <label for="adresse">Adresse (optionnel)</label>
            <input
              type="text"
              id="adresse"
              formControlName="adresse"
              placeholder="Votre adresse"
            />
          </div>

          <div class="form-group">
            <label for="qualification">Qualification (optionnel)</label>
            <input
              type="text"
              id="qualification"
              formControlName="qualification"
              placeholder="Vos qualifications"
            />
          </div>

          <div class="error-message" *ngIf="errorMessage">
            {{ errorMessage }}
          </div>

          <div class="success-message" *ngIf="successMessage">
            {{ successMessage }}
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-full"
            [disabled]="registerForm.invalid || loading"
          >
            <span *ngIf="loading" class="loading"></span>
            {{ loading ? 'Inscription...' : "S'inscrire" }}
          </button>

          <div class="auth-footer">
            <p>Déjà un compte ? <a routerLink="/login">Se connecter</a></p>
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
      max-width: 420px;
      max-height: 80vh;
      overflow-y: auto;
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
      margin-bottom: 1.5rem;
    }

    .logo-icon {
      width: 3rem;
      height: 3rem;
      background: var(--primary);
      color: white;
      border-radius: var(--radius);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.25rem;
    }

    .logo h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin: 0;
      color: var(--text-primary);
    }

    .logo p {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .auth-header h2 {
      font-size: 1.75rem;
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
      margin-bottom: 1.25rem;
    }

    .form-group input,
    .form-group select {
      width: 100%;
      padding: 0.875rem;
      font-size: 0.9rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
      box-sizing: border-box;
    }

    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
      background: white;
    }

    .form-group input.error,
    .form-group select.error {
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
      font-size: 0.8125rem;
      margin-top: 0.5rem;
    }

    .success-message {
      color: var(--success);
      font-size: 0.875rem;
      margin-bottom: 1rem;
      padding: 0.75rem;
      background-color: #dcfce7;
      border-radius: var(--radius);
      text-align: center;
    }

    .btn-full {
      width: 100%;
      padding: 1rem;
      font-size: 1rem;
      font-weight: 600;
    }

    .auth-footer {
      margin-top: 1.5rem;
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
        padding: 1.5rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';
  passwordVisible = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.formBuilder.group({
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['', Validators.required],
      poste: [''],
      structure: [''],
      contact: [''],
      adresse: [''],
      qualification: ['']
    });
  }

  togglePasswordVisibility(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.loading = true;
      this.errorMessage = '';
      this.successMessage = '';

      console.log('Attempting registration with:', this.registerForm.value);

      this.authService.register(this.registerForm.value).subscribe({
        next: () => {
          this.loading = false;
          console.log('Registration successful');
          this.successMessage = 'Inscription réussie ! Vous pouvez maintenant vous connecter.';
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 2000);
        },
        error: (error) => {
          this.loading = false;
          console.error('Registration error:', error);
          if (error.status === 0) {
            this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le backend est démarré.';
          } else {
            this.errorMessage = error.error?.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
          }
        }
      });
    }
  }
}