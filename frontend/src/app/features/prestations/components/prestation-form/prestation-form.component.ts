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
import { Item } from '../../../../core/models/business.models';
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
  maxQuantityForTrimestre: number = 0;
  existingPrestationsCount: number = 0;

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
      trimestre: [data?.prestation?.trimestre || '', Validators.required],
      dateDebut: [data?.prestation?.dateDebut || '', Validators.required],
      dateFin: [data?.prestation?.dateFin || '', Validators.required],
      statut: [data?.prestation?.statut || 'en attente', Validators.required],
      description: [data?.prestation?.description || '']
    });
  }

  ngOnInit(): void {
    this.loadItems();
    this.loadPrestataires();
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

  setupItemSelectionListener(): void {
    this.prestationForm.get('nomPrestation')?.valueChanges.subscribe(value => {
      if (value) {
        this.selectedItem = this.items.find(item => item.nomItem === value) || null;
        this.updateMaxQuantity();
        this.updateExistingPrestationsCount();
      } else {
        this.selectedItem = null;
        this.maxQuantityForTrimestre = 0;
        this.existingPrestationsCount = 0;
      }
    });

    // Écouter seulement le trimestre
    this.prestationForm.get('trimestre')?.valueChanges.subscribe(value => {
      if (value && this.selectedItem) {
        this.updateExistingPrestationsCount();
      }
    });
  }

  updateMaxQuantity(): void {
    if (this.selectedItem) {
      this.maxQuantityForTrimestre = this.selectedItem.quantiteMaxTrimestre || 0;
    } else {
      this.maxQuantityForTrimestre = 0;
    }
  }

  updateExistingPrestationsCount(): void {
    if (this.selectedItem && this.prestationForm.get('trimestre')?.value) {
      const trimestre = this.prestationForm.get('trimestre')?.value;
      const nomItem = this.selectedItem.nomItem;
      
      // Compter TOUTES les prestations pour cet item et ce trimestre (tous prestataires confondus)
      this.prestationService.getCountByItemAndTrimestre(nomItem, trimestre).subscribe({
        next: (count) => {
          this.existingPrestationsCount = count;
        },
        error: (error) => {
          console.error('Erreur lors de la récupération du nombre de prestations existantes:', error);
          this.existingPrestationsCount = 0;
        }
      });
    } else {
      this.existingPrestationsCount = 0;
    }
  }

  async onSubmit(): Promise<void> {
    if (this.prestationForm.valid) {
      const formValue = this.prestationForm.value;
      // Helper to format date as YYYY-MM-DD (LocalDate expected by backend)
      const formatLocalDate = (d: any) => {
        if (!d) return null;
        const dt = new Date(d);
        if (isNaN(dt.getTime())) return null;
        return dt.toISOString().slice(0, 10);
      };

      const prestationData = {
        ...formValue,
        quantiteItem: 1, // Set to 1 since we're counting prestations, not summing quantities
        nbPrestRealise: 0, // Initialize to 0 on creation
        dateDebut: formatLocalDate(formValue.dateDebut),
        dateFin: formatLocalDate(formValue.dateFin)
      };

      if (this.isEditMode) {
        const confirmed = await this.confirmationService.show({
          title: 'Confirmer la mise à jour',
          message: 'Êtes-vous sûr de vouloir mettre à jour cette prestation ?',
          type: 'warning',
          confirmText: 'Mettre à jour',
          cancelText: 'Annuler'
        });

        if (confirmed) {
          this.prestationService.updatePrestation(this.data.prestation.id!, prestationData).subscribe({
            next: () => {
              this.dialogRef.close(true);
            },
            error: (error: any) => {
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la mise à jour de la prestation' });
              console.error(error);
            }
          });
        }
      } else {
        // VÉRIFICATION PRINCIPALE - Bloquer si la limite est atteinte
        if (!this.isEditMode && this.existingPrestationsCount >= this.maxQuantityForTrimestre) {
          this.toastService.show({
            type: 'error',
            title: 'Limite atteinte',
            message: `Le nombre limite de prestations pour l'item "${this.selectedItem?.nomItem}" est atteint (${this.maxQuantityForTrimestre} prestations maximum par trimestre)`
          });
          return;
        }

        this.prestationService.createPrestation(prestationData).subscribe({
          next: () => {
            this.dialogRef.close(true);
          },
          error: (error: any) => {
            let errorMessage = 'Erreur lors de la création de la prestation';
            
            // Capturer les erreurs backend supplémentaires
            if (error?.error && typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error?.message) {
              errorMessage = error.message;
            }

            // Si le backend renvoie aussi une erreur de limite
            if (errorMessage.toLowerCase().includes('limite') || errorMessage.toLowerCase().includes('maximum')) {
              this.toastService.show({
                type: 'error',
                title: 'Limite atteinte',
                message: errorMessage
              });
            } else {
              this.toastService.show({ type: 'error', title: 'Erreur', message: errorMessage });
            }
            console.error(error);
          }
        });
      }
    } else {
      this.toastService.show({ type: 'error', title: 'Erreur', message: 'Veuillez remplir tous les champs requis' });
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
