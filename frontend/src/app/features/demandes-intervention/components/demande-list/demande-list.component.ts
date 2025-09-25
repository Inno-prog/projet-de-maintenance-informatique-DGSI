import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { DemandeInterventionService } from '../../../../core/services/demande-intervention.service';
import { DemandeIntervention, StatutDemande, FichePrestation, StatutFiche } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';
import { FichePrestationService } from '../../../../core/services/fiche-prestation.service';
import { PdfExportService } from '../../../../core/services/pdf-export.service';

@Component({
  selector: 'app-demande-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LayoutComponent],
  template: `
    <app-layout>
      <div class="container">
        <div class="page-header">
          <div>
            <h1>Les Demandes d'Intervention</h1>
            <p>Gérez vos demandes d'intervention technique</p>
          </div>
        </div>

        <!-- Cartes de statistiques pour admin -->
        <div class="stats-cards" *ngIf="authService.isAdmin()">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatTotal() }}</div>
              <div class="stat-label">Total Demandes</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"></div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatEnAttente() }}</div>
              <div class="stat-label">En Attente</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon"></div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatEnCours() }}</div>
              <div class="stat-label">En Cours</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">❌</div>
            <div class="stat-content">
              <div class="stat-number">{{ getStatAnnulees() }}</div>
              <div class="stat-label">Annulées</div>
            </div>
          </div>
        </div>

        <!-- Create Demande Form Modal -->
        <div class="modal-overlay" *ngIf="showCreateForm" (click)="cancelEdit()">
          <div class="modal-content form-modal" (click)="$event.stopPropagation()">
            <div class="card">
              <div class="card-header">
                <h2>{{ isEditing ? 'Modifier' : 'Créer' }} une Demande d'Intervention</h2>
              </div>
              
              <form [formGroup]="demandeForm" (ngSubmit)="onSubmit()">
                <div class="form-grid">
                  <div class="form-group">
                    <label for="prestataireNom">Nom du Demandeur</label>
                    <input type="text" id="prestataireNom" formControlName="prestataireNom">
                  </div>

                  <div class="form-group">
                    <label for="prestataireContact">Contact (Email/Téléphone)</label>
                    <input type="text" id="prestataireContact" formControlName="prestataireContact" placeholder="email@exemple.com ou +33123456789">
                  </div>

                  <div class="form-group form-group-full">
                    <label for="objet">Objet de la Demande</label>
                    <input type="text" id="objet" formControlName="objet" placeholder="Ex: Ordinateur en panne">
                  </div>

                  <div class="form-group">
                    <label for="categorie">Catégorie</label>
                    <select id="categorie" formControlName="categorie">
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="MATERIEL">Matériel</option>
                      <option value="LOGICIEL">Logiciel</option>
                      <option value="RESEAU">Réseau</option>
                      <option value="TELEPHONIE">Téléphonie</option>
                      <option value="IMPRIMANTE">Imprimante</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>

                  <div class="form-group">
                    <label for="statut">Statut de la Demande</label>
                    <select id="statut" formControlName="statut" (change)="onStatutChange()">
                      <option value="SOUMISE">Soumettre Immédiatement</option>
                      <option value="EN_COURS">Planifier pour Plus Tard</option>
                      <option value="EN_COURS" *ngIf="authService.isAdmin()">En cours</option>
                      <option value="TERMINEE" *ngIf="authService.isAdmin()">Terminée</option>
                      <option value="ANNULEE" *ngIf="authService.isAdmin()">Annulée</option>
                    </select>
                  </div>

                  <div class="form-group form-group-full">
                    <label for="description">Description du Problème</label>
                    <textarea id="description" formControlName="description" rows="4" placeholder="Décrivez en détail le problème rencontré..."></textarea>
                  </div>

                  <div class="form-group form-group-full">
                    <label for="contratPdf">Documents du Contrat (PDF)</label>
                    <input type="file" id="contratPdf" (change)="onFileSelected($event)" accept=".pdf" multiple class="file-input">
                    <div class="file-info" *ngIf="selectedFiles.length > 0">
                      <p><strong>Fichiers sélectionnés:</strong></p>
                      <ul>
                        <li *ngFor="let file of selectedFiles">{{ file.name }} ({{ formatFileSize(file.size) }})</li>
                      </ul>
                    </div>
                  </div>

                  <div class="form-group" *ngIf="authService.isAdmin()">
                    <label for="technicienAssigne">Technicien Assigné</label>
                    <input type="text" id="technicienAssigne" formControlName="technicienAssigne" placeholder="Nom du technicien">
                  </div>
                </div>

                <div class="form-actions">
                  <button type="button" class="btn btn-outline" (click)="cancelEdit()">Annuler</button>
                  <button type="submit" class="btn btn-primary" [disabled]="loading" (click)="onSubmit()">
                    {{ loading ? 'Enregistrement...' : (isEditing ? 'Modifier' : 'Créer') }}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <!-- Demandes Table -->
        <div class="table-container">
          <div class="table-header">
            <h2>Liste des Demandes</h2>
            <div class="header-actions">
              <button class="btn btn-secondary" (click)="exportToPdf()" *ngIf="demandes.length > 0">
                📄 Exporter PDF
              </button>
              <button class="btn btn-primary" (click)="showCreateForm = !showCreateForm">
                {{ showCreateForm ? 'Annuler' : 'Nouvelle Demande' }}
              </button>
            </div>
          </div>
          
          <div class="demandes-grid" *ngIf="demandes.length > 0; else noData">
            <div class="demande-coupon" *ngFor="let demande of demandes">
              <div class="coupon-header">
                <div class="company-logo">
                  <span class="logo-icon">DG</span>
                  <span class="company-name">DGSI Maintenance</span>
                </div>
                <span class="badge" [class]="getStatusBadgeClass(demande.statut)">
                  {{ getStatusLabel(demande.statut) }}
                </span>
              </div>
              
              <div class="coupon-icon">
                <span class="intervention-icon">🔧</span>
              </div>
              
              <div class="coupon-content">
                <h3>{{ demande.objet }}</h3>
                <p class="demande-description">{{ demande.description || 'Demande d\'intervention' }}</p>
                <div class="demande-info">
                  <span class="info-item">
                    <strong>Demandeur:</strong> {{ demande.prestataireNom }}
                  </span>
                  <span class="info-item">
                    <strong>Catégorie:</strong> {{ getCategorieLabel(demande.categorie) }}
                  </span>
                  <span class="info-item">
                    <strong>Technicien:</strong> {{ demande.technicienAssigne || 'Non assigné' }}
                  </span>
                </div>
              </div>
              
              <div class="coupon-footer">
                <div class="demande-code">
                  <span>ID: <span class="code">{{ demande.idDemande }}</span></span>
                  <span class="date">Créée le: {{ formatDate(demande.dateDemande) }}</span>
                </div>
                
                <div class="coupon-actions">
                  <button class="btn btn-info btn-sm" (click)="showDetails(demande)">
                    🔍 Détails
                  </button>
                  <button class="btn btn-success btn-sm" 
                          *ngIf="authService.isAdmin() && demande.statut === 'SOUMISE'" 
                          (click)="accepterDemande(demande)">
                    Accepter
                  </button>
                  <button class="btn btn-danger btn-sm" 
                          *ngIf="authService.isAdmin() && demande.statut === 'SOUMISE'" 
                          (click)="refuserDemande(demande)">
                    Refuser
                  </button>
                  <button class="btn btn-secondary btn-sm" (click)="editDemande(demande)" *ngIf="!authService.isAdmin()">
                    Modifier
                  </button>
                </div>
              </div>
            </div>
          </div>

          <ng-template #noData>
            <div class="no-data">
              <p>Aucune demande d'intervention trouvée</p>
            </div>
          </ng-template>
        </div>

        <div class="loading" *ngIf="loadingList">
          Chargement des demandes...
        </div>
      </div>
    </app-layout>
  `,
  styles: [`
    .demandes-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .demande-coupon {
      border: 3px dotted #bbb;
      border-radius: 12px;
      background: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: transform 0.2s ease;
      max-height: 350px;
    }

    .demande-coupon:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
    }

    .coupon-header {
      background: #f1f1f1;
      padding: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .company-logo {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .logo-icon {
      width: 1.5rem;
      height: 1.5rem;
      background: var(--primary);
      color: white;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 0.8rem;
    }

    .company-name {
      font-weight: 600;
      color: #333;
      font-size: 0.9rem;
    }

    .coupon-icon {
      text-align: center;
      padding: 0.5rem;
      background: #ccc;
    }

    .intervention-icon {
      font-size: 1.5rem;
    }

    .coupon-content {
      padding: 0.75rem;
      background: white;
    }

    .coupon-content h3 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 700;
      color: #333;
    }

    .demande-description {
      color: #666;
      margin-bottom: 0.5rem;
      line-height: 1.3;
      font-size: 0.85rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .demande-info {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .info-item {
      font-size: 0.8rem;
      color: #555;
    }

    .coupon-footer {
      background: #f1f1f1;
      padding: 0.5rem;
    }

    .demande-code {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      font-size: 0.8rem;
    }

    .code {
      background: #ccc;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
    }

    .date {
      color: #666;
    }

    .coupon-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
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

    .file-input {
      padding: 0.75rem;
      border: 2px dashed #d1d5db;
      border-radius: 6px;
      background: #f9fafb;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .file-input:hover {
      border-color: #3b82f6;
    }

    .file-info {
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: #f0f9ff;
      border-radius: 6px;
      border: 1px solid #bae6fd;
    }

    .file-info ul {
      margin: 0.5rem 0 0 0;
      padding-left: 1.5rem;
    }

    .file-info li {
      color: #0369a1;
      font-size: 0.9rem;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      transition: transform 0.2s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .stat-icon {
      font-size: 2rem;
      width: 3rem;
      height: 3rem;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f3f4f6;
      border-radius: 50%;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: var(--primary);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
    }

    @media (max-width: 768px) {
      .demandes-grid {
        grid-template-columns: 1fr;
      }
      
      .coupon-actions {
        flex-direction: column;
      }

      .stats-cards {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class DemandeListComponent implements OnInit {
  demandes: DemandeIntervention[] = [];
  demandeForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  selectedFiles: File[] = [];

  constructor(
    private demandeService: DemandeInterventionService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService,
    private fichePrestationService: FichePrestationService,
    private pdfExportService: PdfExportService
  ) {
    this.demandeForm = this.formBuilder.group({
      prestataireNom: ['', Validators.required],
      prestataireContact: ['', Validators.required],
      objet: ['', Validators.required],
      description: ['', Validators.required],
      categorie: ['', Validators.required],
      statut: ['SOUMISE'],
      technicienAssigne: [''],
      fichiersContrat: ['']
    });
  }

  ngOnInit(): void {
    this.loadDemandes();
  }

  loadDemandes(): void {
    this.loadingList = true;
    this.demandeService.getAllDemandes().subscribe({
      next: (demandes) => {
        this.demandes = demandes;
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading demandes:', error);
        this.loadingList = false;
      }
    });
  }

  async onSubmit(): Promise<void> {
    if (this.demandeForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cette demande d'intervention ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const demandeData = this.demandeForm.value;

        if (this.isEditing && this.editingId) {
          this.demandeService.updateDemande(this.editingId, demandeData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadDemandes();
              this.toastService.show({ type: 'success', title: 'Demande modifiée', message: 'La demande a été modifiée avec succès' });
            },
            error: (error) => {
              console.error('Error updating demande:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
            }
          });
        } else {
          this.demandeService.createDemande(demandeData).subscribe({
            next: () => {
              this.loading = false;
              this.resetForm();
              this.loadDemandes();
              this.toastService.show({ type: 'success', title: 'Demande créée', message: 'La demande a été créée avec succès' });
            },
            error: (error) => {
              console.error('Error creating demande:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
            }
          });
        }
      }
    }
  }

  editDemande(demande: DemandeIntervention): void {
    this.isEditing = true;
    this.editingId = demande.id!;
    this.showCreateForm = true;
    
    this.demandeForm.patchValue({
      prestataireNom: demande.prestataireNom,
      prestataireContact: demande.prestataireContact,
      objet: demande.objet,
      description: demande.description,
      categorie: demande.categorie,
      statut: demande.statut,
      technicienAssigne: demande.technicienAssigne,
      fichiersContrat: demande.fichiersContrat
    });
  }

  async deleteDemande(demande: DemandeIntervention): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer la demande',
      message: `Êtes-vous sûr de vouloir supprimer la demande ${demande.idDemande} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.demandeService.deleteDemande(demande.id!).subscribe({
        next: () => {
          this.loadDemandes();
          this.toastService.show({ type: 'success', title: 'Demande supprimée', message: 'La demande a été supprimée avec succès' });
        },
        error: (error) => {
          console.error('Error deleting demande:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de la demande' });
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.demandeForm.reset();
    this.demandeForm.patchValue({ statut: 'SOUMISE' });
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  onStatutChange(): void {
    const statut = this.demandeForm.get('statut')?.value;
    if (statut === 'SOUMISE') {
      console.log('Demande soumise');
    }
  }

  async accepterDemande(demande: DemandeIntervention): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Accepter la demande',
      message: `Voulez-vous accepter la demande ${demande.idDemande} ? Une prestation sera automatiquement créée.`,
      confirmText: 'Accepter',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      // 1. Mettre à jour le statut de la demande avec seulement les champs nécessaires
      const demandeUpdate: DemandeIntervention = {
        prestataireNom: demande.prestataireNom,
        prestataireContact: demande.prestataireContact,
        objet: demande.objet,
        description: demande.description,
        categorie: demande.categorie,
        statut: 'EN_COURS' as StatutDemande,
        technicienAssigne: demande.technicienAssigne,
        fichiersContrat: demande.fichiersContrat,
        idDemande: demande.idDemande,
        dateDemande: demande.dateDemande
      };
      this.demandeService.updateDemande(demande.id!, demandeUpdate).subscribe({
        next: () => {
          // 2. Créer automatiquement une prestation
          this.creerPrestationAutomatique(demande);
        },
        error: (error) => {
          console.error('Error accepting demande:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de l\'acceptation' });
        }
      });
    }
  }

  private creerPrestationAutomatique(demande: DemandeIntervention): void {
    const prestationData: FichePrestation = {
      idPrestation: 'PREST-' + Date.now(),
      nomPrestataire: demande.prestataireNom,
      nomItem: demande.objet,
      dateRealisation: new Date().toISOString(),
      quantite: 1,
      statut: StatutFiche.EN_ATTENTE,
      commentaire: `Créée automatiquement depuis la demande ${demande.idDemande}`,
      fichiersContrat: demande.fichiersContrat
    };

    this.fichePrestationService.createFiche(prestationData).subscribe({
      next: () => {
        this.loadDemandes();
        this.toastService.show({ 
          type: 'success', 
          title: 'Demande acceptée', 
          message: 'La demande a été acceptée et une prestation a été créée automatiquement' 
        });
      },
      error: (error) => {
        console.error('Error creating prestation:', error);
        this.loadDemandes();
        this.toastService.show({ 
          type: 'warning', 
          title: 'Demande acceptée', 
          message: 'La demande a été acceptée mais erreur lors de la création de la prestation' 
        });
      }
    });
  }

  async refuserDemande(demande: DemandeIntervention): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Refuser la demande',
      message: `Voulez-vous refuser la demande ${demande.idDemande} ?`,
      confirmText: 'Refuser',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      const demandeUpdate: DemandeIntervention = {
        prestataireNom: demande.prestataireNom,
        prestataireContact: demande.prestataireContact,
        objet: demande.objet,
        description: demande.description,
        categorie: demande.categorie,
        statut: 'ANNULEE' as StatutDemande,
        technicienAssigne: demande.technicienAssigne,
        fichiersContrat: demande.fichiersContrat,
        idDemande: demande.idDemande,
        dateDemande: demande.dateDemande
      };
      this.demandeService.updateDemande(demande.id!, demandeUpdate).subscribe({
        next: () => {
          this.loadDemandes();
          this.toastService.show({ type: 'success', title: 'Demande refusée', message: 'La demande a été refusée' });
        },
        error: (error) => {
          console.error('Error refusing demande:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du refus' });
        }
      });
    }
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getStatusBadgeClass(statut: StatutDemande): string {
    const statusClasses: { [key: string]: string } = {
      'SOUMISE': 'badge-warning',
      'EN_COURS': 'badge-info',
      'TERMINEE': 'badge-success',
      'ANNULEE': 'badge-error'
    };
    return statusClasses[statut] || 'badge-info';
  }

  getStatusLabel(statut: StatutDemande): string {
    const statusLabels: { [key: string]: string } = {
      'SOUMISE': 'Soumise',
      'EN_COURS': 'En cours',
      'TERMINEE': 'Terminée',
      'ANNULEE': 'Annulée'
    };
    return statusLabels[statut] || statut;
  }

  getCategorieLabel(categorie: string): string {
    const categorieLabels: { [key: string]: string } = {
      'MATERIEL': 'Matériel',
      'LOGICIEL': 'Logiciel',
      'RESEAU': 'Réseau',
      'TELEPHONIE': 'Téléphonie',
      'IMPRIMANTE': 'Imprimante',
      'AUTRE': 'Autre'
    };
    return categorieLabels[categorie] || categorie;
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    this.selectedFiles = Array.from(files as FileList).filter((file: File) => file.type === 'application/pdf');
    
    if (this.selectedFiles.length !== files.length) {
      this.toastService.show({
        type: 'warning',
        title: 'Fichiers filtrés',
        message: 'Seuls les fichiers PDF sont acceptés'
      });
    }

    // Convertir les fichiers en base64 pour stockage
    if (this.selectedFiles.length > 0) {
      const filePromises = this.selectedFiles.map(file => this.convertFileToBase64(file));
      Promise.all(filePromises).then(base64Files => {
        const filesData = this.selectedFiles.map((file, index) => ({
          name: file.name,
          size: file.size,
          data: base64Files[index]
        }));
        this.demandeForm.patchValue({ fichiersContrat: JSON.stringify(filesData) });
      });
    }
  }

  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  showDetails(demande: DemandeIntervention): void {
    const details = `
      ID: ${demande.idDemande}
      Objet: ${demande.objet}
      Demandeur: ${demande.prestataireNom}
      Contact: ${demande.prestataireContact}
      Catégorie: ${this.getCategorieLabel(demande.categorie)}
      Description: ${demande.description}
      Statut: ${this.getStatusLabel(demande.statut)}
      Technicien: ${demande.technicienAssigne || 'Non assigné'}
      Date de création: ${this.formatDate(demande.dateDemande)}
    `;
    alert(details);
  }

  getStatTotal(): number {
    return this.demandes.length;
  }

  getStatEnAttente(): number {
    return this.demandes.filter(d => d.statut === 'SOUMISE').length;
  }

  getStatEnCours(): number {
    return this.demandes.filter(d => d.statut === 'EN_COURS').length;
  }

  getStatAnnulees(): number {
    return this.demandes.filter(d => d.statut === 'ANNULEE').length;
  }

  exportToPdf(): void {
    this.pdfExportService.exportDemandesInterventionToPdf(this.demandes);
    this.toastService.show({
      type: 'success',
      title: 'Export PDF',
      message: 'Fenêtre d\'impression ouverte pour générer le PDF'
    });
  }
}