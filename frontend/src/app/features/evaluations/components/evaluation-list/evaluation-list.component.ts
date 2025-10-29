import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EvaluationService } from '../../../../core/services/evaluation.service';
import { EvaluationTrimestrielle } from '../../../../core/models/business.models';
import { AuthService } from '../../../../core/services/auth.service';
import { ConfirmationService } from '../../../../core/services/confirmation.service';
import { ToastService } from '../../../../core/services/toast.service';

@Component({
  selector: 'app-evaluation-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './evaluation-list.component.html',
  styles: [`
    .container {
      max-width: 98%;
      margin: 0 auto;
      padding: 1rem;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }

    .modal-content {
      background: white;
      border-radius: 8px;
      border: 2px solid #1e293b;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
      max-width: 800px;
      width: 90%;
      max-height: 90vh;
      overflow-y: auto;
    }

    .evaluation-form {
      padding: 30px;
    }

    .form-title {
      font-size: 22px;
      font-weight: 600;
      color: #333;
      margin-bottom: 30px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 25px;
      position: relative;
    }

    label {
      display: block;
      font-size: 14px;
      font-weight: 500;
      color: #555;
      margin-bottom: 8px;
    }

    .line-input {
      width: 100%;
      padding: 12px 0;
      border: none;
      border-radius: 0;
      font-size: 16px;
      background: transparent;
      outline: none;
      color: #333;
    }

    .line-input::placeholder {
      color: #999;
    }

    .line-input:focus {
      outline: none;
    }

    .input-line {
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background: #ddd;
      transition: all 0.3s ease;
    }

    .line-input:focus + .input-line {
      background: #1e293b;
      height: 2px;
    }

    .line-input.error + .input-line,
    .input-line.error {
      background: #ff4444;
    }

    .error-message {
      color: #ff4444;
      font-size: 12px;
      margin-top: 5px;
    }

    .checkboxes-section {
      margin-top: 30px;
      margin-bottom: 30px;
    }

    .checkboxes-section h3 {
      font-size: 18px;
      font-weight: 600;
      color: #333;
      margin-bottom: 20px;
      text-align: center;
    }

    .checkbox-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 15px;
    }

    .checkbox-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .checkbox-group input[type="checkbox"] {
      width: 18px;
      height: 18px;
      accent-color: #1e293b;
    }

    .checkbox-group label {
      font-size: 14px;
      font-weight: 400;
      color: #555;
      margin-bottom: 0;
      cursor: pointer;
    }

    .form-actions {
      display: flex;
      gap: 15px;
      justify-content: center;
      margin-top: 30px;
    }

    .btn {
      padding: 12px 30px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .btn:disabled {
      background: #ccc;
      cursor: not-allowed;
    }

    .btn-outline {
      background: transparent;
      color: #666;
      border: 1px solid #ddd;
    }

    .btn-outline:hover:not(:disabled) {
      background: #f5f5f5;
    }

    .btn-primary {
      background: linear-gradient(135deg, #1e293b, #334155);
      color: white;
      box-shadow: 0 4px 12px rgba(30, 41, 59, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      background: linear-gradient(135deg, #334155, #475569);
      box-shadow: 0 6px 16px rgba(30, 41, 59, 0.4);
    }

    .table-container {
      background: white;
      border-radius: 12px;
      overflow-x: auto;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      width: 100%;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      table-layout: auto;
    }

    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #e5e7eb;
      white-space: nowrap;
    }

    th {
      background: #f9fafb;
      font-weight: 600;
    }

    tr:hover {
      background-color: #f9fafb;
    }

    .action-buttons {
      display: flex;
      gap: 0.5rem;
      align-items: center;
      white-space: normal;
      min-width: 150px;
    }

    .btn-sm {
      padding: 0.5rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
      border-radius: 6px;
      border: none;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-secondary {
      background-color: #6c757d;
      color: white;
    }

    .btn-danger {
      background-color: #dc3545;
      color: white;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      font-size: 0.75rem;
      font-weight: 500;
      border-radius: 9999px;
    }

    .badge-info {
      background-color: #dbeafe;
      color: #1e40af;
    }

    .badge-danger {
      background-color: #fecaca;
      color: #991b1b;
    }

    .score-success {
      color: #166534;
      font-weight: 600;
    }

    .score-warning {
      color: #92400e;
      font-weight: 600;
    }

    .score-danger {
      color: #991b1b;
      font-weight: 600;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
    }

    .table-header {
      background: #f9fafb;
      padding: 1.5rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .table-header h2 {
      margin: 0;
      color: #1f2937;
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .search-bar {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      padding: 0.5rem 2.5rem 0.5rem 1rem;
      border: 1px solid #d1d5db;
      border-radius: 8px;
      font-size: 0.875rem;
      width: 250px;
      transition: all 0.2s;
    }

    .search-input:focus {
      outline: none;
      border-color: #f97316;
      box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    }

    .search-icon {
      position: absolute;
      right: 0.75rem;
      color: #6b7280;
      pointer-events: none;
    }

    .declasse {
      background-color: #fef2f2 !important;
    }

    .loading {
      text-align: center;
      padding: 2rem;
      color: #6b7280;
    }

    @media (max-width: 768px) {
      .checkbox-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
      }
    }
  `]
})
export class EvaluationListComponent implements OnInit {
  evaluations: EvaluationTrimestrielle[] = [];
  filteredEvaluations: EvaluationTrimestrielle[] = [];
  searchTerm = '';
  evaluationForm: FormGroup;
  showCreateForm = false;
  isEditing = false;
  editingId: number | null = null;
  loading = false;
  loadingList = false;
  selectedFile: File | null = null;
  selectedFileName: string = '';

