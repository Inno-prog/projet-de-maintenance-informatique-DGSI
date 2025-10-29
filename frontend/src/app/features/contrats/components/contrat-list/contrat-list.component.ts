import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ContratService } from '../../../../core/services/contrat.service';
import { Contrat, StatutContrat } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { UserService } from '../../../../core/services/user.service';

@Component({
  selector: 'app-contrat-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>Gestion des Contrats</h1>
          <button class="btn btn-primary" *ngIf="authService.isAdmin()" (click)="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Annuler' : 'Nouveau Contrat' }}
          </button>
        </div>

        <!-- Create Contract Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm && authService.isAdmin()" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <form [formGroup]="contratForm" (ngSubmit)="onSubmit()" class="contrat-form">
            <h2 class="form-title">{{ isEditing ? 'Modifier' : 'Créer' }} un Contrat</h2>
            
            <div class="form-group">
              <label for="numeroContrat">Numéro de Contrat</label>
              <input
                type="number"
                id="numeroContrat"
                formControlName="numeroContrat"
                placeholder="Entrez le numéro du contrat"
                class="line-input"
                [class.error]="contratForm.get('numeroContrat')?.invalid && contratForm.get('numeroContrat')?.touched"
              />
              <div class="input-line" [class.error]="contratForm.get('numeroContrat')?.invalid && contratForm.get('numeroContrat')?.touched"></div>
              <div class="error-message" *ngIf="contratForm.get('numeroContrat')?.invalid && contratForm.get('numeroContrat')?.touched">
                Le numéro du contrat est requis
              </div>
            </div>

            <div class="form-group">
              <label for="nomPrestataire">Prestataire</label>
              <select
                id="nomPrestataire"
                formControlName="nomPrestataire"
                class="line-input"
                [class.error]="contratForm.get('nomPrestataire')?.invalid && contratForm.get('nomPrestataire')?.touched"
              >
                <option value="">Sélectionnez un prestataire</option>
                <option *ngFor="let prestataire of prestataires" [value]="prestataire.nom">{{ prestataire.nom }}</option>
              </select>
              <div class="input-line" [class.error]="contratForm.get('nomPrestataire')?.invalid && contratForm.get('nomPrestataire')?.touched"></div>
              <div class="error-message" *ngIf="contratForm.get('nomPrestataire')?.invalid && contratForm.get('nomPrestataire')?.touched">
                Le prestataire est requis
              </div>
            </div>

            <div class="form-group">
              <label for="dateDebut">Date de Début</label>
              <input
                type="date"
                id="dateDebut"
                formControlName="dateDebut"
                class="line-input"
                [class.error]="contratForm.get('dateDebut')?.invalid && contratForm.get('dateDebut')?.touched"
              />
              <div class="input-line" [class.error]="contratForm.get('dateDebut')?.invalid && contratForm.get('dateDebut')?.touched"></div>
              <div class="error-message" *ngIf="contratForm.get('dateDebut')?.invalid && contratForm.get('dateDebut')?.touched">
                La date de début est requise
              </div>
            </div>

            <div class="form-group">
              <label for="dateFin">Date de Fin</label>
              <input
                type="date"
                id="dateFin"
                formControlName="dateFin"
                class="line-input"
                [class.error]="contratForm.get('dateFin')?.invalid && contratForm.get('dateFin')?.touched"
              />
              <div class="input-line" [class.error]="contratForm.get('dateFin')?.invalid && contratForm.get('dateFin')?.touched"></div>
              <div class="error-message" *ngIf="contratForm.get('dateFin')?.invalid && contratForm.get('dateFin')?.touched">
                La date de fin est requise
              </div>
            </div>

            <div class="form-group">
              <label for="montant">Montant (FCFA)</label>
              <input
                type="number"
                id="montant"
                formControlName="montant"
                placeholder="0"
                min="0"
                step="0.01"
                class="line-input"
                [class.error]="contratForm.get('montant')?.invalid && contratForm.get('montant')?.touched"
              />
              <div class="input-line" [class.error]="contratForm.get('montant')?.invalid && contratForm.get('montant')?.touched"></div>
              <div class="error-message" *ngIf="contratForm.get('montant')?.invalid && contratForm.get('montant')?.touched">
                Le montant est requis
              </div>
            </div>

            <div class="form-group">
              <label for="statut">Statut</label>
              <select
                id="statut"
                formControlName="statut"
                class="line-input"
                [class.error]="contratForm.get('statut')?.invalid && contratForm.get('statut')?.touched"
              >
                <option *ngFor="let statut of statutOptions" [value]="statut">{{ getStatutLabel(statut) }}</option>
              </select>
              <div class="input-line" [class.error]="contratForm.get('statut')?.invalid && contratForm.get('statut')?.touched"></div>
              <div class="error-message" *ngIf="contratForm.get('statut')?.invalid && contratForm.get('statut')?.touched">
                Le statut est requis
              </div>
            </div>

            <!-- Actions -->
            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancelEdit()">
                Annuler
              </button>
              <button type="submit" class="btn btn-primary" [disabled]="contratForm.invalid || loading">
                {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
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
                  <th>Numéro Contrat</th>
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
                  <td>{{ contrat.nomPrestataire }}</td>
                  <td>{{ formatDate(contrat.dateDebut) }}</td>
                  <td>{{ formatDate(contrat.dateFin) }}</td>
                  <td>{{ (contrat.montant || 0) | number:'1.0-0' }} FCFA</td>
                  <td>
                    <select class="status-select" [value]="contrat.statut" (change)="changeStatut(contrat, $event)" *ngIf="authService.isAdmin()" [style.background-color]="getStatusColor(contrat.statut)">
                      <option *ngFor="let statut of statutOptions" [value]="statut">{{ getStatutLabel(statut) }}</option>
                    </select>
                    <span *ngIf="!authService.isAdmin()" class="badge" [class]="getStatusBadgeClass(contrat)">
                      {{ getStatusLabel(contrat) }}
                    </span>
                  </td>
                  <td>
                    <button class="edit-btn" (click)="editContrat(contrat)" *ngIf="authService.isAdmin()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
                    <button class="delete-btn" (click)="deleteContrat(contrat)" *ngIf="authService.isAdmin()">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6h18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M10 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M14 11v6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </button>
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
      align-items: center;
      margin-bottom: 2rem;
    }

    .page-header h1 {
      font-size: 24px;
      font-weight: 600;
      color: #333;
      margin: 0;
    }

    /* Modal Styles */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border: 1px solid #1e293b;
      border-radius: 8px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 450px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-modal {
      padding: 0;
    }

    .contrat-form {
      padding: 30px;
    }

    .form-title {
      font-size: 22px;
      font-weight: 700;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 600;
      color: #555;
      margin-bottom: 8px;
    }

    .line-input {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      font-size: 16px;
      background: transparent;
      outline: none;
      color: #333;
    }

    .line-input::placeholder {
      color: #999;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .line-input:focus + .input-line {
      background: #007bff;
      height: 2px;
    }

    .line-input.error + .input-line,
    .input-line.error {
      background: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    /* Boutons EXACTEMENT comme l'image */
    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn-primary {
      background: #1e293b;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #334155;
    }

    .btn-primary:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover {
      background: #f5f5f5;
    }

    /* Style pour le select */
    select.line-input {
      appearance: none;
      background: transparent;
      cursor: pointer;
    }

    .form-group:has(select)::after {
      content: '▼';
      position: absolute;
      right: 0;
      bottom: 12px;
      font-size: 12px;
      color: #666;
      pointer-events: none;
    }

    /* Table Styles (conservés) */
    .table-container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
      overflow-x: auto;
      width: 100%;
      padding: 1rem;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.75rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
    }

    th {
      background-color: #f9fafb;
      font-weight: 600;
      color: #374151;
      font-size: 0.875rem;
    }

    td {
      color: #6b7280;
      font-size: 0.875rem;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .table-header h2 {
      margin: 0;
      color: #111827;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .search-bar {
      position: relative;
    }

    .search-input {
      padding: 0.5rem 1rem 0.5rem 2.5rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      width: 250px;
    }

    .search-icon {
      position: absolute;
      left: 0.75rem;
      color: #6b7280;
    }

    .status-select {
      padding: 0.375rem 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 0.875rem;
      min-width: 120px;
    }

    .edit-btn, .delete-btn {
      background: none;
      border: 1px solid #d1d5db;
      border-radius: 4px;
      cursor: pointer;
      padding: 0.5rem;
      color: #6b7280;
      margin-right: 0.5rem;
    }

    .badge {
      display: inline-flex;
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 12px;
    }

    .badge-actif {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-suspendu {
      background-color: #fecaca;
      color: #991b1b;
    }

    .badge-termine {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-expire {
      background-color: #f3f4f6;
      color: #374151;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #6b7280;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .table-header {
        flex-direction: column;
        gap: 1rem;
      }
      
      .search-input {
        width: 100%;
      }
      
      .form-actions {
        flex-direction: column;
      }
      
      .btn {
        width: 100%;
      }
    }
  `]
})
export class ContratListComponent implements OnInit {
  contrats: Contrat[] = [];
  filteredContrats: Contrat[] = [];
  prestataires: any[] = [];
  searchTerm = '';
  contratForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  statutOptions = Object.values(StatutContrat);

  constructor(
    private contratService: ContratService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private userService: UserService
  ) {
    this.contratForm = this.formBuilder.group({
      numeroContrat: ['', Validators.required],
      nomPrestataire: ['', Validators.required],
      dateDebut: ['', Validators.required],
      dateFin: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
      statut: [StatutContrat.ACTIF, Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadContrats();
    this.loadPrestataires();
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

  loadPrestataires(): void {
    this.userService.getAllUsers().subscribe({
      next: (users: any[]) => {
        // Filter only users with role PRESTATAIRE
        this.prestataires = users.filter(user => user.role === 'PRESTATAIRE');
      },
      error: (error: any) => {
        console.error('Error loading prestataires:', error);
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
        contratData.idContrat = contratData.numeroContrat;
        contratData.typeContrat = 'Maintenance';

        if (this.isEditing && this.editingId) {
          this.contratService.updateContrat(this.editingId, contratData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadContrats();
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
      numeroContrat: contrat.idContrat,
      nomPrestataire: contrat.nomPrestataire,
      dateDebut: contrat.dateDebut,
      dateFin: contrat.dateFin,
      montant: contrat.montant,
      statut: contrat.statut
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
    switch (contrat.statut) {
      case StatutContrat.ACTIF:
        return 'badge-actif';
      case StatutContrat.SUSPENDU:
        return 'badge-suspendu';
      case StatutContrat.TERMINE:
        return 'badge-termine';
      case StatutContrat.EXPIRE:
        return 'badge-expire';
      default:
        return 'badge-default';
    }
  }

  getStatusLabel(contrat: Contrat): string {
    if (contrat.statut) {
      return this.getStatutLabel(contrat.statut);
    }
    return 'Inconnu';
  }

  getStatutLabel(statut: StatutContrat): string {
    switch (statut) {
      case StatutContrat.ACTIF: return 'Actif';
      case StatutContrat.SUSPENDU: return 'Suspendu';
      case StatutContrat.TERMINE: return 'Terminé';
      case StatutContrat.EXPIRE: return 'Expiré';
      default: return statut;
    }
  }

  async changeStatut(contrat: Contrat, event: any): Promise<void> {
    const newStatut = event.target.value as StatutContrat;

    const confirmed = await this.confirmationService.show({
      title: 'Changer le statut',
      message: `Voulez-vous vraiment changer le statut du contrat ${contrat.idContrat} à "${this.getStatutLabel(newStatut)}" ?`,
      confirmText: 'Confirmer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.contratService.updateContratStatut(contrat.id!, newStatut).subscribe({
        next: (updatedContrat) => {
          contrat.statut = updatedContrat.statut;
          this.toastService.show({ type: 'success', title: 'Succès', message: 'Statut mis à jour avec succès' });
        },
        error: (error) => {
          console.error('Error updating statut:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la mise à jour du statut' });
        }
      });
    } else {
      event.target.value = contrat.statut;
    }
  }

  getStatusColor(statut: StatutContrat): string {
    switch (statut) {
      case StatutContrat.ACTIF: return '#dcfce7';
      case StatutContrat.SUSPENDU: return '#fecaca';
      case StatutContrat.TERMINE: return '#fef3c7';
      case StatutContrat.EXPIRE: return '#f3f4f6';
      default: return '#e5e7eb';
    }
  }
}