import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EvaluationService } from '../../core/services/evaluation.service';
import { EvaluationTrimestrielle } from '../../core/models/business.models';
import { ToastService } from '../../core/services/toast.service';
import { PdfService } from '../../core/services/pdf.service';

@Component({
  selector: 'app-evaluation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="container">
        <div class="page-header">
          <h1>Évaluation du Prestataire</h1>
          <p *ngIf="prestataireNom">Prestataire: {{ prestataireNom }} - {{ nomItem }}</p>
        </div>
      
      <form [formGroup]="evaluationForm" (ngSubmit)="onSubmit()">
        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Trimestre *</label>
              <div class="custom-select-container">
                <div class="custom-select" (click)="toggleTrimestreDropdown()" [class.open]="showTrimestreDropdown">
                  <span class="selected-text">{{ getTrimestreDisplayText() }}</span>
                  <span class="dropdown-arrow">▼</span>
                </div>
                <div class="dropdown-overlay" *ngIf="showTrimestreDropdown" (click)="showTrimestreDropdown = false"></div>
                <div class="custom-dropdown" *ngIf="showTrimestreDropdown">
                  <div class="dropdown-option" (click)="selectTrimestre('')">Sélectionner...</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T1')">T1</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T2')">T2</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T3')">T3</div>
                  <div class="dropdown-option" (click)="selectTrimestre('T4')">T4</div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Lot *</label>
              <input type="text" class="form-control" formControlName="lot" placeholder="Ex: Lot 1">
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Nom du prestataire *</label>
              <input type="text" class="form-control" formControlName="nomPrestataire" placeholder="Ex: Geraldo Service">
            </div>
          </div>
          
          <div class="col-md-6">
            <div class="mb-3">
              <label class="form-label">Date d'évaluation *</label>
              <input type="date" class="form-control" formControlName="dateEvaluation">
            </div>
          </div>
        </div>

        <h4>III. EXIGENCES À SATISFAIRE</h4>

        <table class="evaluation-table">
          <thead>
            <tr>
              <th>N°</th>
              <th>Exigences du DAO</th>
              <th>Prestataire</th>
              <th>Observations</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Vérification des techniciens avec chef de site certifié ITIL Foundation</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="techniciensCertifies" (change)="calculerScore()">
                  <label>Liste effective fournie</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsTechniciens" placeholder="RAS">
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Transmission du rapport d'intervention trimestriel</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="rapportInterventionTransmis" (change)="calculerScore()">
                  <label>Transmis</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsRapport" placeholder="A transmettre au plus tard le...">
              </td>
            </tr>
            <tr>
              <td>3</td>
              <td>Remplissage quotidien du registre et fiches d'interventions</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="registreRempli" (change)="calculerScore()">
                  <label>Effectué</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsRegistre" placeholder="RAS">
              </td>
            </tr>
            <tr>
              <td>4</td>
              <td>Respect des horaires d'intervention</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="horairesRespectes" (change)="calculerScore()">
                  <label>Respectés</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsHoraires" placeholder="RAS">
              </td>
            </tr>
            <tr>
              <td>5</td>
              <td>Respect du délai de réaction (4h)</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="delaiReactionRespecte" (change)="calculerScore()">
                  <label>Respecté</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsDelaiReaction" placeholder="RAS">
              </td>
            </tr>
            <tr>
              <td>6</td>
              <td>Respect du délai d'intervention (24h)</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="delaiInterventionRespecte" (change)="calculerScore()">
                  <label>Respecté</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsDelaiIntervention" placeholder="RAS">
              </td>
            </tr>
            <tr>
              <td>7</td>
              <td>Disponibilité du véhicule de service</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="vehiculeDisponible" (change)="calculerScore()">
                  <label>Disponible</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsVehicule" placeholder="RAS">
              </td>
            </tr>
            <tr>
              <td>8</td>
              <td>Disponibilité de la tenue réglementaire</td>
              <td>
                <div class="checkbox-container">
                  <input type="checkbox" formControlName="tenueDisponible" (change)="calculerScore()">
                  <label>Disponible</label>
                </div>
              </td>
              <td>
                <input type="text" class="form-control form-control-sm" formControlName="obsTenue" placeholder="RAS">
              </td>
            </tr>
          </tbody>
        </table>

        <div class="score-section">
          <div class="score-display">
            <h3>Score: {{ scoreGlobal }}/8</h3>
            <div class="recommandation" [class]="'rec-' + recommandation.toLowerCase()">
              {{ getRecommandationText() }}
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="form-label elegant-label">Observations générales</label>
          <textarea class="form-control elegant-textarea" rows="4" formControlName="observationsGenerales"
                    placeholder="Saisissez vos observations générales concernant cette évaluation..."></textarea>
        </div>

        <div class="mb-4">
          <label class="form-label elegant-label">Appréciation du représentant</label>
          <textarea class="form-control elegant-textarea" rows="3" formControlName="appreciationRepresentant"
                    placeholder="Saisissez votre appréciation personnelle..."></textarea>
        </div>

        <div class="mb-3">
          <label class="form-label">Statut</label>
          <div class="custom-select-container">
            <div class="custom-select" (click)="toggleStatutDropdown()" [class.open]="showStatutDropdown">
              <span class="selected-text">{{ getStatutDisplayText() }}</span>
              <span class="dropdown-arrow">▼</span>
            </div>
            <div class="dropdown-overlay" *ngIf="showStatutDropdown" (click)="showStatutDropdown = false"></div>
            <div class="custom-dropdown" *ngIf="showStatutDropdown">
              <div class="dropdown-option" (click)="selectStatut('Brouillon')">Brouillon</div>
              <div class="dropdown-option" (click)="selectStatut('Validé')">Validé</div>
              <div class="dropdown-option" (click)="selectStatut('Transmis')">Transmis</div>
            </div>
          </div>
        </div>

        <!-- Success message and download section -->
        <div *ngIf="isSubmitted" class="success-section">
          <div class="success-message">
            <div class="success-icon">✓</div>
            <div class="success-content">
              <h4>Évaluation enregistrée avec succès</h4>
              <p>Vous pouvez maintenant télécharger le rapport d'évaluation</p>
            </div>
          </div>
          <button type="button" class="btn btn-success download-btn" (click)="downloadEvaluation()">
            <span class="download-icon">📄</span>
            Télécharger le Rapport
          </button>
        </div>

        <div class="form-actions" [class.subtle]="isSubmitted">
          <button type="button" class="btn btn-outline-secondary" (click)="retour()">
            Retour
          </button>
          <button type="submit" class="btn btn-primary elegant-submit" [disabled]="evaluationForm.invalid || isSubmitted">
            {{ isSubmitted ? 'Évaluation Enregistrée' : 'Enregistrer Évaluation' }}
          </button>
        </div>
      </form>
      </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #ffffff;
      border-radius: 16px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #f1f5f9;
      transition: all 0.3s ease;
    }

    .page-header {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #e2e8f0;
    }

    .page-header h1 {
      color: #1e293b;
      font-size: 1.8rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .page-header p {
      color: #64748b;
      font-size: 1rem;
      margin: 0;
      font-weight: 500;
    }

    h4 {
      color: #2563eb;
      font-size: 1.25rem;
      font-weight: 700;
      margin: 2rem 0 1rem 0;
      letter-spacing: -0.025em;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5rem;
    }

    .evaluation-table {
      width: 100%;
      border-collapse: collapse;
      margin: 2rem 0;
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }

    .evaluation-table th {
      background: #2563eb;
      color: white;
      padding: 1rem;
      text-align: left;
      font-weight: 600;
    }

    .evaluation-table td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: middle;
    }

    .evaluation-table tbody tr:nth-child(even) {
      background: #f8fafc;
    }

    .evaluation-table tbody tr:hover {
      background: #f1f5f9;
    }

    .checkbox-container {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .checkbox-container input[type="checkbox"] {
      width: 1.2rem;
      height: 1.2rem;
      accent-color: #10b981;
    }

    .checkbox-container label {
      font-weight: 500;
      margin: 0;
      cursor: pointer;
      font-size: 0.9rem;
    }

    .form-control-sm {
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 0.375rem 0.5rem;
      font-size: 0.85rem;
      line-height: 1.4;
      color: #374151;
      background: #ffffff;
      transition: all 0.2s ease;
    }

    .form-control-sm:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
    }

    .form-control-sm::placeholder {
      color: #9ca3af;
      font-style: italic;
    }

    .score-section {
      background: #f8fafc;
      padding: 2rem;
      border-radius: 12px;
      margin: 2rem 0;
      text-align: center;
    }

    .score-display h3 {
      font-size: 2rem;
      margin-bottom: 1rem;
      color: #1f2937;
    }

    .recommandation {
      padding: 1rem 2rem;
      border-radius: 8px;
      font-weight: 700;
      font-size: 1.1rem;
      text-transform: uppercase;
    }

    .rec-maintenir {
      background: #dcfce7;
      color: #166534;
      border: 2px solid #10b981;
    }

    .rec-formation {
      background: #fef3c7;
      color: #92400e;
      border: 2px solid #f59e0b;
    }

    .rec-declasser {
      background: #fecaca;
      color: #991b1b;
      border: 2px solid #ef4444;
    }

    .success-section {
      background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
      border: 2px solid #0ea5e9;
      border-radius: 16px;
      padding: 2rem;
      margin: 2rem 0;
      text-align: center;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .success-message {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .success-icon {
      width: 3rem;
      height: 3rem;
      background: #10b981;
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: bold;
      box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);
    }

    .success-content h4 {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
      font-size: 1.2rem;
      font-weight: 600;
    }

    .success-content p {
      margin: 0;
      color: #64748b;
      font-size: 0.95rem;
    }

    .download-btn {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      border: none;
      border-radius: 12px;
      padding: 0.875rem 2rem;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .download-btn:hover {
      background: linear-gradient(135deg, #059669 0%, #047857 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(16, 185, 129, 0.3);
    }

    .download-icon {
      font-size: 1.2rem;
    }

    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 2rem;
      transition: all 0.3s ease;
    }

    .form-actions.subtle {
      opacity: 0.7;
      transform: scale(0.98);
    }

    .elegant-submit {
      background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
      border: none;
      border-radius: 12px;
      padding: 0.875rem 2rem;
      color: white;
      font-weight: 600;
      font-size: 1rem;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);
    }

    .elegant-submit:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
      transform: translateY(-2px);
      box-shadow: 0 6px 8px rgba(37, 99, 235, 0.3);
    }

    .elegant-submit:disabled {
      background: #9ca3af;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .elegant-label {
      font-weight: 600;
      color: #374151;
      font-size: 1rem;
      margin-bottom: 0.75rem;
      display: block;
      letter-spacing: 0.025em;
    }

    .elegant-textarea {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 1rem 1.25rem;
      font-size: 0.95rem;
      line-height: 1.6;
      color: #374151;
      background: #ffffff;
      transition: all 0.3s ease;
      resize: vertical;
      min-height: 120px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .elegant-textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), 0 4px 8px rgba(0, 0, 0, 0.12);
      background: #fefefe;
    }

    .elegant-textarea::placeholder {
      color: #9ca3af;
      font-style: italic;
      opacity: 0.8;
    }

    .elegant-textarea:hover {
      border-color: #d1d5db;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
    }

    .custom-select-container {
      position: relative;
    }

    .custom-select {
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      padding: 0.875rem 1rem;
      background: #ffffff;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 0.3s ease;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .custom-select:hover {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .custom-select.open {
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1), 0 4px 8px rgba(0, 0, 0, 0.12);
    }

    .selected-text {
      color: #374151;
      font-weight: 500;
    }

    .dropdown-arrow {
      color: #6b7280;
      font-size: 0.75rem;
      transition: transform 0.3s ease;
    }

    .custom-select.open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .custom-dropdown {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
      border: 1px solid #e5e7eb;
      z-index: 1001;
      min-width: 300px;
      overflow: hidden;
      animation: dropdownFadeIn 0.3s ease-out;
    }

    @keyframes dropdownFadeIn {
      from {
        opacity: 0;
        transform: translate(-50%, -40%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    .dropdown-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 1000;
      animation: overlayFadeIn 0.3s ease-out;
    }

    @keyframes overlayFadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .dropdown-option {
      padding: 1rem 1.5rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f3f4f6;
      text-align: center;
      font-weight: 500;
      color: #374151;
    }

    .dropdown-option:last-child {
      border-bottom: none;
    }

    .dropdown-option:hover {
      background: #f8fafc;
      color: #2563eb;
    }

    .dropdown-option:first-child {
      background: #f1f5f9;
      color: #6b7280;
      font-style: italic;
    }

    .dropdown-option:first-child:hover {
      background: #e2e8f0;
      color: #4b5563;
    }

    @media (max-width: 768px) {
      .criteres-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
        gap: 1rem;
      }

      .elegant-textarea {
        padding: 0.875rem 1rem;
        font-size: 0.9rem;
      }
    }
  `]
})
export class EvaluationFormComponent implements OnInit {
  evaluationForm: FormGroup;

  prestataireNom = '';
  nomItem = '';
  scoreGlobal = 0;
  recommandation = 'MAINTENIR';
  evaluationId: number | null = null;
  isSubmitted = false;
  showTrimestreDropdown = false;
  showStatutDropdown = false;

  constructor(
    private fb: FormBuilder,
    private evaluationService: EvaluationService,
    private pdfService: PdfService,
    private route: ActivatedRoute,
    private router: Router,
    private toastService: ToastService
  ) {
    this.evaluationForm = this.fb.group({
      trimestre: ['', Validators.required],
      lot: ['', Validators.required],
      nomPrestataire: ['', Validators.required],
      prestataireNom: [''],
      dateEvaluation: ['', Validators.required],
      evaluateurId: [1],
      correspondantId: [1],
      techniciensCertifies: [false],
      rapportInterventionTransmis: [false],
      registreRempli: [false],
      horairesRespectes: [false],
      delaiReactionRespecte: [false],
      delaiInterventionRespecte: [false],
      vehiculeDisponible: [false],
      tenueDisponible: [false],
      obsTechniciens: ['RAS'],
      obsRapport: ['A transmettre au plus tard le ' + this.getDeadlineDate('')],
      obsRegistre: ['RAS'],
      obsHoraires: ['RAS'],
      obsDelaiReaction: ['RAS'],
      obsDelaiIntervention: ['RAS'],
      obsVehicule: ['RAS'],
      obsTenue: ['RAS'],
      observationsGenerales: [''],
      appreciationRepresentant: [''],
      statut: ['Brouillon']
    });
  }

  ngOnInit(): void {
    // Récupérer les paramètres de l'URL
    this.route.queryParams.subscribe(params => {
      if (params['prestataire']) {
        this.prestataireNom = params['prestataire'];
        this.nomItem = params['nomItem'] || '';
        
        // Pré-remplir le formulaire
        this.evaluationForm.patchValue({
          prestataireNom: this.prestataireNom,
          nomPrestataire: this.prestataireNom,
          lot: params['contratId'] || '',
          dateEvaluation: new Date().toISOString().split('T')[0]
        });
      }
    });
  }

  calculerScore(): void {
    const criteres = [
      this.evaluationForm.get('techniciensCertifies')?.value,
      this.evaluationForm.get('rapportInterventionTransmis')?.value,
      this.evaluationForm.get('registreRempli')?.value,
      this.evaluationForm.get('horairesRespectes')?.value,
      this.evaluationForm.get('delaiReactionRespecte')?.value,
      this.evaluationForm.get('delaiInterventionRespecte')?.value,
      this.evaluationForm.get('vehiculeDisponible')?.value,
      this.evaluationForm.get('tenueDisponible')?.value
    ];

    this.scoreGlobal = criteres.filter(c => c).length;

    // Déterminer la recommandation
    if (this.scoreGlobal >= 7) {
      this.recommandation = 'MAINTENIR';
    } else if (this.scoreGlobal >= 5) {
      this.recommandation = 'FORMATION';
    } else {
      this.recommandation = 'DECLASSER';
    }
  }

  getDeadlineDate(trimestre: string): string {
    const deadlineMap: { [key: string]: string } = {
      'T1': '1er Avril 2025',
      'T2': '1er Juillet 2025',
      'T3': '1er Octobre 2025',
      'T4': '1er Janvier 2026'
    };
    return deadlineMap[trimestre] || 'Date à définir';
  }

  toggleTrimestreDropdown(): void {
    this.showTrimestreDropdown = !this.showTrimestreDropdown;
  }

  selectTrimestre(value: string): void {
    this.evaluationForm.patchValue({ trimestre: value });
    this.showTrimestreDropdown = false;
  }

  getTrimestreDisplayText(): string {
    const value = this.evaluationForm.get('trimestre')?.value;
    return value || 'Sélectionner...';
  }

  toggleStatutDropdown(): void {
    this.showStatutDropdown = !this.showStatutDropdown;
  }

  selectStatut(value: string): void {
    this.evaluationForm.patchValue({ statut: value });
    this.showStatutDropdown = false;
  }

  getStatutDisplayText(): string {
    const value = this.evaluationForm.get('statut')?.value;
    return value || 'Brouillon';
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    const clickedInsideTrimestre = target.closest('.custom-select-container');
    const clickedInsideStatut = target.closest('.custom-select-container');

    if (!clickedInsideTrimestre) {
      this.showTrimestreDropdown = false;
    }
    if (!clickedInsideStatut) {
      this.showStatutDropdown = false;
    }
  }

  getRecommandationText(): string {
    switch (this.recommandation) {
      case 'MAINTENIR': return 'MAINTENIR LE PRESTATAIRE';
      case 'FORMATION': return 'FORMATION REQUISE';
      case 'DECLASSER': return 'DÉCLASSER LE PRESTATAIRE';
      default: return '';
    }
  }

  onSubmit(): void {
    if (this.evaluationForm.valid) {
      const formValue = this.evaluationForm.value;
      const evaluation = {
        ...formValue,
        scoreGlobal: this.scoreGlobal,
        recommandation: this.recommandation,
        prestataireNom: formValue.nomPrestataire // Use the form field value
      };

      this.evaluationService.createEvaluation(evaluation).subscribe({
        next: (response: any) => {
          this.evaluationId = response.id;
          this.isSubmitted = true;
          this.toastService.show({
            type: 'success',
            title: 'Évaluation enregistrée',
            message: `Recommandation: ${this.getRecommandationText()}`
          });
          // Don't navigate away, stay on the form to allow download
        },
        error: (error) => {
          console.error('Erreur:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors de l\'enregistrement'
          });
        }
      });
    }
  }

  downloadEvaluation(): void {
    if (this.evaluationId) {
      this.pdfService.genererEvaluation(this.evaluationId).subscribe({
        next: (blob) => {
          const nomPrestataire = this.evaluationForm.get('nomPrestataire')?.value || 'prestataire';
          const trimestre = this.evaluationForm.get('trimestre')?.value || 'T1';
          const filename = `evaluation-${nomPrestataire.replace(/[^a-zA-Z0-9]/g, '-')}-${trimestre}.pdf`;
          this.pdfService.downloadFile(blob, filename);
          this.toastService.show({
            type: 'success',
            title: 'Téléchargement réussi',
            message: 'Le rapport d\'évaluation a été téléchargé'
          });
        },
        error: (error) => {
          console.error('Erreur lors du téléchargement:', error);
          this.toastService.show({
            type: 'error',
            title: 'Erreur',
            message: 'Erreur lors du téléchargement du rapport'
          });
        }
      });
    }
  }

  retour(): void {
    this.router.navigate(['/prestations-dashboard']);
  }

  onReset(): void {
    this.evaluationForm.reset({
      prestataireId: 1,
      evaluateurId: 1,
      correspondantId: 1,
      statut: 'Brouillon'
    });
  }
}