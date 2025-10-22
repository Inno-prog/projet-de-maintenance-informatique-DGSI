import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ItemService } from '../../../../core/services/item.service';
import { Item } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ItemFormComponent } from '../item-form/item-form.component';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule, FormsModule, ItemFormComponent],
  template: `
    <div class="container">
        <div class="header-section">
          <h1>Gestion des items de prestation</h1>
          <p>Choisissez vos items sr lesquels vous réalisez votre prestation</p>
        </div>

        <!-- Statistics Cards -->
        <div class="stats-section" *ngIf="items.length > 0">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="icon-items">📦</i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getTotalItems() }}</div>
                <div class="stat-label">Total Items</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="icon-money">💰</i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getAveragePrice() | number:'1.0-0' }} FCFA</div>
                <div class="stat-label">Prix Moyen</div>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon">
                <i class="icon-value">💎</i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getTotalValue() | number:'1.0-0' }} FCFA</div>
                <div class="stat-label">Valeur Totale</div>
              </div>
            </div>


            <div class="stat-card">
              <div class="stat-icon">
                <i class="icon-services">🔧</i>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getUniquePrestationsCount() }}</div>
                <div class="stat-label">Prestations</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Filters Section -->
        <div class="filters-section" *ngIf="items.length > 0">
          <div class="filters-grid">

            <div class="filter-group">
              <label for="search-filter">Rechercher:</label>
              <input id="search-filter" type="text" class="filter-input" [(ngModel)]="searchTerm" (input)="applyFilters()" placeholder="ID, nom, description...">
            </div>

            <div class="filter-actions">
              <button class="btn-clear" (click)="clearFilters()">Effacer</button>
            </div>
          </div>
        </div>

        <div class="content-section">
          <div class="table-header">
            <button class="btn-add" (click)="onAdd()">
              <i class="icon-add">+</i>
              Ajouter un Item
            </button>
          </div>

          <div class="loading-container" *ngIf="loading; else tableContent">
            <div class="loading-spinner">
              <div class="spinner"></div>
              <p>Chargement des items...</p>
            </div>
          </div>

          <ng-template #tableContent>
            <div class="table-container" *ngIf="filteredItems.length > 0; else noData">
              <table class="items-table">
              <thead>
                <tr>
                  <th>ID Item</th>
                  <th>Nom Item</th>
                  <th>Description</th>
                  <th>Prix</th>
                  <th>Qté Equip Défini</th>
                  <th>Quantité Max Trimestre</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of filteredItems">
                  <td>{{ item.idItem }}</td>
                  <td class="prestation-name">{{ formatPrestationName(item.nomItem) }}</td>
                  <td class="description-cell">{{ formatDescription(item.description) || '-' }}</td>
                  <td>{{ item.prix }} FCFA</td>
                  <td>{{ item.qteEquipDefini }}</td>
                  <td>{{ item.quantiteMaxTrimestre }}</td>
                  <td>
                    <div class="action-buttons">
                      <button class="btn-edit" (click)="onEdit(item)" title="Modifier">
                        <i class="icon-edit">✏️</i>
                      </button>
                      <button class="btn-delete" (click)="onDelete(item)" title="Supprimer">
                        <i class="icon-delete">🗑️</i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noData>
            <div class="no-data">
              <p>Aucun item trouvé</p>
            </div>
          </ng-template>
          </ng-template>
        </div>

        <!-- Item Form Modal -->
        <app-item-form
          [isVisible]="showForm"
          [isEditing]="isEditing"
          [itemToEdit]="itemToEdit"
          (formClosed)="onFormClosed()"
          (itemSaved)="onItemSaved()">
        </app-item-form>
      </div>
    `,
  styles: [`
    .container {
      max-width: 100vw;
      margin: 0 auto;
      padding: 1.5rem;
      width: 100%;
    }

    .header-section {
      margin-bottom: 1.5rem;
    }

    .header-section h1 {
      font-size: 2rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
    }

    .header-section p {
      color: var(--text-secondary);
      font-size: 1rem;
    }

    .content-section {
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow);
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
    }

    .items-table {
      width: 100%;
      border-collapse: collapse;
    }

    .items-table th,
    .items-table td {
      padding: 0.75rem 0.5rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      font-size: 0.875rem;
    }

    .items-table th:nth-child(1),
    .items-table td:nth-child(1) {
      width: 8%;
      min-width: 80px;
    }

    .items-table th:nth-child(2),
    .items-table td:nth-child(2) {
      width: 20%;
      min-width: 150px;
    }

    .items-table th:nth-child(3),
    .items-table td:nth-child(3) {
      width: 25%;
      min-width: 200px;
    }

    .items-table th:nth-child(4),
    .items-table td:nth-child(4) {
      width: 12%;
      min-width: 100px;
    }

    .items-table th:nth-child(5),
    .items-table td:nth-child(5) {
      width: 12%;
      min-width: 100px;
    }

    .items-table th:nth-child(6),
    .items-table td:nth-child(6) {
      width: 15%;
      min-width: 120px;
    }

    .items-table th {
      background-color: #f9fafb;
      font-weight: 600;
      color: var(--text-primary);
      border-bottom: 2px solid #e5e7eb;
    }

    .items-table tbody tr:hover {
      background-color: #f9fafb;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: var(--text-secondary);
    }

    .no-data p {
      font-size: 1.1rem;
      margin: 0;
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

    .description-cell {
      white-space: pre-line;
      line-height: 1.4;
      word-wrap: break-word;
      max-width: 200px;
    }

    /* Statistics Section */
    .stats-section {
      margin-bottom: 1.5rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .stat-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-icon {
      font-size: 2rem;
      opacity: 0.8;
    }

    .stat-content {
      flex: 1;
    }

    .stat-number {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 0.25rem;
    }

    .stat-label {
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
    }

    /* Filters Section */
    .filters-section {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--shadow);
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
      align-items: end;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .filter-group label {
      font-weight: 600;
      color: var(--text-primary);
      font-size: 0.875rem;
    }

    .filter-select,
    .filter-input {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: border-color 0.2s;
    }

    .filter-select:focus,
    .filter-input:focus {
      outline: none;
      border-color: #3b82f6;
    }

    .filter-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-clear {
      padding: 0.75rem 1.5rem;
      background: #f3f4f6;
      color: var(--text-primary);
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .btn-clear:hover {
      background: #e5e7eb;
    }

    /* Table Header */
    .table-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }

    .btn-add {
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      color: white;
      border: none;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-add:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
    }

    .icon-add {
      font-size: 1rem;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      gap: 0.5rem;
      justify-content: center;
    }

    .btn-edit,
    .btn-delete {
      background: none;
      border: none;
      padding: 0.5rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background-color 0.2s, transform 0.1s;
    }

    .btn-edit {
      background: #dbeafe;
      color: #1d4ed8;
    }

    .btn-edit:hover {
      background: #bfdbfe;
      transform: scale(1.1);
    }

    .btn-delete {
      background: #fee2e2;
      color: #dc2626;
    }

    .btn-delete:hover {
      background: #fecaca;
      transform: scale(1.1);
    }

    .icon-edit,
    .icon-delete {
      font-size: 1rem;
    }

    /* Table Actions Column */
    .items-table th:last-child,
    .items-table td:last-child {
      width: 120px;
      min-width: 120px;
    }

    /* Loading Styles */
    .loading-container {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 3rem;
      background: white;
      border-radius: 12px;
      box-shadow: var(--shadow);
    }

    .loading-spinner {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid #f3f4f6;
      border-top: 4px solid #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .loading-spinner p {
      color: var(--text-secondary);
      font-size: 0.875rem;
      margin: 0;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `]
})
export class ItemListComponent implements OnInit {
  items: Item[] = [];
  filteredItems: Item[] = [];

