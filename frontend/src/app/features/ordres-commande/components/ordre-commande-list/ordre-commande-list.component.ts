import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { OrdreCommande, StatutCommande, Contrat, calculer_ecart_item, calcul_montantTotal, calcul_penalite } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-ordre-commande-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
        <!-- Header Section -->
        <div class="prestation-header">
          <div class="header-content">
            <h1>Ordres de Commande</h1>
            <p>Gérez et suivez les ordres de commande de vos prestataires</p>
          </div>
          <div class="header-actions">
            <div *ngIf="authService.isAdmin()">
              <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
                {{ showCreateForm ? 'Annuler' : (isEditing ? 'Modifier' : 'Nouvel Ordre') }}
              </button>
            </div>
            <button class="btn btn-outline" (click)="loadOrdres()">🔄 Actualiser</button>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-content">
              <div class="stat-number">{{ ordres.length }}</div>
              <div class="stat-label">Total Ordres</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ approuveCount }}</div>
              <div class="stat-label">Approuvés</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{{ enAttenteCount }}</div>
              <div class="stat-label">En Attente</div>
            </div>
          </div>
        </div>

        <!-- Orders Table -->
        <div class="table-container">
          <div class="table-header"><h3>Liste des Ordres de Commande</h3></div>
          <div class="table-responsive">
            <table class="prestation-table" *ngIf="ordres.length > 0; else noData">
              <thead>
                <tr>
                  <th>Num OC</th>
                  <th>Item</th>
                  <th>Prestataire</th>
                  <th>Min / Max</th>
                  <th>Prix unitaire</th>
                  <th>Montant OC</th>
                  <th>Observations</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let ordre of ordres" [ngClass]="getRowClass(ordre.statut)" (click)="openDetails(ordre)" tabindex="0">
                  <td data-label="Num OC">{{ ordre.numeroOC || ordre.numeroCommande || '-' }}</td>
                  <td data-label="Item"><strong>{{ ordre.item?.nomItem || ordre.nomItem || '-' }}</strong></td>
                  <td data-label="Prestataire">{{ ordre.prestataireItem || (ordre.fichePrestations && ordre.fichePrestations.length ? ordre.fichePrestations[0].nomPrestataire : null) || '-' }}</td>
                  <td data-label="Min/Max">{{ ordre.min_prestations ?? ordre.minArticles ?? 0 }} / {{ ordre.max_prestations ?? ordre.maxArticles ?? 0 }}</td>
                  <td data-label="Prix unitaire">{{ (ordre.prixUnitPrest || ordre.item?.prix || ordre.montant || 0) | number:'1.0-0' }} FCFA</td>
                  <td data-label="Montant OC" class="montant-cell">{{ (ordre.montantOC ?? ordre.montant ?? calcul_montantTotal(ordre)) | number:'1.0-0' }} FCFA</td>
                  <td data-label="Observations">{{ ordre.observations || ordre.description || '-' }}</td>
                  <td data-label="Statut" class="text-center">
                    <div>{{ getStatusLabel(ordre.statut) }}</div>
                    <div class="penalite" *ngIf="ordre.penalites">Pénalités: {{ ordre.penalites | number:'1.0-0' }} FCFA</div>
                  </td>
                  <td class="actions-cell">
                      <div class="action-buttons">
                        <button class="btn btn-sm btn-outline" (click)="$event.stopPropagation(); editOrdre(ordre)" *ngIf="authService.isAdmin()">✏️</button>
                        <button class="btn btn-sm btn-danger" (click)="$event.stopPropagation(); deleteOrdre(ordre)" *ngIf="authService.isAdmin()">🗑️</button>
                      </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <ng-template #noData>
              <div class="empty-state">
                <div class="empty-icon">📦</div>
                <h3>Aucun ordre de commande trouvé</h3>
                <p>Appuyez sur Actualiser pour réessayer ou créez un nouvel ordre si vous avez les droits.</p>
              </div>
            </ng-template>
          </div>
        </div>

        <!-- Fullscreen details modal (no horizontal scroll) -->
        <div class="details-overlay" *ngIf="showDetails" (click)="closeDetails()">
          <div class="details-modal" (click)="$event.stopPropagation()">
            <ng-container *ngIf="selectedOrdre as so">
              <div class="details-header">
                <h2>Détails - Ordre {{ so.numeroOC || so.numeroCommande || so.idOC }}</h2>
                <div class="details-actions">
                  <button class="btn btn-outline" (click)="closeDetails()">Fermer</button>
                </div>
              </div>

              <div class="details-body">
                <div class="details-left">
                  <section class="card">
                    <h3>Informations générales</h3>
                    <p><strong>Numéro OC:</strong> {{ so.numeroOC || so.numeroCommande || so.idOC }}</p>
                    <p><strong>Item:</strong> {{ so.item?.nomItem || so.nomItem || '-' }}</p>
                    <p><strong>Prestataire:</strong> {{ so.prestataireItem || '-' }}</p>
                    <p><strong>Statut:</strong> {{ getStatusLabel(so.statut) }}</p>
                    <p><strong>Observations:</strong> {{ so.observations || so.description || '-' }}</p>
                  </section>

                  <section class="card">
                    <h3>Quantités & Prix</h3>
                    <p><strong>Min prestations:</strong> {{ so.min_prestations || so.minArticles || 0 }}</p>
                    <p><strong>Max prestations:</strong> {{ so.max_prestations || so.maxArticles || 0 }}</p>
                    <p><strong>Prix unitaire:</strong> {{ (so.prixUnitPrest || so.item?.prix || so.montant || 0) | number:'1.0-0' }} FCFA</p>
                    <p><strong>Montant total:</strong> {{ calcul_montantTotal(so) | number:'1.0-0' }} FCFA</p>
                    <p><strong>Écart:</strong> {{ calculer_ecart_item(so) }}</p>
                    <p><strong>Pénalités:</strong> {{ calcul_penalite(so) | number:'1.0-0' }} FCFA</p>
                  </section>
                </div>

                <div class="details-right">
                  <section class="card big">
                    <h3>Prestations associées</h3>
                    <div *ngIf="so.fichePrestations?.length; else noFiches">
                      <div *ngFor="let fiche of so.fichePrestations" class="fiche-item">
                        <div class="fiche-head">
                          <strong>{{ fiche.nomItem || fiche.nomPrestataire }}</strong>
                          <span class="badge">{{ fiche.statut }}</span>
                        </div>
                        <div class="fiche-meta">Date: {{ fiche.dateRealisation || '-' }} — Quantité: {{ fiche.quantite }}</div>
                        <div class="fiche-comment">{{ fiche.commentaire || '' }}</div>
                      </div>
                    </div>
                    <ng-template #noFiches>
                      <div class="muted">Aucune fiche de prestation associée</div>
                    </ng-template>
                  </section>
                </div>
              </div>
            </ng-container>
          </div>
        </div>

        <div class="loading" *ngIf="loadingList">Chargement des ordres de commande...</div>
      </div>
  `,
  styles: [`
    .container { padding: 2rem; max-width: 1400px; margin: 0 auto; }

    .prestation-header {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 2.5rem; padding: 1.5rem; background: linear-gradient(135deg,#1e293b 0%,#334155 100%);
      border-radius: 12px; color: white;
    }

    .header-content h1 { font-size: 2rem; margin: 0 0 0.25rem 0; }
    .header-content p { margin: 0; opacity: 0.9; }

    .header-actions { display:flex; gap:1rem; align-items:center; }

    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { background:white; padding:1.25rem; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.06); display:flex; gap:1rem; align-items:center; border:1px solid #f1f5f9 }
    .stat-icon { font-size:2.25rem; opacity:0.85 }
    .stat-number { font-size:1.75rem; font-weight:700 }
    .stat-label { font-size:0.9rem; color:#6b7280 }

    .table-container { background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.06); overflow:hidden; border:1px solid #f1f5f9 }
    .table-header { padding:1.25rem; border-bottom:1px solid #f1f5f9 }
    .table-header h3 { margin:0 }
    .table-responsive { overflow-x:auto }
    .prestation-table { width:100%; border-collapse:collapse }
    .prestation-table {
      width:100%;
      border-collapse:collapse;
      table-layout: fixed; /* prevent long rows from causing horizontal scroll */
      word-wrap: break-word;
    }
    .prestation-table th { background:#f8fafc; padding:0.75rem; text-align:left; font-weight:600; color:#374151; border-bottom:1px solid #f1f5f9 }
    .prestation-table td { padding:0.75rem; border-bottom:1px solid #f8fafc; vertical-align:top }
    .prestation-table tr:hover { background:#fef7f0 }

    /* Ensure long content wraps and uses ellipsis where appropriate */
    .prestation-table td, .prestation-table th { overflow: hidden; text-overflow: ellipsis; white-space: normal; }

    /* Responsive: stack table rows as cards on small screens so no horizontal scrolling */
    @media (max-width: 900px) {
      .prestation-table thead { display: none; }
      .prestation-table, .prestation-table tbody, .prestation-table tr, .prestation-table td { display: block; width: 100%; }
      .prestation-table tr { margin-bottom: 1rem; border:1px solid #f1f5f9; border-radius: 8px; padding: 0.5rem; background: white }
      .prestation-table td { display: flex; justify-content: space-between; padding: 0.75rem 1rem; }
      .prestation-table td[data-label]::before { content: attr(data-label) ": "; font-weight:700; color:#374151; margin-right:0.5rem }
      .action-buttons { justify-content: flex-end }
    }

    /* Fullscreen details modal styles */
    .details-overlay { position: fixed; inset: 0; background: rgba(2,6,23,0.6); display:flex; align-items:flex-start; justify-content:center; padding:2rem; z-index:3000 }
    .details-modal { width: 100%; max-width:1200px; height: calc(100vh - 4rem); background:white; border-radius:12px; overflow:auto; box-shadow:0 40px 80px rgba(2,6,23,0.4); display:flex; flex-direction:column }
    .details-header { display:flex; align-items:center; justify-content:space-between; gap:1rem; padding:1.25rem; border-bottom:1px solid #f1f5f9 }
    .details-body { display:flex; gap:1rem; padding:1.25rem; flex:1; }
    .details-left { width:360px; flex-shrink:0; display:flex; flex-direction:column; gap:1rem }
    .details-right { flex:1; overflow:auto }
    .card { background:#fbfbfd; border:1px solid #eef2ff; padding:1rem; border-radius:8px }
    .card.big { min-height:400px }
    .fiche-item { padding:0.75rem; border-bottom:1px dashed #eef2ff }
    .fiche-head { display:flex; justify-content:space-between; align-items:center }
    .badge { background:#f1f5f9; padding:0.25rem 0.5rem; border-radius:6px }

    .montant-cell { color:#059669; font-weight:600 }
    .description { color:#6b7280; font-size:0.9rem }

    .status-badge { padding:0.35rem 0.6rem; border-radius:16px; font-weight:700; font-size:0.78rem }
    .status-approuve { background:#dcfce7; color:#166534 }
    .status-en-attente { background:#fef3c7; color:#92400e }
    .status-non-approuve { background:#fecaca; color:#991b1b }

    .action-buttons { display:flex; gap:0.5rem }
    .btn { padding:0.6rem 1rem; border-radius:8px; border:none }
    .btn-primary { background:#F97316; color:white }
    .btn-outline { background:transparent; border:1px solid #d1d5db }
    .btn-danger { background:#ef4444; color:white }

    .empty-state { text-align:center; padding:3rem }

    @media(max-width:768px) { .prestation-header { flex-direction:column; gap:1rem } .stats-grid { grid-template-columns:repeat(2,1fr) } }
  `]
})
export class OrdreCommandeListComponent implements OnInit {
  ordres: OrdreCommande[] = [];
  selectedOrdre: OrdreCommande | null = null;
  showDetails = false;
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
      idOC: ['', Validators.required],
      numeroCommande: [''],
      minArticles: [0, [Validators.required, Validators.min(0)]],
      maxArticles: [0, [Validators.required, Validators.min(0)]],
      montant: [0, Validators.required],
      description: [''],
      statut: ['EN_ATTENTE', Validators.required]
    });
  }

  ngOnInit(): void {
    // If the user is not authenticated, trigger the OAuth login flow so they
    // are redirected to Keycloak instead of seeing an error when the API
    // request is made without a token.
    if (!this.authService.isAuthenticated()) {
      // Keep the create form hidden and start the login redirect.
      this.showCreateForm = false;
      this.authService.login();
      return;
    }

    // Only load orders once the user is authenticated. Admins also get the
    // contrats list.
    this.loadOrdres();
    if (this.authService.isAdmin()) {
      this.loadContrats();
    }
  }

  loadOrdres(): void {
    this.loadingList = true;
    console.log('Loading orders...');
    this.ordreCommandeService.getAllOrdresCommande().subscribe({
      next: (ordres) => {
        console.log('Orders loaded successfully:', ordres);
        console.log('Number of orders:', ordres.length);
        // Filter orders based on user role
        if (this.authService.isPrestataire()) {
          // Prestataires only see orders where they are the prestataire
          const currentUser = this.authService.getCurrentUser();
          this.ordres = ordres.filter(ordre =>
            ordre.prestataireItem && currentUser &&
            ordre.prestataireItem.toLowerCase().includes(currentUser.nom.toLowerCase())
          );
        } else {
          // Admins see all orders
          this.ordres = ordres;
        }
        console.log('Filtered orders:', this.ordres.length);
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading ordres:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des ordres: ' + error.message });
        this.loadingList = false;
      }
    });
  }

  openDetails(ordre: OrdreCommande): void {
    this.selectedOrdre = ordre;
    // compute penalites if not present
    if (typeof ordre.penalites !== 'number') {
      ordre.penalites = this.calcul_penalite(ordre);
    }
    this.showDetails = true;
  }

  closeDetails(): void {
    this.showDetails = false;
    this.selectedOrdre = null;
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
      idOC: ordre.idOC,
      numeroCommande: ordre.numeroCommande,
      minArticles: ordre.minArticles,
      maxArticles: ordre.maxArticles,
      montant: ordre.montant,
      description: ordre.description,
      statut: ordre.statut
    });
  }

  async deleteOrdre(ordre: OrdreCommande): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'ordre',
      message: `Êtes-vous sûr de vouloir supprimer l'ordre ${ordre.idOC} ?`,
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
      message: `Voulez-vous approuver l'ordre ${ordre.idOC} ?`,
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
      message: `Êtes-vous sûr de vouloir rejeter l'ordre ${ordre.idOC} ?`,
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
      numeroCommande: '',
      minArticles: 0,
      maxArticles: 0,
      montant: 0
    });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  calculateMontant(): void {
    const maxPrestations = this.ordreForm.get('max_prestations')?.value || this.ordreForm.get('maxArticles')?.value || 0;
    const prixUnitPrest = this.ordreForm.get('prixUnitPrest')?.value || this.ordreForm.get('prixUnitaire')?.value || 0;
    const montant = maxPrestations * prixUnitPrest;

    this.ordreForm.patchValue({ montantOC: montant });
  }

  // Use shared business helpers (imported from models) so logic is centralized
  public calculer_ecart_item = calculer_ecart_item;
  public calcul_montantTotal = calcul_montantTotal;
  public calcul_penalite = calcul_penalite;

  formatDate(dateStr?: string): string {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(statut: StatutCommande): string {
    const statusClasses: { [key: string]: string } = {
      'APPROUVE': 'badge-success',
      'NON_APPROUVE': 'badge-error',
      'EN_ATTENTE': 'badge-warning',
      'REJETE': 'badge-error',
      'EN_COURS': 'badge-info',
      'TERMINE': 'badge-success'
    };
    return statusClasses[statut] || 'badge-info';
  }

  getStatusLabel(statut: StatutCommande): string {
    const statusLabels: { [key: string]: string } = {
      'APPROUVE': 'Approuvé',
      'NON_APPROUVE': 'Non Approuvé',
      'EN_ATTENTE': 'En Attente',
      'REJETE': 'Rejeté',
      'EN_COURS': 'En Cours',
      'TERMINE': 'Terminé'
    };
    return statusLabels[statut] || statut;
  }

  // UI helper getters used by the template to avoid inline expressions
  get approuveCount(): number {
    return this.ordres ? this.ordres.filter(o => o.statut === 'APPROUVE').length : 0;
  }

  get enAttenteCount(): number {
    return this.ordres ? this.ordres.filter(o => o.statut === 'EN_ATTENTE').length : 0;
  }

  getRowClass(statut?: any): string {
    if (!statut) return '';
    return statut.toString().toLowerCase().replace('_', '-') as string;
  }
}