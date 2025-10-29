import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrdreCommandeService } from '../../../../core/services/ordre-commande.service';
import { OrdreCommande } from '../../../../core/models/business.models';
import { OrdreCommandeListComponent } from '../ordre-commande-list/ordre-commande-list.component';

@Component({
  selector: 'app-ordre-commande-prestataire',
  standalone: true,
  imports: [CommonModule, FormsModule, OrdreCommandeListComponent],
  template: `
    <div class="container mt-4">
      <h2>Ordres de Commande par Prestataire</h2>

      <!-- Sélection du prestataire -->
      <div class="row mb-4">
        <div class="col-md-6">
          <select class="form-control" [(ngModel)]="prestataireSelectionne" (change)="chargerOrdresPrestataire()">
            <option value="">Sélectionnez un prestataire</option>
            <option *ngFor="let prestataire of prestataires" [value]="prestataire">
              {{ prestataire }}
            </option>
          </select>
        </div>
      </div>

      <!-- Statistiques du prestataire -->
      <div *ngIf="statistiquesPrestataire" class="row mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary">
            <div class="card-body">
              <h5 class="card-title">{{ statistiquesPrestataire.totalOrdres }}</h5>
              <p class="card-text">Ordres de commande</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success">
            <div class="card-body">
              <h5 class="card-title">{{ statistiquesPrestataire.totalPrestations }}</h5>
              <p class="card-text">Prestations totales</p>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning">
            <div class="card-body">
              <h5 class="card-title">{{ statistiquesPrestataire.montantTotal | currency:'EUR' }}</h5>
              <p class="card-text">Montant total</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Liste des ordres du prestataire -->
      <div *ngIf="ordresPrestataire.length > 0">
        <h4>Ordres de {{ prestataireSelectionne }}</h4>
        <app-ordre-commande-list [ordres]="ordresPrestataire"></app-ordre-commande-list>
      </div>

      <!-- Vue groupée de tous les prestataires -->
      <div *ngIf="!prestataireSelectionne">
        <h4>Tous les prestataires</h4>
        <div *ngFor="let prestataire of Object.keys(ordresGroupes)" class="mb-4">
          <h5 class="text-primary">{{ prestataire }}</h5>
          <app-ordre-commande-list [ordres]="ordresGroupes[prestataire]"></app-ordre-commande-list>
        </div>
      </div>
    </div>
  `
})
export class OrdreCommandePrestataireComponent implements OnInit {
  ordresGroupes: { [prestataire: string]: OrdreCommande[] } = {};
  ordresPrestataire: OrdreCommande[] = [];
  prestataires: string[] = [];
  prestataireSelectionne: string = '';
  statistiquesPrestataire: any = null;

  constructor(private ordreCommandeService: OrdreCommandeService) {}

  ngOnInit() {
    this.chargerOrdresGroupes();
    this.chargerPrestataires();
  }

  chargerOrdresGroupes() {
    this.ordreCommandeService.getOrdresCommandeGroupesParPrestataire().subscribe({
      next: (ordresGroupes: { [prestataire: string]: OrdreCommande[] }) => {
        this.ordresGroupes = ordresGroupes;
        console.log('✅ Ordres groupés chargés:', Object.keys(ordresGroupes).length, 'prestataires');
      },
      error: (error: any) => console.error('❌ Erreur chargement ordres groupés:', error)
    });
  }

  chargerPrestataires() {
    this.ordreCommandeService.getAllPrestataires().subscribe({
      next: (prestataires) => this.prestataires = prestataires,
      error: (error) => console.error('❌ Erreur chargement prestataires:', error)
    });
  }

  chargerOrdresPrestataire() {
    if (this.prestataireSelectionne) {
      // Use the grouped orders to filter by prestataire
      this.ordresPrestataire = this.ordresGroupes[this.prestataireSelectionne] || [];
      this.chargerStatistiquesPrestataire();
    }
  }

  chargerStatistiquesPrestataire() {
    this.ordreCommandeService.getStatistiquesParPrestataire(this.prestataireSelectionne).subscribe({
      next: (stats) => this.statistiquesPrestataire = stats,
      error: (error) => console.error('❌ Erreur chargement statistiques:', error)
    });
  }

  // Pour utiliser Object.keys dans le template
  Object = Object;
}
