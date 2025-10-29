import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EquipementService } from '../../../../core/services/equipement.service';
import { EquipementFormComponent } from '../equipement-form/equipement-form.component';
import { Equipement } from '../../../../core/models/business.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-equipement-dashboard',
  templateUrl: './equipement-dashboard.component.html',
  styleUrls: ['./equipement-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, MatDialogModule]
})
export class EquipementDashboardComponent implements OnInit, OnDestroy {
  stats = {
    totalEquipements: 0,
    equipementsActifs: 0,
    equipementsEnMaintenance: 0,
    utilisationsTotales: 0
  };

  loading = true;
  private subscriptions: Subscription[] = [];

  constructor(private equipementService: EquipementService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.loadStats();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private loadStats(): void {
    this.loading = true;

    const sub = this.equipementService.getAllEquipements().subscribe({
      next: (equipements: Equipement[]) => {
        this.stats.totalEquipements = equipements.length;
        this.stats.equipementsActifs = equipements.filter(e => e.statut === 'ACTIF').length;
        this.stats.equipementsEnMaintenance = equipements.filter(e => e.statut === 'EN_MAINTENANCE').length;
        // Calculate total utilisations based on prestations linked to each equipement
        this.stats.utilisationsTotales = equipements.reduce((total, e) => total + (e.prestations ? e.prestations.length : 0), 0);
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Erreur lors du chargement des statistiques des équipements:', error);
        this.loading = false;
      }
    });

    this.subscriptions.push(sub);
  }

  creerNouvelEquipement(): void {
    const dialogRef = this.dialog.open(EquipementFormComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadStats();
      }
    });
  }
}
