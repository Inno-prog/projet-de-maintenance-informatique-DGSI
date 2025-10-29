import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { Equipement } from '../../../../core/models/business.models';
import { EquipementService } from '../../../../core/services/equipement.service';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { EquipementFormComponent } from '../equipement-form/equipement-form.component';

@Component({
  selector: 'app-equipement-list',
  templateUrl: './equipement-list.component.html',
  styleUrls: ['./equipement-list.component.css'],
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, MatDialogModule]
})
export class EquipementListComponent implements OnInit {
  equipements: Equipement[] = [];
  filteredEquipements: Equipement[] = [];
  searchTerm: string = '';
  selectedType: string = '';
  loading: boolean = false;

  types: string[] = [];

  constructor(
    private equipementService: EquipementService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadEquipements();
  }

  loadEquipements(): void {
    this.loading = true;
    this.equipementService.getAllEquipements().subscribe({
      next: (data) => {
        this.equipements = data;
        this.filteredEquipements = data;
        this.extractFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement des équipements:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des équipements' });
        this.loading = false;
      }
    });
  }

  extractFilters(): void {
    this.types = [...new Set(this.equipements.map(e => e.typeEquipement))].filter(Boolean);
  }

  onSearch(): void {
    this.applyFilters();
  }

  onTypeChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = this.equipements;

    if (this.searchTerm.trim()) {
      filtered = filtered.filter(equipement =>
        equipement.nomEquipement.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        equipement.description?.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    if (this.selectedType) {
      filtered = filtered.filter(equipement => equipement.typeEquipement === this.selectedType);
    }

    this.filteredEquipements = filtered;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedType = '';
    this.filteredEquipements = this.equipements;
  }

  async deleteEquipement(equipement: Equipement): Promise<void> {
    if (!equipement.id) return;

    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'équipement',
      message: `Êtes-vous sûr de vouloir supprimer l'équipement "${equipement.nomEquipement}" ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      type: 'danger'
    });

    if (confirmed) {
      this.equipementService.deleteEquipement(equipement.id).subscribe({
        next: () => {
          this.toastService.show({ type: 'success', title: 'Succès', message: 'Équipement supprimé avec succès' });
          this.loadEquipements();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de l\'équipement' });
        }
      });
    }
  }

  getTotalValue(): number {
    return this.filteredEquipements.reduce((total, equipement) =>
      total + (equipement.prixUnitaire * equipement.quantiteDisponible), 0);
  }

  getTotalQuantity(): number {
    return this.filteredEquipements.reduce((total, equipement) =>
      total + equipement.quantiteDisponible, 0);
  }

  creerNouvelEquipement(): void {
    const dialogRef = this.dialog.open(EquipementFormComponent, {
      width: '800px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadEquipements();
      }
    });
  }
}
