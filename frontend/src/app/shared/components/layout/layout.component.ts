import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { User } from '../../../core/models/auth.models';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { ToastComponent } from '../toast/toast.component';
import { ConfirmationComponent } from '../confirmation/confirmation.component';
import { InformationsDropdownComponent } from '../informations-dropdown/informations-dropdown.component';
import { ConfirmationService } from '../../../core/services/confirmation.service';
import { ToastService } from '../../../core/services/toast.service';
import { NotificationService, Notification } from '../../../core/services/notification.service';
@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, SidebarComponent, ToastComponent, ConfirmationComponent, InformationsDropdownComponent],
  template: `
    <div class="layout">
      <nav class="navbar">
        <div class="container">
          <div class="nav-brand">
            <button class="hamburger" (click)="toggleSidebar()">
              <span class="bar"></span>
              <span class="bar"></span>
              <span class="bar"></span>
            </button>
          </div>

          <div class="nav-center">
            <app-informations-dropdown></app-informations-dropdown>
          </div>

          <div class="nav-user" *ngIf="currentUser">
            <div class="user-profile-section">
              <div class="notification-bell" *ngIf="authService.isPrestataire()" (click)="toggleNotifications()">
                <span class="bell-icon">🔔</span>
                <span class="notification-badge" *ngIf="getUnreadCount() > 0">{{ getUnreadCount() }}</span>
              </div>

              <!-- Notifications Dropdown -->
              <div class="notifications-dropdown" *ngIf="showNotifications && authService.isPrestataire()" (mouseleave)="closeNotifications()">
                <div class="notifications-header">
                  <h4>Notifications</h4>
                  <button class="mark-all-read" *ngIf="getUnreadCount() > 0" (click)="markAllAsRead()">Tout marquer comme lu</button>
                </div>
                <div class="notifications-list" *ngIf="notifications.length > 0; else noNotifications">
                  <div class="notification-item" *ngFor="let notification of notifications" [class.unread]="!notification.lu" (click)="markAsRead(notification)">
                    <div class="notification-icon" [class]="'type-' + notification.type.toLowerCase()">
                      <span *ngIf="notification.type === 'INFO'">ℹ️</span>
                      <span *ngIf="notification.type === 'WARNING'">⚠️</span>
                      <span *ngIf="notification.type === 'SUCCESS'">✅</span>
                      <span *ngIf="notification.type === 'ERROR'">❌</span>
                    </div>
                    <div class="notification-content">
                      <h5>{{ notification.titre }}</h5>
                      <p>{{ notification.message }}</p>
                      <span class="notification-date">{{ formatDate(notification.dateCreation) }}</span>
                    </div>
                  </div>
                </div>
                <ng-template #noNotifications>
                  <div class="no-notifications">
                    <span>🔔</span>
                    <p>Aucune notification</p>
                  </div>
                </ng-template>
              </div>

              <div class="user-display">
                <button class="menu-item profile-item" (click)="openProfileModal()">
                  <span class="menu-icon">👤</span>
                  <div class="user-info">
                    <span class="user-name">{{ currentUser.nom }}</span>
                    <span class="user-role">{{ getRoleLabel(currentUser.role) }}</span>
                  </div>
                </button>
              </div>
              
              <div class="profile-dropdown" *ngIf="profileMenuOpen" (mouseleave)="closeProfileMenu()">
                <div class="profile-header">
                  <div class="user-avatar-large">
                    {{ getUserInitials() }}
                  </div>
                  <div class="user-details">
                    <h4>{{ currentUser.nom }}</h4>
                    <p>{{ currentUser.email }}</p>
                    <span class="role-badge" [class]="getRoleClass()">{{ getRoleLabel(currentUser.role) }}</span>
                  </div>
                </div>
                
                <div class="profile-menu">
                  <button class="menu-item" (click)="openProfileModal()">
                    <span class="menu-icon">👤</span>
                    <span>Mon Profil</span>
                  </button>
                  <button class="menu-item" (click)="openSettingsModal()">
                    <span class="menu-icon">⚙️</span>
                    <span>Paramètres</span>
                  </button>
                  <hr class="menu-divider">
                  <button class="menu-item logout" (click)="logout()">
                    <span class="menu-icon">🚺</span>
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div class="sidebar-overlay" *ngIf="sidebarOpen" (click)="closeSidebar()"></div>

      <app-sidebar #sidebar [open]="sidebarOpen" (toggleChange)="onSidebarToggle($event)"></app-sidebar>

      <main class="main-content" [style.margin-left.px]="sidebarOpen ? 320 : 0">
        <ng-content></ng-content>
      </main>

      <!-- Profile Modal -->
      <div class="modal-overlay" *ngIf="showProfileModal" (click)="closeProfileModal()">
        <div class="modal-content profile-modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>Mon Profil</h2>
            <button class="close-btn" (click)="closeProfileModal()">×</button>
          </div>
          
          <form [formGroup]="profileForm" (ngSubmit)="updateProfile()">
            <div class="modal-body">
              <div class="profile-avatar-section">
                <div class="profile-avatar-large">
                  {{ getUserInitials() }}
                </div>
                <div class="avatar-info">
                  <h3>{{ currentUser?.nom }}</h3>
                  <p>{{ getRoleLabel(currentUser?.role || '') }}</p>
                </div>
              </div>
              
              <div class="form-grid">
                <div class="form-group">
                  <label for="nom">Nom complet</label>
                  <input type="text" id="nom" formControlName="nom" class="form-control">
                </div>
                
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" formControlName="email" class="form-control">
                </div>
                
                <div class="form-group">
                  <label for="contact">Téléphone</label>
                  <input type="tel" id="contact" formControlName="contact" class="form-control">
                </div>
                
                <div class="form-group form-group-full">
                  <label for="adresse">Adresse</label>
                  <textarea id="adresse" formControlName="adresse" class="form-control" rows="3"></textarea>
                </div>
              </div>
            </div>
            
            <div class="modal-footer">
              <button type="button" class="btn btn-outline" (click)="closeProfileModal()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="profileLoading || profileForm.invalid">
                {{ profileLoading ? 'Mise à jour...' : 'Mettre à jour' }}
              </button>
            </div>
          </form>
        </div>
      </div>

      <app-toast #toast></app-toast>
      <app-confirmation #confirmation></app-confirmation>
    </div>
  `,
  styles: [`
    .layout {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }

    .navbar {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: white;
      padding: 1rem 0;
      box-shadow: var(--shadow-md);
      position: relative;
      z-index: 1002;
    }

    .navbar .container {
       display: flex;
       align-items: center;
       justify-content: space-between;
     }

     .nav-center {
       flex: 1;
       display: flex;
       justify-content: center;
       align-items: center;
     }

    .hamburger {
      display: flex;
      flex-direction: column;
      justify-content: space-around;
      width: 30px;
      height: 30px;
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 0;
      margin-right: 1rem;
      transition: all 0.3s ease;
    }

    .hamburger:hover {
      opacity: 0.8;
    }

    .bar {
      width: 100%;
      height: 3px;
      background: white;
      border-radius: 2px;
      transition: all 0.3s ease;
      transform-origin: center;
    }

    .hamburger.active .bar:nth-child(1) {
      transform: rotate(45deg) translate(5px, 5px);
    }

    .hamburger.active .bar:nth-child(2) {
      opacity: 0;
    }

    .hamburger.active .bar:nth-child(3) {
      transform: rotate(-45deg) translate(7px, -6px);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .logo-image {
      width: 4rem;
      height: 4rem;
      border-radius: var(--radius);
      object-fit: contain;
    }

    .nav-user {
      position: relative;
    }

    .user-profile-section {
      position: relative;
      display: flex;
      align-items: center;
      gap: 0.75rem;
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

    .user-display {
      display: flex;
      align-items: center;
    }

    .profile-item {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      border-radius: 8px;
      padding: 0.75rem 1rem;
      color: white;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-align: left;
    }

    .profile-item:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .user-info {
      text-align: left;
    }

    .user-name {
      display: block;
      font-weight: 600;
      color: white;
      font-size: 0.9rem;
    }

    .user-role {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    .menu-icon {
      font-size: 1.2rem;
      width: 1.5rem;
      text-align: center;
    }

    .dropdown-icon {
      width: 1.2rem;
      height: 1.2rem;
      transition: transform 0.2s ease;
    }

    .dropdown-icon.rotated {
      transform: rotate(180deg);
    }

    .profile-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      width: 280px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid #e5e7eb;
      z-index: 1000;
      overflow: hidden;
    }

    .profile-header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      padding: 1.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-avatar-large {
      width: 3.5rem;
      height: 3.5rem;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
      color: white;
    }

    .user-details h4 {
      margin: 0;
      color: white;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .user-details p {
      margin: 0.25rem 0;
      color: #94a3b8;
      font-size: 0.85rem;
    }

    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .role-admin {
      background: #dc2626;
      color: white;
    }

    .role-prestataire {
      background: #059669;
      color: white;
    }

    .role-ci {
      background: #7c3aed;
      color: white;
    }

    .profile-menu {
      padding: 0.5rem 0;
    }

    .menu-item {
      width: 100%;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1.5rem;
      background: none;
      border: none;
      color: #374151;
      font-size: 0.9rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
      text-align: left;
    }

    .menu-item:hover {
      background: #f3f4f6;
    }

    .menu-item.logout {
      color: #dc2626;
    }

    .menu-item.logout:hover {
      background: #fef2f2;
    }

    .menu-icon {
      font-size: 1rem;
      width: 1.2rem;
      text-align: center;
    }

    .menu-divider {
      margin: 0.5rem 0;
      border: none;
      border-top: 1px solid #e5e7eb;
    }

    .notifications-dropdown {
      position: absolute;
      top: 100%;
      right: 0;
      margin-top: 0.5rem;
      width: 380px;
      max-height: 500px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
      border: 1px solid #e5e7eb;
      z-index: 1000;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }

    .notifications-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #f9fafb;
      border-bottom: 1px solid #e5e7eb;
    }

    .notifications-header h4 {
      margin: 0;
      color: #1f2937;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .mark-all-read {
      background: var(--primary);
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 6px;
      font-size: 0.8rem;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .mark-all-read:hover {
      background: #ea580c;
    }

    .notifications-list {
      max-height: 400px;
      overflow-y: auto;
    }

    .notification-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem 1.5rem;
      border-bottom: 1px solid #f3f4f6;
      cursor: pointer;
      transition: background-color 0.2s ease;
    }

    .notification-item:hover {
      background: #f9fafb;
    }

    .notification-item.unread {
      background: #fef3c7;
      border-left: 4px solid var(--primary);
    }

    .notification-item.unread:hover {
      background: #fde68a;
    }

    .notification-icon {
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .notification-content {
      flex: 1;
      min-width: 0;
    }

    .notification-content h5 {
      margin: 0 0 0.25rem 0;
      color: #1f2937;
      font-size: 0.9rem;
      font-weight: 600;
    }

    .notification-content p {
      margin: 0 0 0.5rem 0;
      color: #6b7280;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .notification-date {
      font-size: 0.75rem;
      color: #9ca3af;
    }

    .no-notifications {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 3rem 1.5rem;
      text-align: center;
      color: #9ca3af;
    }

    .no-notifications span {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .no-notifications p {
      margin: 0;
      font-size: 0.9rem;
    }

    .profile-modal {
      width: 90%;
      max-width: 500px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .modal-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #6b7280;
      cursor: pointer;
      padding: 0.25rem;
      border-radius: 4px;
    }

    .close-btn:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .profile-avatar-section {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 2rem;
      padding: 1rem;
      background: #f9fafb;
      border-radius: 8px;
    }

    .profile-avatar-large {
      width: 4rem;
      height: 4rem;
      background: var(--primary);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.5rem;
      color: white;
    }

    .avatar-info h3 {
      margin: 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .avatar-info p {
      margin: 0.25rem 0 0 0;
      color: #6b7280;
      font-size: 0.9rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.9rem;
      transition: border-color 0.2s ease;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
    }

    .main-content {
      flex: 1;
      padding: 2rem 0;
      background-color: var(--bg-secondary);
      transition: margin-left 0.3s ease-in-out;
    }

    @media (max-width: 768px) {
      .navbar .container {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-menu {
        order: 3;
        gap: 1rem;
      }

      .nav-user {
        order: 2;
      }
    }
  `]
})
export class LayoutComponent implements AfterViewInit, OnDestroy {
  currentUser: User | null = null;
  profileMenuOpen = false;
  notifications: Notification[] = [];
  showNotifications = false;
  sidebarOpen = true;
  notificationPollingInterval: any;
  @ViewChild('sidebar') sidebar!: SidebarComponent;
  @ViewChild('toast') toast!: ToastComponent;
  @ViewChild('confirmation') confirmation!: ConfirmationComponent;

