import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

import { Equipement } from '../../../../core/models/business.models';
import { EquipementService } from '../../../../core/services/equipement.service';
import { ItemService } from '../../../../core/services/item.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-equipement-form',
  templateUrl: './equipement-form.component.html',
  styleUrls: ['./equipement-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule
  ]
})
export class EquipementFormComponent implements OnInit {
  equipementForm: FormGroup;
  isEditMode: boolean = false;
  equipementId: number | null = null;
  loading: boolean = false;
  submitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private equipementService: EquipementService,
    private itemService: ItemService,
    private toastService: ToastService,
    public dialogRef: MatDialogRef<EquipementFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.equipementForm = this.createForm();
  }

  ngOnInit(): void {
    this.checkEditMode();
  }

  createForm(): FormGroup {
    return this.fb.group({
      nomEquipement: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      typeEquipement: ['', [Validators.required]],
      prixUnitaire: [0, [Validators.required, Validators.min(0)]],
      quantiteDisponible: [1, [Validators.required, Validators.min(1)]]
    });
  }

  checkEditMode(): void {
    this.equipementId = this.data?.equipement?.id;
    this.isEditMode = !!this.equipementId;

    if (this.isEditMode && this.equipementId) {
      this.loadEquipement(this.equipementId);
    }
  }

  loadEquipement(id: number): void {
    this.loading = true;
    this.equipementService.getEquipementById(id).subscribe({
      next: (equipement) => {
      this.equipementForm.patchValue({
          nomEquipement: equipement.nomEquipement,
          description: equipement.description || '',
          typeEquipement: equipement.typeEquipement,
          prixUnitaire: equipement.prixUnitaire,
          quantiteDisponible: equipement.quantiteDisponible
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erreur lors du chargement de l\'équipement:', error);
        this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du chargement de l\'équipement' });
        this.loading = false;
        this.dialogRef.close();
      }
    });
  }



  onSubmit(): void {
    if (this.equipementForm.valid) {
      this.submitting = true;

      const formValue = this.equipementForm.value;
      const equipement: Omit<Equipement, 'id'> = {
        nomEquipement: formValue.nomEquipement,
        description: formValue.description || undefined,
        typeEquipement: formValue.typeEquipement,
        prixUnitaire: formValue.prixUnitaire,
        quantiteDisponible: formValue.quantiteDisponible,
        statut: 'ACTIF',
        prestations: []
      };

      const operation = this.isEditMode && this.equipementId
        ? this.equipementService.updateEquipement(this.equipementId, equipement)
        : this.equipementService.createEquipement(equipement);

      operation.subscribe({
        next: (result) => {
          this.toastService.show({ type: 'success', title: 'Succès', message: this.isEditMode ? 'Équipement modifié avec succès' : 'Équipement créé avec succès' });
          this.submitting = false;
          this.dialogRef.close(true);
        },
        error: (error) => {
          console.error('Erreur lors de la sauvegarde:', error);
          let errorMessage = 'Erreur lors de la sauvegarde de l\'équipement';



          this.toastService.show({ type: 'error', title: 'Erreur', message: errorMessage });
          this.submitting = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }



  markFormGroupTouched(): void {
    Object.keys(this.equipementForm.controls).forEach(key => {
      const control = this.equipementForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.equipementForm.get(fieldName);
    if (control?.hasError('required')) {
      return 'Ce champ est obligatoire';
    }
    if (control?.hasError('minlength')) {
      return `Minimum ${control.errors?.['minlength']?.requiredLength} caractères`;
    }
    if (control?.hasError('maxlength')) {
      return `Maximum ${control.errors?.['maxlength']?.requiredLength} caractères`;
    }
    if (control?.hasError('min')) {
      return 'La valeur doit être positive';
    }

    return '';
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
