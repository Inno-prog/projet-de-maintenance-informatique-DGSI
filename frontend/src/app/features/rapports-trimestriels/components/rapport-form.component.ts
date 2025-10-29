import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FileUploadService } from '../../../core/services/file-upload.service';
import { ToastService } from '../../../core/services/toast.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-rapport-form',
  standalone: true,
  template: `
    <div class="container">
        <div class="page-header">
          <h1>Soumettre Rapport Trimestriel</h1>
          <p>Soumettez votre rapport et vos fiches de prestations</p>
        </div>

        <form [formGroup]="rapportForm" (ngSubmit)="onSubmit()">
          <div class="form-sections">
            
            <!-- Informations générales -->
            <div class="form-section">
              <h2>Informations Générales</h2>
              <div class="form-grid">
                <div class="form-group">
                  <label for="trimestre">Trimestre</label>
                  <select id="trimestre" formControlName="trimestre" class="form-control">
                    <option value="">Sélectionner...</option>
                    <option value="T1">T1 - Premier trimestre</option>
                    <option value="T2">T2 - Deuxième trimestre</option>
                    <option value="T3">T3 - Troisième trimestre</option>
                    <option value="T4">T4 - Quatrième trimestre</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="annee">Année</label>
                  <input type="number" id="annee" formControlName="annee" class="form-control" 
                         [value]="currentYear" min="2020" max="2030">
                </div>

                <div class="form-group">
                  <label for="prestataire">Prestataire</label>
                  <input type="text" id="prestataire" formControlName="prestataire" class="form-control" readonly>
                </div>

                <div class="form-group">
                  <label for="nombrePrestations">Nombre de Prestations</label>
                  <input type="number" id="nombrePrestations" formControlName="nombrePrestations" 
                         class="form-control" min="0">
                </div>
              </div>
            </div>

            <!-- Upload de fichiers -->
            <div class="form-section">
              <h2>Documents</h2>
              
              <div class="upload-section">
                <h3>Rapport Trimestriel (PDF)</h3>
                <input type="file" (change)="onRapportSelected($event)" accept=".pdf" class="file-input">
                <div class="file-info" *ngIf="rapportFile">
                  <i class="fas fa-file-pdf"></i>
                  {{ rapportFile.name }} ({{ formatFileSize(rapportFile.size) }})
                </div>
              </div>

              <div class="upload-section">
                <h3>Fiches de Prestations (PDF)</h3>
                <input type="file" (change)="onFichesSelected($event)" accept=".pdf" multiple class="file-input">
                <div class="files-list" *ngIf="fichesFiles.length > 0">
                  <div class="file-item" *ngFor="let file of fichesFiles">
                    <i class="fas fa-file-pdf"></i>
                    {{ file.name }} ({{ formatFileSize(file.size) }})
                    <button type="button" class="remove-file" (click)="removeFile(file)">
                      <i class="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Résumé -->
            <div class="form-section">
              <h2>Résumé</h2>
              <div class="form-group">
                <label for="commentaires">Commentaires Additionnels</label>
                <textarea id="commentaires" formControlName="commentaires" 
                          class="form-control" rows="4" 
                          placeholder="Commentaires sur les prestations du trimestre..."></textarea>
              </div>
            </div>
          </div>

          <div class="form-actions">
            <button type="button" class="btn btn-secondary" (click)="annuler()">
              Annuler
            </button>
            <button type="submit" class="btn btn-primary" [disabled]="rapportForm.invalid || loading">
              {{ loading ? 'Soumission...' : 'Soumettre Rapport' }}
            </button>
          </div>
        </form>
      </div>
  `,
  styles: [`
    .form-sections {
      display: flex;
      flex-direction: column;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .form-section {
      background: white;
      padding: 1.5rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .form-section h2 {
      margin: 0 0 1rem 0;
      color: #1f2937;
      font-size: 1.25rem;
    }

    .form-section h3 {
      margin: 0 0 0.75rem 0;
      color: #374151;
      font-size: 1rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
    }

    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #374151;
    }

    .form-control {
      padding: 0.75rem;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      font-size: 1rem;
    }

    .form-control:focus {
      outline: none;
      border-color: #1e293b;
      box-shadow: 0 0 0 3px rgba(30, 41, 59, 0.1);
    }

    .upload-section {
      margin-bottom: 1.5rem;
    }

    .file-input {
      padding: 1rem;
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      background: #f9fafb;
      cursor: pointer;
      transition: border-color 0.2s;
      width: 100%;
    }

    .file-input:hover {
      border-color: #1e293b;
    }

    .file-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-top: 0.5rem;
      padding: 0.75rem;
      background: #f0f9ff;
      border-radius: 6px;
      color: #0369a1;
    }

    .files-list {
      margin-top: 0.5rem;
    }

    .file-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem;
      background: #f0f9ff;
      border-radius: 6px;
      margin-bottom: 0.5rem;
      color: #0369a1;
    }

    .remove-file {
      background: none;
      border: none;
      color: #ef4444;
      cursor: pointer;
      padding: 0.25rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #334155, #475569);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
    }

    .btn-primary:disabled {
      background: #9ca3af;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f3f4f6;
      color: #374151;
      border: 1px solid #d1d5db;
    }

    .btn-secondary:hover {
      background: #e5e7eb;
    }
  `]
})
export class RapportFormComponent implements OnInit {
  rapportForm: FormGroup;
  rapportFile: File | null = null;
  fichesFiles: File[] = [];
  loading = false;
  currentYear = new Date().getFullYear();

