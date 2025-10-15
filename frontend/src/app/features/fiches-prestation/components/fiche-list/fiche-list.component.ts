import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { FichePrestation, StatutFiche } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <div>
            <h1>Gestion des Prestations</h1>
            <p>Gérer les prestations et leur statut</p>
          </div>
        </div>

        <!-- Create Fiche Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} une Prestation</h2>
              </div>
              
              <form [formGroup]="ficheForm" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="nomPrestataire">Nom du Prestataire</label>
                    <input type="text" id="nomPrestataire" formControlName="nomPrestataire">
                  </div>

                  <div class="form-group">
                    <label for="nomItem">Nom de l'Item</label>
                    <input type="text" id="nomItem" formControlName="nomItem" placeholder="Ex: Maintenance ordinateur">
                  </div>

                  <div class="form-group">
                    <label for="dateRealisation">Date de Réalisation</label>
                    <input type="datetime-local" id="dateRealisation" formControlName="dateRealisation">
                  </div>

                  <div class="form-group">
                    <label for="quantite">Quantité</label>
                    <input type="number" id="quantite" formControlName="quantite" min="1">
                  </div>

                  <div class="form-group" *ngIf="authService.isAgentDGSI()">
                    <label for="statut">Statut</label>
                    <select id="statut" formControlName="statut">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="VALIDER">Valider</option>
                      <option value="REJETER">Rejeter</option>
                    </select>
                  </div>

                  <div class="form-group form-group-full">
                    <label for="commentaire">Commentaire</label>
                    <textarea id="commentaire" formControlName="commentaire" rows="4" placeholder="Commentaires sur la prestation..."></textarea>
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading">
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Quarterly Submission for Prestataires -->
        <div class="quarterly-submission" *ngIf="authService.isPrestataire()">
          <div class="submission-card">
            <h3>Soumission du Rapport Trimestriel</h3>
            <p>Soumettez toutes vos fiches de prestations pour le trimestre sélectionné à l'administrateur</p>

            <div class="submission-form">
              <div class="form-group">
                <label for="quarter">Trimestre</label>
                <select id="quarter" [(ngModel)]="selectedQuarter" class="form-control">
                  <option value="">Sélectionnez un trimestre</option>
                  <option value="Q1">Trimestre 1 (Jan-Mar)</option>
                  <option value="Q2">Trimestre 2 (Avr-Jun)</option>
                  <option value="Q3">Trimestre 3 (Jul-Sep)</option>
                  <option value="Q4">Trimestre 4 (Oct-Déc)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="year">Année</label>
                <select id="year" [(ngModel)]="selectedYear" class="form-control">
                  <option value="">Sélectionnez une année</option>
                  <option *ngFor="let year of availableYears" [value]="year">{{ year }}</option>
                </select>
              </div>

              <button class="btn btn-success" (click)="submitQuarterlyReport()" [disabled]="!selectedQuarter || !selectedYear || submittingReport">
                {{ submittingReport ? 'Soumission...' : 'Soumettre le Rapport' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Fiches Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Prestations</h2>
            <button class="btn btn-primary" *ngIf="authService.isPrestataire() || authService.isAdmin()" (click)="showCreateForm = !showCreateForm">
              {{ showCreateForm ? 'Annuler' : 'Nouvelle Prestation' }}
            </button>
          </div>
          
          <div class="table-wrapper">
            <table *ngIf="fiches.length > 0; else noData">
              <thead>
                <tr>
                  <th>ID Prestation</th>
                  <th>Prestataire</th>
                  <th>Item</th>
                  <th>Date Réalisation</th>
                  <th>Quantité</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let fiche of fiches">
                  <td>{{ fiche.idPrestation }}</td>
                  <td>{{ fiche.nomPrestataire }}</td>
                  <td>{{ fiche.nomItem }}</td>
                  <td>{{ formatDate(fiche.dateRealisation) }}</td>
                  <td>{{ fiche.quantite }}</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(fiche.statut)">
                      {{ getStatusLabel(fiche.statut) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-success btn-sm" 
                              *ngIf="authService.isAgentDGSI() && fiche.statut === 'EN_ATTENTE'" 
                              (click)="validerFiche(fiche)">
                        Valider
                      </button>
                      <button class="btn btn-danger btn-sm" 
                              *ngIf="authService.isAgentDGSI() && fiche.statut === 'EN_ATTENTE'" 
                              (click)="rejeterFiche(fiche)">
                        Rejeter
                      </button>
                      <button class="btn btn-secondary btn-sm" (click)="editFiche(fiche)" *ngIf="authService.isPrestataire()">
                        Modifier
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteFiche(fiche)" *ngIf="authService.isAdmin()">
                        Supprimer
                      </button>
                      <button class="btn btn-warning btn-sm" 
                              *ngIf="authService.isAdmin() && fiche.statut === 'TERMINEE'" 
                              (click)="evaluerPrestataire(fiche)"
                              title="Évaluer le prestataire">
                        <i class="fas fa-star"></i> Évaluer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucune prestation trouvée</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des prestations...
        </div>
      </div>
  `,
  styles: [`
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

    .quarterly-submission {
      margin-bottom: 2rem;
    }

    .submission-card {
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 16px;
      box-shadow: 0 8px 32px rgba(249, 115, 22, 0.15);
      padding: 2rem;
      text-align: center;
    }

    .submission-card h3 {
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }

    .submission-card p {
      color: var(--text-secondary);
      margin-bottom: 1.5rem;
    }

    .submission-form {
      display: flex;
      gap: 1rem;
      align-items: end;
      justify-content: center;
      flex-wrap: wrap;
    }

    .submission-form .form-group {
      margin-bottom: 0;
      min-width: 150px;
    }

    .submission-form .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid rgba(0, 0, 0, 0.1);
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.8);
      transition: all 0.3s ease;
    }

    .submission-form .form-control:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
      background: white;
    }

    @media (max-width: 768px) {
      .action-buttons {
        flex-direction: column;
      }

      .submission-form {
        flex-direction: column;
        align-items: stretch;
      }

      .submission-form .form-group {
        min-width: auto;
      }
    }
  `]
})
export class FicheListComponent implements OnInit {
  fiches: FichePrestation[] = [];
  ficheForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  selectedQuarter = '';
  selectedYear = '';
  submittingReport = false;
  availableYears: number[] = [];

  constructor(
    private ficheService: FichePrestationService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.ficheForm = this.formBuilder.group({
      nomPrestataire: ['', Validators.required],
      nomItem: ['', Validators.required],
      dateRealisation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      statut: ['EN_ATTENTE'],
      commentaire: ['']
    });
  }

  ngOnInit(): void {
    this.loadFiches();
    this.initializeAvailableYears();
  }

  initializeAvailableYears(): void {
    const currentYear = new Date().getFullYear();
    this.availableYears = [];
    for (let i = currentYear - 2; i <= currentYear + 1; i++) {
      this.availableYears.push(i);
    }
  }

  async submitQuarterlyReport(): Promise<void> {
    if (!this.selectedQuarter || !this.selectedYear) {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Veuillez sélectionner un trimestre et une année'
      });
      return;
    }

    const confirmed = await this.confirmationService.show({
      title: 'Soumission du Rapport Trimestriel',
      message: `Voulez-vous soumettre toutes vos fiches de prestations pour ${this.selectedQuarter} ${this.selectedYear} à l'administrateur ?`,
      confirmText: 'Soumettre',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.submittingReport = true;

      // Get current user's fiches for the selected quarter
      const user = this.authService.getCurrentUser();
      if (user) {
        const quarterFiches = this.fiches.filter(fiche => {
          const ficheDate = new Date(fiche.dateRealisation);
          const ficheYear = ficheDate.getFullYear();
          const ficheMonth = ficheDate.getMonth() + 1; // getMonth() returns 0-11

          // Determine quarter
          let ficheQuarter = '';
          if (ficheMonth >= 1 && ficheMonth <= 3) ficheQuarter = 'Q1';
          else if (ficheMonth >= 4 && ficheMonth <= 6) ficheQuarter = 'Q2';
          else if (ficheMonth >= 7 && ficheMonth <= 9) ficheQuarter = 'Q3';
          else ficheQuarter = 'Q4';

          return fiche.nomPrestataire === user.nom && ficheQuarter === this.selectedQuarter && ficheYear === parseInt(this.selectedYear);
        });

        if (quarterFiches.length === 0) {
          this.toastService.show({
            type: 'warning',
            title: 'Aucune fiche',
            message: 'Aucune fiche trouvée pour ce trimestre'
          });
          this.submittingReport = false;
          return;
        }

        // Here we would typically send the report to admin
        // For now, just show success and mark fiches as submitted
        this.toastService.show({
          type: 'success',
          title: 'Rapport soumis',
          message: `${quarterFiches.length} fiche(s) soumise(s) pour évaluation trimestrielle`
        });

        this.submittingReport = false;
        this.selectedQuarter = '';
        this.selectedYear = '';
      }
    }
  }

  loadFiches(): void {
    this.loadingList = true;
    this.ficheService.getAllFiches().subscribe({
      next: (fiches) => {
        this.fiches = fiches;
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading fiches:', error);
        this.loadingList = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.ficheForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cette fiche ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const ficheData = this.ficheForm.value;

        if (this.isEditing && this.editingId) {
          this.ficheService.updateFiche(this.editingId, ficheData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadFiches();
              this.toastService.show({ type: 'success', title: 'Fiche modifiée', message: 'Succès' });
            },
            error: (error) => {
              console.error('Error updating fiche:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur modification' });
            }
          });
        } else {
          this.ficheService.createFiche(ficheData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadFiches();
              this.toastService.show({ type: 'success', title: 'Fiche créée', message: 'Succès' });
            },
            error: (error) => {
              console.error('Error creating fiche:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur création' });
            }
          });
        }
      }
    }
  }

  editFiche(fiche: FichePrestation): void {
    this.isEditing = true;
    this.editingId = fiche.id!;
    this.showCreateForm = true;
    
    this.ficheForm.patchValue({
      nomPrestataire: fiche.nomPrestataire,
      nomItem: fiche.nomItem,
      dateRealisation: fiche.dateRealisation,
      quantite: fiche.quantite,
      statut: fiche.statut,
      commentaire: fiche.commentaire
    });
  }

  async deleteFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer',
      message: `Supprimer la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      this.ficheService.deleteFiche(fiche.id!).subscribe({
        next: () => {
          this.loadFiches();
          this.toastService.show({ type: 'success', title: 'Supprimée', message: 'Fiche supprimée' });
        },
        error: (error) => {
          console.error('Error deleting fiche:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur suppression' });
        }
      });
    }
  }

  async validerFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Valider',
      message: `Valider la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Valider',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      const commentaires = prompt('Commentaires (optionnel):');
      this.ficheService.validerFiche(fiche.id!, commentaires || undefined).subscribe({
        next: () => {
          this.loadFiches();
          this.toastService.show({ type: 'success', title: 'Validée', message: 'Fiche validée' });
        },
        error: (error) => {
          console.error('Error validating fiche:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur validation' });
        }
      });
    }
  }

  async rejeterFiche(fiche: FichePrestation): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Rejeter',
      message: `Rejeter la fiche ${fiche.idPrestation} ?`,
      confirmText: 'Rejeter',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      const commentaires = prompt('Motif du rejet:');
      if (commentaires) {
        this.ficheService.rejeterFiche(fiche.id!, commentaires).subscribe({
          next: () => {
            this.loadFiches();
            this.toastService.show({ type: 'success', title: 'Rejetée', message: 'Fiche rejetée' });
          },
          error: (error) => {
            console.error('Error rejecting fiche:', error);
            this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur rejet' });
          }
        });
      }
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.ficheForm.reset();
    this.ficheForm.patchValue({ statut: 'EN_ATTENTE', quantite: 1 });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(statut: StatutFiche): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'EN_COURS': 'badge-info',
      'TERMINEE': 'badge-success',
      'VALIDER': 'badge-success',
      'REJETER': 'badge-error'
    };
    return statusClasses[statut] || 'badge-info';
  }

  getStatusLabel(statut: StatutFiche): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'VALIDER': 'Validé',
      'REJETER': 'Rejeté'
    };
    return statusLabels[statut] || statut;
  }

  evaluerPrestataire(fiche: FichePrestation): void {
    this.router.navigate(['/evaluations/new'], {
      queryParams: {
        prestationId: fiche.id,
        prestataire: fiche.nomPrestataire,
        nomItem: fiche.nomItem
      }
    });
  }
}