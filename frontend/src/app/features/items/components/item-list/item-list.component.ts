import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeItemService } from '../../../../core/services/type-item.service';
import { TypeItem } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-item-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
        <div class="header-section">
          <h1>Gestion des Équipements</h1>
          <p>Gérez les types d'équipements et leurs caractéristiques</p>
        </div>

        <div class="content-section">
          <div class="table-container" *ngIf="items.length > 0; else noData">
            <table class="items-table">
              <thead>
                <tr>
                  <th>N°</th>
                  <th>Prestation</th>
                  <th>Lot</th>
                  <th>Min Articles</th>
                  <th>Max Articles</th>
                  <th>Prix Unitaire</th>
                  <th>Quantité OC1</th>
                  <th>Montant OC1</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let item of items">
                  <td>{{ item.numero }}</td>
                  <td>{{ item.prestation }}</td>
                  <td>{{ item.lot }}</td>
                  <td>{{ item.minArticles }}</td>
                  <td>{{ item.maxArticles }}</td>
                  <td>{{ item.prixUnitaire }} €</td>
                  <td>{{ item.oc1Quantity || 0 }}</td>
                  <td>{{ (item.prixUnitaire * (item.oc1Quantity || 0)) }} €</td>
                </tr>
              </tbody>
            </table>
          </div>

          <ng-template #noData>
            <div class="no-data">
              <p>Aucun équipement trouvé</p>
            </div>
          </ng-template>
        </div>
      </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .header-section {
      margin-bottom: 2rem;
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
      padding: 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
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
  `]
})
export class ItemListComponent implements OnInit {
  items: TypeItem[] = [];

  constructor(
    private typeItemService: TypeItemService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.loadItems();
  }

  private loadItems(): void {
    this.typeItemService.getAllTypeItems().subscribe({
      next: (items) => {
        this.items = items;
      },
      error: (error) => {
        console.error('Error loading items:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors du chargement des équipements'
        });
      }
    });
  }
}