import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommande, StatutCommande, Contrat } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-ordre-commande-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container">
        <div class="page-header">
          <div>
            <h1>Ordres de Commande</h1>
            <p>Gérez les ordres de commande et leur statut</p>
          </div>
          <button class="btn btn-primary" *ngIf="authService.isAdmin()" (click)="showCreateForm = !showCreateForm">
            {{ showCreateForm ? 'Annuler' : 'Nouvel Ordre' }}
          </button>
        </div>

        <!-- Create Order Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm && authService.isAdmin()" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} un Ordre de Commande</h2>
              </div>
          
          <form [formGroup]="ordreForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <div class="form-group">
                <label for="numeroCommande">Numéro d'Ordre de Commande</label>
                <input type="text" id="numeroCommande" formControlName="numeroCommande">
              </div>

              <div class="form-group">
                <label for="nomItem">Nom de l'Item</label>
                <input type="text" id="nomItem" formControlName="nomItem" placeholder="Ex: Installation et réinstallation de SE">
              </div>

              <div class="form-group">
                <label for="minArticles">Min Articles à Utiliser</label>
                <input type="number" id="minArticles" formControlName="minArticles">
              </div>

              <div class="form-group">
                <label for="maxArticles">Max Articles à Utiliser</label>
                <input type="number" id="maxArticles" formControlName="maxArticles">
              </div>

              <div class="form-group">
                <label for="nombreArticlesUtilise">Nombre d'Articles Utilisés</label>
                <input type="number" id="nombreArticlesUtilise" formControlName="nombreArticlesUtilise" (input)="calculateEcart()">
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
                <label for="prestataireItem">Prestataire de l'Item</label>
                <input type="text" id="prestataireItem" formControlName="prestataireItem">
              </div>

              <div class="form-group">
                <label for="montant">Montant</label>
                <input type="number" id="montant" formControlName="montant" step="0.01">
              </div>

              <div class="form-group">
                <label for="statut">Statut</label>
                <select id="statut" formControlName="statut">
                  <option value="EN_ATTENTE">En attente</option>
                  <option value="APPROUVE">Approuvé</option>
                  <option value="NON_APPROUVE">Non Approuvé</option>
                  <option value="REJETE">Rejeté</option>
                  <option value="EN_COURS">En cours</option>
                  <option value="TERMINE">Terminé</option>
                </select>
              </div>

              <div class="form-group form-group-full">
                <label for="description">Description</label>
                <textarea id="description" formControlName="description" rows="3" placeholder="Description de l'ordre de commande"></textarea>
              </div>
            </div>

            <div class="form-actions">
              <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
              <button type="submit" class="btn btn-primary" [disabled]="loading" (click)="onSubmit()">
                <span *ngIf="loading" class="loading"></span>
                {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
              </button>
            </div>
          </form>
            </div>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Ordres de Commande</h2>
          </div>
          
          <div class="table-wrapper">
            <table *ngIf="ordres.length > 0; else noData">
              <thead>
                <tr>
                  <th>Numéro</th>
                  <th>Item</th>
                  <th>Min/Max Articles</th>
                  <th>Articles Utilisés</th>
                  <th>Écart</th>
                  <th>Trimestre</th>
                  <th>Prestataire</th>
                  <th>Montant</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ordre of ordres">
                  <td>{{ ordre.numeroCommande }}</td>
                  <td>{{ ordre.nomItem || '-' }}</td>
                  <td>{{ ordre.minArticles || 0 }} / {{ ordre.maxArticles || 0 }}</td>
                  <td>{{ ordre.nombreArticlesUtilise || 0 }}</td>
                  <td>{{ ordre.ecartArticles || 0 }}</td>
                  <td>{{ ordre.trimestre || '-' }}</td>
                  <td>{{ ordre.prestataireItem || '-' }}</td>
                  <td>{{ (ordre.montant || 0) | number:'1.0-0' }} FCFA</td>
                  <td>
                    <span class="badge" [class]="getStatusBadgeClass(ordre.statut!)">
                      {{ getStatusLabel(ordre.statut!) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn btn-success btn-sm" 
                              *ngIf="ordre.statut === 'EN_ATTENTE'" 
                              (click)="approuverOrdre(ordre)">
                        Approuver
                      </button>
                      <button class="btn btn-danger btn-sm" 
                              *ngIf="ordre.statut === 'EN_ATTENTE'" 
                              (click)="rejeterOrdre(ordre)">
                        Rejeter
                      </button>
                      <button class="btn btn-secondary btn-sm" (click)="editOrdre(ordre)" *ngIf="authService.isAdmin()">
                        Modifier
                      </button>
                      <button class="btn btn-danger btn-sm" (click)="deleteOrdre(ordre)" *ngIf="authService.isAdmin()">
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="no-data">
                <p>Aucun ordre de commande trouvé</p>
              </div>
            </ng-template>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des ordres de commande...
        </div>
      </div>
    </app-layout>
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

    .form-group-full {
      grid-column: 1 / -1;
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

    .badge-warning {
      background-color: #fef3c7;
      color: #92400e;
    }

    .badge-success {
      background-color: #dcfce7;
      color: #166534;
    }

    .badge-error {
      background-color: #fecaca;
      color: #991b1b;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
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
export class OrdreCommandeListComponent implements OnInit {
  ordres: OrdreCommande[] = [];
  contrats: Contrat[] = [];
  ordreForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;

  constructor(
    private ordreCommandeService: OrdreCommandeService,
    private contratService: ContratService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.ordreForm = this.formBuilder.group({
      numeroCommande: ['', Validators.required],
      nomItem: ['', Validators.required],
      minArticles: [0, [Validators.required, Validators.min(0)]],
      maxArticles: [0, [Validators.required, Validators.min(0)]],
      nombreArticlesUtilise: [0, [Validators.required, Validators.min(0)]],
      trimestre: ['', Validators.required],
      prestataireItem: ['', Validators.required],
      montant: [0, [Validators.required, Validators.min(0)]],
      description: [''],
      statut: ['EN_ATTENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadOrdres();
    if (this.authService.isAdmin()) {
      this.loadContrats();
    }
  }

  loadOrdres(): void {
    this.loadingList = true;
    this.ordreCommandeService.getAllOrdresCommande().subscribe({
      next: (ordres) => {
        this.ordres = ordres;
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading ordres:', error);
        this.loadingList = false;
      }
    });
  }

  loadContrats(): void {
    this.contratService.getAllContrats().subscribe({
      next: (contrats) => {
        this.contrats = contrats;
      },
      error: (error) => {
        console.error('Error loading contrats:', error);
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.ordreForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cet ordre de commande ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const ordreData = this.ordreForm.value;

        if (this.isEditing && this.editingId) {
          this.ordreCommandeService.updateOrdreCommande(this.editingId, ordreData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadOrdres();
              this.toastService.show({ type: 'success', title: 'Ordre modifié', message: 'L\'ordre de commande a été modifié avec succès' });
            },
            error: (error) => {
              console.error('Error updating ordre:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
            }
          });
        } else {
          this.ordreCommandeService.createOrdreCommande(ordreData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadOrdres();
              this.toastService.show({ type: 'success', title: 'Ordre créé', message: 'L\'ordre de commande a été créé avec succès' });
            },
            error: (error) => {
              console.error('Error creating ordre:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
            }
          });
        }
      }
    }
  }

  editOrdre(ordre: OrdreCommande): void {
    this.isEditing = true;
    this.editingId = ordre.id!;
    this.showCreateForm = true;
    
    this.ordreForm.patchValue({
      numeroCommande: ordre.numeroCommande,
      nomItem: ordre.nomItem,
      minArticles: ordre.minArticles,
      maxArticles: ordre.maxArticles,
      nombreArticlesUtilise: ordre.nombreArticlesUtilise,
      trimestre: ordre.trimestre,
      prestataireItem: ordre.prestataireItem,
      montant: ordre.montant,
      description: ordre.description,
      statut: ordre.statut
    });
  }

  async deleteOrdre(ordre: OrdreCommande): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'ordre',
      message: `Êtes-vous sûr de vouloir supprimer l'ordre ${ordre.numeroCommande} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.ordreCommandeService.deleteOrdreCommande(ordre.id!).subscribe({
        next: () => {
          this.loadOrdres();
          this.toastService.show({ type: 'success', title: 'Ordre supprimé', message: 'L\'ordre de commande a été supprimé avec succès' });
        },
        error: (error) => {
          console.error('Error deleting ordre:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de l\'ordre' });
        }
      });
    }
  }

  async approuverOrdre(ordre: OrdreCommande): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Approuver l\'ordre',
      message: `Voulez-vous approuver l'ordre ${ordre.numeroCommande} ?`,
      confirmText: 'Approuver',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.ordreCommandeService.approuverOrdre(ordre.id!).subscribe({
        next: () => {
          this.loadOrdres();
          this.toastService.show({ type: 'success', title: 'Ordre approuvé', message: 'L\'ordre de commande a été approuvé avec succès' });
        },
        error: (error) => {
          console.error('Error approving ordre:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de l\'approbation' });
        }
      });
    }
  }

  async rejeterOrdre(ordre: OrdreCommande): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Rejeter l\'ordre',
      message: `Êtes-vous sûr de vouloir rejeter l'ordre ${ordre.numeroCommande} ?`,
      confirmText: 'Rejeter',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.ordreCommandeService.rejeterOrdre(ordre.id!).subscribe({
        next: () => {
          this.loadOrdres();
          this.toastService.show({ type: 'success', title: 'Ordre rejeté', message: 'L\'ordre de commande a été rejeté' });
        },
        error: (error) => {
          console.error('Error rejecting ordre:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du rejet' });
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.ordreForm.reset();
    this.ordreForm.patchValue({ 
      statut: 'EN_ATTENTE',
      minArticles: 0,
      maxArticles: 0,
      nombreArticlesUtilise: 0,
      montant: 0
    });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }
  
  calculateEcart(): void {
    const maxArticles = this.ordreForm.get('maxArticles')?.value || 0;
    const nombreUtilise = this.ordreForm.get('nombreArticlesUtilise')?.value || 0;
    const ecart = maxArticles - nombreUtilise;
    
    // L'écart sera calculé automatiquement côté backend
    console.log('Écart calculé:', ecart);
  }

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(statut: StatutCommande): string {
    const statusClasses: { [key: string]: string } = {
      'EN_ATTENTE': 'badge-warning',
      'APPROUVE': 'badge-success',
      'REJETE': 'badge-error',
      'EN_COURS': 'badge-info',
      'TERMINE': 'badge-success',
      'NON_APPROUVE': 'badge-error'
    };
    return statusClasses[statut] || 'badge-info';
  }

  getStatusLabel(statut: StatutCommande): string {
    const statusLabels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'APPROUVE': 'Approuvé',
      'NON_APPROUVE': 'Non Approuvé',
      'REJETE': 'Rejeté',
      'EN_COURS': 'En cours',
      'TERMINE': 'Terminé'
    };
    return statusLabels[statut] || statut;
  }
}