import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar" [class.open]="isOpen" [style.width.px]="sidebarWidth" [style.--sidebar-width.px]="sidebarWidth">
      <button class="sidebar-toggle" [class.collapsed]="!isOpen" (click)="toggleSidebar()">
        <span class="arrow" *ngIf="isOpen">◀</span>
        <div class="hamburger" *ngIf="!isOpen">
          <span class="line"></span>
          <span class="line"></span>
          <span class="line"></span>
        </div>
      </button>
      <div class="sidebar-resizer" (mousedown)="startResize($event)"></div>
      <div class="sidebar-header">
        <div class="logo">
          <img src="/assets/logoFinal.png" alt="DGSI Logo" class="logo-image">
          <div class="logo-text">
            <h3>DGSI Maintenance</h3>
            <p>{{ getRoleLabel() }}</p>
          </div>
        </div>

      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Tableau de bord</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isPrestataire()">
          <h4 class="section-title">Mes Services</h4>
          <a routerLink="/fiches-prestation" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Fiches de Prestation</span>
          </a>

          <a routerLink="/prestations" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📝</span>
            <span class="nav-text">Mes Prestations</span>
          </a>

          <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Ordres de Commande</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isAdmin()">
          <h4 class="section-title">Administration</h4>
          <a routerLink="/users" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">👥</span>
            <span class="nav-text">Utilisateurs</span>
          </a>

          <a routerLink="/prestations" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📋</span>
            <span class="nav-text">Gestion des Prestations</span>
          </a>

          <a routerLink="/contrats" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📄</span>
            <span class="nav-text">Contrats</span>
          </a>

          <a routerLink="/items" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📝</span>
            <span class="nav-text">Items</span>
          </a>

          <a routerLink="/evaluations" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">⭐</span>
            <span class="nav-text">Evaluations</span>
          </a>

          <a routerLink="/ordres-commande" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📦</span>
            <span class="nav-text">Ordres de Commande</span>
          </a>
        </div>

        <div class="nav-section" *ngIf="authService.isAdminOrPrestataire()">
          <h4 class="section-title">Rapports</h4>
          <a routerLink="/rapports-suivi" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Rapports de Suivi</span>
          </a>

          <a routerLink="/rapports-trimestriels" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📈</span>
            <span class="nav-text">Rapports Trimestriels</span>
          </a>
        </div>

        <div class="nav-section">
          <h4 class="section-title">Statistiques</h4>
          <a routerLink="/statistiques" routerLinkActive="active" class="nav-item">
            <span class="nav-icon">📊</span>
            <span class="nav-text">Statistiques</span>
          </a>
        </div>
      </nav>

      <div class="sidebar-footer">
        <button class="logout-btn" (click)="logout()">
          <span class="logout-icon">🚪</span>
          <span class="logout-text">Déconnexion</span>
        </button>
      </div>

      <div class="sidebar-overlay" *ngIf="!isOpen" (click)="closeSidebar()"></div>
    </div>
  `,
  styles: [`
    .sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: linear-gradient(180deg, #1e293b 0%, #334155 100%);
      color: white;
      z-index: 1001;
      transform: translateX(-100%);
      transition: transform 0.3s ease-in-out;
      display: flex;
      flex-direction: column;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.1);
      overflow-y: auto;
    }

    .sidebar.open {
      transform: translateX(0);
    }

    .sidebar-toggle {
      position: absolute;
      top: 1rem;
      right: -40px;
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border: none;
      border-radius: 0 8px 8px 0;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1002;
      transition: all 0.3s ease;
      box-shadow: 2px 0 10px rgba(0, 0, 0, 0.2);
    }

    .sidebar-toggle:hover {
      background: linear-gradient(135deg, #334155 0%, #475569 100%);
    }

    .sidebar-toggle .arrow {
      font-size: 1.2rem;
      transition: transform 0.3s ease;
    }

    .sidebar-toggle.collapsed .arrow {
      transform: rotate(180deg);
    }

    .sidebar-toggle .hamburger {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 20px;
      height: 20px;
    }

    .sidebar-toggle .line {
      width: 100%;
      height: 2px;
      background: white;
      border-radius: 1px;
      transition: all 0.3s ease;
    }

    .sidebar-resizer {
      position: absolute;
      top: 0;
      right: 0;
      width: 4px;
      height: 100%;
      background: rgba(255, 255, 255, 0.2);
      cursor: col-resize;
      z-index: 1002;
      opacity: 0;
      transition: opacity 0.2s ease;
    }

    .sidebar-resizer:hover {
      opacity: 1;
      background: rgba(255, 255, 255, 0.4);
    }

    .sidebar.open .sidebar-resizer {
      opacity: 0;
    }

    .sidebar-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      display: none;
    }

    .sidebar.open .sidebar-overlay {
      display: block;
    }

    .sidebar-header {
      padding: 1.5rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: space-between;
      position: sticky;
      top: 0;
      background: inherit;
      z-index: 10;
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
      margin-right: 1rem;
    }

    .close-btn:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .logo-image {
      width: 3.5rem;
      height: 3.5rem;
      border-radius: 8px;
      object-fit: contain;
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

    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
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
      background: inherit;
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
  `]
})
export class SidebarComponent implements OnChanges {
  @Input() open: boolean = true;
  @Output() toggleChange = new EventEmitter<boolean>();
  isOpen = true;
  sidebarWidth = 320;
  isResizing = false;
  private startX = 0;
  private startWidth = 0;

  constructor(public authService: AuthService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['open']) {
      this.isOpen = this.open;
    }
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
    this.toggleChange.emit(this.isOpen);
  }

  closeSidebar(): void {
    this.isOpen = false;
    this.toggleChange.emit(this.isOpen);
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

  startResize(event: MouseEvent): void {
    if (!this.isOpen) return;
    this.isResizing = true;
    this.startX = event.clientX;
    this.startWidth = this.sidebarWidth;

    document.addEventListener('mousemove', this.resize.bind(this));
    document.addEventListener('mouseup', this.stopResize.bind(this));
  }

  private resize(event: MouseEvent): void {
    if (!this.isResizing) return;

    const deltaX = event.clientX - this.startX;
    const newWidth = this.startWidth + deltaX;

    this.sidebarWidth = Math.max(200, Math.min(600, newWidth));
  }

  private stopResize(): void {
    this.isResizing = false;
    document.removeEventListener('mousemove', this.resize.bind(this));
    document.removeEventListener('mouseup', this.stopResize.bind(this));
  }
}
