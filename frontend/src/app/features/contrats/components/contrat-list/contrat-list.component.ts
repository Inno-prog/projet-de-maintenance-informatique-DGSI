import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContratService } from '../../../../core/services/contrat.service';
import { Contrat } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-contrat-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>Gestion des Contrats</h1>
          <p>Gérez les contrats de maintenance avec les prestataires</p>
          <button class="btn btn-primary" *ngIf="authService.isAdmin()" (click)="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Annuler' : 'Nouveau Contrat' }}
          </button>
        </div>

        <!-- Create Contract Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm && authService.isAdmin()" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} un Contrat</h2>
              </div>
          
          <form [formGroup]="contratForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group">
                <label for="idContrat">ID Contrat</label>
                <input type="text" id="idContrat" formControlName="idContrat" [class.error]="contratForm.get('idContrat')?.invalid && contratForm.get('idContrat')?.touched">
                <div class="error-message" *ngIf="contratForm.get('idContrat')?.invalid && contratForm.get('idContrat')?.touched">
                  L'ID du contrat est requis
                </div>
              </div>

              <div class="form-group">
                <label for="typeContrat">Type de Contrat</label>
                <input type="text" id="typeContrat" formControlName="typeContrat" [class.error]="contratForm.get('typeContrat')?.invalid && contratForm.get('typeContrat')?.touched">
                <div class="error-message" *ngIf="contratForm.get('typeContrat')?.invalid && contratForm.get('typeContrat')?.touched">
                  Le type de contrat est requis
                </div>
              </div>

              <div class="form-group">
                <label for="dateDebut">Date de Début</label>
                <input type="date" id="dateDebut" formControlName="dateDebut" [class.error]="contratForm.get('dateDebut')?.invalid && contratForm.get('dateDebut')?.touched">
                <div class="error-message" *ngIf="contratForm.get('dateDebut')?.invalid && contratForm.get('dateDebut')?.touched">
                  La date de début est requise
                </div>
              </div>

              <div class="form-group">
                <label for="dateFin">Date de Fin</label>
                <input type="date" id="dateFin" formControlName="dateFin" [class.error]="contratForm.get('dateFin')?.invalid && contratForm.get('dateFin')?.touched">
                <div class="error-message" *ngIf="contratForm.get('dateFin')?.invalid && contratForm.get('dateFin')?.touched">
                  La date de fin est requise
                </div>
              </div>

              <div class="form-group">
                <label for="nomPrestataire">Nom du Prestataire</label>
                <input type="text" id="nomPrestataire" formControlName="nomPrestataire" [class.error]="contratForm.get('nomPrestataire')?.invalid && contratForm.get('nomPrestataire')?.touched">
                <div class="error-message" *ngIf="contratForm.get('nomPrestataire')?.invalid && contratForm.get('nomPrestataire')?.touched">
                  Le nom du prestataire est requis
                </div>
              </div>

              <div class="form-group">
                <label for="montant">Montant (FCFA)</label>
                <input type="number" id="montant" formControlName="montant" min="0" step="0.01" [class.error]="contratForm.get('montant')?.invalid && contratForm.get('montant')?.touched">
                <div class="error-message" *ngIf="contratForm.get('montant')?.invalid && contratForm.get('montant')?.touched">
                  Le montant est requis
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="contratForm.invalid || loading">
                <span *ngIf="loading" class="loading"></span>
                {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>

        <!-- Contracts Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Contrats</h2>
            <div class="search-bar">
              <input type="text" placeholder="Rechercher..." [(ngModel)]="searchTerm" (input)="filterContrats()" class="search-input">
              <span class="search-icon">🔍</span>
            </div>
          </div>
          
          <div class="table-wrapper">
            <table *ngIf="filteredContrats.length > 0; else noData">
              <thead>
                <tr>
                  <th>ID Contrat</th>
                  <th>Type</th>
                  <th>Prestataire</th>
                  <th>Date Début</th>
                  <th>Date Fin</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let contrat of filteredContrats">
                  <td>{{ contrat.idContrat }}</td>
                  <td>{{ contrat.typeContrat }}</td>
                  <td>{{ contrat.nomPrestataire }}</td>
                  <td>{{ formatDate(contrat.dateDebut) }}</td>
                  <td>{{ formatDate(contrat.dateFin) }}</td>
                  <td>{{ (contrat.montant || 0) | number:'1.0-0' }} FCFA</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(contrat)">
                      {{ getStatusLabel(contrat) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-secondary btn-sm" (click)="editContrat(contrat)" *ngIf="authService.isAdmin()">Modifier</button>
                      <button class="btn btn-danger btn-sm" (click)="deleteContrat(contrat)" *ngIf="authService.isAdmin()">Supprimer</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucun contrat trouvé</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des contrats...
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
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 2rem;
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

    .btn-danger {
      background-color: #dc3545;
      color: white;
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

    .badge-error {
      background-color: #fecaca;
      color: #991b1b;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
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
  `]
})
export class ContratListComponent implements OnInit {
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  searchTerm = '';
  contratForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;

  constructor(
    private contratService: ContratService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.contratForm = this.formBuilder.group({
      idContrat: ['', Validators.required],
      typeContrat: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      nomPrestataire: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    this.loadContrats();
  }

  loadContrats(): void {
    this.loadingList = true;
    this.contratService.getAllContrats().subscribe({
      next: (contrats) => {
        this.contrats = contrats;
        this.filteredContrats = contrats;
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading contrats:', error);
        this.loadingList = false;
      }
    });
  }

  filterContrats(): void {
    if (!this.searchTerm.trim()) {
      this.filteredContrats = [...this.contrats];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredContrats = this.contrats.filter(contrat => 
        (contrat.idContrat || '').toLowerCase().includes(term) ||
        (contrat.nomPrestataire || '').toLowerCase().includes(term) ||
        (contrat.typeContrat || '').toLowerCase().includes(term)
      );
    }
  }

  async onSubmit(): Promise<void> {
    if (this.contratForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} ce contrat ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const contratData = this.contratForm.value;

        if (this.isEditing && this.editingId) {
          this.contratService.updateContrat(this.editingId, contratData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadContrats();
              this.toastService.show({ type: 'success', title: 'Contrat modifié', message: 'Le contrat a été modifié avec succès' });
            },
            error: (error) => {
              console.error('Error updating contrat:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
            }
          });
        } else {
          this.contratService.createContrat(contratData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadContrats();
              this.toastService.show({ type: 'success', title: 'Contrat créé', message: 'Le contrat a été créé avec succès' });
            },
            error: (error) => {
              console.error('Error creating contrat:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
            }
          });
        }
      }
    }
  }

  editContrat(contrat: Contrat): void {
    this.isEditing = true;
    this.editingId = contrat.id!;
    this.showCreateForm = true;
    
    this.contratForm.patchValue({
      idContrat: contrat.idContrat,
      typeContrat: contrat.typeContrat,
      dateDebut: contrat.dateDebut,
      dateFin: contrat.dateFin,
      nomPrestataire: contrat.nomPrestataire,
      montant: contrat.montant
    });
  }

  async deleteContrat(contrat: Contrat): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer le contrat',
      message: `Êtes-vous sûr de vouloir supprimer le contrat ${contrat.idContrat} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.contratService.deleteContrat(contrat.id!).subscribe({
        next: () => {
          this.loadContrats();
          this.toastService.show({ type: 'success', title: 'Contrat supprimé', message: 'Le contrat a été supprimé avec succès' });
        },
        error: (error) => {
          console.error('Error deleting contrat:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression du contrat' });
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.contratForm.reset();
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(contrat: Contrat): string {
    const today = new Date();
    const endDate = new Date(contrat.dateFin);
    
    if (endDate < today) {
      return 'badge-error';
    } else if (endDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
      return 'badge-warning';
    } else {
      return 'badge-success';
    }
  }

  getStatusLabel(contrat: Contrat): string {
    const today = new Date();
    const endDate = new Date(contrat.dateFin);
    
    if (endDate < today) {
      return 'Expiré';
    } else if (endDate.getTime() - today.getTime() < 30 * 24 * 60 * 60 * 1000) {
      return 'Expire bientôt';
    } else {
      return 'Actif';
    }
  }
}