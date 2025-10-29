import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { PrestationService, Prestation } from '../../../../core/services/prestation.service';
import { ItemService } from '../../../../core/services/item.service';
import { Item, Equipement } from '../../../../core/models/business.models';
import { ToastService } from '../../../../core/services/toast.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { UserService } from '../../../../core/services/user.service';
import { User } from '../../../../core/models/auth.models';

@Component({
  selector: 'app-prestation-form',
  templateUrl: './prestation-form.component.html',
  styleUrls: ['./prestation-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule
  ]
})
export class PrestationFormComponent implements OnInit {
  prestationForm: FormGroup;
  isEditMode = false;
  items: Item[] = [];
  prestataires: User[] = [];
  selectedItem: Item | null = null;
  equipements: Equipement[] = [];
  selectedEquipements: Equipement[] = [];
  maxQuantityForTrimestre: number = 0;
  existingPrestationsCount: number = 0;
  showForm = false;

  statutOptions = [
    { value: 'en cours', label: 'En cours' },
    { value: 'en attente', label: 'En attente' },
    { value: 'terminé', label: 'Terminé' }
  ];

  trimestreOptions = [
    { value: 'trimestre 1', label: 'Trimestre 1' },
    { value: 'trimestre 2', label: 'Trimestre 2' },
    { value: 'trimestre 3', label: 'Trimestre 3' },
    { value: 'trimestre 4', label: 'Trimestre 4' }
  ];

  constructor(
    private fb: FormBuilder,
    private prestationService: PrestationService,
    private itemService: ItemService,
    private userService: UserService,
    private toastService: ToastService,
    private confirmationService: ConfirmationService,
    public dialogRef: MatDialogRef<PrestationFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.isEditMode = !!data?.prestation;
    this.prestationForm = this.fb.group({
      nomPrestataire: [data?.prestation?.nomPrestataire || '', Validators.required],
      nomPrestation: [data?.prestation?.nomPrestation || '', Validators.required],
      montantPrest: [data?.prestation?.montantPrest || '', [Validators.required, Validators.min(0)]],
      equipementsUtilises: [data?.prestation?.equipementsUtilises || [], []],
      trimestre: [data?.prestation?.trimestre || '', Validators.required],
      dateDebut: [data?.prestation?.dateDebut || '', Validators.required],
      dateFin: [data?.prestation?.dateFin || '', Validators.required],
      statut: [data?.prestation?.statut || 'en attente', Validators.required],
      description: [data?.prestation?.description || '']
    });
  }

  ngOnInit(): void {
    this.showForm = true;
    this.loadItems();
    this.loadPrestataires();
    this.loadEquipements();
    this.setupItemSelectionListener();
  }

  loadItems(): void {
    this.itemService.getAllItems().subscribe({
      next: (items) => {
        this.items = items;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des items:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des items' });
        }
      }
    });
  }

  loadPrestataires(): void {
    this.userService.getAllUsers().subscribe({
      next: (users) => {
        this.prestataires = users;
      },
      error: (error) => {
        if (error.status !== 401) {
          console.error('Erreur lors du chargement des prestataires:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement des prestataires' });
        }
      }
    });
  }

  loadEquipements(): void {
    // TODO: Implement equipement service call
    // For now, we'll leave this empty as the service might not exist yet
    this.equipements = [];
  }

  onEquipementSelectionChange(event: any): void {
    const selectedIds = Array.from(event.target.selectedOptions, (option: any) => option.value);
    this.selectedEquipements = this.equipements.filter(eq => selectedIds.includes(eq.id));
  }

  setupItemSelectionListener(): void {
    this.prestationForm.get('nomPrestation')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedItem = this.items.find(item => item.nomItem === value) || null;
        this.updateMaxQuantity();
        this.updateExistingPrestationsCount(); // Mettre à jour le compteur
        // Pré-remplir automatiquement le montant avec le prix de l'item sélectionné
        if (this.selectedItem) {
          this.prestationForm.patchValue({ montantPrest: this.selectedItem.prix });
        }
      } else {
        this.selectedItem = null;
        this.maxQuantityForTrimestre = 0;
        this.existingPrestationsCount = 0;
        // Remettre le montant à vide si aucun item n'est sélectionné
        this.prestationForm.patchValue({ montantPrest: '' });
      }
    });

    // Supprimer l'écouteur de trimestre car on ne s'en sert plus
  }

  updateMaxQuantity(): void {
    if (this.selectedItem) {
      this.maxQuantityForTrimestre = this.selectedItem.quantiteMaxTrimestre || 0;
    } else {
      this.maxQuantityForTrimestre = 0;
    }
  }

  updateExistingPrestationsCount(): void {
    if (this.selectedItem) {
      const nomItem = this.selectedItem.nomItem;
      console.log(`🔍 Mise à jour compteur pour: ${nomItem}`);
      
      this.prestationService.getCountByItem(nomItem).subscribe({
        next: (count) => {
          this.existingPrestationsCount = count;
          this.maxQuantityForTrimestre = this.selectedItem?.quantiteMaxTrimestre || 0;
          console.log(`✅ Compteur mis à jour: ${count}/${this.maxQuantityForTrimestre}`);
        },
        error: (error) => {
          console.error('❌ Erreur compteur:', error);
          // Mettre à jour avec des valeurs par défaut
          this.existingPrestationsCount = 0;
          this.maxQuantityForTrimestre = this.selectedItem?.quantiteMaxTrimestre || 0;
        }
      });
    } else {
      this.existingPrestationsCount = 0;
      this.maxQuantityForTrimestre = 0;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.prestationForm.valid) {
      console.log('🔄 Soumission du formulaire...');
      
      // Vérification frontend de la limite
      if (!this.isEditMode && this.existingPrestationsCount >= this.maxQuantityForTrimestre) {
        const message = `Limite atteinte: ${this.existingPrestationsCount}/${this.maxQuantityForTrimestre} prestations`;
        console.warn('🚫 ' + message);
        this.toastService.show({
          type: 'error',
          title: 'Limite atteinte',
          message
        });
        return;
      }

      try {
        const result = await this.prestationService.createPrestation(
          this.preparePrestationData()
        ).toPromise();
        
        console.log('✅ Succès:', result);
        this.dialogRef.close(true);
        
      } catch (error: any) {
        console.error('❌ Erreur soumission:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: error.message || 'Erreur lors de la création'
        });
      }
    }
  }

  private preparePrestationData(): any {
    const formValue = this.prestationForm.value;

    const formatDate = (date: any) => {
      if (!date) return null;
      const d = new Date(date);
      return d.toISOString().split('T')[0]; // YYYY-MM-DD
    };

    return {
      ...formValue,
      nbPrestRealise: 0,
      equipementsUtilises: this.selectedEquipements.map(eq => ({ id: eq.id })),
      dateDebut: formatDate(formValue.dateDebut),
      dateFin: formatDate(formValue.dateFin)
    };
  }

  onCancel(): void {
    this.showForm = false;
    this.dialogRef.close();
  }
}
