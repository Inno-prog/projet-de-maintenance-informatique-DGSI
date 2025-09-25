import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { ContratService } from '../../../../core/services/contrat.service';
import { FichePrestation, Contrat, StatutFiche } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ToastService } from '../../../../core/services/toast.service';
import { PdfExportService } from '../../../../core/services/pdf-export.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { FileUploadService } from '../../../../core/services/file-upload.service';
import { PdfService } from '../../../../core/services/pdf.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';

interface PrestationDashboard {
  fiche: FichePrestation;
  contrat?: Contrat;
  progression: number;
  documentsJoints: string[];
}

@Component({
  selector: 'app-prestations-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container">
        <div class="page-header">
          <h1>Tableau de Bord des Prestations</h1>
          <p>Suivi et évaluation des prestations</p>
        </div>

        <!-- Statistiques -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon warning">
              <i class="fas fa-clock"></i>
            </div>
            <div class="stat-content">
              <h3>{{ getStatsByStatus('EN_ATTENTE').length }}</h3>
              <p>En Attente</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon info">
              <i class="fas fa-play-circle"></i>
            </div>
            <div class="stat-content">
              <h3>{{ getStatsByStatus('EN_COURS').length }}</h3>
              <p>En Cours</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon success">
              <i class="fas fa-check-circle"></i>
            </div>
            <div class="stat-content">
              <h3>{{ getStatsByStatus('TERMINEE').length }}</h3>
              <p>Terminées</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon primary">
              <i class="fas fa-star"></i>
            </div>
            <div class="stat-content">
              <h3>{{ getPrestationsAEvaluer().length }}</h3>
              <p>À Évaluer</p>
            </div>
          </div>
        </div>

        <!-- Filtres et Boutons d'Action -->
        <div class="filters-section">
          <div class="action-buttons-left">
            <button class="btn btn-secondary" (click)="exportToPdf()" *ngIf="prestations.length > 0">
              📄 Exporter PDF
            </button>
            <button class="btn btn-success" *ngIf="authService.isAdmin()" (click)="creerNouvellePrestation()">
              <i class="fas fa-plus"></i> Créer Nouvelle Prestation
            </button>
            <button class="btn btn-primary" *ngIf="authService.isAdmin()" (click)="genererOrdrePDF()">
              <i class="fas fa-file-pdf"></i> Générer Ordre de Commande PDF
            </button>
          </div>
          <div class="filters">
            <select [(ngModel)]="selectedStatus" (change)="applyFilters()" class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="EN_COURS">En cours</option>
              <option value="TERMINEE">Terminées</option>
            </select>
            <select [(ngModel)]="selectedPrestataire" (change)="applyFilters()" class="filter-select">
              <option value="">Tous les prestataires</option>
              <option *ngFor="let prestataire of getUniquePrestataires()" [value]="prestataire">
                {{ prestataire }}
              </option>
            </select>
          </div>
        </div>

        <!-- Tableau -->
        <div class="prestations-table">
          <table *ngIf="filteredPrestations.length > 0; else noData">
            <thead>
              <tr>
                <th>ID</th>
                <th>Contrat</th>
                <th>Prestataire</th>
                <th>Item</th>
                <th>Date Début</th>
                <th>Date Fin</th>
                <th>Montant</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let prestation of filteredPrestations" [class]="getRowClass(prestation.fiche.statut)">
                <td>{{ prestation.fiche.idPrestation }}</td>
                <td>
                  <div *ngIf="prestation.fiche.fichiersContrat; else noFiles">
                    <button class="btn btn-info btn-xs" (click)="voirFichiers(prestation.fiche.fichiersContrat)">
                      <i class="fas fa-file-pdf"></i> Voir fichiers
                    </button>
                  </div>
                  <ng-template #noFiles>
                    <span class="text-muted">Aucun fichier</span>
                  </ng-template>
                </td>
                <td>{{ prestation.fiche.nomPrestataire }}</td>
                <td>{{ prestation.fiche.nomItem }}</td>
                <td>{{ prestation.contrat ? formatDate(prestation.contrat.dateDebut) : '-' }}</td>
                <td>{{ prestation.contrat ? formatDate(prestation.contrat.dateFin) : '-' }}</td>
                <td class="montant">{{ prestation.contrat?.montant | number:'1.0-0' || '-' }} FCFA</td>
                <td>
                  <span class="badge" [class]="getStatusBadgeClass(prestation.fiche.statut)">
                    {{ getStatusLabel(prestation.fiche.statut) }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn btn-info btn-sm" (click)="modifierPrestation(prestation)">
                      Modifier
                    </button>
                    <button class="btn btn-primary btn-sm" 
                            *ngIf="prestation.fiche.statut === 'EN_ATTENTE'" 
                            (click)="demarrerPrestation(prestation)">
                      Démarrer
                    </button>
                    <button class="btn btn-warning btn-sm" 
                            *ngIf="prestation.fiche.statut === 'EN_COURS'" 
                            (click)="terminerPrestation(prestation)">
                      Terminer
                    </button>
                    <button class="btn btn-success btn-sm" 
                            *ngIf="prestation.fiche.statut === 'TERMINEE'" 
                            (click)="evaluerPrestataire(prestation)">
                      Évaluer
                    </button>
                    <button class="btn btn-danger btn-sm" 
                            *ngIf="authService.isAdmin()" 
                            (click)="supprimerPrestation(prestation)">
                      Supprimer
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

        <!-- Modal Création/Modification Prestation -->
        <div *ngIf="showCreateForm || showEditForm" class="modal-overlay" (click)="fermerFormulaire()">
          <div class="modal-content" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ editingPrestation ? 'Modifier Prestation' : 'Créer Nouvelle Prestation' }}</h2>
              <button class="close-btn" (click)="fermerFormulaire()">
                <i class="fas fa-times"></i>
              </button>
            </div>
            
            <form [formGroup]="prestationForm" (ngSubmit)="creerPrestation()">
              <div class="modal-body">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="nomPrestataire">Nom du Prestataire</label>
                    <input type="text" id="nomPrestataire" formControlName="nomPrestataire" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="nomItem">Nom de l'Item</label>
                    <input type="text" id="nomItem" formControlName="nomItem" class="form-control" placeholder="Ex: Maintenance ordinateur">
                  </div>

                  <div class="form-group">
                    <label for="dateRealisation">Date de Réalisation</label>
                    <input type="datetime-local" id="dateRealisation" formControlName="dateRealisation" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="quantite">Quantité</label>
                    <input type="number" id="quantite" formControlName="quantite" min="1" class="form-control">
                  </div>

                  <div class="form-group" *ngIf="authService.isAdmin()">
                    <label for="statut">Statut</label>
                    <select id="statut" formControlName="statut" class="form-control">
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TERMINEE">Terminée</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="idContrat">ID Contrat</label>
                    <input type="text" id="idContrat" formControlName="idContrat" class="form-control" placeholder="Ex: CONT-2024-001">
                  </div>

                  <div class="form-group">
                    <label for="dateDebut">Date Début</label>
                    <input type="date" id="dateDebut" formControlName="dateDebut" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="dateFin">Date Fin</label>
                    <input type="date" id="dateFin" formControlName="dateFin" class="form-control">
                  </div>

                  <div class="form-group">
                    <label for="montant">Montant (FCFA)</label>
                    <input type="number" id="montant" formControlName="montant" min="0" class="form-control" placeholder="0">
                  </div>

                  <div class="form-group form-group-full">
                    <label for="commentaire">Commentaire</label>
                    <textarea id="commentaire" formControlName="commentaire" rows="3" class="form-control" placeholder="Commentaires sur la prestation..."></textarea>
                  </div>
                </div>
              </div>

              <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="fermerFormulaire()">Annuler</button>
                <button type="submit" class="btn btn-primary" [disabled]="prestationForm.invalid || loading">
                  {{ loading ? (editingPrestation ? 'Modification...' : 'Création...') : (editingPrestation ? 'Modifier Prestation' : 'Créer Prestation') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      width: 3rem;
      height: 3rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      color: white;
    }

    .stat-icon.success { background: #10b981; }
    .stat-icon.warning { background: #f59e0b; }
    .stat-icon.danger { background: #ef4444; }
    .stat-icon.info { background: #3b82f6; }
    .stat-icon.primary { background: #8b5cf6; }

    .stat-content h3 {
      font-size: 2rem;
      font-weight: 700;
      margin: 0;
    }

    .filters-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      gap: 1rem;
    }

    .action-buttons-left {
      display: flex;
      gap: 1rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
    }

    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
    }

    .prestations-table {
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

    th:nth-child(4), td:nth-child(4) { /* Item */
      white-space: normal;
      max-width: 200px;
    }

    th:nth-child(9), td:nth-child(9) { /* Actions */
      white-space: normal;
      min-width: 200px;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    .row-pending { background: #fffbeb; }
    .row-progress { background: #dbeafe; }
    .row-completed { background: #f0fdf4; }



    .badge-success { background: #dcfce7; color: #166534; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-error { background: #fecaca; color: #991b1b; }
    .badge-info { background: #dbeafe; color: #1e40af; }

    .montant {
      font-weight: 600;
      color: #059669;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      justify-content: flex-start;
      flex-wrap: nowrap;
    }

    .action-buttons .btn-sm i {
      font-size: 0.875rem;
      color: inherit !important;
    }

    .btn i {
      color: inherit !important;
    }

    .btn * {
      color: inherit !important;
    }

    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 32px;
      height: 32px;
    }

    .btn-xs {
      padding: 0.375rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 4px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .text-muted {
      color: #6b7280;
      font-style: italic;
    }

    .btn {
      padding: 0.5rem 0.75rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
      font-size: 0.8rem;
      color: white;
      text-align: center;
      line-height: 1.2;
    }

    .btn-primary {
      background-color: #007bff;
    }

    .btn-primary:hover {
      background-color: #0056b3;
    }

    .btn-success {
      background-color: #28a745;
    }

    .btn-success:hover {
      background-color: #1e7e34;
    }

    .btn-danger {
      background-color: #dc3545;
    }

    .btn-danger:hover {
      background-color: #c82333;
    }

    .btn-info {
      background-color: #17a2b8;
    }

    .btn-info:hover {
      background-color: #138496;
    }

    .btn-warning {
      background-color: #ffc107;
      color: #212529;
    }

    .btn-warning:hover {
      background-color: #e0a800;
      color: #212529;
    }

    .btn-secondary {
      background-color: #6c757d;
    }

    .btn-secondary:hover {
      background-color: #545b62;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .create-section {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .modal-content {
      background: white;
      width: 90%;
      max-width: 600px;
      border-radius: 12px;
      box-shadow: 0 25px 50px rgba(0,0,0,0.25);
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
      cursor: pointer;
      color: #6b7280;
      padding: 0.25rem;
    }

    .modal-body {
      padding: 1.5rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group-full {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
    }
  `]
})
export class PrestationsDashboardComponent implements OnInit {
  prestations: PrestationDashboard[] = [];
  filteredPrestations: PrestationDashboard[] = [];
  contrats: Contrat[] = [];
  selectedStatus = '';
  selectedPrestataire = '';
  showCreateForm = false;
  showEditForm = false;
  prestationForm!: FormGroup;
  editingPrestation: PrestationDashboard | null = null;
  loading = false;

  constructor(
    private ficheService: FichePrestationService,
    private contratService: ContratService,
    public authService: AuthService,
    private router: Router,
    private formBuilder: FormBuilder,
    private toastService: ToastService,
    private notificationService: NotificationService,
    private fileUploadService: FileUploadService,
    private pdfService: PdfService,
    private confirmationService: ConfirmationService,
    private pdfExportService: PdfExportService
  ) {
    this.prestationForm = this.formBuilder.group({
      nomPrestataire: ['', Validators.required],
      nomItem: ['', Validators.required],
      dateRealisation: ['', Validators.required],
      quantite: [1, [Validators.required, Validators.min(1)]],
      statut: ['EN_ATTENTE'],
      commentaire: [''],
      idContrat: [''],
      dateDebut: [''],
      dateFin: [''],
      montant: [0, [Validators.min(0)]]
    });
  }

  ngOnInit(): void {
    if (this.authService.isAdmin()) {
      this.loadData();
    }
  }

  loadData(): void {
    Promise.all([
      this.ficheService.getAllFiches().toPromise(),
      this.contratService.getAllContrats().toPromise()
    ]).then(([fiches, contrats]) => {
      this.contrats = contrats || [];
      this.prestations = (fiches || []).map(fiche => this.createPrestationDashboard(fiche));
      this.filteredPrestations = [...this.prestations];
    });
  }

  private createPrestationDashboard(fiche: FichePrestation): PrestationDashboard {
    const contrat = this.contrats.find(c => c.nomPrestataire === fiche.nomPrestataire);
    
    return {
      fiche,
      contrat,
      progression: this.calculateProgression(fiche),
      documentsJoints: []
    };
  }

  private calculateProgression(fiche: FichePrestation): number {
    switch (fiche.statut) {
      case StatutFiche.EN_ATTENTE: return 25;
      case StatutFiche.EN_COURS: return 75;
      case StatutFiche.TERMINEE: return 100;
      default: return 0;
    }
  }

  applyFilters(): void {
    this.filteredPrestations = this.prestations.filter(p => {
      const statusMatch = !this.selectedStatus || p.fiche.statut === this.selectedStatus as StatutFiche;
      const prestataireMatch = !this.selectedPrestataire || p.fiche.nomPrestataire === this.selectedPrestataire;
      return statusMatch && prestataireMatch;
    });
  }

  getStatsByStatus(status: string): PrestationDashboard[] {
    return this.prestations.filter(p => p.fiche.statut === status as StatutFiche);
  }

  getTotalMontant(): number {
    return this.prestations.reduce((total, p) => total + (p.contrat?.montant || 0), 0);
  }

  getUniquePrestataires(): string[] {
    return [...new Set(this.prestations.map(p => p.fiche.nomPrestataire))];
  }

  getRowClass(statut: StatutFiche): string {
    switch (statut) {
      case StatutFiche.EN_ATTENTE: return 'row-pending';
      case StatutFiche.EN_COURS: return 'row-progress';
      case StatutFiche.TERMINEE: return 'row-completed';
      default: return '';
    }
  }

  getStatusBadgeClass(statut: StatutFiche): string {
    switch (statut) {
      case StatutFiche.EN_ATTENTE: return 'badge badge-warning';
      case StatutFiche.EN_COURS: return 'badge badge-info';
      case StatutFiche.TERMINEE: return 'badge badge-success';
      default: return 'badge';
    }
  }

  getStatusLabel(statut: StatutFiche): string {
    switch (statut) {
      case StatutFiche.EN_ATTENTE: return 'En attente';
      case StatutFiche.EN_COURS: return 'En cours';
      case StatutFiche.TERMINEE: return 'Terminée';
      default: return statut;
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  modifierPrestation(prestation: PrestationDashboard): void {
    this.editingPrestation = prestation;
    this.showEditForm = true;
    
    // Pré-remplir le formulaire avec les données existantes
    this.prestationForm.patchValue({
      nomPrestataire: prestation.fiche.nomPrestataire,
      nomItem: prestation.fiche.nomItem,
      dateRealisation: new Date(prestation.fiche.dateRealisation).toISOString().slice(0, 16),
      quantite: prestation.fiche.quantite,
      statut: prestation.fiche.statut,
      commentaire: prestation.fiche.commentaire || '',
      idContrat: prestation.contrat?.idContrat || '',
      dateDebut: prestation.contrat?.dateDebut || '',
      dateFin: prestation.contrat?.dateFin || '',
      montant: prestation.contrat?.montant || 0
    });
  }

  voirFichiers(fichiersContrat: string): void {
    try {
      const fichiers = JSON.parse(fichiersContrat);
      if (fichiers && fichiers.length > 0) {
        fichiers.forEach((fichier: any, index: number) => {
          const link = document.createElement('a');
          link.href = fichier.data;
          link.download = fichier.name || `document-${index + 1}.pdf`;
          link.click();
        });
        this.toastService.show({
          type: 'success',
          title: 'Téléchargement',
          message: `${fichiers.length} fichier(s) téléchargé(s)`
        });
      }
    } catch (error) {
      console.error('Erreur lors du téléchargement des fichiers:', error);
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'Erreur lors du téléchargement des fichiers'
      });
    }
  }

  getPrestationsAEvaluer(): PrestationDashboard[] {
    return this.prestations.filter(p => p.fiche.statut === StatutFiche.TERMINEE);
  }

  demarrerPrestation(prestation: PrestationDashboard): void {
    if (prestation.fiche.id) {
      // Préparer les données minimales pour la mise à jour du statut
      const updatedData = {
        statut: StatutFiche.EN_COURS
      };

      console.log('Données envoyées pour démarrage:', updatedData);

      this.ficheService.updateFiche(prestation.fiche.id, updatedData as any).subscribe({
        next: () => {
          prestation.fiche.statut = StatutFiche.EN_COURS;
          prestation.progression = this.calculateProgression(prestation.fiche);
          this.toastService.show({
            type: 'success',
            title: 'Prestation démarrée',
            message: 'La prestation a été marquée comme en cours'
          });
        },
        error: (error) => {
          console.error('Erreur lors du démarrage de la prestation:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du démarrage de la prestation: ' + (error.error?.message || error.message)
          });
        }
      });
    } else {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de prestation manquant'
      });
    }
  }

  terminerPrestation(prestation: PrestationDashboard): void {
    if (prestation.fiche.id) {
      // Préparer les données minimales pour la mise à jour du statut
      const updatedData = {
        statut: StatutFiche.TERMINEE
      };

      console.log('Données envoyées pour terminaison:', updatedData);

      this.ficheService.updateFiche(prestation.fiche.id, updatedData as any).subscribe({
        next: () => {
          prestation.fiche.statut = StatutFiche.TERMINEE;
          prestation.progression = this.calculateProgression(prestation.fiche);

          // Envoyer notification si prestation terminée
          this.notificationService.notifierPrestationTerminee(
            prestation.fiche.nomPrestataire,
            prestation.fiche.id!,
            prestation.fiche.nomItem
          ).subscribe({
            next: () => {
              this.toastService.show({
                type: 'info',
                title: 'Notification envoyée',
                message: 'Le prestataire a été notifié pour soumettre son rapport'
              });
            },
            error: (error) => {
              console.error('Erreur lors de l\'envoi de notification:', error);
            }
          });

          this.toastService.show({
            type: 'success',
            title: 'Prestation terminée',
            message: 'La prestation a été marquée comme terminée'
          });
        },
        error: (error) => {
          console.error('Erreur lors de la terminaison de la prestation:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la terminaison de la prestation: ' + (error.error?.message || error.message)
          });
        }
      });
    } else {
      this.toastService.show({
        type: 'error',
        title: 'Erreur',
        message: 'ID de prestation manquant'
      });
    }
  }

  evaluerPrestataire(prestation: PrestationDashboard): void {
    this.router.navigate(['/evaluations/new'], {
      queryParams: {
        prestationId: prestation.fiche.id,
        prestataire: prestation.fiche.nomPrestataire,
        nomItem: prestation.fiche.nomItem,
        contratId: prestation.contrat?.idContrat
      }
    });
  }

  creerNouvellePrestation(): void {
    this.showCreateForm = true;
  }

  fermerFormulaire(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.editingPrestation = null;
    this.prestationForm.reset();
    this.prestationForm.patchValue({ 
      quantite: 1, 
      statut: 'EN_ATTENTE',
      montant: 0
    });
  }

  async creerPrestation(): Promise<void> {
    if (this.prestationForm.valid) {
      this.loading = true;
      const formData = this.prestationForm.value;
      
      if (this.editingPrestation) {
        // Mode modification
        const prestationData = {
          nomPrestataire: formData.nomPrestataire,
          nomItem: formData.nomItem,
          dateRealisation: new Date(formData.dateRealisation).toISOString(),
          quantite: formData.quantite,
          statut: formData.statut,
          commentaire: formData.commentaire,
          idPrestation: this.editingPrestation.fiche.idPrestation,
          fichiersContrat: this.editingPrestation.fiche.fichiersContrat
        };

        // Mettre à jour la fiche de prestation
        this.ficheService.updateFiche(this.editingPrestation.fiche.id!, prestationData).subscribe({
          next: () => {
            // Créer ou mettre à jour le contrat
            if (formData.dateDebut || formData.dateFin || formData.montant || formData.idContrat) {
              const contratData = {
                idContrat: formData.idContrat || `CONT-${prestationData.nomPrestataire}-${Date.now()}`,
                typeContrat: 'PRESTATION',
                dateDebut: formData.dateDebut,
                dateFin: formData.dateFin,
                nomPrestataire: prestationData.nomPrestataire,
                montant: formData.montant || 0
              };
              
              if (this.editingPrestation!.contrat?.id) {
                // Mettre à jour le contrat existant
                this.contratService.updateContrat(this.editingPrestation!.contrat.id, contratData).subscribe({
                  next: () => {
                    this.finaliserModification();
                  },
                  error: (error) => {
                    console.error('Error updating contrat:', error);
                    this.finaliserModification();
                  }
                });
              } else {
                // Créer un nouveau contrat
                this.contratService.createContrat(contratData).subscribe({
                  next: () => {
                    this.finaliserModification();
                  },
                  error: (error) => {
                    console.error('Error creating contrat:', error);
                    this.finaliserModification();
                  }
                });
              }
            } else {
              this.finaliserModification();
            }
          },
          error: (error) => {
            console.error('Error updating prestation:', error);
            this.loading = false;
            this.toastService.show({ 
              type: 'error', 
              title: 'Erreur', 
              message: 'Erreur lors de la modification de la prestation' 
            });
          }
        });
      } else {
        // Mode création
        const prestationData = {
          nomPrestataire: formData.nomPrestataire,
          nomItem: formData.nomItem,
          dateRealisation: new Date(formData.dateRealisation).toISOString(),
          quantite: formData.quantite,
          statut: formData.statut || 'EN_ATTENTE',
          commentaire: formData.commentaire,
          idPrestation: 'PREST-' + Date.now()
        };

        this.ficheService.createFiche(prestationData).subscribe({
          next: () => {
            this.loading = false;
            this.fermerFormulaire();
            this.loadData();
            this.toastService.show({ 
              type: 'success', 
              title: 'Prestation créée', 
              message: 'La prestation a été créée avec succès' 
            });
          },
          error: (error) => {
            console.error('Error creating prestation:', error);
            this.loading = false;
            this.toastService.show({ 
              type: 'error', 
              title: 'Erreur', 
              message: 'Erreur lors de la création de la prestation' 
            });
          }
        });
      }
    }
  }

  async supprimerPrestation(prestation: PrestationDashboard): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la prestation',
      message: `Êtes-vous sûr de vouloir supprimer la prestation ${prestation.fiche.idPrestation} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed && prestation.fiche.id) {
      this.ficheService.deleteFiche(prestation.fiche.id).subscribe({
        next: () => {
          this.loadData();
          this.toastService.show({ 
            type: 'success', 
            title: 'Prestation supprimée', 
            message: 'La prestation a été supprimée avec succès' 
          });
        },
        error: (error) => {
          console.error('Error deleting prestation:', error);
          this.toastService.show({ 
            type: 'error', 
            title: 'Erreur', 
            message: 'Erreur lors de la suppression de la prestation' 
          });
        }
      });
    }
  }

  private finaliserModification(): void {
    this.loading = false;
    this.fermerFormulaire();
    this.loadData();
    this.toastService.show({ 
      type: 'success', 
      title: 'Prestation modifiée', 
      message: 'La prestation a été modifiée avec succès' 
    });
  }

  genererOrdrePDF(): void {
    const prestationsTerminees = this.prestations.filter(p => p.fiche.statut === StatutFiche.TERMINEE);
    
    if (prestationsTerminees.length === 0) {
      this.toastService.show({
        type: 'warning',
        title: 'Aucune prestation',
        message: 'Aucune prestation terminée pour générer l\'ordre de commande'
      });
      return;
    }

    this.genererPDFAvecJsPDF(prestationsTerminees);
  }

  private genererPDFAvecJsPDF(prestations: PrestationDashboard[]): void {
    this.pdfService.genererOrdreCommande().subscribe({
      next: (blob) => {
        const trimestre = 'T' + Math.ceil((new Date().getMonth() + 1) / 3);
        const annee = new Date().getFullYear();
        const filename = `ordre-commande-${trimestre}-${annee}.txt`;
        
        this.pdfService.downloadFile(blob, filename);
        
        this.toastService.show({
          type: 'success',
          title: 'Document généré',
          message: `Ordre de commande généré pour ${prestations.length} prestations`
        });
      },
      error: (error) => {
        console.error('Erreur génération PDF:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la génération du document'
        });
      }
    });
  }

  exportToPdf(): void {
    const fichesData = this.prestations.map(p => p.fiche);
    this.pdfExportService.exportFichesPrestation(fichesData);
    this.toastService.show({
      type: 'success',
      title: 'Export réussi',
      message: 'Les fiches de prestation ont été exportées en PDF'
    });
  }
}