  constructor(
    private formBuilder: FormBuilder,
    private fileUploadService: FileUploadService,
    private toastService: ToastService,
    private authService: AuthService
  ) {
    this.rapportForm = this.formBuilder.group({
      trimestre: ['', Validators.required],
      annee: [this.currentYear, Validators.required],
      prestataire: ['', Validators.required],
      nombrePrestations: [0, [Validators.required, Validators.min(0)]],
      commentaires: ['']
    });
  }

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.rapportForm.patchValue({
        prestataire: user.nom
      });
    }
  }

  onRapportSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.rapportFile = file;
    } else {
      this.toastService.show({
        type: 'error',
        title: 'Fichier invalide',
        message: 'Seuls les fichiers PDF sont acceptés'
      });
    }
  }

  onFichesSelected(event: any): void {
    const files = Array.from(event.target.files) as File[];
    const pdfFiles = files.filter(file => file.type === 'application/pdf');
    
    this.fichesFiles = [...this.fichesFiles, ...pdfFiles];
    
    if (pdfFiles.length !== files.length) {
      this.toastService.show({
        type: 'warning',
        title: 'Fichiers filtrés',
        message: 'Seuls les fichiers PDF ont été ajoutés'
      });
    }
  }

  removeFile(fileToRemove: File): void {
    this.fichesFiles = this.fichesFiles.filter(file => file !== fileToRemove);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  async onSubmit(): Promise<void> {
    if (this.rapportForm.valid && this.rapportFile) {
      this.loading = true;

      try {
        // Upload du rapport
        const rapportFiles = await this.fileUploadService.uploadRapports([this.rapportFile]).toPromise();
        
        // Upload des fiches si présentes
        let fichesFiles: string[] = [];
        if (this.fichesFiles.length > 0) {
          fichesFiles = await this.fileUploadService.uploadRapports(this.fichesFiles).toPromise() || [];
        }

        // Simuler la sauvegarde du rapport
        const rapportData = {
          ...this.rapportForm.value,
          rapportPath: rapportFiles?.[0],
          fichesPaths: fichesFiles,
          dateSubmission: new Date().toISOString()
        };

        console.log('Rapport soumis:', rapportData);

        this.toastService.show({
          type: 'success',
          title: 'Rapport soumis',
          message: 'Votre rapport trimestriel a été soumis avec succès'
        });

        this.resetForm();

      } catch (error) {
        console.error('Erreur upload:', error);
        this.toastService.show({
          type: 'error',
          title: 'Erreur',
          message: 'Erreur lors de l\'upload des fichiers'
        });
      } finally {
        this.loading = false;
      }
    } else {
      this.toastService.show({
        type: 'warning',
        title: 'Formulaire incomplet',
        message: 'Veuillez remplir tous les champs et ajouter le rapport PDF'
      });
    }
  }

  annuler(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.rapportForm.reset({
      annee: this.currentYear,
      prestataire: this.authService.getCurrentUser()?.nom
    });
    this.rapportFile = null;
    this.fichesFiles = [];
  }
}