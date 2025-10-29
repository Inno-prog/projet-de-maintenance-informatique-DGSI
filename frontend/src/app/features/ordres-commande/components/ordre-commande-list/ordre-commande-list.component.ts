import { Component, OnInit, Input } from '@angular/core';
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
            <!-- NOUVEAU : Boutons de vue -->
            <div class="view-toggle">
              <button class="btn btn-outline" [class.active]="viewMode === 'all'" (click)="switchView('all')">Tous les ordres</button>
              <button class="btn btn-outline" [class.active]="viewMode === 'by-prestataire'" (click)="switchView('by-prestataire')">Par prestataire</button>
            </div>
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
          <div class="table-header">
            <h3>Liste des Ordres de Commande</h3>
            <!-- NOUVEAU : Affichage des groupes par prestataire -->
            <div *ngIf="viewMode === 'by-prestataire' && ordresParPrestataire" class="prestataire-groups">
              <div *ngFor="let prestataire of getPrestatairesKeys()" class="prestataire-group">
                <h4>{{ prestataire }}</h4>
                <span class="badge">{{ (ordresParPrestataire[prestataire] ? ordresParPrestataire[prestataire].length : 0) }} ordres</span>
              </div>
            </div>
          </div>
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
                  <td data-label="Num OC">{{ ordre.numeroOc || ordre.numeroCommande || '-' }}</td>
                  <td data-label="Item" [title]="getItemsNamesTooltip(ordre) || ordre.item?.nomItem || ordre.nomItem"><strong>{{ getItemsNamesTruncated(ordre) || ordre.item?.nomItem || ordre.nomItem || '-' }}</strong></td>
                  <td data-label="Prestataire">{{ ordre.prestataireItem || (ordre.prestations && ordre.prestations.length ? ordre.prestations[0].nomPrestataire : null) || '-' }}</td>
                  <td data-label="Min / Max">{{ getMinPrestations(ordre) }} / {{ getMaxPrestations(ordre) }}</td>
                  <td data-label="Prix unitaire">{{ getPrixUnitaireDisplay(ordre) }}</td>
                  <td data-label="Montant OC" class="montant-cell">{{ getMontantTotalDisplay(ordre) }}</td>
                  <td data-label="Observations">{{ getObservationsDisplay(ordre) }}</td>
                  <td data-label="Statut" class="text-center">
                    <div>{{ getStatusLabel(getStatutFromPrestations(ordre)) }}</div>
                    <div class="penalite" *ngIf="getPenalites(ordre) > 0">Pénalités: {{ getPenalites(ordre) | number:'1.0-0' }} FCFA</div>
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
                <h2>Détails - Ordre {{ so.numeroOc || so.numeroCommande || so.idOC }}</h2>
                <div class="details-actions">
                  <button class="btn btn-primary" (click)="exportPdf()">📄 Exporter PDF</button>
                  <button class="btn btn-outline" (click)="closeDetails()">Fermer</button>
                </div>
              </div>

              <div class="details-body">
                <div class="details-left">
                  <section class="card">
                    <h3>Informations générales</h3>
                    <p><strong>Numéro OC:</strong> {{ so.numeroOc || so.numeroCommande || so.idOC }}</p>
                    <p><strong>Item:</strong> {{ getItemsNames(so) || so.item?.nomItem || so.nomItem || '-' }}</p>
                    <p><strong>Prestataire:</strong> {{ so.prestataireItem || '-' }}</p>
                    <p><strong>Statut:</strong> {{ getStatusLabel(getStatutFromPrestations(so)) }}</p>
                    <p><strong>Observations:</strong> {{ getObservationsDisplay(so) }}</p>
                  </section>

                  <section class="card">
                    <h3>Quantités & Prix</h3>
                    <p><strong>Min prestations:</strong> {{ getMinPrestations(so) }}</p>
                    <p><strong>Max prestations:</strong> {{ getMaxPrestations(so) }}</p>
                    <p><strong>Prix unitaire:</strong> {{ getPrixUnitaireDisplay(so) }}</p>
                    <p><strong>Montant total:</strong> {{ getMontantTotalDisplay(so) }}</p>
                    <p><strong>Écart:</strong> {{ getEcart(so) }}</p>
                    <p><strong>Pénalités:</strong> {{ getPenalites(so) | number:'1.0-0' }} FCFA</p>
                  </section>
                </div>

                <div class="details-right">
                  <section class="card big">
                    <h3>Prestations associées ({{ so.prestations?.length || 0 }})</h3>
                    <div *ngIf="so.prestations?.length; else noFiches">
                      <div class="prestations-summary">
                        <div class="summary-stats">
                          <div class="stat-item">
                            <span class="stat-label">Total prestations:</span>
                            <span class="stat-value">{{ so.prestations!.length }}</span>
                          </div>
                          <div class="stat-item">
                            <span class="stat-label">Montant total:</span>
                            <span class="stat-value">{{ getTotalPrestationsAmount(so) | number:'1.0-0' }} FCFA</span>
                          </div>
                          <div class="stat-item">
                            <span class="stat-label">Trimestre:</span>
                            <span class="stat-value">{{ so.trimestre || so.prestations![0].trimestre || '-' }}</span>
                          </div>
                        </div>
                      </div>

                      <div class="prestations-list">
                        <div *ngFor="let prestation of so.prestations; let i = index" class="prestation-detail-card">
                          <div class="prestation-header">
                            <div class="prestation-title">
                              <span class="prestation-number">#{{ i + 1 }}</span>
                              <strong>{{ prestation.nomPrestation || 'Prestation ' + (i + 1) }}</strong>
                            </div>
                            <div class="prestation-status">
                              <span class="badge" [ngClass]="getPrestationStatusClass(prestation.statut)">
                                {{ getPrestationStatusLabel(prestation.statut) }}
                              </span>
                            </div>
                          </div>

                          <div class="prestation-info">
                            <div class="info-row">
                              <span class="info-label">Prestataire:</span>
                              <span class="info-value">{{ prestation.nomPrestataire }}</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Quantité réalisée:</span>
                              <span class="info-value">{{ prestation.nbPrestRealise }}/{{ prestation.equipementsUtilises || prestation.quantiteItem }}</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Montant:</span>
                              <span class="info-value montant">{{ (prestation.montantPrest | number:'1.0-0') || 0 }} FCFA</span>
                            </div>
                            <div class="info-row">
                              <span class="info-label">Période:</span>
                              <span class="info-value">{{ prestation.dateDebut | date:'dd/MM/yyyy' }} - {{ prestation.dateFin | date:'dd/MM/yyyy' }}</span>
                            </div>
                            <div class="info-row" *ngIf="prestation.trimestre">
                              <span class="info-label">Trimestre:</span>
                              <span class="info-value">{{ prestation.trimestre }}</span>
                            </div>
                          </div>

                          <div class="prestation-description" *ngIf="prestation.description">
                            <span class="info-label">Description:</span>
                            <p class="description-text">{{ prestation.description }}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <ng-template #noFiches>
                      <div class="empty-prestations">
                        <div class="empty-icon">📋</div>
                        <p class="empty-message">Aucune prestation associée à cet ordre de commande</p>
                        <p class="empty-hint">Les prestations seront automatiquement regroupées ici lorsqu'elles seront créées pour ce prestataire et trimestre.</p>
                      </div>
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

    .view-toggle { display:flex; gap:0.5rem; }
    .view-toggle .btn.active { background:#F97316; color:white; border-color:#F97316; }

    .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:1rem; margin-bottom:1.5rem; }
    .stat-card { background:white; padding:1.25rem; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.06); display:flex; gap:1rem; align-items:center; border:1px solid #f1f5f9 }
    .stat-icon { font-size:2.25rem; opacity:0.85 }
    .stat-number { font-size:1.75rem; font-weight:700 }
    .stat-label { font-size:0.9rem; color:#6b7280 }

    .table-container { background:white; border-radius:12px; box-shadow:0 4px 20px rgba(0,0,0,0.06); overflow:hidden; border:1px solid #f1f5f9 }
    .table-header { padding:1.25rem; border-bottom:1px solid #f1f5f9 }
    .table-header h3 { margin:0 }

    .prestataire-groups { display:flex; flex-wrap:wrap; gap:1rem; margin-top:1rem; }
    .prestataire-group { display:flex; align-items:center; gap:0.5rem; background:#f8fafc; padding:0.5rem 1rem; border-radius:8px; border:1px solid #e2e8f0; }
    .prestataire-group h4 { margin:0; font-size:0.9rem; font-weight:600; }
    .prestataire-group .badge { background:#F97316; color:white; padding:0.25rem 0.5rem; border-radius:12px; font-size:0.75rem; }
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

    /* Enhanced prestations display styles */
    .prestations-summary { background:#f8fafc; padding:1rem; border-radius:8px; margin-bottom:1.5rem; border:1px solid #e2e8f0; }
    .summary-stats { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:1rem; }
    .stat-item { display:flex; justify-content:space-between; align-items:center; }
    .stat-label { font-weight:600; color:#374151; }
    .stat-value { font-weight:700; color:#1f2937; }

    .prestations-list { display:flex; flex-direction:column; gap:1rem; }
    .prestation-detail-card { background:white; border:1px solid #e5e7eb; border-radius:8px; padding:1rem; box-shadow:0 1px 3px rgba(0,0,0,0.1); }
    .prestation-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem; }
    .prestation-title { display:flex; align-items:center; gap:0.5rem; }
    .prestation-number { background:#f97316; color:white; padding:0.25rem 0.5rem; border-radius:12px; font-size:0.75rem; font-weight:600; }
    .prestation-status { flex-shrink:0; }

    .prestation-info { display:grid; grid-template-columns:1fr 1fr; gap:0.5rem 1rem; margin-bottom:0.75rem; }
    .info-row { display:flex; justify-content:space-between; align-items:center; }
    .info-label { font-weight:600; color:#6b7280; font-size:0.875rem; }
    .info-value { font-weight:500; color:#1f2937; text-align:right; }
    .info-value.montant { color:#059669; font-weight:700; }

    .prestation-description { border-top:1px solid #f3f4f6; padding-top:0.75rem; }
    .description-text { margin:0.25rem 0 0 0; color:#4b5563; font-style:italic; }

    .empty-prestations { text-align:center; padding:2rem; color:#6b7280; }
    .empty-icon { font-size:3rem; margin-bottom:1rem; opacity:0.5; }
    .empty-message { font-weight:600; margin-bottom:0.5rem; }
    .empty-hint { font-size:0.875rem; opacity:0.8; }

    .badge { background:#f1f5f9; padding:0.25rem 0.5rem; border-radius:6px; font-size:0.75rem; font-weight:600; }
    .badge-success { background:#dcfce7; color:#166534; }
    .badge-warning { background:#fef3c7; color:#92400e; }
    .badge-info { background:#dbeafe; color:#1e40af; }
    .badge-error { background:#fecaca; color:#dc2626; }
    .badge-secondary { background:#f3f4f6; color:#6b7280; }

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
  @Input() ordres: OrdreCommande[] = [];
  ordresParPrestataire: { [key: string]: OrdreCommande[] } = {};
  selectedOrdre: OrdreCommande | null = null;
  showDetails = false;
  contrats: Contrat[] = [];
  ordreForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  viewMode: 'all' | 'by-prestataire' = 'all'; // NOUVEAU : Mode de vue

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
    // If ordres is not provided via @Input, load them
    if (!this.ordres || this.ordres.length === 0) {
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
  }

  loadOrdres(): void {
    this.loadingList = true;
    console.log('Loading orders...');

    if (this.viewMode === 'by-prestataire') {
      this.loadOrdresParPrestataire();
    } else {
      this.loadOrdresTous();
    }
  }

  private loadOrdresTous(): void {
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
        if (error.status !== 401) {
          console.error('Error loading ordres:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des ordres: ' + error.message });
        }
        this.loadingList = false;
      }
    });
  }

  private loadOrdresParPrestataire(): void {
    this.ordreCommandeService.getOrdresCommandeGroupesParPrestataire().subscribe({
      next: (ordresParPrestataire) => {
        console.log('Orders by prestataire loaded:', ordresParPrestataire);
        this.ordresParPrestataire = ordresParPrestataire;

        // Convertir en liste plate pour la vue actuelle
        this.ordres = Object.values(ordresParPrestataire).flat();

        // Filtrage par rôle utilisateur
        if (this.authService.isPrestataire()) {
          const currentUser = this.authService.getCurrentUser();
          this.ordres = this.ordres.filter(ordre =>
            ordre.prestataireItem && currentUser &&
            ordre.prestataireItem.toLowerCase().includes(currentUser.nom.toLowerCase())
          );
        }

        console.log('Filtered orders by prestataire:', this.ordres.length);
        this.loadingList = false;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Error loading ordres by prestataire:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des ordres par prestataire: ' + error.message });
        }
        this.loadingList = false;
      }
    });
  }

  openDetails(ordre: OrdreCommande): void {
    this.selectedOrdre = ordre;
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

  // Helper methods for dynamic display based on prestations
  getItemsNames(ordre: OrdreCommande): string {
    if (ordre.prestations && ordre.prestations.length > 0) {
      return ordre.prestations.map(p => p.nomPrestation).filter(n => n).join(', ');
    }
    return ordre.nomItem || '';
  }

  // Helper method to get truncated item names for display
  getItemsNamesTruncated(ordre: OrdreCommande): string {
    const fullName = this.getItemsNames(ordre);
    if (fullName.length > 25) {
      return fullName.substring(0, 25) + '...';
    }
    return fullName;
  }

  // Helper method to get full item names for tooltip
  getItemsNamesTooltip(ordre: OrdreCommande): string {
    return this.getItemsNames(ordre);
  }

  getMinPrestations(ordre: OrdreCommande): number {
    return ordre.min_prestations || ordre.minArticles || (ordre.prestations ? ordre.prestations.length : 0);
  }

  getMaxPrestations(ordre: OrdreCommande): number {
    if (ordre.items && ordre.items.length > 0) {
      return Math.max(...ordre.items.map(item => item.quantiteMaxTrimestre || 0));
    }
    return ordre.max_prestations || ordre.maxArticles || (ordre.prestations ? ordre.prestations.length : 0);
  }

  getPrixUnitaireDisplay(ordre: OrdreCommande): string {
    if (ordre.prestations && ordre.prestations.length > 0) {
      const total = ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
      const avg = total / ordre.prestations.length;
      return (avg || 0).toFixed(0) + ' FCFA';
    }
    return ((ordre.prixUnitPrest || ordre.montant || 0)).toFixed(0) + ' FCFA';
  }

  getMontantTotalDisplay(ordre: OrdreCommande): string {
    if (ordre.prestations && ordre.prestations.length > 0) {
      const total = ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
      return total.toFixed(0) + ' FCFA';
    }
    return ((ordre.montantOC || ordre.montant || 0)).toFixed(0) + ' FCFA';
  }

  getObservationsDisplay(ordre: OrdreCommande): string {
    if (ordre.prestations && ordre.prestations.length > 0) {
      const descriptions = ordre.prestations.map(p => p.description).filter(d => d && d.trim());
      if (descriptions.length > 0) {
        return descriptions.join('; ');
      }
    }
    return ordre.observations || ordre.description || '-';
  }

  getStatutFromPrestations(ordre: OrdreCommande): StatutCommande {
    if (ordre.prestations && ordre.prestations.length > 0) {
      const allTerminee = ordre.prestations.every(p => p.statut === 'TERMINEE');
      if (allTerminee) return StatutCommande.TERMINE;
      const anyEnCours = ordre.prestations.some(p => p.statut === 'EN_COURS');
      if (anyEnCours) return StatutCommande.EN_COURS;
      return StatutCommande.EN_ATTENTE;
    }
    return ordre.statut;
  }

  getEcart(ordre: OrdreCommande): number {
    const realized = ordre.prestations ? ordre.prestations.length : 0;
    const max = this.getMaxPrestations(ordre);
    return Math.max(0, max - realized);
  }

  getPenalites(ordre: OrdreCommande): number {
    if (ordre.prestations && ordre.prestations.length > 0) {
      const realizedAmount = ordre.prestations.reduce((sum, p) => sum + (p.montantPrest || 0), 0);
      const maxAmount = ordre.items && ordre.items.length > 0 ?
        ordre.items.reduce((sum, item) => sum + ((item.quantiteMaxTrimestre || 0) * (item.prix || 0)), 0) : 0;
      return Math.max(0, maxAmount - realizedAmount);
    }
    const ecart = this.getEcart(ordre);
    return ecart * (ordre.prixUnitPrest || 0);
  }

  // NOUVEAU : Méthode pour changer de vue
  switchView(mode: 'all' | 'by-prestataire'): void {
    this.viewMode = mode;
    this.loadOrdres();
  }

  // NOUVEAU : Méthode pour obtenir les clés des prestataires
  getPrestatairesKeys(): string[] {
    return Object.keys(this.ordresParPrestataire || {});
  }

  // Helper methods for enhanced prestation display
  getTotalPrestationsAmount(ordre: OrdreCommande): number {
    if (!ordre.prestations || ordre.prestations.length === 0) return 0;
    return ordre.prestations.reduce((total, prestation) => {
      const montant = typeof prestation.montantPrest === 'number' ? prestation.montantPrest : 0;
      return total + montant;
    }, 0);
  }

  exportPdf(): void {
    if (this.selectedOrdre) {
      this.ordreCommandeService.exportOrdreCommandePdf(this.selectedOrdre.id!).subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          const fileName = 'ordre-commande-' + (this.selectedOrdre!.numeroOc || this.selectedOrdre!.idOC || 'unknown') + '.pdf';
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          this.toastService.show({ type: 'success', title: 'Export PDF', message: 'PDF exporté avec succès' });
        },
        error: (error) => {
          console.error('Error exporting PDF:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de l\'export PDF' });
        }
      });
    }
  }

  getPrestationStatusClass(statut?: string): string {
    if (!statut) return 'badge-secondary';
    const statusMap: { [key: string]: string } = {
      'TERMINEE': 'badge-success',
      'EN_COURS': 'badge-warning',
      'EN_ATTENTE': 'badge-info',
      'VALIDER': 'badge-success',
      'REJETER': 'badge-error'
    };
    return statusMap[statut.toUpperCase()] || 'badge-secondary';
  }

  getPrestationStatusLabel(statut?: string): string {
    if (!statut) return 'Non défini';
    const statusLabels: { [key: string]: string } = {
      'TERMINEE': 'Terminée',
      'EN_COURS': 'En Cours',
      'EN_ATTENTE': 'En Attente',
      'VALIDER': 'Validée',
      'REJETER': 'Rejetée'
    };
    return statusLabels[statut.toUpperCase()] || statut;
  }
}
