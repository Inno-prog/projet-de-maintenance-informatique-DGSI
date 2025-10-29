import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeItem } from '../../../../core/models/business.models';
import { TypeItemService } from '../../../../core/services/type-item.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-type-item-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="form-overlay" *ngIf="isVisible" (click)="onOverlayClick($event)">
      <div class="form-container">
        <div class="form-header">
          <h2>{{ title }}</h2>
          <button class="btn-close" (click)="closeForm()" aria-label="Fermer">
            <i class="icon-close">×</i>
          </button>
        </div>

        <form (ngSubmit)="onSubmit()" #itemForm="ngForm">
          <div class="form-body">
            <div class="form-row">
              <div class="form-group">
                <label for="numero" class="required">Numéro *</label>
                <input
                  type="text"
                  id="numero"
                  name="numero"
                  class="form-control"
                  [(ngModel)]="formData.numero"
                  required
                  #numero="ngModel"
                  placeholder="Ex: ITEM-001">
                <div class="error-message" *ngIf="numero.invalid && numero.touched">
                  Le numéro est obligatoire
                </div>
              </div>

              <div class="form-group">
                <label for="prestation" class="required">Prestation *</label>
                <input
                  type="text"
                  id="prestation"
                  name="prestation"
                  class="form-control"
                  [(ngModel)]="formData.prestation"
                  required
                  #prestation="ngModel"
                  placeholder="Ex: Maintenance préventive">
                <div class="error-message" *ngIf="prestation.invalid && prestation.touched">
                  La prestation est obligatoire
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="minArticles" class="required">Min Articles *</label>
                <input
                  type="number"
                  id="minArticles"
                  name="minArticles"
                  class="form-control"
                  [(ngModel)]="formData.minArticles"
                  required
                  #minArticles="ngModel"
                  min="0"
                  placeholder="0">
                <div class="error-message" *ngIf="minArticles.invalid && minArticles.touched">
                  Le nombre minimum d'articles est obligatoire
                </div>
              </div>

              <div class="form-group">
                <label for="maxArticles" class="required">Max Articles *</label>
                <input
                  type="number"
                  id="maxArticles"
                  name="maxArticles"
                  class="form-control"
                  [(ngModel)]="formData.maxArticles"
                  required
                  #maxArticles="ngModel"
                  min="1"
                  placeholder="100">
                <div class="error-message" *ngIf="maxArticles.invalid && maxArticles.touched">
                  Le nombre maximum d'articles est obligatoire
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="prixUnitaire" class="required">Prix Unitaire (FCFA) *</label>
              <input
                type="number"
                id="prixUnitaire"
                name="prixUnitaire"
                class="form-control"
                [(ngModel)]="formData.prixUnitaire"
                required
                #prixUnitaire="ngModel"
                min="0"
                step="0.01"
                placeholder="0">
              <div class="error-message" *ngIf="prixUnitaire.invalid && prixUnitaire.touched">
                Le prix unitaire est obligatoire
              </div>
            </div>

            <div class="form-group">
              <label for="oc1Quantity">Quantité OC1</label>
              <input
                type="number"
                id="oc1Quantity"
                name="oc1Quantity"
                class="form-control"
                [(ngModel)]="formData.oc1Quantity"
                #oc1Quantity="ngModel"
                min="0"
                placeholder="0">
            </div>
          </div>

          <div class="form-footer">
            <button type="button" class="btn-cancel" (click)="closeForm()">
              Annuler
            </button>
            <button type="submit" class="btn-save" [disabled]="!itemForm.valid">
              {{ isEditing ? 'Modifier' : 'Créer' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .form-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
    }

    .form-container {
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      width: 100%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
    }

    .form-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      background: #f9fafb;
      border-radius: 12px 12px 0 0;
    }

    .form-header h2 {
      margin: 0;
      color: var(--text-primary);
      font-size: 1.25rem;
      font-weight: 600;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: var(--text-secondary);
      padding: 0.5rem;
      border-radius: 6px;
      transition: background-color 0.2s;
    }

    .btn-close:hover {
      background: #e5e7eb;
    }

    .form-body {
      padding: 1.5rem;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.5rem;
      font-size: 0.875rem;
    }

    .form-group label.required::after {
      content: " *";
      color: #dc2626;
    }

    .form-control {
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.875rem;
      transition: border-color 0.2s, box-shadow 0.2s;
    }

    .form-control:focus {
      outline: none;
      border-color: #1e293b;
      box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
    }

    .form-control.ng-invalid.ng-touched {
      border-color: #dc2626;
    }

    .error-message {
      color: #dc2626;
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .form-footer {
      display: flex;
      justify-content: flex-end;
      gap: 0.75rem;
      padding: 1.5rem;
      border-top: 1px solid #e5e7eb;
      background: #f9fafb;
      border-radius: 0 0 12px 12px;
    }

    .btn-cancel {
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

    .btn-cancel:hover {
      background: #e5e7eb;
    }

    .btn-save {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 0.875rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-save:hover:not(:disabled) {
      transform: translateY(-1px);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
      background: linear-gradient(135deg, #334155, #475569);
    }

    .btn-save:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    @media (max-width: 640px) {
      .form-row {
        grid-template-columns: 1fr;
      }

      .form-footer {
        flex-direction: column-reverse;
      }
    }
  `]
})
export class TypeItemFormComponent implements OnInit {
  @Input() isVisible = false;
  @Input() isEditing = false;
  @Input() itemToEdit: TypeItem | null = null;
  @Output() formClosed = new EventEmitter<void>();
  @Output() itemSaved = new EventEmitter<TypeItem>();

  get title(): string {
    return this.isEditing ? "Modifier le type d'item" : "Ajouter un nouveau type d'item";
  }

  formData: TypeItem = {
    numero: '',
    prestation: '',
    minArticles: 0,
    maxArticles: 0,
    prixUnitaire: 0,
    oc1Quantity: 0
  };

  constructor(
    private typeItemService: TypeItemService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    if (this.itemToEdit) {
      this.formData = { ...this.itemToEdit };
    }
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeForm();
    }
  }

  closeForm(): void {
    this.isVisible = false;
    this.formClosed.emit();
    this.resetForm();
  }

  private resetForm(): void {
    this.formData = {
      numero: '',
      prestation: '',
      minArticles: 0,
      maxArticles: 0,
      prixUnitaire: 0,
      oc1Quantity: 0
    };
  }

  onSubmit(): void {
    if (this.isEditing && this.itemToEdit) {
      this.updateItem();
    } else {
      this.createItem();
    }
  }

  private createItem(): void {
    this.typeItemService.createTypeItem(this.formData).subscribe({
      next: (newItem: TypeItem) => {
        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: `Item ${newItem.numero} créé avec succès`
        });
        this.itemSaved.emit(newItem);
        this.closeForm();
      },
      error: (error: any) => {
        console.error('Error creating item:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la création de l\'item'
        });
      }
    });
  }

  private updateItem(): void {
    if (!this.itemToEdit?.id) return;

    this.typeItemService.updateTypeItem(this.itemToEdit.id, this.formData).subscribe({
      next: (updatedItem: TypeItem) => {
        this.toastService.show({
          type: 'success',
          title: 'Succès',
          message: `Item ${updatedItem.numero} modifié avec succès`
        });
        this.itemSaved.emit(updatedItem);
        this.closeForm();
      },
      error: (error: any) => {
        console.error('Error updating item:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de la modification de l\'item'
        });
      }
    });
  }
}