  constructor(
    private evaluationService: EvaluationService,
    public authService: AuthService,
    private formBuilder: FormBuilder,
    private confirmationService: ConfirmationService,
    private toastService: ToastService
  ) {
    this.evaluationForm = this.formBuilder.group({
      sessionId: [null],
      lot: ['', Validators.required],
      trimestre: ['', Validators.required],
      dateEvaluation: ['', Validators.required],
      prestataireNom: ['', Validators.required],
      evaluateurNom: ['', Validators.required],
      observationsGenerales: [''],
      signatureEvaluateur: [''],
      rapportInterventionTransmis: [false],
      delaiReactionRespecte: [false],
      delaiInterventionRespecte: [false],
      horairesRespectes: [false],
      registreRempli: [false],
      vehiculeDisponible: [false],
      tenueDisponible: [false],

      correspondantId: [null, Validators.required],
      techniciensListe: [''],
      prestationsVerifiees: [''],
      instancesNonResolues: [''],
      appreciationRepresentant: [''],
      signatureRepresentant: [''],
      preuves: [''],
      penalitesCalcul: [0],
      fichierPdf: [''],
      statut: ['Brouillon', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadEvaluations();
  }

  loadEvaluations(): void {
    this.loadingList = true;
    this.evaluationService.getAllEvaluations().subscribe({
      next: (evaluations) => {
        console.log('Evaluations chargées:', evaluations);
        this.evaluations = evaluations;
        this.filteredEvaluations = evaluations;
        this.loadingList = false;
      },
      error: (error) => {
        console.error('Error loading evaluations:', error);
        this.loadingList = false;
      }
    });
  }

  filterEvaluations(): void {
    if (!this.searchTerm.trim()) {
      this.filteredEvaluations = [...this.evaluations];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredEvaluations = this.evaluations.filter(evaluation => 
        (evaluation.prestataireNom || '').toLowerCase().includes(term) ||
        (evaluation.evaluateurNom || '').toLowerCase().includes(term) ||
        (evaluation.lot || '').toLowerCase().includes(term) ||
        (evaluation.trimestre || '').toLowerCase().includes(term)
      );
    }
  }

  async onSubmit(): Promise<void> {
    if (this.evaluationForm.valid) {
      const action = this.isEditing ? 'modifier' : 'créer';
      const confirmed = await this.confirmationService.show({
        title: 'Confirmation',
        message: `Voulez-vous vraiment ${action} cette évaluation ?`,
        confirmText: 'Confirmer',
        cancelText: 'Annuler'
      });

      if (confirmed) {
        this.loading = true;
        const evaluationData = this.evaluationForm.value;

        if (this.selectedFile) {
          this.evaluationService.uploadFile(this.selectedFile).subscribe({
            next: (fileName) => {
              evaluationData.fichierPdf = fileName;
              this.saveEvaluation(evaluationData);
            },
            error: (error) => {
              console.error('Error uploading file:', error);
              this.loading = false;
              this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors du téléchargement du fichier' });
            }
          });
        } else {
          this.saveEvaluation(evaluationData);
        }
      }
    }
  }

  private saveEvaluation(evaluationData: any): void {
    if (this.isEditing && this.editingId) {
      this.evaluationService.updateEvaluation(this.editingId, evaluationData).subscribe({
        next: () => {
          this.loading = false;
          this.resetForm();
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('Error updating evaluation:', error);
          this.loading = false;
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la modification' });
        }
      });
    } else {
      this.evaluationService.createEvaluation(evaluationData).subscribe({
        next: () => {
          this.loading = false;
          this.resetForm();
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('Error creating evaluation:', error);
          this.loading = false;
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la création' });
        }
      });
    }
  }

  editEvaluation(evaluation: EvaluationTrimestrielle): void {
    this.isEditing = true;
    this.editingId = evaluation.id!;
    this.showCreateForm = true;
    
    const dateValue = evaluation.dateEvaluation ? 
      new Date(evaluation.dateEvaluation).toISOString().slice(0, 10) : '';
    
    this.evaluationForm.patchValue({
      lot: evaluation.lot,
      trimestre: evaluation.trimestre,
      dateEvaluation: dateValue,
      prestataireNom: evaluation.prestataireNom,
      evaluateurNom: evaluation.evaluateurNom,
      observationsGenerales: evaluation.observationsGenerales,
      signatureEvaluateur: evaluation.signatureEvaluateur,
      rapportInterventionTransmis: evaluation.rapportInterventionTransmis,
      delaiReactionRespecte: evaluation.delaiReactionRespecte,
      delaiInterventionRespecte: evaluation.delaiInterventionRespecte,
      horairesRespectes: evaluation.horairesRespectes,
      registreRempli: evaluation.registreRempli,
      vehiculeDisponible: evaluation.vehiculeDisponible,
      tenueDisponible: evaluation.tenueDisponible,

      correspondantId: evaluation.correspondantId,
      techniciensListe: evaluation.techniciensListe,
      prestationsVerifiees: evaluation.prestationsVerifiees,
      instancesNonResolues: evaluation.instancesNonResolues,
      appreciationRepresentant: evaluation.appreciationRepresentant,
      signatureRepresentant: evaluation.signatureRepresentant,
      preuves: evaluation.preuves,
      penalitesCalcul: evaluation.penalitesCalcul,
      statut: evaluation.statut
    });
  }

  async deleteEvaluation(evaluation: EvaluationTrimestrielle): Promise<void> {
    const confirmed = await this.confirmationService.show({
      title: 'Supprimer l\'évaluation',
      message: `Êtes-vous sûr de vouloir supprimer l'évaluation ${evaluation.id} ?`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler'
    });

    if (confirmed) {
      this.evaluationService.deleteEvaluation(evaluation.id!).subscribe({
        next: () => {
          this.loadEvaluations();
        },
        error: (error) => {
          console.error('Error deleting evaluation:', error);
          this.toastService.show({ type: 'error', title: 'Erreur', message: 'Erreur lors de la suppression de l\'évaluation' });
        }
      });
    }
  }

  cancelEdit(): void {
    this.resetForm();
  }

  private resetForm(): void {
    this.evaluationForm.reset();
    this.evaluationForm.patchValue({ 
      rapportInterventionTransmis: false,
      delaiReactionRespecte: false,
      delaiInterventionRespecte: false,
      horairesRespectes: false,
      registreRempli: false,
      vehiculeDisponible: false,
      tenueDisponible: false,
      penalitesCalcul: 0,
      statut: 'Brouillon'
    });
    this.selectedFile = null;
    this.selectedFileName = '';
    this.showCreateForm = false;
    this.isEditing = false;
    this.editingId = null;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('fr-FR');
  }

  getScoreClass(score: number | undefined): string {
    if (!score) return 'score-neutral';
    if (score < 25) return 'score-danger';
    if (score < 50) return 'score-warning';
    if (score < 75) return 'score-info';
    return 'score-success';
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.selectedFile = file;
      this.selectedFileName = file.name;
    } else {
      alert('Veuillez sélectionner un fichier PDF valide.');
      event.target.value = '';
      this.selectedFile = null;
      this.selectedFileName = '';
    }
  }
}