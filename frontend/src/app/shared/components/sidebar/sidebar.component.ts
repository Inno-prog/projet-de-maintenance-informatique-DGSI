import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.sidebar-open]="isOpen">
      <div class="sidebar-header">
        <div class="logo">
          <span class="logo-icon">DG</span>
          <div class="logo-text">
            <h3>DGSI Maintenance</h3>
            <p>{{ getRoleLabel() }}</p>
          </div>
        </div>

      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <h4 class="section-title">Tableau de Bord</h4>
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Dashboard</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isPrestataire()">
          <h4 class="section-title">Mes Services</h4>
          
          <a routerLink="/contrats" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📄</span>
            <span class="nav-text">Contrats</span>
          </a>

          <a routerLink="/evaluations" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">Évaluations</span>
          </a>

          <a routerLink="/fiches-prestation" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Fiches de Prestation</span>
          </a>

          <a routerLink="/" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">🔧</span>
            <span class="nav-text">Demandes d'Intervention</span>
          </a>

          <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Ordres de Commande</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isAdmin()">
          <h4 class="section-title">Administration</h4>
          
          <a routerLink="/prestations-dashboard" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Tableau de Bord Prestations</span>
          </a>

          <a routerLink="/users" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Utilisateurs</span>
          </a>

          <a routerLink="/contrats" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📄</span>
            <span class="nav-text">Contrats</span>
          </a>

          <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Ordres de Commande</span>
          </a>

          <a routerLink="/" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">🔧</span>
            <span class="nav-text">Demandes d'Intervention</span>
          </a>

          <a routerLink="/evaluations" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">Évaluations</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isAgentDGSI()">
          <h4 class="section-title">Validation & Évaluation</h4>
          
          <a routerLink="/fiches-prestation" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">✅</span>
            <span class="nav-text">Valider Fiches</span>
          </a>

          <a routerLink="/evaluations" routerLinkActive="active" class="nav-item" (click)="closeSidebar()">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">Créer Évaluations</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ getUserInitials() }}</div>
          <div class="user-details">
            <span class="user-name">{{ authService.getCurrentUser()?.nom }}</span>
            <span class="user-role">{{ getRoleLabel() }}</span>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()">
          <span>🚪</span> Déconnexion
        </button>
      </div>
    </div>


  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 320px;
      height: 100vh;
      background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
      color: white;
      z-index: 1000;
      transition: left 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
    }

    .sidebar:not(.sidebar-open) {
      left: -320px;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
      width: 2.5rem;
      height: 2.5rem;
      background: var(--primary);
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.1rem;
    }

    .logo-text h3 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .logo-text p {
      margin: 0;
      font-size: 0.8rem;
      color: #94a3b8;
    }

    .close-btn {
      background: none;
      border: none;
      color: white;
      font-size: 1.5rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 4px;
      transition: background-color 0.2s;
    }

    .close-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-section {
      margin-bottom: 2rem;
    }

    .section-title {
      padding: 0 1.5rem;
      margin: 0 0 1rem 0;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      color: #94a3b8;
      letter-spacing: 0.05em;
    }

    .nav-item {
      display: flex;
      align-items: center;
      padding: 0.75rem 1.5rem;
      color: #e2e8f0;
      text-decoration: none;
      transition: all 0.2s ease-in-out;
      border-left: 3px solid transparent;
    }

    .nav-item:hover {
      background-color: rgba(249, 115, 22, 0.1);
      color: var(--primary);
      border-left-color: var(--primary);
    }

    .nav-item.active {
      background-color: rgba(249, 115, 22, 0.15);
      color: var(--primary);
      border-left-color: var(--primary);
    }

    .nav-icon {
      font-size: 1.2rem;
      margin-right: 0.75rem;
      width: 1.5rem;
      text-align: center;
    }

    .nav-text {
      flex: 1;
      font-weight: 500;
    }

    .sidebar-footer {
      padding: 1.5rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .user-avatar {
      width: 2.5rem;
      height: 2.5rem;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-details {
      flex: 1;
    }

    .user-name {
      display: block;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .user-role {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .logout-btn {
      width: 100%;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 0.75rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s ease-in-out;
    }

    .sidebar-overlay.active {
      opacity: 1;
      visibility: visible;
    }
  `]
})
export class SidebarComponent {
  isOpen = true;

  constructor(public authService: AuthService) {}

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  closeSidebar(): void {
    this.isOpen = false;
  }

  logout(): void {
    this.authService.logout();
  }

  getRoleLabel(): string {
    const user = this.authService.getCurrentUser();
    if (!user) return '';

    switch (user.role) {
      case 'ADMINISTRATEUR': return 'Administrateur';
      case 'PRESTATAIRE': return 'Prestataire';
      case 'AGENT_DGSI': return 'Agent DGSI';
      default: return user.role;
    }
  }

  getUserInitials(): string {
    const user = this.authService.getCurrentUser();
    if (!user?.nom) return 'U';
    
    return user.nom
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }
}