  constructor(
    public authService: AuthService, 
    private router: Router,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private notificationService: NotificationService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  ngAfterViewInit(): void {
    this.confirmationService.setComponent(this.confirmation);
    this.toastService.setComponent(this.toast);

    // Charger les notifications pour les prestataires
    if (this.authService.isPrestataire()) {
      this.loadNotifications();
      this.startNotificationPolling();
    }
  }

  ngOnDestroy(): void {
    if (this.notificationPollingInterval) {
      clearInterval(this.notificationPollingInterval);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
    // Update sidebar component state
    if (this.sidebar) {
      this.sidebar.isOpen = this.sidebarOpen;
    }
  }

  closeSidebar(): void {
    this.sidebarOpen = false;
    if (this.sidebar) {
      this.sidebar.isOpen = false;
    }
  }

  onSidebarToggle(isOpen: boolean): void {
    this.sidebarOpen = isOpen;
  }

  toggleProfileMenu(): void {
    this.profileMenuOpen = !this.profileMenuOpen;
  }

  closeProfileMenu(): void {
    this.profileMenuOpen = false;
  }

  openProfileModal(): void {
    this.closeProfileMenu();
    this.showProfileModal = true;
    this.initProfileForm();
  }

  showProfileModal = false;
  profileForm!: FormGroup;
  profileLoading = false;

  initProfileForm(): void {
    const fb = new FormBuilder();
    this.profileForm = fb.group({
      nom: [this.currentUser?.nom || '', Validators.required],
      email: [this.currentUser?.email || '', [Validators.required, Validators.email]],
      contact: [this.currentUser?.contact || ''],
      adresse: [this.currentUser?.adresse || '']
    });
  }

  closeProfileModal(): void {
    this.showProfileModal = false;
  }

  async updateProfile(): Promise<void> {
    if (this.profileForm.valid && this.currentUser) {
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: 'Voulez-vous vraiment mettre à jour votre profil ?',
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.profileLoading = true;
        const updatedUser = {
          ...this.currentUser,
          ...this.profileForm.value
        };
        
        // Appel API pour mettre à jour le profil
        this.authService.updateUserProfile(updatedUser).subscribe({
          next: (user: any) => {
            this.profileLoading = false;
            this.closeProfileModal();
            this.toastService.show({
              type: 'success',
              title: 'Profil mis à jour',
              message: 'Vos informations ont été sauvegardées avec succès'
            });
          },
          error: (error: any) => {
            this.profileLoading = false;
            console.error('Erreur mise à jour profil:', error);
            this.toastService.show({
              type: 'error',
              title: 'Erreur',
              message: 'Impossible de mettre à jour le profil'
            });
          }
        });
      }
    }
  }

  openSettingsModal(): void {
    this.closeProfileMenu();
    // TODO: Ouvrir modal paramètres
    console.log('Ouvrir modal paramètres');
  }

  getUserInitials(): string {
    if (!this.currentUser?.nom) return 'U';
    return this.currentUser.nom
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleClass(): string {
    if (!this.currentUser) return '';
    switch (this.currentUser.role) {
      case 'ADMINISTRATEUR': return 'role-admin';
      case 'PRESTATAIRE': return 'role-prestataire';
      case 'AGENT_DGSI': return 'role-ci';
      default: return '';
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  isAdminOrPrestataire(): boolean {
    return this.authService.isAdmin() || this.authService.isPrestataire();
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'ADMINISTRATEUR': 'Administrateur',
      'PRESTATAIRE': 'Prestataire',
      'USER': 'Utilisateur'
    };
    return roleLabels[role] || role;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.lu).length;
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications && this.authService.isPrestataire()) {
      this.loadNotifications();
    }
  }

  closeNotifications(): void {
    this.showNotifications = false;
  }

  private loadNotifications(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.notificationService.getNotifications(user.email).subscribe({
        next: (notifications) => {
          this.notifications = notifications;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des notifications:', error);
        }
      });
    }
  }

  private startNotificationPolling(): void {
    // Poll for new notifications every 30 seconds
    this.notificationPollingInterval = setInterval(() => {
      if (this.authService.isPrestataire()) {
        this.loadNotifications();
      }
    }, 30000); // 30 seconds
  }

  markAsRead(notification: Notification): void {
    this.notificationService.marquerCommeLu(notification.id).subscribe({
      next: () => {
        notification.lu = true;
      },
      error: (error) => {
        console.error('Erreur lors du marquage comme lu:', error);
      }
    });
  }

  markAllAsRead(): void {
    const unreadNotifications = this.notifications.filter(n => !n.lu);
    unreadNotifications.forEach(notification => {
      this.markAsRead(notification);
    });
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }
}