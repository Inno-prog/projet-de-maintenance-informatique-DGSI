import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { OrdreCommande, RapportSuivi, StatutRapport } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-rapport-suivi-list',
  standalone: true,
  template: `
    <div class="container">
        <div class="page-header">
          <div>
            <h1>Rapports de Suivi</h1>
            <p>Gérez les rapports de suivi des prestations</p>
          </div>
          <button class="btn btn-primary" *ngIf="authService.isAgentDGSI()" (click)="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Annuler' : 'Nouveau Rapport' }}
          </button>
        </div>

        <!-- Create Rapport Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm && authService.isAgentDGSI()" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} un Rapport de Suivi</h2>
              </div>

              <form [formGroup]="rapportForm" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="ordreCommandeId">Ordre de Commande</label>
                    <select id="ordreCommandeId" formControlName="ordreCommandeId">
                      <option value="">Sélectionnez un ordre de commande</option>
                      <option *ngFor="let ordre of ordres" [value]="ordre.id">{{ ordre.idOC }} - {{ ordre.numeroOc || ordre.numeroCommande }}</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="dateRapport">Date du Rapport</label>
                    <input type="date" id="dateRapport" formControlName="dateRapport">
                  </div>

                  <div class="form-group">
                    <label for="trimestre">Trimestre</label>
                    <select id="trimestre" formControlName="trimestre">
                      <option value="">Sélectionnez un trimestre</option>
                      <option value="T1">T1</option>
                      <option value="T2">T2</option>
                      <option value="T3">T3</option>
                      <option value="T4">T4</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="prestataire">Prestataire</label>
                    <input type="text" id="prestataire" formControlName="prestataire" readonly>
                  </div>

                  <div class="form-group">
                    <label for="prestationsRealisees">Prestations Réalisées</label>
                    <input type="number" id="prestationsRealisees" formControlName="prestationsRealisees">
                  </div>

                  <div class="form-group">
                    <label for="observations">Observations</label>
                    <textarea id="observations" formControlName="observations" rows="3" placeholder="Observations sur les prestations"></textarea>
                  </div>

                  <div class="form-group">
                    <label for="statut">Statut</label>
                    <select id="statut" formControlName="statut">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="APPROUVE">Approuvé</option>
                      <option value="REJETE">Rejeté</option>
                    </select>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    <span *ngIf="loading" class="loading"></span>
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Rapports Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Rapports de Suivi</h2>
          </div>

          <div class="table-wrapper">
            <table *ngIf="rapports.length > 0; else noData">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ordre de Commande</th>
                  <th>Trimestre</th>
                  <th>Prestataire</th>
                  <th>Prestations Réalisées</th>
                  <th>Statut</th>
                  <th>Observations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let rapport of rapports">
                  <td>{{ rapport.dateRapport | date:'dd/MM/yyyy' }}</td>
                  <td>{{ rapport.ordreCommande?.idOC }} - {{ rapport.ordreCommande?.numeroOc || rapport.ordreCommande?.numeroCommande }}</td>
                  <td>{{ rapport.trimestre }}</td>
                  <td>{{ rapport.prestataire }}</td>
                  <td>{{ rapport.prestationsRealisees }}</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(rapport.statut!)">
                      {{ getStatusLabel(rapport.statut!) }}
                    </span>
                  </td>
                  <td>{{ rapport.observations || '-' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-secondary btn-sm" (click)="editRapport(rapport)" *ngIf="authService.isAgentDGSI()">
                        Modifier
                      </button>
                      <button class="btn btn-info btn-sm" (click)="viewRapport(rapport)">
                        Détails
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteRapport(rapport)" *ngIf="authService.isAgentDGSI()">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucun rapport de suivi trouvé</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des rapports de suivi...
        </div>
      </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
      gap: 2rem;
    }

    .page-header div {
      flex: 1;
    }

    .page-header h1 {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .page-header p {
      font-size: 1.125rem;
      color: var(--text-secondary);
      margin: 0;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }

    .table-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
    }

    .table-header h2 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
    }

    .table-wrapper {
      overflow-x: auto;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .btn-sm {
      padding: 0.375rem 0.75rem;
      font-size: 0.75rem;
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
      padding: 3rem;
      text-align: center;
      color: var(--text-secondary);
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: var(--text-secondary);
    }

    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class RapportSuiviListComponent implements OnInit {
  rapports: RapportSuivi[] = [];
  ordres: OrdreCommande[] = [];
  rapportForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;

  constructor(
    private ordreCommandeService: OrdreCommandeService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.rapportForm = this.formBuilder.group({
      ordreCommandeId: ['', Validators.required],
      dateRapport: ['', Validators.required],
      trimestre: ['', Validators.required],
      prestataire: [''],
      prestationsRealisees: [0, [Validators.required, Validators.min(0)]],
      observations: [''],
      statut: ['EN_ATTENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadRapports();
    this.loadOrdres();
  }

  loadRapports(): void {
    this.loadingList = true;
    // TODO: Implement rapport service
    // this.rapportService.getAllRapports().subscribe({
    //   next: (rapports) => {
    //     this.rapports = rapports;
    //     this.loadingList = false;
    //   },
    //   error: (error) => {
    //     console.error('Error loading rapports:', error);
    //     this.loadingList = false;
    //   }
    // });
    this.loadingList = false;
  }

  loadOrdres(): void {
    this.ordreCommandeService.getAllOrdresCommande().subscribe({
      next: (ordres) => {
        this.ordres = ordres;
      },
      error: (error) => {
        console.error('Error loading ordres:', error);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.rapportForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} ce rapport de suivi ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const rapportData = this.rapportForm.value;

        // TODO: Implement rapport service
        // if (this.isEditing && this.editingId) {
        //   this.rapportService.updateRapport(this.editingId, rapportData).subscribe({
        //     next: () => {
        //       this.loading = false;
        //       this.resetForm();
        //       this.loadRapports();
        //       this.toastService.show({ type: 'success', title: 'Rapport modifié', message: 'Le rapport de suivi a été modifié avec succès' });
        //     },
        //     error: (error) => {
        //       console.error('Error updating rapport:', error);
        //       this.loading = false;
        //       this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
        //     }
        //   });
        // } else {
        //   this.rapportService.createRapport(rapportData).subscribe({
        //     next: () => {
        //       this.loading = false;
        //       this.resetForm();
        //       this.loadRapports();
        //       this.toastService.show({ type: 'success', title: 'Rapport créé', message: 'Le rapport de suivi a été créé avec succès' });
        //     },
        //     error: (error) => {
        //       console.error('Error creating rapport:', error);
        //       this.loading = false;
        //       this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
        //     }
        //   });
        // }
      }
    }
  }

  editRapport(rapport: any): void {
    this.isEditing = true;
    this.editingId = rapport.id!;
    this.showCreateForm = true;

    this.rapportForm.patchValue({
      ordreCommandeId: rapport.ordreCommandeId,
      dateRapport: rapport.dateRapport,
      trimestre: rapport.trimestre,
      prestataire: rapport.prestataire,
      prestationsRealisees: rapport.prestationsRealisees,
      observations: rapport.observations,
      statut: rapport.statut
    });
  }

  async deleteRapport(rapport: any): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer le rapport',
      message: `Êtes-vous sûr de vouloir supprimer ce rapport du ${rapport.dateRapport} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      // TODO: Implement rapport service
      // this.rapportService.deleteRapport(rapport.id!).subscribe({
      //   next: () => {
      //     this.loadRapports();
      //     this.toastService.show({ type: 'success', title: 'Rapport supprimé', message: 'Le rapport de suivi a été supprimé avec succès' });
      //   },
      //   error: (error) => {
      //     console.error('Error deleting rapport:', error);
      //     this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression du rapport' });
      //   }
      // });
    }
  }

  viewRapport(rapport: any): void {
    // TODO: Implement rapport details view
    this.toastService.show({
      type: 'info',
      title: 'Détails du rapport',
      message: `Rapport du ${rapport.dateRapport} - ${rapport.prestataire}`
    });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.rapportForm.reset();
    this.rapportForm.patchValue({
      statut: 'EN_ATTENTE',
      prestationsRealisees: 0
    });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  getStatusBadgeClass(statut: StatutRapport): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'APPROUVE': 'badge-success',
      'REJETE': 'badge-error'
    };
    return statusClasses[statut] || 'badge-warning';
  }

  getStatusLabel(statut: StatutRapport): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'APPROUVE': 'Approuvé',
      'REJETE': 'Rejeté'
    };
    return statusLabels[statut] || statut;
  }
}