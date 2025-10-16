import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-prestation-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
        <!-- Header Section -->
        <div class="prestation-header">
          <div class="header-content">
            <h1>Gestion des Prestations</h1>
            <p>Surveillez et gérez l'exécution des prestations de maintenance</p>
          </div>
          <div class="header-actions">
            <div class="search-box">
              <input
                type="text"
                placeholder="Rechercher par prestataire ou prestation..."
                [(ngModel)]="searchTerm"
                (input)="onSearch()"
                class="search-input">
              <span class="search-icon">🔍</span>
            </div>
            <select
              [(ngModel)]="selectedStatut"
              (change)="onFilterChange()"
              class="filter-select">
              <option value="">Tous les statuts</option>
              <option value="terminé">Terminé</option>
              <option value="en cours">En cours</option>
              <option value="en attente">En attente</option>
            </select>
            <button class="btn btn-primary" (click)="refreshData()">
              <span>🔄</span>
              Actualiser
            </button>
          </div>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📊</div>
            <div class="stat-content">
              <div class="stat-number">{{ prestations.length }}</div>
              <div class="stat-label">Total Prestations</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <div class="stat-number">{{ getCountByStatut('terminé') }}</div>
              <div class="stat-label">Terminées</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🔄</div>
            <div class="stat-content">
              <div class="stat-number">{{ getCountByStatut('en cours') }}</div>
              <div class="stat-label">En Cours</div>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">⏳</div>
            <div class="stat-content">
              <div class="stat-number">{{ getCountByStatut('en attente') }}</div>
              <div class="stat-label">En Attente</div>
            </div>
          </div>
        </div>

        <!-- Prestations Table -->
        <div class="table-container">
          <div class="table-header">
            <h3>Liste des Prestations</h3>
          </div>

          <div class="table-responsive">
            <table class="prestation-table">
              <thead>
                <tr>
                  <th>Prestataire</th>
                  <th>Prestation</th>
                  <th>Montant</th>
                  <th>Quantité</th>
                  <th>Réalisées</th>
                  <th>Trimestre</th>
                  <th>Période</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let prestation of filteredPrestations" [class]="getRowClass(prestation.statut)">
                  <td class="prestataire-cell">
                    <div class="prestataire-info">
                      <strong>{{ prestation.nomPrestataire }}</strong>
                    </div>
                  </td>
                  <td>
                    <div class="prestation-info">
                      <strong class="prestation-name">{{ formatPrestationName(prestation.nomPrestation) }}</strong>
                      <div class="description" *ngIf="prestation.description">
                        {{ prestation.description.length > 60 ? (prestation.description | slice:0:60) + '...' : prestation.description }}
                      </div>
                    </div>
                  </td>
                  <td class="montant-cell">
                    <span class="montant">{{ prestation.montantPrest | number:'1.0-0' }} FCFA</span>
                  </td>
                  <td class="text-center">
                    <span class="badge">{{ prestation.quantiteItem }}</span>
                  </td>
                  <td class="text-center">
                    <span class="badge progress">{{ prestation.nbPrestRealise }}/{{ prestation.quantiteItem }}</span>
                  </td>
                  <td class="text-center">
                    <span class="trimestre-badge">{{ prestation.trimestre }}</span>
                  </td>
                  <td>
                    <div class="date-info">
                      <div>Début: {{ prestation.dateDebut | date:'dd/MM/yyyy' }}</div>
                      <div>Fin: {{ prestation.dateFin | date:'dd/MM/yyyy' }}</div>
                    </div>
                  </td>
                  <td class="text-center">
                    <span class="status-badge" [class]="'status-' + prestation.statut.toLowerCase().replace(' ', '-')">
                      {{ prestation.statut }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button class="btn btn-sm btn-outline" (click)="editPrestation(prestation)" title="Modifier">
                        ✏️
                      </button>
                      <button class="btn btn-sm btn-danger" (click)="deletePrestation(prestation)" title="Supprimer">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Empty State -->
          <div class="empty-state" *ngIf="filteredPrestations.length === 0">
            <div class="empty-icon">📋</div>
            <h3>Aucune prestation trouvée</h3>
            <p>{{ searchTerm || selectedStatut ? 'Aucun résultat ne correspond à vos critères.' : 'Aucune prestation n\'a été enregistrée pour le moment.' }}</p>
          </div>
        </div>
      </div>
  `,
  styles: [`
    .container {
      padding: 1.5rem;
      max-width: 100vw;
      margin: 0 auto;
      width: 100%;
    }

    .prestation-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      border-radius: 12px;
      color: white;
    }

    .header-content h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.5rem 0;
    }

    .header-content p {
      font-size: 1.1rem;
      opacity: 0.9;
      margin: 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .search-box {
      position: relative;
    }

    .search-input {
      padding: 0.75rem 1rem 0.75rem 3rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.9rem;
      width: 300px;
      transition: all 0.2s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #F97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .search-icon {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #6b7280;
      font-size: 1.2rem;
    }

    .filter-select {
      padding: 0.75rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.9rem;
      background: white;
      cursor: pointer;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      display: flex;
      align-items: center;
      gap: 1rem;
      border: 1px solid #f1f5f9;
    }

    .stat-icon {
      font-size: 3rem;
      opacity: 0.8;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #1f2937;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.9rem;
      color: #6b7280;
      font-weight: 500;
      margin-top: 0.25rem;
    }

    .table-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      overflow: hidden;
      border: 1px solid #f1f5f9;
    }

    .table-header {
      padding: 2rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .table-header h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #1f2937;
      margin: 0;
    }

    .table-responsive {
      overflow-x: auto;
    }

    .prestation-table {
      width: 100%;
      border-collapse: collapse;
    }

    .prestation-table th {
      background: #f8fafc;
      padding: 1rem 0.75rem;
      text-align: left;
      font-weight: 600;
      color: #374151;
      border-bottom: 1px solid #f1f5f9;
      white-space: nowrap;
      font-size: 0.875rem;
    }

    .prestation-table th:first-child {
      padding-left: 2rem;
    }

    .prestation-table th:last-child {
      padding-right: 2rem;
    }

    .prestation-table td {
      padding: 1rem 0.75rem;
      border-bottom: 1px solid #f8fafc;
      vertical-align: middle;
      font-size: 0.875rem;
    }

    .prestation-table td:first-child {
      padding-left: 2rem;
    }

    .prestation-table td:last-child {
      padding-right: 2rem;
    }

    .prestation-table tr:hover {
      background: #fef7f0;
    }

    .prestataire-cell {
      min-width: 150px;
      max-width: 200px;
    }

    .prestataire-info strong {
      color: #1f2937;
      font-size: 0.95rem;
    }

    .prestation-info strong {
      color: #1f2937;
      font-size: 0.95rem;
      display: block;
      margin-bottom: 0.25rem;
    }

    .prestation-name {
      white-space: pre-line;
      line-height: 1.4;
      word-wrap: break-word;
      min-height: 2.5rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .prestation-table td {
      vertical-align: top;
      min-height: 80px;
    }

    .description {
      color: #6b7280;
      font-size: 0.85rem;
      line-height: 1.4;
    }

    .montant-cell {
      min-width: 100px;
      max-width: 120px;
    }

    .montant {
      font-weight: 600;
      color: #059669;
      font-size: 0.95rem;
    }

    .badge {
      display: inline-block;
      padding: 0.5rem 0.75rem;
      background: #e5e7eb;
      color: #374151;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 500;
      text-align: center;
      min-width: 40px;
    }

    .badge.progress {
      background: #dbeafe;
      color: #1e40af;
    }

    .trimestre-badge {
      background: #f3e8ff;
      color: #7c3aed;
      padding: 0.5rem 0.75rem;
      border-radius: 6px;
      font-size: 0.85rem;
      font-weight: 600;
    }

    .date-info {
      font-size: 0.85rem;
      color: #6b7280;
      line-height: 1.4;
    }

    .status-badge {
      padding: 0.5rem 0.75rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .status-badge.status-terminé {
      background: #dcfce7;
      color: #166534;
    }

    .status-badge.status-en-cours {
      background: #dbeafe;
      color: #1e40af;
    }

    .status-badge.status-en-attente {
      background: #fef3c7;
      color: #92400e;
    }

    .actions-cell {
      min-width: 140px;
      max-width: 160px;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      font-size: 0.9rem;
    }

    .btn-primary {
      background: #F97316;
      color: white;
    }

    .btn-primary:hover {
      background: #ea580c;
      transform: translateY(-1px);
    }

    .btn-outline {
      background: transparent;
      color: #6b7280;
      border: 1px solid #d1d5db;
    }

    .btn-outline:hover {
      background: #f3f4f6;
      color: #374151;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-danger:hover {
      background: #dc2626;
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #6b7280;
    }

    .empty-icon {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: #374151;
      margin: 0 0 0.5rem 0;
    }

    .empty-state p {
      font-size: 1rem;
      margin: 0;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .prestation-header {
        flex-direction: column;
        gap: 1.5rem;
        text-align: center;
      }

      .header-actions {
        flex-wrap: wrap;
        justify-content: center;
      }

      .search-input {
        width: 250px;
      }

      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }

      .stat-card {
        padding: 1.5rem;
      }

      .stat-number {
        font-size: 2rem;
      }

      .prestation-table {
        font-size: 0.85rem;
      }

      .prestation-table th,
      .prestation-table td {
        padding: 1rem 0.5rem;
      }

      .prestation-table th:first-child,
      .prestation-table td:first-child {
        padding-left: 1rem;
      }

      .prestation-table th:last-child,
      .prestation-table td:last-child {
        padding-right: 1rem;
      }
    }

    @media (max-width: 480px) {
      .stats-grid {
        grid-template-columns: 1fr;
      }

      .header-actions {
        flex-direction: column;
        width: 100%;
      }

      .search-input {
        width: 100%;
      }
    }
  `]
})
export class PrestationListComponent implements OnInit {
  prestations: Prestation[] = [];
  filteredPrestations: Prestation[] = [];
  searchTerm = '';
  selectedStatut = '';

  constructor(
    private authService: AuthService,

    private prestationService: PrestationService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadPrestations();
  }

  loadPrestations(): void {
    this.prestationService.getAllPrestations().subscribe({
      next: (data) => {
        this.prestations = data;
        this.filteredPrestations = [...this.prestations];
      },
      error: (error) => {
        console.error('Erreur lors du chargement des prestations:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible de charger les prestations'
        });
      }
    });
  }

  onSearch(): void {
    this.filterPrestations();
  }

  onFilterChange(): void {
    this.filterPrestations();
  }

  filterPrestations(): void {
    let filtered = [...this.prestations];

    // Filter by search term
    if (this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.nomPrestataire.toLowerCase().includes(searchLower) ||
        p.nomPrestation.toLowerCase().includes(searchLower) ||
        (p.description && p.description.toLowerCase().includes(searchLower))
      );
    }

    // Filter by status
    if (this.selectedStatut) {
      filtered = filtered.filter(p => p.statut === this.selectedStatut);
    }

    this.filteredPrestations = filtered;
  }

  getCountByStatut(statut: string): number {
    return this.prestations.filter(p => p.statut === statut).length;
  }

  getRowClass(statut: string): string {
    switch (statut.toLowerCase()) {
      case 'terminé': return 'row-completed';
      case 'en cours': return 'row-in-progress';
      case 'en attente': return 'row-pending';
      default: return '';
    }
  }

  editPrestation(prestation: Prestation): void {
    // TODO: Implement edit functionality
    this.toastService.show({
      type: 'info',
      title: 'Fonctionnalité à venir',
      message: 'La modification des prestations sera bientôt disponible'
    });
  }

  deletePrestation(prestation: Prestation): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer la prestation "${prestation.nomPrestation}" ?`)) {
      this.prestationService.deletePrestation(prestation.id!).subscribe({
        next: () => {
          this.loadPrestations();
          this.toastService.show({
            type: 'success',
            title: 'Prestation supprimée',
            message: 'La prestation a été supprimée avec succès'
          });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Impossible de supprimer la prestation'
          });
        }
      });
    }
  }

  refreshData(): void {
    this.loadPrestations();
    this.toastService.show({
      type: 'success',
      title: 'Données actualisées',
      message: 'Les prestations ont été rechargées'
    });
  }

  formatPrestationName(name: string): string {
    if (!name) return '';

    const words = name.trim().split(/\s+/);
    if (words.length <= 4) return name;

    // Instead of line breaks, use a shorter format for better table display
    if (words.length <= 6) {
      return words.slice(0, 3).join(' ') + '\n' + words.slice(3).join(' ');
    } else {
      // For longer names, show first 3 words, then ellipsis
      return words.slice(0, 3).join(' ') + '\n...';
    }
  }
}