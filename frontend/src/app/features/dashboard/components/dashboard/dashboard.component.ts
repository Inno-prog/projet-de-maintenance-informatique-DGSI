import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { AuthService } from '../../../../core/services/auth.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { UserService } from '../../../../core/services/user.service';
import { DemandeInterventionService } from '../../../../core/services/demande-intervention.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, LayoutComponent],
  template: `
    <app-layout *ngIf="authService.isAuthenticated(); else publicView">
      <div class="container">
        <div class="dashboard-header">
          <div class="welcome-section">
            <h1>Bienvenue sur <span class="text-primary">DGSI Maintenance</span></h1>
            <p *ngIf="authService.isAuthenticated()">
              Bonjour <strong>{{ authService.getCurrentUser()?.nom }}</strong> -
              <span class="user-role" [class]="getRoleClass()">
                {{ getRoleDisplayName() }}
              </span>
            </p>
            <p *ngIf="!authService.isAuthenticated()">Plateforme de suivi rigoureux des prestations de maintenance informatique</p>
            <p class="subtitle">Développé par Direction Générale des Systèmes d'Information</p>
          </div>

          <div class="cta-section">
            <a href="http://www.it@finances.gov.bf" target="_blank" class="btn btn-primary" *ngIf="!authService.isAuthenticated()">
              En savoir plus
              <span>→</span>
            </a>
            <button class="btn btn-primary" *ngIf="authService.isAuthenticated()" (click)="goToUserDashboard()">
              Accéder à mon Dashboard
              <span>→</span>
            </button>
          </div>
        </div>

        <div class="features-section">
          <div class="feature-card">
            <div class="feature-icon">
              <span>📋</span>
            </div>
            <h3>Gestion Prestataires</h3>
            <p>Création et gestion complète des prestataires avec leurs items associés</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <span>✅</span>
            </div>
            <h3>Suivi Sécurisé</h3>
            <p>Suivi rigoureux de l'exécution des prestations de maintenance</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">
              <span>🎧</span>
            </div>
            <h3>Support 24/7</h3>
            <p>Évaluation continue des prestataires selon 13 critères standardisés</p>
          </div>
        </div>



        <div class="stats-section" *ngIf="authService.isAdmin()">
          <h2>Statistiques du système</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalUsers }}</div>
              <div class="stat-label">Utilisateurs</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalContrats }}</div>
              <div class="stat-label">Contrats</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalOrdres }}</div>
              <div class="stat-label">Ordres de Commande</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalEvaluations }}</div>
              <div class="stat-label">Évaluations</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalDemandes }}</div>
              <div class="stat-label">Demandes Total</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.demandesEnAttente }}</div>
              <div class="stat-label">En Attente</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">{{ stats.totalPrestations }}</div>
              <div class="stat-label">Prestations</div>
            </div>
          </div>
        </div>

        <!-- Role-specific quick actions -->
        <div class="quick-actions" *ngIf="authService.isAuthenticated()">
          <h2>Actions rapides</h2>
          <div class="actions-grid">
            <!-- Admin actions -->
            <ng-container *ngIf="authService.isAdmin()">
              <a routerLink="/users" class="action-card">
                <div class="action-icon">👥</div>
                <h3>Gérer les Utilisateurs</h3>
                <p>Administrer les comptes utilisateur</p>
              </a>
              <a routerLink="/contrats" class="action-card">
                <div class="action-icon">📄</div>
                <h3>Gérer les Contrats</h3>
                <p>Visualiser et gérer tous les contrats</p>
              </a>
              <a routerLink="/demandes-intervention" class="action-card">
                <div class="action-icon">🔧</div>
                <h3>Demandes d'Intervention</h3>
                <p>Accepter ou refuser les demandes des prestataires</p>
              </a>
            </ng-container>

            <!-- Prestataire actions -->
            <ng-container *ngIf="authService.isPrestataire()">
              <a routerLink="/contrats" class="action-card">
                <div class="action-icon">📄</div>
                <h3>Contrats & Évaluations</h3>
                <p>Gérer mes contrats et consulter mes évaluations trimestrielles</p>
              </a>
              <a routerLink="/ordres-commande" class="action-card">
                <div class="action-icon">📋</div>
                <h3>Ordres de Commande</h3>
                <p>Approuver ou rejeter les ordres reçus</p>
              </a>
              <a routerLink="/demandes-intervention" class="action-card">
                <div class="action-icon">🔧</div>
                <h3>Mes Demandes d'Intervention</h3>
                <p>Créer et gérer mes demandes d'intervention</p>
              </a>
            </ng-container>

            <!-- Correspondant Informatique actions -->
            <ng-container *ngIf="authService.isCorrespondantInformatique()">
              <a routerLink="/fiches-prestation" class="action-card">
                <div class="action-icon">📄</div>
                <h3>Fiches de Prestation</h3>
                <p>Valider les fiches de prestations des prestataires</p>
              </a>
              <a routerLink="/evaluations" class="action-card">
                <div class="action-icon">⭐</div>
                <h3>Évaluations</h3>
                <p>Créer et consulter les évaluations des prestataires</p>
              </a>
            </ng-container>
          </div>
        </div>

      </div>
    </app-layout>

    <ng-template #publicView>
      <div class="public-layout">
        <nav class="navbar">
          <div class="container">
            <div class="nav-brand">
              <div class="logo">
                <span class="logo-icon">DG</span>
                <div>
                  <h1>DGSI Maintenance</h1>
                  <p>par Direction Générale</p>
                </div>
              </div>
            </div>
            
            <div class="nav-actions">
              <a routerLink="/login" class="btn btn-outline">Connexion</a>
              <a routerLink="/register" class="btn btn-primary">S'inscrire</a>
            </div>
          </div>
        </nav>

        <main class="main-content">
          <div class="floating-shapes">
            <div class="shape shape-1">⚡</div>
            <div class="shape shape-2">🔧</div>
            <div class="shape shape-3">📊</div>
            <div class="shape shape-4">🚀</div>
            <div class="shape shape-5">💡</div>
            <div class="shape shape-6">🔒</div>
          </div>
          <div class="container">
            <div class="dashboard-header" style="max-width: 70%; margin: 4rem auto 5rem auto;">
              <div class="welcome-section">
                <h1>Bienvenue sur <span class="text-primary">DGSI Maintenance</span></h1>
                <p>Plateforme de suivi rigoureux des prestations de maintenance informatique</p>
                <p class="subtitle">Développé par Direction Générale des Systèmes d'Information</p>
              </div>
              
              <div class="cta-section">
                <a href="http://www.it@finances.gov.bf" target="_blank" class="btn btn-primary">
                  En savoir plus
                  <span>→</span>
                </a>
              </div>
            </div>

            <div class="features-section">
              <div class="feature-card">
                <div class="feature-icon">
                  <span>📋</span>
                </div>
                <h3>Gestion Prestataires</h3>
                <p>Création et gestion complète des prestataires avec leurs items associés</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">
                  <span>✅</span>
                </div>
                <h3>Suivi Sécurisé</h3>
                <p>Suivi rigoureux de l'exécution des prestations de maintenance</p>
              </div>

              <div class="feature-card">
                <div class="feature-icon">
                  <span>🎧</span>
                </div>
                <h3>Support 24/7</h3>
                <p>Évaluation continue des prestataires selon 13 critères standardisés</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ng-template>
  `,
  styles: [`
    .public-layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: rgba(30, 41, 59, 0.9);
      backdrop-filter: blur(20px);
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: white;
      padding: 1rem 0;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
      position: relative;
      z-index: 10;
    }

    .navbar::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(51, 65, 85, 0.9) 100%);
      z-index: -1;
    }

    .navbar .container {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
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
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    .logo p {
      font-size: 0.875rem;
      color: #94a3b8;
      margin: 0;
    }

    .nav-actions {
      display: flex;
      gap: 1rem;
    }

    .nav-actions .btn {
      text-decoration: none;
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
      border-radius: 8px;
      padding: 0.75rem 1.5rem;
      font-weight: 500;
    }

    .nav-actions .btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
      transition: left 0.5s;
    }

    .nav-actions .btn:hover::before {
      left: 100%;
    }

    .nav-actions .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.4);
    }

    .nav-actions .btn-outline {
      background-color: transparent;
      border: 1px solid rgba(249, 115, 22, 0.6);
      color: var(--primary);
    }

    .nav-actions .btn-outline:hover {
      background-color: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .nav-actions .btn-primary {
      background-color: var(--primary);
      border: 1px solid var(--primary);
      color: white;
    }

    .nav-actions .btn-primary:hover {
      background-color: #ea580c;
      box-shadow: 0 8px 25px rgba(249, 115, 22, 0.6);
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      position: relative;
      overflow: hidden;
    }

    .main-content::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image:
        radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(147, 51, 234, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(16, 185, 129, 0.1) 0%, transparent 50%);
      animation: float 20s ease-in-out infinite;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      33% { transform: translateY(-10px) rotate(120deg); }
      66% { transform: translateY(10px) rotate(240deg); }
    }

    .floating-shapes {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
    }

    .shape {
      position: absolute;
      font-size: 2rem;
      opacity: 0.1;
      animation: floatShape 15s ease-in-out infinite;
    }

    .shape-1 { top: 10%; left: 10%; animation-delay: 0s; }
    .shape-2 { top: 20%; right: 15%; animation-delay: 2s; }
    .shape-3 { bottom: 30%; left: 20%; animation-delay: 4s; }
    .shape-4 { bottom: 20%; right: 10%; animation-delay: 6s; }
    .shape-5 { top: 50%; left: 50%; animation-delay: 8s; }
    .shape-6 { top: 70%; right: 20%; animation-delay: 10s; }

    @keyframes floatShape {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }

    .dashboard-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 4rem 2rem;
      border-radius: 16px;
      margin: 4rem auto 5rem auto;
      max-width: 70%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .welcome-section h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      color: white;
    }

    .text-primary {
      color: var(--primary);
    }

    .welcome-section p {
      font-size: 1.25rem;
      color: #e2e8f0;
      margin-bottom: 0.5rem;
    }

    .user-role {
      font-weight: 600;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.9rem;
    }

    .role-admin {
      background-color: #dc2626;
      color: white;
    }

    .role-prestataire {
      background-color: #059669;
      color: white;
    }

    .role-ci {
      background-color: #7c3aed;
      color: white;
    }

    .subtitle {
      font-size: 1rem !important;
      color: #94a3b8 !important;
    }

    .cta-section .btn {
      font-size: 1.125rem;
      padding: 1rem 2rem;
      background-color: var(--primary);
      border: none;
    }

    .cta-section .btn span {
      margin-left: 0.5rem;
      transition: transform 0.2s ease-in-out;
    }

    .cta-section .btn:hover span {
      transform: translateX(4px);
    }

    .cta-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .notification-bell {
      position: relative;
      cursor: pointer;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      transition: all 0.2s ease;
    }

    .notification-bell:hover {
      background: rgba(255, 255, 255, 0.2);
      transform: scale(1.1);
    }

    .bell-icon {
      font-size: 1.5rem;
      display: block;
    }

    .notification-badge {
      position: absolute;
      top: -5px;
      right: -5px;
      background: #ef4444;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.75rem;
      font-weight: 600;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
      }
      70% {
        box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
      }
      100% {
        box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
      }
    }

    .features-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 2rem;
      margin: 3rem auto 4rem auto;
      max-width: 90%;
      animation: slideUp 0.8s ease-out;
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-card {
      background: rgba(255, 255, 255, 0.9);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.5);
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(249, 115, 22, 0.15);
      text-align: center;
      transition: all 0.3s ease-in-out;
      animation: fadeInUp 0.6s ease-out forwards;
      opacity: 0;
      position: relative;
      overflow: hidden;
    }

    .feature-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transition: left 0.5s;
    }

    .feature-card:hover::before {
      left: 100%;
    }

    .feature-card:nth-child(1) { animation-delay: 0.1s; }
    .feature-card:nth-child(2) { animation-delay: 0.2s; }
    .feature-card:nth-child(3) { animation-delay: 0.3s; }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(40px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .feature-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(249, 115, 22, 0.25);
      border-color: rgba(249, 115, 22, 0.5);
      background: rgba(255, 255, 255, 0.95);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 1rem;
    }

    .feature-card p {
      color: var(--text-secondary);
      line-height: 1.6;
    }

    .stats-section {
      margin-bottom: 3rem;
    }

    .stats-section h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: center;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.5rem;
    }

    .stat-label {
      font-size: 1rem;
      color: var(--text-secondary);
      font-weight: 500;
    }

    .quick-actions h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .action-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      border: 2px solid transparent;
    }

    .action-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
      border-color: var(--primary);
    }

    .action-icon {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .action-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .action-card p {
      color: var(--text-secondary);
      margin: 0;
    }

    .notifications-section {
      margin-top: 3rem;
    }

    .notifications-section h2 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 2rem;
    }

    .notifications-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .notification-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      border-left: 4px solid #e5e7eb;
    }

    .notification-card.unread {
      border-left-color: var(--primary);
      background: #fef3c7;
    }

    .notification-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .notification-type {
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .type-info {
      background: #dbeafe;
      color: #1e40af;
    }

    .type-warning {
      background: #fef3c7;
      color: #92400e;
    }

    .type-success {
      background: #dcfce7;
      color: #166534;
    }

    .type-error {
      background: #fecaca;
      color: #991b1b;
    }

    .notification-date {
      font-size: 0.9rem;
      color: #6b7280;
    }

    .notification-card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .notification-card p {
      margin: 0 0 1rem 0;
      color: #4b5563;
    }

    @media (max-width: 768px) {
      .dashboard-header {
        flex-direction: column;
        text-align: center;
        padding: 2rem 1rem;
      }

      .welcome-section h1 {
        font-size: 2rem;
      }

      .features-section,
      .stats-grid,
      .actions-grid {
        grid-template-columns: 1fr;
      }

      .shape {
        font-size: 1.5rem;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats = {
    totalUsers: 0,
    totalContrats: 0,
    totalOrdres: 0,
    totalEvaluations: 0,
    totalDemandes: 0,
    demandesEnAttente: 0,
    totalPrestations: 0
  };


  constructor(
    public authService: AuthService,
    private contratService: ContratService,
    private ordreCommandeService: OrdreCommandeService,
    private evaluationService: EvaluationService,
    private userService: UserService,
    private router: Router,
    private demandeService: DemandeInterventionService,
    private prestationService: FichePrestationService
  ) {}

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loadStats();
    }
  }

  private loadStats(): void {
    this.userService.getAllUsers().subscribe(users => {
      this.stats.totalUsers = users.length;
    });

    this.contratService.getAllContrats().subscribe(contrats => {
      this.stats.totalContrats = contrats.length;
    });

    this.ordreCommandeService.getAllOrdresCommande().subscribe(ordres => {
      this.stats.totalOrdres = ordres.length;
    });

    this.evaluationService.getAllEvaluations().subscribe(evaluations => {
      this.stats.totalEvaluations = evaluations.length;
    });

    this.demandeService.getAllDemandes().subscribe(demandes => {
      this.stats.totalDemandes = demandes.length;
      this.stats.demandesEnAttente = demandes.filter(d => d.statut === 'SOUMISE').length;
    });

    this.prestationService.getAllFiches().subscribe(prestations => {
      this.stats.totalPrestations = prestations.length;
    });
  }


  getRoleDisplayName(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR':
        return 'Administrateur';
      case 'PRESTATAIRE':
        return 'Prestataire';
      case 'CORRESPONDANT_INFORMATIQUE':
        return 'Correspondant Informatique';
      default:
        return user.role;
    }
  }

  getRoleClass(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR':
        return 'role-admin';
      case 'PRESTATAIRE':
        return 'role-prestataire';
      case 'CORRESPONDANT_INFORMATIQUE':
        return 'role-ci';
      default:
        return '';
    }
  }


  goToUserDashboard(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      switch (user.role) {
        case 'ADMINISTRATEUR':
          this.router.navigate(['/dashboard/admin']);
          break;
        case 'PRESTATAIRE':
          this.router.navigate(['/dashboard/prestataire']);
          break;
        case 'CORRESPONDANT_INFORMATIQUE':
          this.router.navigate(['/dashboard/ci']);
          break;
        default:
          this.router.navigate(['/dashboard']);
      }
    }
  }
}