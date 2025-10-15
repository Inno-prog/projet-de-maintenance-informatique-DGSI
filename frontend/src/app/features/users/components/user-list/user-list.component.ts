import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/auth.models';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>Gestion des Utilisateurs</h1>
          <p>Gérez les utilisateurs du système DGSI Maintenance</p>
        </div>

        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Utilisateurs</h2>
            <div class="table-actions">
              <div class="search-bar">
                <input type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm" (input)="filterUsers()" class="search-input">
                <span class="search-icon">🔍</span>
              </div>
              <button class="btn btn-primary btn-sm" (click)="openCreateUserModal()">+ Nouvel Utilisateur</button>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table *ngIf="filteredUsers.length > 0; else noData">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th>Contact</th>
                  <th>Qualification</th>
                  <th>Date de création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let user of filteredUsers">
                  <td>{{ user.nom }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <span class="badge" [class]="getBadgeClass(user.role)">
                      {{ getRoleLabel(user.role) }}
                    </span>
                  </td>
                  <td>{{ user.contact || '-' }}</td>
                  <td>{{ user.qualification || '-' }}</td>
                  <td>{{ formatDate(user.createdAt) }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-secondary btn-sm" (click)="editUser(user)">Modifier</button>
                      <button class="btn btn-danger btn-sm" (click)="deleteUser(user)" [disabled]="user.id === currentUserId">Supprimer</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucun utilisateur trouvé</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loading">
          Chargement des utilisateurs...
        </div>
      </div>

      <!-- User Modal -->
      <div class="modal-overlay" *ngIf="showUserModal" (click)="closeUserModal()">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditing ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h3>
            <button class="modal-close" (click)="closeUserModal()">&times;</button>
          </div>

          <form class="modal-body" (ngSubmit)="saveUser()">
            <div class="form-row">
              <div class="form-group">
                <label for="nom">Nom *</label>
                <input type="text" id="nom" [(ngModel)]="userForm.nom" required class="form-control">
              </div>

              <div class="form-group">
                <label for="email">Email *</label>
                <input type="email" id="email" [(ngModel)]="userForm.email" required class="form-control">
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="contact">Contact</label>
                <input type="text" id="contact" [(ngModel)]="userForm.contact" class="form-control">
              </div>

              <div class="form-group">
                <label for="role">Rôle *</label>
                <select id="role" [(ngModel)]="userForm.role" required class="form-control">
                  <option value="USER">Utilisateur</option>
                  <option value="ADMINISTRATEUR">Administrateur</option>
                  <option value="PRESTATAIRE">Prestataire</option>
                  <option value="AGENT_DGSI">Agent DGSI</option>
                </select>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="adresse">Adresse</label>
                <input type="text" id="adresse" [(ngModel)]="userForm.adresse" class="form-control">
              </div>

              <div class="form-group">
                <label for="qualification">Qualification</label>
                <input type="text" id="qualification" [(ngModel)]="userForm.qualification" class="form-control">
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" (click)="closeUserModal()">Annuler</button>
              <button type="submit" class="btn btn-primary">{{ isEditing ? 'Modifier' : 'Créer' }}</button>
            </div>
          </form>
        </div>
      </div>
  `,
  styles: [`
    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    tr:hover {
      background-color: #f9fafb;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
      white-space: normal;
      min-width: 150px;
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }

    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    .table-header {
      background: #f9fafb;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      padding: 0.5rem 2.5rem 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      width: 250px;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      color: #6b7280;
      pointer-events: none;
    }

    .table-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 1rem;
    }

    .btn-primary {
      background-color: #f97316;
      color: white;
    }

    .btn-primary:hover {
      background-color: #ea580c;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }

    .modal {
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
    }

    .modal-header {
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .modal-header h3 {
      margin: 0;
      color: #1f2937;
    }

    .modal-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
      border-radius: 4px;
      transition: all 0.2s;
    }

    .modal-close:hover {
      background: #f3f4f6;
      color: #1f2937;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .modal-footer {
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: all 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .table-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .search-input {
        width: 100%;
      }
    }
  `]
})
export class UserListComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchTerm = '';
  loading = false;
  currentUserId: string | null = null;
  showUserModal = false;
  isEditing = false;
  currentUser: User | null = null;
  userForm: User = {
    id: '',
    nom: '',
    email: '',
    contact: '',
    adresse: '',
    role: 'USER',
    qualification: '',
    createdAt: '',
    updatedAt: ''
  };

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    const currentUserStr = localStorage.getItem('currentUser');
    if (currentUserStr) {
      const currentUser = JSON.parse(currentUserStr);
      this.currentUserId = currentUser.id;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.filteredUsers = users;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm.trim()) {
      this.filteredUsers = [...this.users];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredUsers = this.users.filter(user => 
        (user.nom || '').toLowerCase().includes(term) ||
        (user.email || '').toLowerCase().includes(term) ||
        (user.contact || '').toLowerCase().includes(term) ||
        (user.role || '').toLowerCase().includes(term)
      );
    }
  }

  getBadgeClass(role: string): string {
    const roleClasses: { [key: string]: string } = {
      'ADMINISTRATEUR': 'badge-success',
      'PRESTATAIRE': 'badge-warning',
      'USER': 'badge-info'
    };
    return roleClasses[role] || 'badge-info';
  }

  getRoleLabel(role: string): string {
    const roleLabels: { [key: string]: string } = {
      'ADMINISTRATEUR': 'Administrateur',
      'PRESTATAIRE': 'Prestataire',
      'USER': 'Utilisateur'
    };
    return roleLabels[role] || role;
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  openCreateUserModal(): void {
    this.isEditing = false;
    this.currentUser = null;
    this.userForm = {
      id: '',
      nom: '',
      email: '',
      contact: '',
      adresse: '',
      role: 'USER',
      qualification: '',
      createdAt: '',
      updatedAt: ''
    };
    this.showUserModal = true;
  }

  editUser(user: User): void {
    this.isEditing = true;
    this.currentUser = user;
    this.userForm = { ...user };
    this.showUserModal = true;
  }

  closeUserModal(): void {
    this.showUserModal = false;
    this.currentUser = null;
    this.userForm = {
      id: '',
      nom: '',
      email: '',
      contact: '',
      adresse: '',
      role: 'USER',
      qualification: '',
      createdAt: '',
      updatedAt: ''
    };
  }

  saveUser(): void {
    if (this.isEditing && this.currentUser) {
      // Update existing user
      this.userService.updateUser(this.currentUser.id, this.userForm).subscribe({
        next: (updatedUser) => {
          const index = this.users.findIndex(u => u.id === updatedUser.id);
          if (index !== -1) {
            this.users[index] = updatedUser;
            this.filterUsers();
          }
          this.toastService.show({ type: 'success', title: 'Utilisateur modifié', message: 'L\'utilisateur a été modifié avec succès' });
          this.closeUserModal();
        },
        error: (error) => {
          console.error('Error updating user:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification de l\'utilisateur' });
        }
      });
    } else {
      // Create new user
      this.userService.createUser(this.userForm).subscribe({
        next: (newUser) => {
          this.users.push(newUser);
          this.filterUsers();
          this.toastService.show({ type: 'success', title: 'Utilisateur créé', message: 'L\'utilisateur a été créé avec succès' });
          this.closeUserModal();
        },
        error: (error) => {
          console.error('Error creating user:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création de l\'utilisateur' });
        }
      });
    }
  }

  async deleteUser(user: User): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'utilisateur',
      message: `Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.userService.deleteUser(user.id).subscribe({
        next: () => {
          this.users = this.users.filter(u => u.id !== user.id);
          this.toastService.show({ type: 'success', title: 'Utilisateur supprimé', message: 'L\'utilisateur a été supprimé avec succès' });
        },
        error: (error) => {
          console.error('Error deleting user:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de l\'utilisateur' });
        }
      });
    }
  }
}