  // Filter properties
   searchTerm: string = '';

  // Form properties
  showForm = false;
  isEditing = false;
  itemToEdit: Item | null = null;

  // Loading state
  loading = false;

  constructor(
    private itemService: ItemService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.loading = true;
    this.itemService.getAllItems().subscribe({
      next: (items: Item[]) => {
        this.items = items;
        this.filteredItems = [...items];
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading items:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des items'
        });
        this.loading = false;
      }
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

  formatDescription(description: string | undefined): string {
    if (!description) return '';

    const words = description.trim().split(/\s+/);
    if (words.length <= 3) return description;

    // Break after 3 or 4 words
    if (words.length <= 7) {
      return words.slice(0, 4).join(' ') + '\n' + words.slice(4).join(' ');
    } else {
      // For longer descriptions, break after 3 words and add ellipsis
      return words.slice(0, 3).join(' ') + '\n' + words.slice(3, 6).join(' ') + '\n...';
    }
  }

  // Statistics methods
  getTotalItems(): number {
    return this.filteredItems.length;
  }

  getAveragePrice(): number {
    if (this.filteredItems.length === 0) return 0;
    const total = this.filteredItems.reduce((sum, item) => sum + item.prix, 0);
    return total / this.filteredItems.length;
  }

  getTotalValue(): number {
    return this.filteredItems.reduce((sum, item) => {
      const quantity = item.qteEquipDefini;
      return sum + (item.prix * quantity);
    }, 0);
  }


  getUniquePrestationsCount(): number {
    const noms = new Set(this.filteredItems.map(item => item.nomItem));
    return noms.size;
  }

  // Filter methods

  getUniquePrestations(): string[] {
    const noms = new Set(this.items.map(item => item.nomItem));
    return Array.from(noms).sort();
  }

  applyFilters(): void {
    this.filteredItems = this.items.filter(item => {
      const matchesSearch = !this.searchTerm ||
        (item.idItem && item.idItem.toString().toLowerCase().includes(this.searchTerm.toLowerCase())) ||
        item.nomItem.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(this.searchTerm.toLowerCase()));

      return matchesSearch;
    });
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filteredItems = [...this.items];
  }

  // CRUD methods
  onEdit(item: Item): void {
    this.isEditing = true;
    this.itemToEdit = item;
    this.showForm = true;
  }

  async onDelete(item: Item): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'item',
      message: `Êtes-vous sûr de vouloir supprimer l'item ${item.nomItem} ?`,
      type: 'danger',
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.itemService.deleteItem(item.id!).subscribe({
        next: () => {
          this.loadItems();
        },
        error: (error: any) => {
          console.error('Error deleting item:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de la suppression de l\'item'
          });
        }
      });
    }
  }

  onAdd(): void {
    this.isEditing = false;
    this.itemToEdit = null;
    this.showForm = true;
  }

  onFormClosed(): void {
    this.showForm = false;
    this.isEditing = false;
    this.itemToEdit = null;
  }

  onItemSaved(): void {
    this.loadItems(); // Refresh the list
    this.showForm = false;
    this.isEditing = false;
    this.itemToEdit = null;
  }

}